import { EventEmitter } from 'events';
import { BaseExchangeConnector, OrderSide } from '../connectors/base-exchange.connector';
import prisma from '@/lib/prisma';
import { FundingArbitrageStatus } from '@prisma/client';

export interface FundingSubscription {
  id: string;
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  positionType: 'long' | 'short';
  quantity: number;
  primaryExchange: BaseExchangeConnector;
  hedgeExchange: BaseExchangeConnector;
  userId: string;
  status: 'active' | 'executing' | 'completed' | 'failed';
  createdAt: number;
  primaryCredentialId?: string;
  hedgeCredentialId?: string;
  executionDelay?: number; // Seconds before funding time to execute PRIMARY order (default: 5)
  leverage?: number; // Leverage multiplier (1-125, recommended 1-20, default: 3)
  margin?: number; // Margin/collateral used for this position (in USDT)
}

export interface OrderExecutionEvent {
  subscriptionId: string;
  symbol: string;
  type: 'primary' | 'hedge';
  order: any;
  timestamp: number;
}

export interface CountdownEvent {
  subscriptionId: string;
  symbol: string;
  secondsRemaining: number;
  fundingRate: number;
  positionType: 'long' | 'short';
}

export interface CachedConnector {
  connector: BaseExchangeConnector;
  credentialId: string;
  exchange: string;
  environment: string;
  subscriptionIds: Set<string>; // Reference counting
  lastUsed: number;
  initializationTime: number;
}

/**
 * Funding Arbitrage Service
 *
 * Manages funding rate arbitrage subscriptions:
 * - Monitors countdown to funding time
 * - Executes PRIMARY order 5 seconds before funding (configurable)
 * - Opens HEDGE position exactly AT funding time (countdown = 0) to avoid negative funding
 * - Emits events for UI notifications
 */
export class FundingArbitrageService extends EventEmitter {
  private subscriptions: Map<string, FundingSubscription> = new Map();
  private countdownTimers: Map<string, NodeJS.Timeout> = new Map();
  private subscriptionCounter = 1;
  private initialized = false;

  // Connector cache for instant execution
  private connectorCache: Map<string, CachedConnector> = new Map();
  private cleanupTimer?: NodeJS.Timeout;

  // Event types
  static readonly COUNTDOWN = 'countdown';
  static readonly ORDER_EXECUTING = 'order_executing';
  static readonly ORDER_EXECUTED = 'order_executed';
  static readonly HEDGE_EXECUTING = 'hedge_executing';
  static readonly HEDGE_EXECUTED = 'hedge_executed';
  static readonly SUBSCRIPTION_COMPLETED = 'subscription_completed';
  static readonly ERROR = 'error';

  /**
   * Initialize service and restore active subscriptions from database
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('[FundingArbitrage] Initializing service and restoring active subscriptions...');

    try {
      // Load all active subscriptions from database
      // IMPORTANT: Include EXECUTING status to restore position closing timers after restart
      const dbSubscriptions = await prisma.fundingArbitrageSubscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'WAITING', 'EXECUTING'] },
        },
      });

      console.log(`[FundingArbitrage] Found ${dbSubscriptions.length} active subscriptions in database`);

      // Restore each subscription
      for (const dbSub of dbSubscriptions) {
        try {
          const timeUntilFunding = dbSub.nextFundingTime.getTime() - Date.now();

          // Handle EXECUTING subscriptions (positions already opened, waiting for close)
          if (dbSub.status === 'EXECUTING') {
            console.log(`[FundingArbitrage] Found EXECUTING subscription ${dbSub.id} - positions opened, checking close status...`);

            // Check if funding time has passed
            if (timeUntilFunding < -600000) {
              // More than 10 minutes past funding - positions should have been closed
              // Mark as ERROR so user can manually close positions
              await prisma.fundingArbitrageSubscription.update({
                where: { id: dbSub.id },
                data: {
                  status: 'ERROR',
                  errorMessage: 'Positions not closed after restart - manual intervention required. Please check and close open positions manually.',
                },
              });
              console.error(`[FundingArbitrage] ⚠️ CRITICAL: Subscription ${dbSub.id} has open positions that were not closed! Manual intervention required.`);
              continue;
            }

            // If funding time hasn't passed yet, restore subscription and wait for funding
            console.log(`[FundingArbitrage] Restoring EXECUTING subscription ${dbSub.id}, will schedule position closing...`);
          } else {
            // For ACTIVE/WAITING subscriptions, check expiration
            if (timeUntilFunding < -60000) {
              // More than 1 minute past funding time - mark as failed
              await prisma.fundingArbitrageSubscription.update({
                where: { id: dbSub.id },
                data: { status: 'ERROR', errorMessage: 'Expired - funding time passed' },
              });
              console.log(`[FundingArbitrage] Subscription ${dbSub.id} expired - marked as ERROR`);
              continue;
            }
          }

          // Load exchange credentials
          const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
          const credential = await ExchangeCredentialsService.getCredentialById(
            dbSub.userId,
            dbSub.primaryCredentialId
          );

          if (!credential) {
            console.error(`[FundingArbitrage] Credential ${dbSub.primaryCredentialId} not found for subscription ${dbSub.id}`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'ERROR', errorMessage: 'Credentials not found' },
            });
            continue;
          }

          // Initialize primary exchange connector using cache
          let primaryConnector;
          try {
            primaryConnector = await this.getOrCreateConnector(
              dbSub.userId,
              dbSub.primaryCredentialId,
              false // Use cache
            );
          } catch (error: any) {
            console.error(`[FundingArbitrage] Failed to initialize primary connector: ${error.message}`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'ERROR', errorMessage: error.message },
            });
            continue;
          }

          // Initialize hedge exchange connector
          let hedgeConnector;
          if (!dbSub.hedgeCredentialId) {
            console.error(`[FundingArbitrage] No hedge credential for subscription ${dbSub.id}`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'ERROR', errorMessage: 'Hedge credential required' },
            });
            continue;
          }

          try {
            hedgeConnector = await this.getOrCreateConnector(
              dbSub.userId,
              dbSub.hedgeCredentialId,
              false // Use cache
            );
          } catch (error: any) {
            console.error(`[FundingArbitrage] Failed to initialize hedge connector: ${error.message}`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'ERROR', errorMessage: error.message },
            });
            continue;
          }

          // Recreate subscription object
          const subscription: FundingSubscription = {
            id: dbSub.id,
            symbol: dbSub.symbol,
            fundingRate: dbSub.fundingRate,
            nextFundingTime: dbSub.nextFundingTime.getTime(),
            positionType: dbSub.positionType as 'long' | 'short',
            quantity: dbSub.quantity,
            primaryExchange: primaryConnector,
            hedgeExchange: hedgeConnector,
            userId: dbSub.userId,
            status: 'active',
            createdAt: dbSub.createdAt.getTime(),
            primaryCredentialId: dbSub.primaryCredentialId,
            hedgeCredentialId: dbSub.hedgeCredentialId || undefined,
            leverage: dbSub.leverage,
            margin: dbSub.margin || undefined,
          };

          // Add to memory
          this.subscriptions.set(dbSub.id, subscription);

          // Add connector references for restored subscription
          this.addConnectorReference(dbSub.primaryCredentialId, dbSub.id, dbSub.userId);
          if (dbSub.hedgeCredentialId) {
            this.addConnectorReference(dbSub.hedgeCredentialId, dbSub.id, dbSub.userId);
          }

          // Handle subscription monitoring based on status
          if (dbSub.status === 'EXECUTING') {
            // Positions already opened - schedule position closing
            console.log(`[FundingArbitrage] Scheduling position closing for EXECUTING subscription ${dbSub.id}...`);

            const entryPrice = dbSub.entryPrice || 0;
            const hedgeEntryPrice = dbSub.hedgeEntryPrice || 0;
            const fundingEarned = dbSub.fundingEarned || 0;

            // Schedule position closing - same logic as in executeArbitrageOrders
            const delayUntilFundingCheck = Math.max(10000, timeUntilFunding + 10000);
            console.log(`[FundingArbitrage] Will close positions in ${Math.floor(delayUntilFundingCheck / 1000)}s (10s after funding)`);

            setTimeout(async () => {
              try {
                // Poll for funding verification (up to 60 seconds)
                const actualFundingEarned = await this.verifyFundingWithPolling(
                  subscription,
                  entryPrice,
                  30 // Max 30 attempts × 2 seconds = 60 seconds total
                );

                // Close positions after funding is confirmed
                await this.closePositions(
                  subscription,
                  entryPrice,
                  hedgeEntryPrice,
                  actualFundingEarned !== null ? actualFundingEarned : fundingEarned
                );
              } catch (error: any) {
                console.error(`[FundingArbitrage] Error in restored subscription closing:`, error);
                this.emit(FundingArbitrageService.ERROR, {
                  subscriptionId: subscription.id,
                  error: error.message,
                });

                // Update database with error
                await prisma.fundingArbitrageSubscription.update({
                  where: { id: dbSub.id },
                  data: {
                    status: 'ERROR',
                    errorMessage: `Failed to close positions after restart: ${error.message}. Please close positions manually.`,
                  },
                });
              }
            }, delayUntilFundingCheck);

            console.log(`[FundingArbitrage] Restored EXECUTING subscription ${dbSub.id} - positions will close in ${Math.floor(delayUntilFundingCheck / 1000)}s`);
          } else {
            // Start normal countdown monitoring for ACTIVE/WAITING subscriptions
            this.startCountdownMonitoring(subscription);
            console.log(`[FundingArbitrage] Restored subscription ${dbSub.id} - ${dbSub.symbol} - funding in ${Math.floor(timeUntilFunding / 1000)}s`);
          }
        } catch (error: any) {
          console.error(`[FundingArbitrage] Error restoring subscription ${dbSub.id}:`, error.message);
        }
      }

      // Start periodic connector cleanup (every 15 minutes)
      this.cleanupTimer = setInterval(() => {
        this.cleanupStaleConnectors();
        this.cleanup(); // Existing subscription cleanup
      }, 900000); // 15 minutes

      console.log('[FundingArbitrage] Started periodic cleanup timer');

      this.initialized = true;
      console.log('[FundingArbitrage] Service initialization complete');
    } catch (error: any) {
      console.error('[FundingArbitrage] Error initializing service:', error);
    }
  }

  /**
   * Subscribe to funding rate arbitrage
   */
  async subscribe(params: {
    symbol: string;
    fundingRate: number;
    nextFundingTime: number;
    positionType: 'long' | 'short';
    quantity: number;
    primaryExchange: BaseExchangeConnector;
    hedgeExchange: BaseExchangeConnector;
    userId: string;
    primaryCredentialId?: string;
    hedgeCredentialId?: string;
    executionDelay?: number;
    leverage?: number;
    margin?: number;
  }): Promise<FundingSubscription> {
    // Save to database first (default leverage: 3x if not provided)
    const leverage = params.leverage ?? 3;
    const margin = params.margin;

    console.log('[FundingArbitrage] Creating subscription with margin:', {
      quantity: params.quantity,
      leverage,
      margin,
      marginProvided: margin !== undefined,
    });

    const dbSubscription = await prisma.fundingArbitrageSubscription.create({
      data: {
        userId: params.userId,
        symbol: params.symbol,
        fundingRate: params.fundingRate,
        nextFundingTime: new Date(params.nextFundingTime),
        positionType: params.positionType,
        quantity: params.quantity,
        leverage,
        margin,
        primaryExchange: params.primaryExchange.exchangeName,
        primaryCredentialId: params.primaryCredentialId || '',
        hedgeExchange: params.hedgeExchange.exchangeName,
        hedgeCredentialId: params.hedgeCredentialId,
        status: 'ACTIVE',
      },
    });

    const subscription: FundingSubscription = {
      id: dbSubscription.id,
      symbol: params.symbol,
      fundingRate: params.fundingRate,
      nextFundingTime: params.nextFundingTime,
      positionType: params.positionType,
      quantity: params.quantity,
      primaryExchange: params.primaryExchange,
      hedgeExchange: params.hedgeExchange,
      userId: params.userId,
      status: 'active',
      createdAt: Date.now(),
      primaryCredentialId: params.primaryCredentialId,
      hedgeCredentialId: params.hedgeCredentialId,
      executionDelay: params.executionDelay || 5,
      leverage,
      margin,
    };

    // Cache connectors for instant execution later
    if (params.primaryCredentialId) {
      this.cacheConnectorForSubscription(
        params.primaryExchange,
        params.primaryCredentialId,
        params.userId,
        dbSubscription.id
      );
    }

    if (params.hedgeCredentialId) {
      this.cacheConnectorForSubscription(
        params.hedgeExchange,
        params.hedgeCredentialId,
        params.userId,
        dbSubscription.id
      );
    }

    this.subscriptions.set(dbSubscription.id, subscription);

    console.log(`[FundingArbitrage] New subscription created with pre-initialized connectors:`, {
      id: dbSubscription.id,
      symbol: params.symbol,
      fundingRate: params.fundingRate,
      nextFundingTime: new Date(params.nextFundingTime).toISOString(),
      positionType: params.positionType,
    });

    // Start countdown monitoring
    this.startCountdownMonitoring(subscription);

    return subscription;
  }

  /**
   * Subscribe to funding rate arbitrage using credential IDs (recommended)
   * This method creates and caches connectors for instant execution
   */
  async subscribeWithCredentials(params: {
    symbol: string;
    fundingRate: number;
    nextFundingTime: number;
    positionType: 'long' | 'short';
    quantity: number;
    userId: string;
    primaryCredentialId: string;
    hedgeCredentialId: string;
    hedgeExchange: string;
    executionDelay?: number;
    leverage?: number;
    margin?: number;
  }): Promise<FundingSubscription> {
    console.log('[FundingArbitrage] Creating subscription with credential caching...');

    // Create and cache primary connector
    const primaryConnector = await this.getOrCreateConnector(
      params.userId,
      params.primaryCredentialId,
      false
    );

    // Create and cache hedge connector
    if (!params.hedgeCredentialId) {
      throw new Error('Hedge credential ID is required');
    }

    const hedgeConnector = await this.getOrCreateConnector(
      params.userId,
      params.hedgeCredentialId,
      false
    );

    console.log('[FundingArbitrage] Connectors created and cached, creating subscription...');

    // IMMEDIATELY set leverage on both exchanges (user-requested feature)
    // This allows users to verify leverage on exchange platforms right after subscribing
    const leverage = params.leverage ?? 3;
    const primarySymbol = this.convertSymbolForExchange(params.symbol, primaryConnector.exchangeName);
    const hedgeSymbol = this.convertSymbolForExchange(params.symbol, hedgeConnector.exchangeName);

    try {
      console.log(`[FundingArbitrage] Setting leverage to ${leverage}x immediately on both exchanges...`);

      // Set leverage in parallel for speed
      await Promise.all([
        this.setExchangeLeverage(primaryConnector, primarySymbol, leverage),
        this.setExchangeLeverage(hedgeConnector, hedgeSymbol, leverage),
      ]);

      console.log(`[FundingArbitrage] ✓ Leverage set successfully on both exchanges (${leverage}x)`);
    } catch (error: any) {
      console.error(`[FundingArbitrage] Failed to set leverage immediately:`, error.message);

      // Provide helpful error message
      throw new Error(
        `Failed to set leverage: ${error.message}. ` +
        `Please ensure there are no open positions on ${params.symbol} before subscribing. ` +
        `You can check your positions on the exchange platforms.`
      );
    }

    // Call the existing subscribe method with connector objects
    return this.subscribe({
      symbol: params.symbol,
      fundingRate: params.fundingRate,
      nextFundingTime: params.nextFundingTime,
      positionType: params.positionType,
      quantity: params.quantity,
      primaryExchange: primaryConnector,
      hedgeExchange: hedgeConnector,
      userId: params.userId,
      primaryCredentialId: params.primaryCredentialId,
      hedgeCredentialId: params.hedgeCredentialId,
      executionDelay: params.executionDelay,
      leverage: params.leverage,
      margin: params.margin,
    });
  }

  /**
   * Unsubscribe from funding rate arbitrage
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);

    // If in memory, clean up timers and connector references
    if (subscription) {
      // Clear countdown timer
      const timer = this.countdownTimers.get(subscriptionId);
      if (timer) {
        clearInterval(timer);
        this.countdownTimers.delete(subscriptionId);
      }

      // Remove connector references
      if (subscription.primaryCredentialId) {
        this.removeConnectorReference(
          subscription.primaryCredentialId,
          subscriptionId,
          subscription.userId
        );
      }
      if (subscription.hedgeCredentialId) {
        this.removeConnectorReference(
          subscription.hedgeCredentialId,
          subscriptionId,
          subscription.userId
        );
      }

      // Delete from memory
      this.subscriptions.delete(subscriptionId);
    }

    // Always try to delete from database
    try {
      await prisma.fundingArbitrageSubscription.delete({
        where: { id: subscriptionId },
      });
      console.log(`[FundingArbitrage] Subscription ${subscriptionId.substring(0, 8)} canceled and deleted`);
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found
        throw new Error(`Subscription ${subscriptionId} not found`);
      }
      throw error;
    }

    // Trigger cleanup of stale connectors
    this.cleanupStaleConnectors();
  }

  /**
   * Get subscription by ID
   */
  getSubscription(subscriptionId: string): FundingSubscription | undefined {
    return this.subscriptions.get(subscriptionId);
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<FundingSubscription[]> {
    // Initialize service if not already done
    await this.initialize();

    // Fetch from database
    const dbSubscriptions = await prisma.fundingArbitrageSubscription.findMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'WAITING', 'EXECUTING'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return subscriptions that are in memory (active timers)
    // Or just return database records for display
    return dbSubscriptions.map((dbSub) => ({
      id: dbSub.id,
      symbol: dbSub.symbol,
      fundingRate: dbSub.fundingRate,
      nextFundingTime: dbSub.nextFundingTime.getTime(),
      positionType: dbSub.positionType as 'long' | 'short',
      quantity: dbSub.quantity,
      primaryExchange: { exchangeName: dbSub.primaryExchange } as BaseExchangeConnector,
      hedgeExchange: { exchangeName: dbSub.hedgeExchange } as BaseExchangeConnector,
      userId: dbSub.userId,
      status: this.mapDbStatusToLocal(dbSub.status),
      createdAt: dbSub.createdAt.getTime(),
      primaryCredentialId: dbSub.primaryCredentialId,
      hedgeCredentialId: dbSub.hedgeCredentialId || undefined,
      leverage: dbSub.leverage,
      margin: dbSub.margin || undefined,
    }));
  }

  /**
   * Map database status to local status
   */
  private mapDbStatusToLocal(dbStatus: FundingArbitrageStatus): 'active' | 'executing' | 'completed' | 'failed' {
    switch (dbStatus) {
      case 'ACTIVE':
      case 'WAITING':
        return 'active';
      case 'EXECUTING':
        return 'executing';
      case 'COMPLETED':
        return 'completed';
      case 'ERROR':
      case 'CANCELLED':
        return 'failed';
      default:
        return 'active';
    }
  }

  /**
   * Get or create connector from cache (FAST PATH for instant execution)
   */
  private async getOrCreateConnector(
    userId: string,
    credentialId: string,
    forceNew: boolean = false
  ): Promise<BaseExchangeConnector> {
    const cacheKey = `${userId}_${credentialId}`;

    // Return cached connector if exists and not forcing new
    if (!forceNew && this.connectorCache.has(cacheKey)) {
      const cached = this.connectorCache.get(cacheKey)!;
      cached.lastUsed = Date.now();
      console.log(`[FundingArbitrage] ✓ Using cached ${cached.exchange} connector (age: ${Math.floor((Date.now() - cached.initializationTime) / 1000)}s)`);
      return cached.connector;
    }

    // Create new connector
    console.log(`[FundingArbitrage] Creating new connector for credential ${credentialId.substring(0, 8)}...`);
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
    const credential = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

    if (!credential) {
      throw new Error(`Credential ${credentialId} not found`);
    }

    let connector: BaseExchangeConnector;
    const startTime = Date.now();

    if (credential.exchange === 'BYBIT') {
      const { BybitConnector } = await import('@/connectors/bybit.connector');
      connector = new BybitConnector(
        credential.apiKey,
        credential.apiSecret,
        credential.environment === 'TESTNET'
      );
    } else if (credential.exchange === 'BINGX') {
      const { BingXConnector } = await import('@/connectors/bingx.connector');
      connector = new BingXConnector(
        credential.apiKey,
        credential.apiSecret,
        credential.environment === 'TESTNET',
        userId,          // Enable persistent time sync caching
        credentialId     // Enable persistent time sync caching
      );
    } else if (credential.exchange === 'MEXC') {
      const { MEXCConnector } = await import('@/connectors/mexc.connector');
      connector = new MEXCConnector(
        credential.apiKey,
        credential.apiSecret,
        credential.environment === 'TESTNET',
        credential.authToken  // Browser session token for MEXC futures trading
      );
    } else {
      throw new Error(`Exchange ${credential.exchange} not supported`);
    }

    await connector.initialize();
    const initTime = Date.now() - startTime;

    // Cache the connector
    this.connectorCache.set(cacheKey, {
      connector,
      credentialId,
      exchange: credential.exchange,
      environment: credential.environment,
      subscriptionIds: new Set(),
      lastUsed: Date.now(),
      initializationTime: Date.now(),
    });

    console.log(`[FundingArbitrage] ✓ ${credential.exchange} connector initialized in ${initTime}ms and cached`);
    return connector;
  }

  /**
   * Cache connector for a subscription (add reference)
   */
  private cacheConnectorForSubscription(
    connector: BaseExchangeConnector,
    credentialId: string,
    userId: string,
    subscriptionId: string
  ): void {
    const cacheKey = `${userId}_${credentialId}`;

    // Check if already cached
    if (this.connectorCache.has(cacheKey)) {
      this.addConnectorReference(credentialId, subscriptionId, userId);
      return;
    }

    // Add to cache with subscription reference
    this.connectorCache.set(cacheKey, {
      connector,
      credentialId,
      exchange: connector.exchangeName,
      environment: connector.exchangeName.includes('TESTNET') ? 'TESTNET' : 'PRODUCTION',
      subscriptionIds: new Set([subscriptionId]),
      lastUsed: Date.now(),
      initializationTime: Date.now(),
    });

    console.log(`[FundingArbitrage] Cached connector ${connector.exchangeName} for subscription ${subscriptionId.substring(0, 8)}`);
  }

  /**
   * Add subscription reference to connector cache
   */
  private addConnectorReference(credentialId: string, subscriptionId: string, userId: string): void {
    const cacheKey = `${userId}_${credentialId}`;
    const cached = this.connectorCache.get(cacheKey);
    if (cached) {
      cached.subscriptionIds.add(subscriptionId);
      console.log(`[FundingArbitrage] Added reference: ${cached.exchange} connector now has ${cached.subscriptionIds.size} subscription(s)`);
    }
  }

  /**
   * Remove subscription reference from connector cache
   */
  private removeConnectorReference(credentialId: string, subscriptionId: string, userId: string): void {
    const cacheKey = `${userId}_${credentialId}`;
    const cached = this.connectorCache.get(cacheKey);
    if (cached) {
      cached.subscriptionIds.delete(subscriptionId);
      console.log(`[FundingArbitrage] Removed reference: ${cached.exchange} connector now has ${cached.subscriptionIds.size} subscription(s)`);

      // If no more subscriptions using this connector, mark for cleanup
      if (cached.subscriptionIds.size === 0) {
        console.log(`[FundingArbitrage] Connector ${cacheKey} has no active subscriptions, eligible for cleanup`);
      }
    }
  }

  /**
   * Cleanup stale connectors (unused for >1 hour)
   */
  private cleanupStaleConnectors(maxIdleTime: number = 3600000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [key, cached] of this.connectorCache.entries()) {
      const idleTime = now - cached.lastUsed;

      // Only cleanup if no active subscriptions and idle for more than maxIdleTime
      if (cached.subscriptionIds.size === 0 && idleTime > maxIdleTime) {
        toRemove.push(key);
      }
    }

    toRemove.forEach((key) => {
      const cached = this.connectorCache.get(key);
      if (cached) {
        console.log(`[FundingArbitrage] Cleaning up stale ${cached.exchange} connector (idle: ${Math.floor((now - cached.lastUsed) / 1000)}s)`);
      }
      this.connectorCache.delete(key);
    });

    if (toRemove.length > 0) {
      console.log(`[FundingArbitrage] Cleaned up ${toRemove.length} stale connector(s)`);
    }
  }

  /**
   * Start countdown monitoring
   */
  private startCountdownMonitoring(subscription: FundingSubscription): void {
    const checkInterval = 250; // Check every 250ms (4 times per second) for better timing accuracy
    const executionDelay = subscription.executionDelay || 5; // Default: 5 seconds before funding

    const timer = setInterval(async () => {
      const now = Date.now();
      const timeUntilFunding = subscription.nextFundingTime - now;
      const secondsRemaining = Math.floor(timeUntilFunding / 1000);

      // Emit countdown event
      this.emit(FundingArbitrageService.COUNTDOWN, {
        subscriptionId: subscription.id,
        symbol: subscription.symbol,
        secondsRemaining,
        fundingRate: subscription.fundingRate,
        positionType: subscription.positionType,
      } as CountdownEvent);

      // Execute orders N seconds before funding (configurable)
      if (secondsRemaining <= executionDelay && secondsRemaining > 0 && subscription.status === 'active') {
        subscription.status = 'executing';
        clearInterval(timer);
        this.countdownTimers.delete(subscription.id);

        console.log(`[FundingArbitrage] Executing orders for ${subscription.symbol} (${secondsRemaining}s before funding)`);

        try {
          await this.executeArbitrageOrders(subscription);
        } catch (error: any) {
          console.error(`[FundingArbitrage] Error executing arbitrage:`, error);
          subscription.status = 'failed';
          this.emit(FundingArbitrageService.ERROR, {
            subscriptionId: subscription.id,
            error: error.message,
          });
        }
      }

      // Clean up if funding time passed
      if (timeUntilFunding < -60000) { // 1 minute after funding
        clearInterval(timer);
        this.countdownTimers.delete(subscription.id);
        if (subscription.status !== 'completed') {
          subscription.status = 'failed';
        }
      }
    }, checkInterval);

    this.countdownTimers.set(subscription.id, timer);
  }

  /**
   * Get current market price for a symbol from an exchange
   * Fetches the mark price or last price from the exchange
   *
   * @param connector Exchange connector
   * @param symbol Trading pair symbol (exchange-specific format)
   * @returns Current price as number
   */
  private async getCurrentPrice(
    connector: BaseExchangeConnector,
    symbol: string
  ): Promise<number> {
    try {
      // Try to get position data which includes markPrice
      const position = await connector.getPosition(symbol);

      // Extract price from position data (prefer markPrice, fallback to lastPrice)
      let price = 0;

      if (position) {
        price = parseFloat(position.markPrice || position.lastPrice || position.avgPrice || '0');
      }

      if (price > 0) {
        console.log(`[FundingArbitrage] Got current price for ${symbol} from ${connector.exchangeName}: ${price}`);
        return price;
      }

      throw new Error(`Could not get valid price for ${symbol} from ${connector.exchangeName}`);
    } catch (error: any) {
      console.error(`[FundingArbitrage] Error getting price for ${symbol}:`, error.message);
      throw new Error(`Failed to get current price for ${symbol}: ${error.message}`);
    }
  }

  /**
   * Convert normalized symbol to exchange-specific format
   * BingX requires hyphenated format: "H-USDT", "BTC-USDT"
   * MEXC requires underscore format: "BTC_USDT"
   * Bybit requires non-hyphenated format: "HUSDT", "BTCUSDT"
   */
  private convertSymbolForExchange(normalizedSymbol: string, exchangeName: string): string {
    // BingX requires hyphenated format
    if (exchangeName.includes('BINGX')) {
      // Add hyphen before USDT if not already present
      if (!normalizedSymbol.includes('-') && normalizedSymbol.endsWith('USDT')) {
        return normalizedSymbol.replace(/USDT$/, '-USDT');
      }
      return normalizedSymbol;
    }

    // MEXC requires underscore format
    if (exchangeName.includes('MEXC')) {
      // Add underscore before USDT if not already present
      if (!normalizedSymbol.includes('_') && normalizedSymbol.endsWith('USDT')) {
        return normalizedSymbol.replace(/USDT$/, '_USDT');
      }
      return normalizedSymbol;
    }

    // Bybit and other exchanges use non-hyphenated format (already normalized)
    return normalizedSymbol;
  }

  /**
   * Set leverage on an exchange
   * Handles exchange-specific setLeverage implementations
   * Checks for existing positions first and skips if positions exist
   *
   * @param connector Exchange connector instance
   * @param symbol Trading pair symbol (exchange-specific format)
   * @param leverage Leverage multiplier
   */
  private async setExchangeLeverage(
    connector: BaseExchangeConnector,
    symbol: string,
    leverage: number
  ): Promise<void> {
    const exchangeName = connector.exchangeName;

    console.log(`[FundingArbitrage] Setting leverage on ${exchangeName} for ${symbol}: ${leverage}x`);

    // FIRST: Check if there are any open positions on this symbol
    try {
      const position = await connector.getPosition(symbol);

      // Check if position is open (has non-zero quantity)
      const positionSize = position ? parseFloat(position.positionAmt || position.size || '0') : 0;

      if (positionSize !== 0) {
        console.warn(
          `[FundingArbitrage] ⚠️ Skipping leverage change for ${symbol} on ${exchangeName}: ` +
          `Open position detected (size: ${positionSize}). ` +
          `Leverage cannot be changed while positions are open. ` +
          `Current subscription will use existing leverage setting.`
        );
        return; // Skip leverage setting if position exists
      }

      console.log(`[FundingArbitrage] ✓ No open positions on ${symbol}, proceeding with leverage change...`);
    } catch (positionError: any) {
      console.warn(`[FundingArbitrage] Could not check position for ${symbol}: ${positionError.message}. Proceeding with leverage change...`);
      // Continue with leverage setting even if position check fails
    }

    // SECOND: Attempt to set leverage
    try {
      // Type assertion to access setLeverage method
      const connectorWithLeverage = connector as any;

      if (typeof connectorWithLeverage.setLeverage !== 'function') {
        console.warn(`[FundingArbitrage] ${exchangeName} connector does not support setLeverage, skipping...`);
        return;
      }

      // Call setLeverage - signature depends on exchange type
      if (exchangeName.includes('BINGX')) {
        // BingX: setLeverage(symbol, leverage, side)
        // Use "BOTH" for one-way mode (default)
        await connectorWithLeverage.setLeverage(symbol, leverage, 'BOTH');
      } else if (exchangeName.includes('BYBIT')) {
        // Bybit: setLeverage(symbol, leverage, category)
        // Use "linear" for USDT perpetuals (default)
        await connectorWithLeverage.setLeverage(symbol, leverage, 'linear');
      } else if (exchangeName.includes('MEXC')) {
        // MEXC: setLeverage(symbol, leverage, openType)
        // Use 2 for cross margin mode (default)
        await connectorWithLeverage.setLeverage(symbol, leverage, 2);
      } else {
        // Generic fallback (most exchanges use: symbol, leverage)
        await connectorWithLeverage.setLeverage(symbol, leverage);
      }

      console.log(`[FundingArbitrage] ✓ Leverage set successfully on ${exchangeName}: ${leverage}x`);
    } catch (error: any) {
      console.error(`[FundingArbitrage] Failed to set leverage on ${exchangeName}:`, error.message);

      // "leverage not modified" means leverage is already at the desired value - this is OK!
      if (error.message.toLowerCase().includes('leverage not modified')) {
        console.log(`[FundingArbitrage] ✓ Leverage already set to ${leverage}x on ${exchangeName}, continuing...`);
        return; // Not an error - leverage is already correct
      }

      // If error is about existing positions, provide helpful context
      if (error.message.toLowerCase().includes('position')) {
        throw new Error(
          `Cannot set leverage on ${exchangeName} for ${symbol}: ${error.message}. ` +
          `Please close all open positions on ${symbol} before subscribing. ` +
          `You can check and close your positions on the exchange platform.`
        );
      }

      throw new Error(`Failed to set leverage on ${exchangeName}: ${error.message}`);
    }
  }

  /**
   * Execute arbitrage orders
   */
  private async executeArbitrageOrders(subscription: FundingSubscription): Promise<void> {
    const { symbol, positionType, quantity, primaryExchange, hedgeExchange, margin, leverage } = subscription;

    // Convert symbol to exchange-specific format
    const primarySymbol = this.convertSymbolForExchange(symbol, primaryExchange.exchangeName);
    const hedgeSymbol = this.convertSymbolForExchange(symbol, hedgeExchange.exchangeName);

    console.log(`[FundingArbitrage] Symbol conversion:`, {
      normalized: symbol,
      primaryExchange: primaryExchange.exchangeName,
      primarySymbol,
      hedgeExchange: hedgeExchange.exchangeName,
      hedgeSymbol,
    });

    // Determine order sides
    // For funding farming:
    // - If funding is NEGATIVE (positionType='long'), go LONG to receive funding
    // - If funding is POSITIVE (positionType='short'), go SHORT to receive funding
    const primarySide: OrderSide = positionType === 'long' ? 'Buy' : 'Sell';
    const hedgeSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';

    // IMPORTANT: Calculate separate quantities for each exchange based on current prices
    // This ensures equal margin usage on both exchanges despite price differences
    let primaryQuantity = quantity;
    let hedgeQuantity = quantity;

    if (margin && leverage) {
      console.log(`[FundingArbitrage] Fetching current prices from both exchanges to calculate precise quantities...`);
      const priceStartTime = Date.now();

      try {
        // Fetch current prices from both exchanges in parallel
        const [primaryPriceData, hedgePriceData] = await Promise.all([
          this.getCurrentPrice(primaryExchange, primarySymbol),
          this.getCurrentPrice(hedgeExchange, hedgeSymbol),
        ]);

        const priceFetchTime = Date.now() - priceStartTime;
        console.log(`[FundingArbitrage] ✓ Prices fetched in ${priceFetchTime}ms:`, {
          primaryPrice: primaryPriceData,
          hedgePrice: hedgePriceData,
        });

        // Calculate position value from margin and leverage
        const positionValue = margin * leverage;

        // Calculate separate quantities for each exchange
        primaryQuantity = positionValue / primaryPriceData;
        hedgeQuantity = positionValue / hedgePriceData;

        console.log(`[FundingArbitrage] ✓ Calculated separate quantities for equal margin:`, {
          margin,
          leverage,
          positionValue,
          primaryPrice: primaryPriceData,
          hedgePrice: hedgePriceData,
          primaryQuantity,
          hedgeQuantity,
          primaryValue: primaryQuantity * primaryPriceData,
          hedgeValue: hedgeQuantity * hedgePriceData,
        });

      } catch (priceError: any) {
        console.error(`[FundingArbitrage] Failed to fetch current prices: ${priceError.message}`);
        console.log(`[FundingArbitrage] Falling back to same quantity on both exchanges: ${quantity}`);
        // Fallback: use the same quantity (old behavior)
        primaryQuantity = quantity;
        hedgeQuantity = quantity;
      }
    } else {
      console.log(`[FundingArbitrage] No margin/leverage provided, using same quantity on both exchanges: ${quantity}`);
    }

    console.log(`[FundingArbitrage] Executing ${positionType} position:`, {
      symbol,
      primarySide,
      hedgeSide,
      primaryQuantity,
      hedgeQuantity,
    });

    // Hedge will open exactly AT funding time (countdown = 0) to avoid paying negative funding
    console.log(`[FundingArbitrage] Hedge will open AT funding time (countdown = 0) to avoid negative funding`);

    // STEP 0: Synchronize leverage on both exchanges BEFORE opening positions
    // Use subscription leverage setting (default: 3x if not specified)
    const subscriptionLeverage = leverage ?? 3;

    try {
      console.log(`[FundingArbitrage] Synchronizing leverage to ${subscriptionLeverage}x on both exchanges...`);

      // Synchronize leverage in parallel for speed
      await Promise.all([
        this.setExchangeLeverage(primaryExchange, primarySymbol, subscriptionLeverage),
        this.setExchangeLeverage(hedgeExchange, hedgeSymbol, subscriptionLeverage),
      ]);

      console.log(`[FundingArbitrage] Leverage synchronized successfully on both exchanges (${subscriptionLeverage}x)`);
    } catch (error: any) {
      console.error(`[FundingArbitrage] Failed to synchronize leverage:`, error.message);

      // Update subscription status to failed
      subscription.status = 'failed';
      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ERROR',
          errorMessage: `Leverage sync failed: ${error.message}`,
        },
      });

      // Emit error event
      this.emit(FundingArbitrageService.ERROR, {
        subscriptionId: subscription.id,
        error: `Leverage synchronization failed: ${error.message}`,
      });

      throw new Error(`Leverage synchronization failed: ${error.message}`);
    }

    // 1. Notify user: Primary order executing (hedge will execute AFTER funding)
    this.emit(FundingArbitrageService.ORDER_EXECUTING, {
      subscriptionId: subscription.id,
      symbol,
      type: 'primary',
      side: primarySide,
      quantity: primaryQuantity,
      exchange: primaryExchange.exchangeName,
    });

    // 2. Execute PRIMARY order FIRST (to receive funding)
    console.log(`[FundingArbitrage] 📊 Opening PRIMARY position (will receive funding)...`);
    const primaryOrderStartTime = Date.now();

    const primaryOrder = await primaryExchange.placeMarketOrder(primarySymbol, primarySide, primaryQuantity);

    const primaryOrderTime = Date.now() - primaryOrderStartTime;
    console.log(`[FundingArbitrage] ✓ Primary order executed in ${primaryOrderTime}ms`);
    console.log(`[FundingArbitrage] Primary order:`, primaryOrder);

    // 3. Notify primary order executed
    this.emit(FundingArbitrageService.ORDER_EXECUTED, {
      subscriptionId: subscription.id,
      symbol,
      type: 'primary',
      order: primaryOrder,
      timestamp: Date.now(),
    } as OrderExecutionEvent);

    // 4. Calculate time to wait before opening hedge (exactly at funding time)
    const timeUntilFunding = subscription.nextFundingTime - Date.now();
    const delayBeforeHedge = timeUntilFunding; // Open hedge AT funding time (countdown = 0)
    const hedgeWaitSeconds = Math.max(0, Math.floor(delayBeforeHedge / 1000));

    console.log(`[FundingArbitrage] ⏳ Waiting ${hedgeWaitSeconds}s before opening hedge...`);
    console.log(`[FundingArbitrage] Hedge will open when countdown reaches 0 (at funding time)`);

    // 5. Wait until funding time, then open hedge
    await new Promise(resolve => setTimeout(resolve, Math.max(0, delayBeforeHedge)));

    console.log(`[FundingArbitrage] ✓ Funding should be paid now, opening HEDGE position...`);

    // 6. Notify hedge executing
    this.emit(FundingArbitrageService.HEDGE_EXECUTING, {
      subscriptionId: subscription.id,
      symbol,
      type: 'hedge',
      side: hedgeSide,
      quantity: hedgeQuantity,
      exchange: hedgeExchange.exchangeName,
    });

    // 7. Execute HEDGE order AFTER funding with rollback on failure
    let hedgeOrder: any;
    const hedgeOrderStartTime = Date.now();

    try {
      hedgeOrder = await hedgeExchange.placeMarketOrder(hedgeSymbol, hedgeSide, hedgeQuantity);

      const hedgeOrderTime = Date.now() - hedgeOrderStartTime;
      console.log(`[FundingArbitrage] ✓ Hedge order executed in ${hedgeOrderTime}ms (AFTER funding)`);
      console.log(`[FundingArbitrage] Hedge order:`, hedgeOrder);

      // 8. Notify hedge executed
      this.emit(FundingArbitrageService.HEDGE_EXECUTED, {
        subscriptionId: subscription.id,
        symbol,
        type: 'hedge',
        order: hedgeOrder,
        timestamp: Date.now(),
      } as OrderExecutionEvent);
    } catch (hedgeError: any) {
      // ⚠️ CRITICAL: Hedge order failed! PRIMARY position is open and unhedged!
      console.error(`[FundingArbitrage] ⚠️ HEDGE ORDER FAILED: ${hedgeError.message}`);
      console.error(`[FundingArbitrage] ⚠️ PRIMARY position is OPEN and UNHEDGED - initiating emergency rollback!`);

      // Determine opposite side to close primary position
      const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';

      // Attempt to close PRIMARY position immediately
      try {
        console.log(`[FundingArbitrage] 🚨 Attempting emergency close of PRIMARY position on ${primaryExchange.exchangeName}...`);
        await this.forceClosePosition(
          primaryExchange,
          primarySymbol,
          primaryCloseSide,
          primaryQuantity,
          primaryExchange.exchangeName
        );
        console.log(`[FundingArbitrage] ✓ PRIMARY position successfully closed (rollback complete)`);

        // Update database with error status
        subscription.status = 'failed';
        await prisma.fundingArbitrageSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ERROR',
            errorMessage: `Hedge order failed: ${hedgeError.message}. Primary position was automatically closed to prevent unhedged exposure. ${
              hedgeError.message.includes('Insufficient margin') || hedgeError.message.includes('101253')
                ? 'Please ensure you have sufficient margin in your BingX account.'
                : ''
            }`,
          },
        });

        // Emit error event
        this.emit(FundingArbitrageService.ERROR, {
          subscriptionId: subscription.id,
          error: `Hedge failed (auto-rolled back): ${hedgeError.message}`,
        });

        // Throw informative error
        throw new Error(
          `Hedge order failed: ${hedgeError.message}. ` +
          `PRIMARY position was automatically closed to prevent unhedged exposure. ` +
          `${hedgeError.message.includes('Insufficient margin') || hedgeError.message.includes('101253')
            ? 'Please ensure you have sufficient margin in your BingX account before subscribing.'
            : 'Please check your hedge exchange configuration and try again.'
          }`
        );
      } catch (rollbackError: any) {
        // ⚠️ CATASTROPHIC: Rollback failed! Position is still open!
        console.error(`[FundingArbitrage] ⚠️⚠️⚠️ CATASTROPHIC: ROLLBACK FAILED! ${rollbackError.message}`);
        console.error(`[FundingArbitrage] ⚠️⚠️⚠️ PRIMARY position on ${primaryExchange.exchangeName} is still OPEN!`);

        // Update database with critical error status
        subscription.status = 'failed';
        await prisma.fundingArbitrageSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ERROR',
            errorMessage: `⚠️ CRITICAL: Hedge failed AND rollback failed! PRIMARY position on ${primaryExchange.exchangeName} for ${symbol} is OPEN and UNHEDGED. Manual intervention required! Hedge error: ${hedgeError.message}. Rollback error: ${rollbackError.message}`,
          },
        });

        // Emit critical error event
        this.emit(FundingArbitrageService.ERROR, {
          subscriptionId: subscription.id,
          error: `CRITICAL: Hedge failed, rollback failed - manual intervention required!`,
        });

        // Throw critical error
        throw new Error(
          `⚠️⚠️⚠️ CRITICAL ERROR ⚠️⚠️⚠️\n` +
          `Hedge order failed: ${hedgeError.message}\n` +
          `Automatic rollback FAILED: ${rollbackError.message}\n\n` +
          `PRIMARY POSITION ON ${primaryExchange.exchangeName} FOR ${symbol} IS STILL OPEN AND UNHEDGED!\n` +
          `You MUST manually close this position immediately to prevent losses:\n` +
          `- Symbol: ${primarySymbol}\n` +
          `- Side to close: ${primaryCloseSide}\n` +
          `- Quantity: ${primaryQuantity}\n\n` +
          `Please close this position on ${primaryExchange.exchangeName} NOW!`
        );
      }
    }

    // 4. Get actual entry prices from positions (market orders don't return avgPrice immediately)
    let entryPrice = primaryOrder.avgPrice || primaryOrder.price || 0;
    let hedgeEntryPrice = hedgeOrder.avgPrice || hedgeOrder.price || 0;

    // If prices are not in order response, fetch from positions in parallel ⚡
    const needPrimaryPrice = entryPrice === 0;
    const needHedgePrice = hedgeEntryPrice === 0;

    if (needPrimaryPrice || needHedgePrice) {
      console.log(`[FundingArbitrage] ⚡ Fetching entry prices in parallel...`);
      const priceStartTime = Date.now();

      const [primaryPosition, hedgePosition] = await Promise.all([
        needPrimaryPrice ? primaryExchange.getPosition(primarySymbol) : Promise.resolve(null),
        needHedgePrice ? hedgeExchange.getPosition(hedgeSymbol) : Promise.resolve(null),
      ]);

      if (needPrimaryPrice && primaryPosition) {
        entryPrice = parseFloat(primaryPosition.avgPrice || primaryPosition.entryPrice || '0');
        console.log(`[FundingArbitrage] Primary entry price: ${entryPrice}`);
      }

      if (needHedgePrice && hedgePosition) {
        hedgeEntryPrice = parseFloat(hedgePosition.avgPrice || hedgePosition.entryPrice || '0');
        console.log(`[FundingArbitrage] Hedge entry price: ${hedgeEntryPrice}`);
      }

      const priceFetchTime = Date.now() - priceStartTime;
      console.log(`[FundingArbitrage] ✓ Entry prices fetched in ${priceFetchTime}ms (parallel)`);
    }

    // Calculate funding earned (funding rate * position value)
    // Funding payment = fundingRate * positionSize * entryPrice
    const fundingEarned = subscription.fundingRate * quantity * entryPrice;

    console.log(`[FundingArbitrage] Positions opened:`, {
      entryPrice,
      hedgeEntryPrice,
      fundingEarned,
    });

    // 6. Schedule funding verification and position closing with polling
    const timeUntilFundingVerification = subscription.nextFundingTime - Date.now();
    const delayUntilFundingCheck = Math.max(10000, timeUntilFundingVerification + 10000); // Wait 10 seconds after funding time to start polling

    console.log(`[FundingArbitrage] Scheduling funding verification in ${Math.floor(delayUntilFundingCheck / 1000)}s`);

    setTimeout(async () => {
      try {
        // Poll for funding verification (up to 60 seconds)
        const actualFundingEarned = await this.verifyFundingWithPolling(
          subscription,
          entryPrice,
          30 // Max 30 attempts × 2 seconds = 60 seconds total
        );

        // Close positions after funding is confirmed
        await this.closePositions(
          subscription,
          entryPrice,
          hedgeEntryPrice,
          actualFundingEarned !== null ? actualFundingEarned : fundingEarned
        );
      } catch (error: any) {
        console.error(`[FundingArbitrage] Error in funding verification/closing:`, error);
        this.emit(FundingArbitrageService.ERROR, {
          subscriptionId: subscription.id,
          error: error.message,
        });
      }
    }, delayUntilFundingCheck);

    // 7. Update database with entry data (but not completed yet)
    await prisma.fundingArbitrageSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'EXECUTING',
        entryPrice,
        hedgeEntryPrice,
        fundingEarned,
        executedAt: new Date(),
      },
    });

    console.log(`[FundingArbitrage] Arbitrage orders executed for ${symbol}, waiting for funding payment`);
  }

  /**
   * Verify funding with polling (retry every 2 seconds until found or timeout)
   */
  private async verifyFundingWithPolling(
    subscription: FundingSubscription,
    entryPrice: number,
    maxAttempts: number = 30
  ): Promise<number | null> {
    const { symbol } = subscription;

    console.log(`[FundingArbitrage] Starting funding verification polling for ${symbol} (max ${maxAttempts} attempts @ 2s intervals)`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const elapsed = (attempt - 1) * 2;
      console.log(`[FundingArbitrage] Polling attempt ${attempt}/${maxAttempts} (${elapsed}s elapsed)...`);

      const funding = await this.verifyFundingReceived(subscription, entryPrice);

      if (funding !== null) {
        console.log(`[FundingArbitrage] ✅ Funding confirmed on attempt ${attempt} (${elapsed}s)!`);
        return funding;
      }

      // Don't wait after the last attempt
      if (attempt < maxAttempts) {
        console.log(`[FundingArbitrage] No funding yet, waiting 2 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    const totalTime = (maxAttempts - 1) * 2;
    console.warn(`[FundingArbitrage] ⚠️ Funding not detected after ${maxAttempts} attempts (${totalTime}s total)`);
    console.warn(`[FundingArbitrage] Using calculated funding amount as fallback`);
    return null;
  }

  /**
   * Verify that funding fee was actually received (single check)
   */
  private async verifyFundingReceived(
    subscription: FundingSubscription,
    entryPrice: number
  ): Promise<number | null> {
    const { symbol, primaryExchange, nextFundingTime } = subscription;

    try {
      // Cast to BybitConnector to access getTransactionLog
      const bybitConnector = primaryExchange as any;
      if (typeof bybitConnector.getTransactionLog !== 'function') {
        console.log(`[FundingArbitrage] Exchange does not support transaction log - skipping verification`);
        return null;
      }

      // Query transaction logs around funding time (±2 minutes)
      const startTime = nextFundingTime - 120000; // 2 minutes before
      const endTime = nextFundingTime + 120000;   // 2 minutes after

      const transactions = await bybitConnector.getTransactionLog({
        category: 'linear',
        type: 'SETTLEMENT', // Funding fee settlements
        startTime,
        endTime,
        limit: 50,
      });

      // Find the funding settlement for this symbol
      const fundingSettlement = transactions.find((tx: any) => {
        const txTime = parseInt(tx.transactionTime);
        const timeDiff = Math.abs(txTime - nextFundingTime);

        // Match symbol and time (within 2 minutes)
        return tx.symbol === symbol && timeDiff < 120000;
      });

      if (fundingSettlement) {
        const actualFunding = parseFloat(fundingSettlement.funding || '0');
        console.log(`[FundingArbitrage] ✅ Funding verified! Received: ${actualFunding} USDT`);

        this.emit(FundingArbitrageService.SUBSCRIPTION_COMPLETED, {
          subscriptionId: subscription.id,
          symbol,
          fundingVerified: true,
          actualFunding,
        });

        return actualFunding;
      } else {
        console.warn(`[FundingArbitrage] ⚠️ WARNING: No funding settlement found for ${symbol}`);
        console.warn(`[FundingArbitrage] Expected funding time: ${new Date(nextFundingTime).toISOString()}`);
        console.warn(`[FundingArbitrage] Will use calculated funding amount as fallback`);

        return null; // Use calculated funding as fallback
      }
    } catch (error: any) {
      console.error(`[FundingArbitrage] Error verifying funding:`, error.message);
      console.log(`[FundingArbitrage] Continuing with calculated funding amount`);
      return null; // Use calculated funding on error
    }
  }

  /**
   * Force close a position using multiple fallback methods
   * Tries: 1) placeReduceOnlyOrder, 2) closePosition, 3) regular market order
   *
   * @param connector Exchange connector
   * @param symbol Exchange-specific symbol
   * @param side Close direction (opposite of entry)
   * @param quantity Position size
   * @param exchangeName Exchange name for logging
   * @returns Order response
   */
  private async forceClosePosition(
    connector: BaseExchangeConnector,
    symbol: string,
    side: OrderSide,
    quantity: number,
    exchangeName: string
  ): Promise<any> {
    const methods = [
      { name: 'reduce-only order', method: 'placeReduceOnlyOrder' },
      { name: 'close position API', method: 'closePosition' },
      { name: 'regular market order', method: 'placeMarketOrder' },
    ];

    let lastError: any = null;

    for (const { name, method } of methods) {
      try {
        console.log(`[FundingArbitrage] Attempting to close ${exchangeName} position with ${name}...`);

        const connectorWithMethod = connector as any;

        // Check if method exists
        if (typeof connectorWithMethod[method] !== 'function') {
          console.log(`[FundingArbitrage] ${exchangeName} doesn't support ${name}, trying next method...`);
          continue;
        }

        // Try to execute the method
        let result;
        if (method === 'closePosition') {
          // closePosition typically takes only symbol
          result = await connectorWithMethod[method](symbol);
        } else {
          // placeReduceOnlyOrder and placeMarketOrder take symbol, side, quantity
          result = await connectorWithMethod[method](symbol, side, quantity);
        }

        console.log(`[FundingArbitrage] ✓ ${exchangeName} position closed successfully using ${name}`);
        return result;

      } catch (error: any) {
        lastError = error;
        console.warn(`[FundingArbitrage] ${name} failed for ${exchangeName}: ${error.message}`);

        // Continue to next method
        if (methods.indexOf({ name, method }) < methods.length - 1) {
          console.log(`[FundingArbitrage] Trying next close method...`);
        }
      }
    }

    // If we get here, all methods failed
    throw new Error(
      `Failed to close ${exchangeName} position after trying all methods. ` +
      `Last error: ${lastError?.message || 'unknown'}. ` +
      `Please manually close the position for ${symbol} on ${exchangeName} immediately!`
    );
  }

  /**
   * Close positions after funding payment
   */
  private async closePositions(
    subscription: FundingSubscription,
    entryPrice: number,
    hedgeEntryPrice: number,
    fundingEarned: number
  ): Promise<void> {
    const { symbol, positionType, primaryExchange, hedgeExchange } = subscription;

    // Convert symbol to exchange-specific format
    const primarySymbol = this.convertSymbolForExchange(symbol, primaryExchange.exchangeName);
    const hedgeSymbol = this.convertSymbolForExchange(symbol, hedgeExchange.exchangeName);

    console.log(`[FundingArbitrage] Closing positions for ${symbol}...`);

    // IMPORTANT: Get actual position sizes from exchanges
    // These may differ from the original quantity due to:
    // 1. Separate quantities calculated for each exchange based on price differences
    // 2. Order fills and slippage
    let primaryQuantity = subscription.quantity; // Fallback to subscription quantity
    let hedgeQuantity = subscription.quantity;   // Fallback to subscription quantity

    try {
      console.log(`[FundingArbitrage] Fetching actual position sizes from exchanges...`);
      const [primaryPosition, hedgePosition] = await Promise.all([
        primaryExchange.getPosition(primarySymbol),
        hedgeExchange.getPosition(hedgeSymbol),
      ]);

      // Extract actual quantities from positions
      if (primaryPosition) {
        const posSize = Math.abs(parseFloat(primaryPosition.positionAmt || primaryPosition.size || '0'));
        if (posSize > 0) {
          primaryQuantity = posSize;
          console.log(`[FundingArbitrage] Primary position actual size: ${primaryQuantity}`);
        }
      }

      if (hedgePosition) {
        const posSize = Math.abs(parseFloat(hedgePosition.positionAmt || hedgePosition.size || '0'));
        if (posSize > 0) {
          hedgeQuantity = posSize;
          console.log(`[FundingArbitrage] Hedge position actual size: ${hedgeQuantity}`);
        }
      }
    } catch (posError: any) {
      console.warn(`[FundingArbitrage] Could not fetch actual position sizes: ${posError.message}`);
      console.log(`[FundingArbitrage] Using subscription quantities as fallback`);
    }

    // Close positions (opposite direction from entry)
    const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';
    const hedgeCloseSide: OrderSide = positionType === 'long' ? 'Buy' : 'Sell';

    // CRITICAL: Close BOTH positions in PARALLEL using Promise.allSettled()
    // This ensures we attempt to close both positions even if one fails
    // Partial closes (one closed, one open) are extremely dangerous for arbitrage!
    // Using forceClosePosition with multiple fallback methods for maximum reliability
    console.log(`[FundingArbitrage] ⚡ Force-closing both positions in parallel with fallback methods...`);
    const closeStartTime = Date.now();

    const closeResults = await Promise.allSettled([
      this.forceClosePosition(primaryExchange, primarySymbol, primaryCloseSide, primaryQuantity, primaryExchange.exchangeName),
      this.forceClosePosition(hedgeExchange, hedgeSymbol, hedgeCloseSide, hedgeQuantity, hedgeExchange.exchangeName),
    ]);

    const closeTime = Date.now() - closeStartTime;
    console.log(`[FundingArbitrage] ✓ Close attempts completed in ${closeTime}ms (parallel)`);

    // Check results and handle errors
    const primaryResult = closeResults[0];
    const hedgeResult = closeResults[1];

    let primaryCloseOrder: any;
    let hedgeCloseOrder: any;

    // Handle primary close result
    if (primaryResult.status === 'fulfilled') {
      primaryCloseOrder = primaryResult.value;
      console.log(`[FundingArbitrage] ✓ Primary position closed successfully:`, primaryCloseOrder);
    } else {
      console.error(`[FundingArbitrage] ✗ Primary position close FAILED:`, primaryResult.reason);
    }

    // Handle hedge close result
    if (hedgeResult.status === 'fulfilled') {
      hedgeCloseOrder = hedgeResult.value;
      console.log(`[FundingArbitrage] ✓ Hedge position closed successfully:`, hedgeCloseOrder);
    } else {
      console.error(`[FundingArbitrage] ✗ Hedge position close FAILED:`, hedgeResult.reason);
    }

    // Check if we have a partial close situation (CRITICAL ERROR!)
    if (primaryResult.status !== hedgeResult.status) {
      const closedExchange = primaryResult.status === 'fulfilled' ? primaryExchange.exchangeName : hedgeExchange.exchangeName;
      const failedExchange = primaryResult.status === 'rejected' ? primaryExchange.exchangeName : hedgeExchange.exchangeName;
      const error = primaryResult.status === 'rejected' ? primaryResult.reason : hedgeResult.reason;

      throw new Error(
        `⚠️ PARTIAL CLOSE DETECTED! ⚠️ ${closedExchange} position was closed, but ${failedExchange} position FAILED to close: ${error.message}. ` +
        `This is a critical error - you have one open position remaining! ` +
        `Please manually close the ${failedExchange} position for ${symbol} immediately to avoid losses.`
      );
    }

    // Check if both failed (also CRITICAL!)
    if (primaryResult.status === 'rejected' && hedgeResult.status === 'rejected') {
      throw new Error(
        `⚠️ BOTH POSITIONS FAILED TO CLOSE! ⚠️ ` +
        `Primary (${primaryExchange.exchangeName}): ${primaryResult.reason.message}. ` +
        `Hedge (${hedgeExchange.exchangeName}): ${hedgeResult.reason.message}. ` +
        `Please manually close both positions for ${symbol} immediately!`
      );
    }

    // If we get here, both positions closed successfully

    // 3. Get actual exit prices from positions (wait a moment for position to update)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second for positions to settle

    let primaryExitPrice = primaryCloseOrder.avgPrice || primaryCloseOrder.price || 0;
    let hedgeExitPrice = hedgeCloseOrder.avgPrice || hedgeCloseOrder.price || 0;

    // If exit price is not in order response, use current market price as fallback
    if (primaryExitPrice === 0) {
      console.log(`[FundingArbitrage] Could not get exit price from order, fetching market price...`);
      try {
        const position = await primaryExchange.getPosition(primarySymbol);
        // Position should be closed now, use mark price as exit price
        primaryExitPrice = parseFloat(position.markPrice || position.lastPrice || '0');
        console.log(`[FundingArbitrage] Using market price for primary exit: ${primaryExitPrice}`);
      } catch (error) {
        console.error(`[FundingArbitrage] Error fetching market price, using entry price as fallback`);
        primaryExitPrice = entryPrice;
      }
    }

    if (hedgeExitPrice === 0) {
      console.log(`[FundingArbitrage] Could not get hedge exit price from order, fetching market price...`);
      try {
        const position = await hedgeExchange.getPosition(hedgeSymbol);
        hedgeExitPrice = parseFloat(position.markPrice || position.lastPrice || '0');
        console.log(`[FundingArbitrage] Using market price for hedge exit: ${hedgeExitPrice}`);
      } catch (error) {
        console.error(`[FundingArbitrage] Error fetching hedge market price, using entry price as fallback`);
        hedgeExitPrice = hedgeEntryPrice;
      }
    }

    // 4. Calculate trading fees using ACTUAL quantities
    // Extract fees from order responses or estimate using typical maker/taker fees
    const primaryEntryFee = primaryCloseOrder.commission || 0;
    const hedgeEntryFee = hedgeCloseOrder.commission || 0;

    // Estimate fees if not provided (typical taker fee: 0.055% for Bybit, 0.05% for BingX)
    const estimatedPrimaryFee = primaryEntryFee || (primaryQuantity * entryPrice * 0.00055);
    const estimatedHedgeFee = hedgeEntryFee || (hedgeQuantity * hedgeEntryPrice * 0.0005);

    // Total fees include both entry and exit
    // For simplicity, we double the exit order fee as we had entry fees too
    const primaryTradingFees = estimatedPrimaryFee * 2;
    const hedgeTradingFees = estimatedHedgeFee * 2;

    console.log(`[FundingArbitrage] Trading fees calculated using actual quantities:`, {
      primaryQuantity,
      hedgeQuantity,
      primaryTradingFees,
      hedgeTradingFees,
      totalFees: primaryTradingFees + hedgeTradingFees,
    });

    // 5. Calculate P&L from price movements using ACTUAL quantities
    // For long primary: P&L = (exitPrice - entryPrice) * quantity
    // For short primary: P&L = (entryPrice - exitPrice) * quantity
    const primaryPnL = positionType === 'long'
      ? (primaryExitPrice - entryPrice) * primaryQuantity
      : (entryPrice - primaryExitPrice) * primaryQuantity;

    // Hedge has opposite P&L
    const hedgePnL = positionType === 'long'
      ? (hedgeEntryPrice - hedgeExitPrice) * hedgeQuantity
      : (hedgeExitPrice - hedgeEntryPrice) * hedgeQuantity;

    // Total realized P&L = funding earned + primary P&L + hedge P&L - total fees
    const realizedPnl = fundingEarned + primaryPnL + hedgePnL - primaryTradingFees - hedgeTradingFees;

    console.log(`[FundingArbitrage] Final P&L calculation:`, {
      fundingEarned,
      primaryPnL,
      hedgePnL,
      primaryTradingFees,
      hedgeTradingFees,
      realizedPnl,
      entryPrice,
      primaryExitPrice,
      hedgeEntryPrice,
      hedgeExitPrice,
    });

    // 6. Update database with final results
    await prisma.fundingArbitrageSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'COMPLETED',
        realizedPnl,
        primaryExitPrice,
        hedgeExitPrice,
        primaryTradingFees,
        hedgeTradingFees,
        closedAt: new Date(),
      },
    });

    // 7. Remove from in-memory subscriptions
    this.subscriptions.delete(subscription.id);

    // 8. Emit completion event
    subscription.status = 'completed';
    this.emit(FundingArbitrageService.SUBSCRIPTION_COMPLETED, {
      subscriptionId: subscription.id,
      symbol,
      fundingRate: subscription.fundingRate,
      entryPrice,
      hedgeEntryPrice,
      fundingEarned,
      realizedPnl,
      primaryExitPrice,
      hedgeExitPrice,
      primaryTradingFees,
      hedgeTradingFees,
    });

    console.log(`[FundingArbitrage] Deal completed for ${symbol} - P&L: $${realizedPnl.toFixed(4)}`);
  }

  /**
   * Get all active subscriptions
   */
  getAllSubscriptions(): FundingSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Manually execute a subscription immediately (skip countdown)
   */
  async executeSubscriptionNow(subscriptionId: string): Promise<void> {
    let subscription = this.subscriptions.get(subscriptionId);

    // If not in memory, try to load from database and recreate connectors
    if (!subscription) {
      const dbSub = await prisma.fundingArbitrageSubscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!dbSub) {
        throw new Error(`Subscription ${subscriptionId} not found`);
      }

      // Use cached connectors for INSTANT execution (FAST PATH)
      console.log(`[FundingArbitrage] Loading subscription from database, attempting to use cached connectors...`);
      const startTime = Date.now();

      let primaryConnector: BaseExchangeConnector;
      let hedgeConnector: BaseExchangeConnector;

      try {
        // Fast path: use cached connectors
        primaryConnector = await this.getOrCreateConnector(
          dbSub.userId,
          dbSub.primaryCredentialId,
          false // Use cached if available
        );

        if (!dbSub.hedgeCredentialId) {
          throw new Error(`No hedge credential for subscription ${dbSub.id}`);
        }

        hedgeConnector = await this.getOrCreateConnector(
          dbSub.userId,
          dbSub.hedgeCredentialId,
          false // Use cached if available
        );

        const loadTime = Date.now() - startTime;
        console.log(`[FundingArbitrage] ✓ Connectors loaded in ${loadTime}ms (cached: ${loadTime < 1000})`);
      } catch (error: any) {
        throw new Error(`Failed to initialize connectors: ${error.message}`);
      }

      // Recreate subscription object
      subscription = {
        id: dbSub.id,
        symbol: dbSub.symbol,
        fundingRate: dbSub.fundingRate,
        nextFundingTime: dbSub.nextFundingTime.getTime(),
        positionType: dbSub.positionType as 'long' | 'short',
        quantity: dbSub.quantity,
        primaryExchange: primaryConnector,
        hedgeExchange: hedgeConnector,
        userId: dbSub.userId,
        status: 'active',
        createdAt: dbSub.createdAt.getTime(),
        primaryCredentialId: dbSub.primaryCredentialId,
        hedgeCredentialId: dbSub.hedgeCredentialId || undefined,
        leverage: dbSub.leverage,
        margin: dbSub.margin || undefined,
      };

      // Add subscription references to cached connectors
      this.addConnectorReference(dbSub.primaryCredentialId, subscriptionId, dbSub.userId);
      if (dbSub.hedgeCredentialId) {
        this.addConnectorReference(dbSub.hedgeCredentialId, subscriptionId, dbSub.userId);
      }

      // Add to memory
      this.subscriptions.set(subscriptionId, subscription);
    }

    if (subscription.status !== 'active') {
      throw new Error(`Subscription ${subscriptionId} is not in active state (current: ${subscription.status})`);
    }

    // Clear countdown timer if exists
    const timer = this.countdownTimers.get(subscriptionId);
    if (timer) {
      clearInterval(timer);
      this.countdownTimers.delete(subscriptionId);
    }

    // Update status and execute
    subscription.status = 'executing';

    console.log(`[FundingArbitrage] ⚡ Executing subscription ${subscriptionId.substring(0, 8)} with cached connectors`);

    try {
      await this.executeArbitrageOrders(subscription);
    } catch (error: any) {
      console.error(`[FundingArbitrage] Error in manual execution:`, error);
      subscription.status = 'failed';
      this.emit(FundingArbitrageService.ERROR, {
        subscriptionId: subscription.id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Cleanup completed/failed subscriptions
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, sub] of this.subscriptions.entries()) {
      const age = now - sub.createdAt;
      if ((sub.status === 'completed' || sub.status === 'failed') && age > maxAge) {
        toRemove.push(id);
      }
    }

    toRemove.forEach((id) => {
      const timer = this.countdownTimers.get(id);
      if (timer) {
        clearInterval(timer);
        this.countdownTimers.delete(id);
      }
      this.subscriptions.delete(id);
      console.log(`[FundingArbitrage] Cleaned up subscription ${id}`);
    });
  }
}

// Export singleton instance
export const fundingArbitrageService = new FundingArbitrageService();

// Add error event listener to prevent unhandled error crashes
fundingArbitrageService.on(FundingArbitrageService.ERROR, (error) => {
  console.error('[FundingArbitrage] Error event received:', error);
});
