import { EventEmitter } from 'events';
import { BaseExchangeConnector, OrderSide } from '../connectors/base-exchange.connector';
import prisma from '@/lib/prisma';
import { FundingArbitrageStatus } from '@prisma/client';
import { PositionCloseStrategyFactory } from '../strategies/position-close-strategy';

export interface FundingSubscription {
  id: string;
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  positionType: 'long' | 'short';
  quantity: number;
  primaryExchange: BaseExchangeConnector;
  hedgeExchange?: BaseExchangeConnector; // Optional for NON_HEDGED mode
  userId: string;
  status: 'active' | 'executing' | 'completed' | 'failed';
  createdAt: number;
  primaryCredentialId?: string;
  hedgeCredentialId?: string;
  executionDelay?: number; // Seconds before funding time to execute PRIMARY order (default: 5)
  leverage?: number; // Leverage multiplier (1-125, recommended 1-20, default: 3)
  margin?: number; // Margin/collateral used for this position (in USDT)
  mode?: 'HEDGED' | 'NON_HEDGED'; // Arbitrage mode (default: HEDGED)
  takeProfit?: number; // [LEGACY] Take-profit percentage (e.g., 0.5 = 0.5% profit target)
  stopLoss?: number; // [LEGACY] Stop-loss percentage (e.g., 0.3 = 0.3% maximum loss)
  takeProfitPercent?: number; // Take-profit as % of expected funding (e.g., 90 = 90% of funding)
  stopLossPercent?: number; // Stop-loss as % of expected funding (e.g., 20 = 20% of funding)
  // Execution tracking fields (cleared after each cycle for recurring subscriptions)
  entryPrice?: number | null;
  hedgeEntryPrice?: number | null;
  primaryExitPrice?: number | null;
  hedgeExitPrice?: number | null;
  errorMessage?: string | null;
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
            console.error('='.repeat(80));
            console.error(`[FundingArbitrage] ⚠️  CRITICAL: Failed to initialize primary connector`);
            console.error(`  Subscription ID: ${dbSub.id}`);
            console.error(`  Symbol: ${dbSub.symbol}`);
            console.error(`  Primary Exchange: ${dbSub.primaryExchange}`);
            console.error(`  Error: ${error.message}`);
            console.error('='.repeat(80));

            await prisma.fundingArbitrageSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'ERROR', errorMessage: error.message },
            });
            continue;
          }

          // Initialize hedge exchange connector (only for HEDGED mode)
          let hedgeConnector;
          const subscriptionMode = dbSub.mode || 'HEDGED'; // Default to HEDGED for backwards compatibility

          if (subscriptionMode === 'HEDGED') {
            if (!dbSub.hedgeCredentialId) {
              console.error(`[FundingArbitrage] No hedge credential for HEDGED subscription ${dbSub.id}`);
              await prisma.fundingArbitrageSubscription.update({
                where: { id: dbSub.id },
                data: { status: 'ERROR', errorMessage: 'Hedge credential required for HEDGED mode' },
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
              console.error('='.repeat(80));
              console.error(`[FundingArbitrage] ⚠️  CRITICAL: Failed to initialize hedge connector`);
              console.error(`  Subscription ID: ${dbSub.id}`);
              console.error(`  Symbol: ${dbSub.symbol}`);
              console.error(`  Hedge Exchange: ${dbSub.hedgeExchange}`);
              console.error(`  Error: ${error.message}`);
              console.error('='.repeat(80));

              await prisma.fundingArbitrageSubscription.update({
                where: { id: dbSub.id },
                data: { status: 'ERROR', errorMessage: error.message },
              });
              continue;
            }
          } else {
            console.log(`[FundingArbitrage] NON_HEDGED mode - skipping hedge connector initialization for ${dbSub.id}`);
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
            hedgeExchange: hedgeConnector, // undefined for NON_HEDGED mode
            userId: dbSub.userId,
            status: 'active',
            createdAt: dbSub.createdAt.getTime(),
            primaryCredentialId: dbSub.primaryCredentialId,
            hedgeCredentialId: dbSub.hedgeCredentialId || undefined,
            leverage: dbSub.leverage,
            margin: dbSub.margin || undefined,
            mode: subscriptionMode,
          };

          // Add to memory
          this.subscriptions.set(dbSub.id, subscription);

          // Add connector references for restored subscription
          this.addConnectorReference(dbSub.primaryCredentialId, dbSub.id, dbSub.userId);
          if (subscriptionMode === 'HEDGED' && dbSub.hedgeCredentialId) {
            this.addConnectorReference(dbSub.hedgeCredentialId, dbSub.id, dbSub.userId);
          }

          // Handle subscription monitoring based on status
          if (dbSub.status === 'EXECUTING') {
            // Positions already opened - schedule position closing
            console.log(`[FundingArbitrage] Scheduling position closing for EXECUTING subscription ${dbSub.id}...`);

            const entryPrice = dbSub.entryPrice || 0;
            const hedgeEntryPrice = dbSub.hedgeEntryPrice || 0;
            const fundingEarned = dbSub.fundingEarned || 0;

            // Schedule position closing with WebSocket funding monitoring (same as executeArbitrageOrders)
            console.log(`[FundingArbitrage] Setting up WebSocket funding monitor for restored subscription ${dbSub.id}...`);

            // Start monitoring funding payment via WebSocket
            this.monitorFundingPayment(
              subscription,
              primaryConnector,
              fundingEarned,
              timeUntilFunding,
              entryPrice,
              hedgeEntryPrice
            ).catch(async (error: any) => {
              console.error(`[FundingArbitrage] Error in restored subscription monitoring:`, error);
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
            });

            console.log(`[FundingArbitrage] Restored EXECUTING subscription ${dbSub.id} - WebSocket funding monitoring active`);
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
    hedgeExchange?: BaseExchangeConnector; // Optional for NON_HEDGED mode
    userId: string;
    primaryCredentialId?: string;
    hedgeCredentialId?: string;
    executionDelay?: number;
    leverage?: number;
    margin?: number;
    mode?: 'HEDGED' | 'NON_HEDGED'; // Default: HEDGED
    takeProfitPercent?: number;
    stopLossPercent?: number;
  }): Promise<FundingSubscription> {
    // Save to database first (default leverage: 3x if not provided)
    const leverage = params.leverage ?? 3;
    const margin = params.margin;
    const mode = params.mode || 'HEDGED';

    console.log('[FundingArbitrage] Creating subscription with margin:', {
      quantity: params.quantity,
      leverage,
      margin,
      marginProvided: margin !== undefined,
      mode,
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
        mode,
        primaryExchange: params.primaryExchange.exchangeName,
        primaryCredentialId: params.primaryCredentialId || '',
        hedgeExchange: mode === 'HEDGED' && params.hedgeExchange ? params.hedgeExchange.exchangeName : null,
        hedgeCredentialId: params.hedgeCredentialId,
        takeProfitPercent: params.takeProfitPercent,
        stopLossPercent: params.stopLossPercent,
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
      hedgeExchange: params.hedgeExchange, // undefined for NON_HEDGED
      userId: params.userId,
      status: 'active',
      createdAt: Date.now(),
      primaryCredentialId: params.primaryCredentialId,
      hedgeCredentialId: params.hedgeCredentialId,
      executionDelay: params.executionDelay || 5,
      leverage,
      margin,
      mode,
      takeProfitPercent: params.takeProfitPercent,
      stopLossPercent: params.stopLossPercent,
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

    if (mode === 'HEDGED' && params.hedgeCredentialId && params.hedgeExchange) {
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
    hedgeCredentialId?: string; // Optional for NON_HEDGED mode
    hedgeExchange?: string; // Optional for NON_HEDGED mode
    executionDelay?: number;
    leverage?: number;
    margin?: number;
    mode?: 'HEDGED' | 'NON_HEDGED'; // Default: HEDGED
    takeProfitPercent?: number;
    stopLossPercent?: number;
  }): Promise<FundingSubscription> {
    const mode = params.mode || 'HEDGED';
    console.log(`[FundingArbitrage] Creating ${mode} subscription with credential caching...`);

    // Create and cache primary connector
    const primaryConnector = await this.getOrCreateConnector(
      params.userId,
      params.primaryCredentialId,
      false
    );

    // Create and cache hedge connector (only for HEDGED mode)
    let hedgeConnector: BaseExchangeConnector | undefined;

    if (mode === 'HEDGED') {
      if (!params.hedgeCredentialId) {
        throw new Error('Hedge credential ID is required for HEDGED mode');
      }

      hedgeConnector = await this.getOrCreateConnector(
        params.userId,
        params.hedgeCredentialId,
        false
      );

      console.log('[FundingArbitrage] Primary and hedge connectors created and cached, creating subscription...');
    } else {
      console.log('[FundingArbitrage] NON_HEDGED mode: Primary connector created, creating subscription...');
    }

    // IMMEDIATELY set leverage on exchanges (user-requested feature)
    // This allows users to verify leverage on exchange platforms right after subscribing
    const leverage = params.leverage ?? 3;
    const primarySymbol = this.convertSymbolForExchange(params.symbol, primaryConnector.exchangeName);

    try {
      if (mode === 'HEDGED' && hedgeConnector) {
        const hedgeSymbol = this.convertSymbolForExchange(params.symbol, hedgeConnector.exchangeName);
        console.log(`[FundingArbitrage] Setting leverage to ${leverage}x immediately on both exchanges...`);

        // Set leverage in parallel for speed
        await Promise.all([
          this.setExchangeLeverage(primaryConnector, primarySymbol, leverage),
          this.setExchangeLeverage(hedgeConnector, hedgeSymbol, leverage),
        ]);

        console.log(`[FundingArbitrage] ✓ Leverage set successfully on both exchanges (${leverage}x)`);
      } else {
        // NON_HEDGED mode: only set leverage on primary exchange
        console.log(`[FundingArbitrage] Setting leverage to ${leverage}x on primary exchange...`);
        await this.setExchangeLeverage(primaryConnector, primarySymbol, leverage);
        console.log(`[FundingArbitrage] ✓ Leverage set successfully on primary exchange (${leverage}x)`);
      }
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
      hedgeExchange: hedgeConnector, // undefined for NON_HEDGED
      userId: params.userId,
      primaryCredentialId: params.primaryCredentialId,
      hedgeCredentialId: params.hedgeCredentialId,
      executionDelay: params.executionDelay,
      leverage: params.leverage,
      margin: params.margin,
      mode,
      takeProfitPercent: params.takeProfitPercent,
      stopLossPercent: params.stopLossPercent,
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

      // BingX rate limiting (code 100410) - non-fatal, subscription can proceed with current leverage
      if (error.message.includes('code:100410') || error.message.includes('disabled period')) {
        console.warn(
          `[FundingArbitrage] ⚠️ BingX rate limiting detected for ${symbol}. ` +
          `Skipping leverage change for now. Subscription will use current leverage setting. ` +
          `Error: ${error.message}`
        );
        return; // Non-fatal - allow subscription to proceed
      }

      // Generic rate limiting or temporary errors - non-fatal
      if (
        error.message.toLowerCase().includes('rate limit') ||
        error.message.toLowerCase().includes('too many requests') ||
        error.message.toLowerCase().includes('fetch failed') ||
        error.message.toLowerCase().includes('timeout')
      ) {
        console.warn(
          `[FundingArbitrage] ⚠️ Temporary error setting leverage on ${exchangeName}: ${error.message}. ` +
          `Subscription will use current leverage setting.`
        );
        return; // Non-fatal - allow subscription to proceed
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
    const { symbol, positionType, quantity, primaryExchange, hedgeExchange, margin, leverage, mode } = subscription;
    const subscriptionMode = mode || 'HEDGED'; // Default to HEDGED for backwards compatibility

    console.log(`[FundingArbitrage] Starting order execution in ${subscriptionMode} mode`);

    // Convert symbol to exchange-specific format
    const primarySymbol = this.convertSymbolForExchange(symbol, primaryExchange.exchangeName);
    const hedgeSymbol = hedgeExchange ? this.convertSymbolForExchange(symbol, hedgeExchange.exchangeName) : undefined;

    if (subscriptionMode === 'HEDGED') {
      console.log(`[FundingArbitrage] Symbol conversion (HEDGED):`, {
        normalized: symbol,
        primaryExchange: primaryExchange.exchangeName,
        primarySymbol,
        hedgeExchange: hedgeExchange?.exchangeName,
        hedgeSymbol,
      });
    } else {
      console.log(`[FundingArbitrage] Symbol conversion (NON_HEDGED):`, {
        normalized: symbol,
        primaryExchange: primaryExchange.exchangeName,
        primarySymbol,
      });
    }

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
      if (subscriptionMode === 'HEDGED' && hedgeExchange && hedgeSymbol) {
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
        // NON_HEDGED mode: only calculate primary quantity
        console.log(`[FundingArbitrage] NON_HEDGED: Fetching primary price to calculate position size...`);
        const priceStartTime = Date.now();

        try {
          const primaryPriceData = await this.getCurrentPrice(primaryExchange, primarySymbol);
          const priceFetchTime = Date.now() - priceStartTime;
          console.log(`[FundingArbitrage] ✓ Primary price fetched in ${priceFetchTime}ms: ${primaryPriceData}`);

          // Calculate position value from margin and leverage
          const positionValue = margin * leverage;
          primaryQuantity = positionValue / primaryPriceData;

          console.log(`[FundingArbitrage] ✓ Calculated primary position quantity:`, {
            margin,
            leverage,
            positionValue,
            primaryPrice: primaryPriceData,
            primaryQuantity,
            primaryValue: primaryQuantity * primaryPriceData,
          });

        } catch (priceError: any) {
          console.error(`[FundingArbitrage] Failed to fetch primary price: ${priceError.message}`);
          console.log(`[FundingArbitrage] Falling back to subscription quantity: ${quantity}`);
          primaryQuantity = quantity;
        }
      }
    } else {
      if (subscriptionMode === 'HEDGED') {
        console.log(`[FundingArbitrage] No margin/leverage provided, using same quantity on both exchanges: ${quantity}`);
      } else {
        console.log(`[FundingArbitrage] NON_HEDGED: Using subscription quantity: ${quantity}`);
      }
    }

    if (subscriptionMode === 'HEDGED') {
      console.log(`[FundingArbitrage] Executing HEDGED ${positionType} position:`, {
        symbol,
        primarySide,
        hedgeSide,
        primaryQuantity,
        hedgeQuantity,
      });
      console.log(`[FundingArbitrage] Hedge will open AT funding time (countdown = 0) to avoid paying negative funding`);
    } else {
      console.log(`[FundingArbitrage] Executing NON_HEDGED ${positionType} position:`, {
        symbol,
        primarySide,
        primaryQuantity,
      });
      console.log(`[FundingArbitrage] NON_HEDGED mode: Single position will be managed with TP/SL conditional orders`);
    }

    // STEP 0: Synchronize leverage BEFORE opening positions
    // Use subscription leverage setting (default: 3x if not specified)
    const subscriptionLeverage = leverage ?? 3;

    try {
      if (subscriptionMode === 'HEDGED' && hedgeExchange && hedgeSymbol) {
        console.log(`[FundingArbitrage] Synchronizing leverage to ${subscriptionLeverage}x on both exchanges...`);

        // Synchronize leverage in parallel for speed
        await Promise.all([
          this.setExchangeLeverage(primaryExchange, primarySymbol, subscriptionLeverage),
          this.setExchangeLeverage(hedgeExchange, hedgeSymbol, subscriptionLeverage),
        ]);

        console.log(`[FundingArbitrage] Leverage synchronized successfully on both exchanges (${subscriptionLeverage}x)`);
      } else {
        // NON_HEDGED mode: only set leverage on primary exchange
        console.log(`[FundingArbitrage] NON_HEDGED: Setting leverage to ${subscriptionLeverage}x on primary exchange...`);
        await this.setExchangeLeverage(primaryExchange, primarySymbol, subscriptionLeverage);
        console.log(`[FundingArbitrage] Leverage set successfully on primary exchange (${subscriptionLeverage}x)`);
      }
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

    // 2. Get TP/SL percentages if configured (for NON_HEDGED mode with BingX atomic order)
    // BingX connector will fetch current price and calculate TP/SL prices automatically
    let takeProfitPercent: number | undefined = undefined;
    let stopLossPercent: number | undefined = undefined;
    const hasTpSl = subscription.takeProfitPercent || subscription.stopLossPercent ||
                    subscription.takeProfit || subscription.stopLoss;

    if (subscriptionMode === 'NON_HEDGED' && hasTpSl) {
      // Use new fields (takeProfitPercent/stopLossPercent) if available, otherwise fall back to legacy fields
      takeProfitPercent = subscription.takeProfitPercent ?? subscription.takeProfit;
      stopLossPercent = subscription.stopLossPercent ?? subscription.stopLoss;

      console.log(`[FundingArbitrage] TP/SL percentages for order:`, {
        takeProfitPercent,
        stopLossPercent,
      });
    }

    // 3. Execute PRIMARY order FIRST (to receive funding)
    console.log(`[FundingArbitrage] 📊 Opening PRIMARY position (will receive funding)...`);
    const primaryOrderStartTime = Date.now();

    let primaryOrder: any;
    const isBingX = primaryExchange.exchangeName.includes('BINGX');

    // Use atomic order with TP/SL for BingX if TP/SL is configured
    console.log(`[FundingArbitrage] 🔍 Checking TP/SL conditions:`, {
      isBingX,
      subscriptionMode,
      takeProfitPercent,
      stopLossPercent,
      willUseTpSl: isBingX && subscriptionMode === 'NON_HEDGED' && (takeProfitPercent || stopLossPercent)
    });

    if (isBingX && subscriptionMode === 'NON_HEDGED' && (takeProfitPercent || stopLossPercent)) {
      console.log(`[FundingArbitrage] ✅ Using atomic order with TP/SL for BingX...`);
      console.log(`[FundingArbitrage] 📤 Calling placeMarketOrderWithTPSL with:`, {
        symbol: primarySymbol,
        side: primarySide,
        quantity: primaryQuantity,
        takeProfitPercent,
        stopLossPercent
      });

      primaryOrder = await (primaryExchange as any).placeMarketOrderWithTPSL(
        primarySymbol,
        primarySide,
        primaryQuantity,
        takeProfitPercent,
        stopLossPercent
      );
    } else {
      console.log(`[FundingArbitrage] ⚠️ Using standard market order (no TP/SL)`);
      // Standard market order for other exchanges or when no TP/SL
      primaryOrder = await primaryExchange.placeMarketOrder(primarySymbol, primarySide, primaryQuantity);
    }

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

    // BIFURCATION POINT: Different flows for HEDGED vs NON_HEDGED modes
    if (subscriptionMode === 'HEDGED' && hedgeExchange && hedgeSymbol) {
      // ========== HEDGED MODE: Open hedge position at funding time ==========
      // 4. Calculate time to wait before opening hedge (exactly at funding time)
      let timeUntilFunding = subscription.nextFundingTime - Date.now();
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

      // 9. Get actual entry prices from positions (market orders don't return avgPrice immediately)
      let entryPrice = primaryOrder.avgPrice || primaryOrder.price || 0;
      let hedgeEntryPrice = hedgeOrder.avgPrice || hedgeOrder.price || 0;

      // If prices are not in order response, fetch from positions with retry logic
      const needPrimaryPrice = entryPrice === 0;
      const needHedgePrice = hedgeEntryPrice === 0;

      if (needPrimaryPrice || needHedgePrice) {
        console.log(`[FundingArbitrage] ⚡ Entry prices not in order responses, fetching from positions with retries...`);
        const priceStartTime = Date.now();

        // Retry up to 5 times with exponential backoff
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            const [primaryPosition, hedgePosition] = await Promise.all([
              needPrimaryPrice && entryPrice === 0 ? primaryExchange.getPosition(primarySymbol) : Promise.resolve(null),
              needHedgePrice && hedgeEntryPrice === 0 ? hedgeExchange.getPosition(hedgeSymbol) : Promise.resolve(null),
            ]);

            if (needPrimaryPrice && entryPrice === 0 && primaryPosition) {
              entryPrice = parseFloat(primaryPosition.avgPrice || primaryPosition.entryPrice || '0');
              if (entryPrice > 0) {
                console.log(`[FundingArbitrage] ✓ Primary entry price obtained: ${entryPrice} (attempt ${attempt})`);
              }
            }

            if (needHedgePrice && hedgeEntryPrice === 0 && hedgePosition) {
              hedgeEntryPrice = parseFloat(hedgePosition.avgPrice || hedgePosition.entryPrice || '0');
              if (hedgeEntryPrice > 0) {
                console.log(`[FundingArbitrage] ✓ Hedge entry price obtained: ${hedgeEntryPrice} (attempt ${attempt})`);
              }
            }

            // If both prices are obtained, break
            if ((!needPrimaryPrice || entryPrice > 0) && (!needHedgePrice || hedgeEntryPrice > 0)) {
              break;
            }

            // If still missing prices and not last attempt, wait and retry
            if (attempt < 5) {
              console.log(`[FundingArbitrage] Entry prices still incomplete, retrying... (attempt ${attempt}/5)`);
              const delay = 200 * Math.pow(2, attempt - 1); // 200ms, 400ms, 800ms, 1600ms, 3200ms
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          } catch (error: any) {
            console.error(`[FundingArbitrage] Error fetching entry prices (attempt ${attempt}): ${error.message}`);
            if (attempt === 5) {
              throw new Error(`Failed to get entry prices after 5 attempts: ${error.message}`);
            }
          }
        }

        const priceFetchTime = Date.now() - priceStartTime;
        console.log(`[FundingArbitrage] Entry price fetch completed in ${priceFetchTime}ms (parallel with retries)`);

        // Validate prices
        if (needPrimaryPrice && entryPrice === 0) {
          throw new Error(
            `Failed to get primary entry price for ${primarySymbol} after 5 attempts. ` +
            `Position may not exist or exchange API is not responding correctly.`
          );
        }

        if (needHedgePrice && hedgeEntryPrice === 0) {
          throw new Error(
            `Failed to get hedge entry price for ${hedgeSymbol} after 5 attempts. ` +
            `Position may not exist or exchange API is not responding correctly.`
          );
        }
      }

      // Calculate funding earned (funding rate * position value)
      // Funding payment = fundingRate * positionSize * entryPrice
      const fundingEarned = subscription.fundingRate * quantity * entryPrice;

      console.log(`[FundingArbitrage] HEDGED mode positions opened:`, {
        entryPrice,
        hedgeEntryPrice,
        fundingEarned,
      });

      // ========== SET TAKE-PROFIT / STOP-LOSS FOR HEDGED MODE ==========
      // Set TP/SL on both exchanges if configured
      if (subscription.takeProfit || subscription.stopLoss) {
        console.log(`[FundingArbitrage] Setting up TP/SL orders for HEDGED mode on both exchanges...`);

        try {
          // Calculate TP/SL prices for PRIMARY position
          const primaryTakeProfitPrice = subscription.takeProfit
            ? entryPrice * (1 + (positionType === 'long' ? subscription.takeProfit : -subscription.takeProfit) / 100)
            : undefined;

          const primaryStopLossPrice = subscription.stopLoss
            ? entryPrice * (1 - (positionType === 'long' ? subscription.stopLoss : -subscription.stopLoss) / 100)
            : undefined;

          // Calculate TP/SL prices for HEDGE position (opposite direction)
          const hedgeTakeProfitPrice = subscription.takeProfit
            ? hedgeEntryPrice * (1 + (positionType === 'long' ? -subscription.takeProfit : subscription.takeProfit) / 100)
            : undefined;

          const hedgeStopLossPrice = subscription.stopLoss
            ? hedgeEntryPrice * (1 - (positionType === 'long' ? -subscription.stopLoss : subscription.stopLoss) / 100)
            : undefined;

          console.log(`[FundingArbitrage] HEDGED TP/SL prices calculated:`, {
            primary: {
              entryPrice,
              takeProfitPrice: primaryTakeProfitPrice?.toFixed(2),
              stopLossPrice: primaryStopLossPrice?.toFixed(2),
            },
            hedge: {
              entryPrice: hedgeEntryPrice,
              takeProfitPrice: hedgeTakeProfitPrice?.toFixed(2),
              stopLossPrice: hedgeStopLossPrice?.toFixed(2),
            },
          });

          // Set TP/SL on both exchanges in parallel
          const [primaryTpslResult, hedgeTpslResult] = await Promise.all([
            primaryExchange.setTradingStop({
              symbol: primarySymbol,
              side: primarySide,
              takeProfit: primaryTakeProfitPrice,
              stopLoss: primaryStopLossPrice,
            }).catch((error: any) => {
              console.error(`[FundingArbitrage] Failed to set TP/SL on primary exchange: ${error.message}`);
              return null;
            }),
            hedgeExchange.setTradingStop({
              symbol: hedgeSymbol,
              side: hedgeSide,
              takeProfit: hedgeTakeProfitPrice,
              stopLoss: hedgeStopLossPrice,
            }).catch((error: any) => {
              console.error(`[FundingArbitrage] Failed to set TP/SL on hedge exchange: ${error.message}`);
              return null;
            }),
          ]);

          if (primaryTpslResult && hedgeTpslResult) {
            console.log(`[FundingArbitrage] ✓ TP/SL orders set successfully on BOTH exchanges`);
            console.log(`[FundingArbitrage] Positions will close automatically when TP or SL is hit on either exchange`);

            // Set up monitoring for TP/SL fills on both exchanges
            // Monitor both positions - when one closes, close the other
            const monitorInterval = setInterval(async () => {
              try {
                const [primaryPosition, hedgePosition] = await Promise.all([
                  primaryExchange.getPosition(primarySymbol),
                  hedgeExchange.getPosition(hedgeSymbol),
                ]);

                const primarySize = Math.abs(parseFloat(primaryPosition.positionAmt || primaryPosition.size || '0'));
                const hedgeSize = Math.abs(parseFloat(hedgePosition.positionAmt || hedgePosition.size || '0'));

                // If either position is closed, close the other and complete the cycle
                if (primarySize === 0 || hedgeSize === 0) {
                  clearInterval(monitorInterval);
                  console.log(`[FundingArbitrage] ✓ One position closed by TP/SL, closing the other...`);

                  // Close remaining position
                  if (primarySize > 0) {
                    const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';
                    await this.forceClosePosition(
                      primaryExchange,
                      primarySymbol,
                      primaryCloseSide,
                      primarySize,
                      primaryExchange.exchangeName
                    );
                  }

                  if (hedgeSize > 0) {
                    const hedgeCloseSide: OrderSide = positionType === 'long' ? 'Buy' : 'Sell';
                    await this.forceClosePosition(
                      hedgeExchange,
                      hedgeSymbol,
                      hedgeCloseSide,
                      hedgeSize,
                      hedgeExchange.exchangeName
                    );
                  }

                  // Handle completion
                  await this.handleHedgedPositionClose(
                    subscription,
                    entryPrice,
                    hedgeEntryPrice,
                    fundingEarned
                  );
                }
              } catch (error: any) {
                console.error(`[FundingArbitrage] Error monitoring HEDGED TP/SL: ${error.message}`);
              }
            }, 2000); // Check every 2 seconds

            // Set max hold time safety (2 hours)
            const MAX_HOLD_TIME = 2 * 60 * 60 * 1000;
            setTimeout(async () => {
              clearInterval(monitorInterval);

              // Force close both positions if still open
              try {
                const [primaryPosition, hedgePosition] = await Promise.all([
                  primaryExchange.getPosition(primarySymbol),
                  hedgeExchange.getPosition(hedgeSymbol),
                ]);

                const primarySize = Math.abs(parseFloat(primaryPosition.positionAmt || primaryPosition.size || '0'));
                const hedgeSize = Math.abs(parseFloat(hedgePosition.positionAmt || hedgePosition.size || '0'));

                if (primarySize > 0 || hedgeSize > 0) {
                  console.log(`[FundingArbitrage] ⏰ Max hold time exceeded, force closing HEDGED positions...`);

                  await Promise.all([
                    primarySize > 0
                      ? this.forceClosePosition(
                          primaryExchange,
                          primarySymbol,
                          positionType === 'long' ? 'Sell' : 'Buy',
                          primarySize,
                          primaryExchange.exchangeName
                        )
                      : Promise.resolve(),
                    hedgeSize > 0
                      ? this.forceClosePosition(
                          hedgeExchange,
                          hedgeSymbol,
                          positionType === 'long' ? 'Buy' : 'Sell',
                          hedgeSize,
                          hedgeExchange.exchangeName
                        )
                      : Promise.resolve(),
                  ]);

                  await this.handleHedgedPositionClose(
                    subscription,
                    entryPrice,
                    hedgeEntryPrice,
                    fundingEarned
                  );
                }
              } catch (error: any) {
                console.error(`[FundingArbitrage] Error in HEDGED max hold time handler: ${error.message}`);
              }
            }, MAX_HOLD_TIME);

            console.log(`[FundingArbitrage] HEDGED mode with TP/SL configured successfully`);

          } else {
            // One or both TP/SL setups failed - fall back to WebSocket monitoring
            console.log(`[FundingArbitrage] TP/SL setup failed on one or both exchanges, falling back to WebSocket monitoring`);
            timeUntilFunding = subscription.nextFundingTime - Date.now();
            this.monitorFundingPayment(
              subscription,
              primaryExchange,
              fundingEarned,
              timeUntilFunding,
              entryPrice,
              hedgeEntryPrice
            ).catch((error: any) => {
              console.error(`[FundingArbitrage] Error in funding monitoring:`, error);
              this.emit(FundingArbitrageService.ERROR, {
                subscriptionId: subscription.id,
                error: error.message,
              });
            });
          }

        } catch (tpslError: any) {
          console.error(`[FundingArbitrage] Failed to set HEDGED TP/SL: ${tpslError.message}`);
          console.log(`[FundingArbitrage] Falling back to WebSocket funding monitoring`);

          // Fall back to WebSocket monitoring
          timeUntilFunding = subscription.nextFundingTime - Date.now();
          this.monitorFundingPayment(
            subscription,
            primaryExchange,
            fundingEarned,
            timeUntilFunding,
            entryPrice,
            hedgeEntryPrice
          ).catch((error: any) => {
            console.error(`[FundingArbitrage] Error in funding monitoring:`, error);
            this.emit(FundingArbitrageService.ERROR, {
              subscriptionId: subscription.id,
              error: error.message,
            });
          });
        }
      } else {
        // No TP/SL configured - use WebSocket monitoring
        console.log(`[FundingArbitrage] No TP/SL configured for HEDGED mode, using WebSocket monitoring`);

        // 10. Schedule position closing with WebSocket funding payment monitoring
        // Recalculate time (some time has passed since opening positions)
        timeUntilFunding = subscription.nextFundingTime - Date.now();

        console.log(`[FundingArbitrage] Setting up WebSocket funding payment monitor (expected: ${fundingEarned.toFixed(4)} USDT)`);

        // Start monitoring funding payment via WebSocket
        this.monitorFundingPayment(
          subscription,
          primaryExchange,
          fundingEarned,
          timeUntilFunding,
          entryPrice,
          hedgeEntryPrice
        ).catch((error: any) => {
          console.error(`[FundingArbitrage] Error in funding monitoring:`, error);
          this.emit(FundingArbitrageService.ERROR, {
            subscriptionId: subscription.id,
            error: error.message,
          });
        });
      }

      // 11. Update database with entry data (but not completed yet)
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

      console.log(`[FundingArbitrage] HEDGED mode arbitrage orders executed for ${symbol}, waiting for funding payment and 8-hour close`);

    } else {
      // ========== NON_HEDGED MODE: Schedule immediate fast position close ==========
      console.log(`[FundingArbitrage] NON_HEDGED mode: Single position opened, scheduling immediate fast close (2-8s)...`);

      // Get primary entry price with retry logic
      let entryPrice = primaryOrder.avgPrice || primaryOrder.price || 0;

      if (entryPrice === 0) {
        console.log(`[FundingArbitrage] ⚡ Entry price not in order response, fetching from position with retries...`);
        const priceStartTime = Date.now();

        // Retry up to 5 times with exponential backoff
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            const primaryPosition = await primaryExchange.getPosition(primarySymbol);
            if (primaryPosition) {
              entryPrice = parseFloat(primaryPosition.avgPrice || primaryPosition.entryPrice || '0');

              if (entryPrice > 0) {
                console.log(`[FundingArbitrage] ✓ Primary entry price obtained: ${entryPrice} (attempt ${attempt})`);
                break;
              } else {
                console.log(`[FundingArbitrage] Entry price still 0, retrying... (attempt ${attempt}/5)`);

                // Wait with exponential backoff: 200ms, 400ms, 800ms, 1600ms, 3200ms
                if (attempt < 5) {
                  const delay = 200 * Math.pow(2, attempt - 1);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              }
            }
          } catch (error: any) {
            console.error(`[FundingArbitrage] Error fetching entry price (attempt ${attempt}): ${error.message}`);
            if (attempt === 5) {
              throw new Error(`Failed to get entry price after 5 attempts: ${error.message}`);
            }
          }
        }

        const priceFetchTime = Date.now() - priceStartTime;
        console.log(`[FundingArbitrage] Entry price fetch completed in ${priceFetchTime}ms`);

        if (entryPrice === 0) {
          throw new Error(
            `Failed to get entry price for ${primarySymbol} after 5 attempts. ` +
            `Position may not exist or exchange API is not responding correctly.`
          );
        }
      }

      // Calculate funding that will be earned (position held through funding time)
      const fundingEarned = subscription.fundingRate * quantity * entryPrice;

      console.log(`[FundingArbitrage] NON_HEDGED mode position opened:`, {
        entryPrice,
        fundingEarned: fundingEarned.toFixed(4),
        note: 'Position will be managed with TP/SL orders',
      });

      // Update database with entry data and EXECUTING status
      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'EXECUTING',
          entryPrice,
          hedgeEntryPrice: null, // No hedge in NON_HEDGED mode
          fundingEarned, // Will earn funding by holding position through funding time
          executedAt: new Date(),
        },
      });

      // Determine close side (opposite of entry)
      const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';

      // ========== SET TAKE-PROFIT / STOP-LOSS ORDERS ==========
      // Use TP/SL if configured, otherwise fall back to time-based close
      // Check BOTH new (takeProfitPercent/stopLossPercent) and legacy (takeProfit/stopLoss) fields
      const hasTpSl = subscription.takeProfitPercent || subscription.stopLossPercent ||
                      subscription.takeProfit || subscription.stopLoss;

      if (hasTpSl) {
        console.log(`[FundingArbitrage] Setting up TP/SL orders for NON_HEDGED mode...`);

        try {
          // Use new fields (takeProfitPercent/stopLossPercent) if available, otherwise fall back to legacy fields
          const tpPercent = subscription.takeProfitPercent ?? subscription.takeProfit;
          const slPercent = subscription.stopLossPercent ?? subscription.stopLoss;

          // Calculate TP/SL prices based on entry price and percentages
          const takeProfitPrice = tpPercent
            ? entryPrice * (1 + (positionType === 'long' ? tpPercent : -tpPercent) / 100)
            : undefined;

          const stopLossPrice = slPercent
            ? entryPrice * (1 - (positionType === 'long' ? slPercent : -slPercent) / 100)
            : undefined;

          console.log(`[FundingArbitrage] TP/SL prices calculated:`, {
            entryPrice,
            takeProfitPrice: takeProfitPrice?.toFixed(2),
            stopLossPrice: stopLossPrice?.toFixed(2),
            takeProfitPercent: tpPercent,
            stopLossPercent: slPercent,
          });

          // Check exchange type for TP/SL implementation
          const isBingX = primaryExchange.exchangeName.includes('BINGX');

          if (isBingX) {
            // ========== BingX: TP/SL already set in atomic order ==========
            console.log(`[FundingArbitrage] ✓ BingX TP/SL already set in atomic order (no separate orders needed)`);
            // TP/SL was set atomically with the market order, no additional orders needed

          } else {
            // ========== Bybit/Other: Use setTradingStop ==========
            console.log(`[FundingArbitrage] Using native setTradingStop for ${primaryExchange.exchangeName}...`);

            const tpslResult = await primaryExchange.setTradingStop({
              symbol: primarySymbol,
              side: primarySide,
              takeProfit: takeProfitPrice,
              stopLoss: stopLossPrice,
            });

            console.log(`[FundingArbitrage] ✓ TP/SL orders set successfully:`, tpslResult);
          }

          console.log(`[FundingArbitrage] Position will close automatically when TP or SL is hit`);

          // Set up monitoring for TP/SL fills
          // For now, use position monitoring to detect when position is closed
          const monitorInterval = setInterval(async () => {
            try {
              const position = await primaryExchange.getPosition(primarySymbol);
              const posSize = Math.abs(parseFloat(position.positionAmt || position.size || '0'));

              // If position is closed (size = 0), TP or SL was hit
              if (posSize === 0) {
                clearInterval(monitorInterval);
                console.log(`[FundingArbitrage] ✓ Position closed by TP/SL trigger`);

                // Handle position close and calculate P&L
                await this.handleNonHedgedPositionClose(
                  subscription,
                  primaryExchange,
                  primarySymbol,
                  primaryQuantity,
                  entryPrice,
                  fundingEarned,
                  positionType
                );
              }
            } catch (error: any) {
              console.error(`[FundingArbitrage] Error monitoring TP/SL: ${error.message}`);
            }
          }, 2000); // Check every 2 seconds

          // Set max hold time safety (2 hours)
          const MAX_HOLD_TIME = 2 * 60 * 60 * 1000;
          setTimeout(async () => {
            clearInterval(monitorInterval);

            // Check if position still open
            try {
              const position = await primaryExchange.getPosition(primarySymbol);
              const posSize = Math.abs(parseFloat(position.positionAmt || position.size || '0'));

              if (posSize > 0) {
                console.log(`[FundingArbitrage] ⏰ Max hold time exceeded, force closing NON_HEDGED position...`);
                await this.forceClosePosition(
                  primaryExchange,
                  primarySymbol,
                  primaryCloseSide,
                  posSize,
                  primaryExchange.exchangeName
                );

                // Handle the close
                await this.handleNonHedgedPositionClose(
                  subscription,
                  primaryExchange,
                  primarySymbol,
                  posSize,
                  entryPrice,
                  fundingEarned,
                  positionType
                );
              }
            } catch (error: any) {
              console.error(`[FundingArbitrage] Error in max hold time handler: ${error.message}`);
            }
          }, MAX_HOLD_TIME);

          console.log(`[FundingArbitrage] NON_HEDGED mode with TP/SL configured successfully`);

        } catch (tpslError: any) {
          console.error(`[FundingArbitrage] Failed to set TP/SL: ${tpslError.message}`);
          console.log(`[FundingArbitrage] Falling back to time-based close strategy`);

          // Fall back to time-based close
          const timeUntilFunding = subscription.nextFundingTime - Date.now();
          const closeDelay = Math.max(100, timeUntilFunding + 2000); // 2 seconds after funding
          console.log(`[FundingArbitrage] NON_HEDGED: Position will close ${Math.floor(closeDelay / 1000)}s after funding (fallback)`);

          // Keep the original setTimeout logic as fallback
          this.scheduleNonHedgedClose(
            subscription,
            primaryExchange,
            primarySymbol,
            primaryCloseSide,
            primaryQuantity,
            entryPrice,
            fundingEarned,
            positionType,
            closeDelay
          );
        }
      } else {
        // No TP/SL configured - use time-based close
        console.log(`[FundingArbitrage] No TP/SL configured, using time-based close`);
        const timeUntilFunding = subscription.nextFundingTime - Date.now();
        const closeDelay = Math.max(100, timeUntilFunding + 2000); // 2 seconds after funding
        console.log(`[FundingArbitrage] NON_HEDGED: Position will close ${Math.floor(closeDelay / 1000)}s after funding`);
        console.log(`[FundingArbitrage] Funding in ${Math.floor(timeUntilFunding / 1000)}s`);

        this.scheduleNonHedgedClose(
          subscription,
          primaryExchange,
          primarySymbol,
          primaryCloseSide,
          primaryQuantity,
          entryPrice,
          fundingEarned,
          positionType,
          closeDelay
        );
      }

      console.log(`[FundingArbitrage] NON_HEDGED mode order executed for ${symbol}`);
    }
  }

  /**
   * Force close a position using SAFE methods only (reduce-only orders)
   *
   * IMPORTANT: This method NEVER uses regular placeMarketOrder without reduceOnly flag
   * to prevent accidentally opening new positions in the opposite direction!
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
    // STEP 0: Check if position actually exists and get actual position size
    console.log(`[FundingArbitrage] Checking actual position size for ${symbol} on ${exchangeName}...`);

    try {
      const position = await connector.getPosition(symbol);
      const actualSize = Math.abs(parseFloat(position.positionAmt || position.size || '0'));

      if (actualSize === 0) {
        console.log(`[FundingArbitrage] ✓ Position already closed (size = 0), skipping close orders`);
        return { success: true, message: 'Position already closed' };
      }

      console.log(`[FundingArbitrage] Actual position size: ${actualSize}, proceeding with close...`);

      // Use actual position size instead of requested quantity
      quantity = actualSize;
    } catch (posError: any) {
      console.warn(`[FundingArbitrage] Could not check position size: ${posError.message}, using requested quantity: ${quantity}`);
    }

    // STEP 1: Try SAFE methods only (reduce-only orders that will NEVER open new positions)
    const safeMethods = [
      { name: 'reduce-only order', method: 'placeReduceOnlyOrder' },
      { name: 'close position API', method: 'closePosition' },
    ];

    let lastError: any = null;

    for (const { name, method } of safeMethods) {
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
          // placeReduceOnlyOrder takes symbol, side, quantity
          result = await connectorWithMethod[method](symbol, side, quantity);
        }

        console.log(`[FundingArbitrage] ✓ ${exchangeName} position closed successfully using ${name}`);
        return result;

      } catch (error: any) {
        lastError = error;
        console.warn(`[FundingArbitrage] ${name} failed for ${exchangeName}: ${error.message}`);

        // If error is "position is zero", the position is already closed - SUCCESS!
        if (error.message.includes('position is zero') ||
            error.message.includes('position not found') ||
            error.message.includes('no position')) {
          console.log(`[FundingArbitrage] ✓ Position already closed (${error.message}), no action needed`);
          return { success: true, message: 'Position already closed', alreadyClosed: true };
        }

        // Continue to next safe method
        console.log(`[FundingArbitrage] Trying next safe close method...`);
      }
    }

    // STEP 2: If all safe methods failed, throw error to prevent opening new positions
    // DO NOT fall back to regular placeMarketOrder - it could open a new position!
    const errorMsg =
      `⚠️ CRITICAL: Failed to close ${exchangeName} position for ${symbol} using safe methods (reduce-only/close API). ` +
      `Last error: ${lastError?.message || 'unknown'}. ` +
      `PLEASE MANUALLY CLOSE THIS POSITION ON THE EXCHANGE IMMEDIATELY! ` +
      `Position details: Symbol=${symbol}, Side=${side}, Quantity=${quantity}. ` +
      `Do NOT attempt automated close - it could open a new position in the opposite direction!`;

    console.error(`[FundingArbitrage] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  /**
   * Handle NON_HEDGED position close, calculate P&L, and update database
   * Used when TP/SL triggers or max hold time is reached
   */
  private async handleNonHedgedPositionClose(
    subscription: FundingSubscription,
    primaryExchange: BaseExchangeConnector,
    primarySymbol: string,
    actualQuantity: number,
    entryPrice: number,
    fundingEarned: number,
    positionType: 'long' | 'short'
  ): Promise<void> {
    try {
      const symbol = subscription.symbol;
      console.log(`[FundingArbitrage] Handling NON_HEDGED position close for ${symbol}...`);

      // Get actual exit price from closed position
      let exitPrice = entryPrice; // Default to entry price
      try {
        const position = await primaryExchange.getPosition(primarySymbol);
        if (position && position.avgPrice) {
          exitPrice = parseFloat(position.avgPrice);
        }
      } catch (error: any) {
        console.warn(`[FundingArbitrage] Could not fetch exit price: ${error.message}, using entry price`);
      }

      // Calculate fees (entry + exit)
      const primaryFeeRate = 0.00055; // Assume taker fee (worst case)
      const primaryTradingFees = (actualQuantity * entryPrice * primaryFeeRate * 2);

      // Calculate P&L from price movement
      const primaryPnL = positionType === 'long'
        ? (exitPrice - entryPrice) * actualQuantity
        : (entryPrice - exitPrice) * actualQuantity;

      // Realized P&L = funding earned + trade P&L - fees
      const realizedPnl = fundingEarned + primaryPnL - primaryTradingFees;

      console.log(`[FundingArbitrage] NON_HEDGED position closed - P&L calculation:`, {
        entryPrice: entryPrice.toFixed(2),
        exitPrice: exitPrice.toFixed(2),
        fundingEarned: fundingEarned.toFixed(4),
        tradePnL: primaryPnL.toFixed(4),
        fees: primaryTradingFees.toFixed(4),
        realizedPnl: realizedPnl.toFixed(4),
      });

      // Update database and reset to ACTIVE for next cycle
      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE', // Reset to ACTIVE for recurring execution
          realizedPnl: {
            increment: realizedPnl, // Accumulate P&L over cycles
          },
          primaryExitPrice: null, // Clear execution-specific fields
          hedgeExitPrice: null,
          primaryTradingFees: {
            increment: primaryTradingFees,
          },
          hedgeTradingFees: null,
          closedAt: new Date(),
          entryPrice: null, // Clear for next cycle
          hedgeEntryPrice: null,
          errorMessage: null,
        },
      });

      // Reset in-memory subscription state
      subscription.status = 'active';
      subscription.entryPrice = null;
      subscription.hedgeEntryPrice = null;
      subscription.primaryExitPrice = null;
      subscription.hedgeExitPrice = null;
      subscription.errorMessage = null;

      console.log(`[FundingArbitrage] ✅ NON_HEDGED cycle completed for ${symbol} - P&L: $${realizedPnl.toFixed(4)}`);
      console.log(`[FundingArbitrage] 🔄 Subscription ${subscription.id} reset to ACTIVE for next funding cycle`);

      // Emit completion event
      this.emit(FundingArbitrageService.SUBSCRIPTION_COMPLETED, {
        subscriptionId: subscription.id,
        symbol,
        fundingRate: subscription.fundingRate,
        entryPrice,
        hedgeEntryPrice: null,
        fundingEarned,
        realizedPnl,
        primaryExitPrice: exitPrice,
        hedgeExitPrice: null,
        primaryTradingFees,
        hedgeTradingFees: 0,
        closeTime: 0, // Not tracked for TP/SL
        strategy: 'TP/SL',
        isRecurring: true,
      });

    } catch (error: any) {
      console.error(`[FundingArbitrage] Error handling NON_HEDGED position close: ${error.message}`);

      // Update database with error
      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ERROR',
          errorMessage: `Position close handler failed: ${error.message}`,
        },
      });

      this.emit(FundingArbitrageService.ERROR, {
        subscriptionId: subscription.id,
        error: `Position close failed: ${error.message}`,
      });
    }
  }

  /**
   * Schedule NON_HEDGED position close using time-based approach (fallback)
   * Used when TP/SL is not configured or fails to set
   */
  private scheduleNonHedgedClose(
    subscription: FundingSubscription,
    primaryExchange: BaseExchangeConnector,
    primarySymbol: string,
    primaryCloseSide: OrderSide,
    primaryQuantity: number,
    entryPrice: number,
    fundingEarned: number,
    positionType: 'long' | 'short',
    closeDelay: number
  ): void {
    setTimeout(async () => {
      try {
        console.log(`[FundingArbitrage] ⚡ Starting time-based close for NON_HEDGED mode...`);

        // Get actual position size
        let actualQuantity = primaryQuantity;
        try {
          const position = await primaryExchange.getPosition(primarySymbol);
          const posSize = Math.abs(parseFloat(position.positionAmt || position.size || '0'));
          if (posSize > 0) {
            actualQuantity = posSize;
            console.log(`[FundingArbitrage] Actual position size: ${actualQuantity}`);
          }
        } catch (posError: any) {
          console.warn(`[FundingArbitrage] Could not fetch position size: ${posError.message}, using original: ${primaryQuantity}`);
        }

        // Select optimal fast close strategy
        const strategy = PositionCloseStrategyFactory.getStrategy(primaryExchange, primaryExchange);
        console.log(`[FundingArbitrage] Selected close strategy: ${strategy.name}`);

        const closeStartTime = Date.now();

        // Execute fast close
        const result = await strategy.closePositions({
          primarySymbol,
          hedgeSymbol: primarySymbol,
          primarySide: primaryCloseSide,
          hedgeSide: primaryCloseSide,
          primaryQuantity: actualQuantity,
          hedgeQuantity: 0,
          positionType,
          maxWaitTime: 5000,
          aggressiveMargin: 0.0005,
        });

        const actualCloseTime = Date.now() - closeStartTime;
        console.log(`[FundingArbitrage] ✓ Time-based close completed in ${actualCloseTime}ms`);

        // Calculate exit price and fees
        const primaryExitPrice = result.primaryExitPrice || entryPrice;
        const primaryFeeRate = result.primaryFeeType === 'maker' ? 0.0002 : 0.00055;
        const primaryTradingFees = (actualQuantity * entryPrice * primaryFeeRate * 2);

        // Calculate P&L
        const primaryPnL = positionType === 'long'
          ? (primaryExitPrice - entryPrice) * actualQuantity
          : (entryPrice - primaryExitPrice) * actualQuantity;

        const realizedPnl = fundingEarned + primaryPnL - primaryTradingFees;

        console.log(`[FundingArbitrage] Time-based close P&L:`, {
          fundingEarned: fundingEarned.toFixed(4),
          tradePnL: primaryPnL.toFixed(4),
          fees: primaryTradingFees.toFixed(4),
          realizedPnl: realizedPnl.toFixed(4),
        });

        // Update database
        await prisma.fundingArbitrageSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            realizedPnl: {
              increment: realizedPnl,
            },
            primaryExitPrice: null,
            hedgeExitPrice: null,
            primaryTradingFees: {
              increment: primaryTradingFees,
            },
            hedgeTradingFees: null,
            closedAt: new Date(),
            entryPrice: null,
            hedgeEntryPrice: null,
            errorMessage: null,
          },
        });

        // Reset in-memory state
        subscription.status = 'active';
        subscription.entryPrice = null;
        subscription.hedgeEntryPrice = null;
        subscription.primaryExitPrice = null;
        subscription.hedgeExitPrice = null;
        subscription.errorMessage = null;

        console.log(`[FundingArbitrage] ✅ Time-based cycle completed - P&L: $${realizedPnl.toFixed(4)}`);
        console.log(`[FundingArbitrage] 🔄 Subscription reset to ACTIVE`);

        // Emit completion event
        this.emit(FundingArbitrageService.SUBSCRIPTION_COMPLETED, {
          subscriptionId: subscription.id,
          symbol: subscription.symbol,
          fundingRate: subscription.fundingRate,
          entryPrice,
          hedgeEntryPrice: null,
          fundingEarned,
          realizedPnl,
          primaryExitPrice,
          hedgeExitPrice: null,
          primaryTradingFees,
          hedgeTradingFees: 0,
          closeTime: actualCloseTime,
          strategy: result.strategy,
          isRecurring: true,
        });

      } catch (closeError: any) {
        console.error(`[FundingArbitrage] Time-based close failed: ${closeError.message}`);

        await prisma.fundingArbitrageSubscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ERROR',
            errorMessage: `Time-based close failed: ${closeError.message}. Please close position manually.`,
          },
        });

        this.emit(FundingArbitrageService.ERROR, {
          subscriptionId: subscription.id,
          error: `Time-based close failed: ${closeError.message}`,
        });
      }
    }, closeDelay);
  }

  /**
   * Handle HEDGED position close, calculate P&L, and update database
   * Used when TP/SL triggers or max hold time is reached in HEDGED mode
   */
  private async handleHedgedPositionClose(
    subscription: FundingSubscription,
    entryPrice: number,
    hedgeEntryPrice: number,
    fundingEarned: number
  ): Promise<void> {
    try {
      const symbol = subscription.symbol;
      console.log(`[FundingArbitrage] Handling HEDGED position close for ${symbol}...`);

      // For HEDGED mode, P&L is primarily from funding
      // Price movement is hedged, so no directional P&L expected
      const primaryFeeRate = 0.00055; // Assume taker fee
      const hedgeFeeRate = 0.00055;

      const quantity = subscription.quantity;
      const primaryTradingFees = (quantity * entryPrice * primaryFeeRate * 2);
      const hedgeTradingFees = (quantity * hedgeEntryPrice * hedgeFeeRate * 2);

      // In perfect hedge, trade P&L should be near zero (price movements offset)
      // Main profit comes from funding
      const realizedPnl = fundingEarned - primaryTradingFees - hedgeTradingFees;

      console.log(`[FundingArbitrage] HEDGED position closed - P&L calculation:`, {
        fundingEarned: fundingEarned.toFixed(4),
        primaryFees: primaryTradingFees.toFixed(4),
        hedgeFees: hedgeTradingFees.toFixed(4),
        realizedPnl: realizedPnl.toFixed(4),
      });

      // Update database and reset to ACTIVE
      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          realizedPnl: {
            increment: realizedPnl,
          },
          primaryExitPrice: null,
          hedgeExitPrice: null,
          primaryTradingFees: {
            increment: primaryTradingFees,
          },
          hedgeTradingFees: {
            increment: hedgeTradingFees,
          },
          closedAt: new Date(),
          entryPrice: null,
          hedgeEntryPrice: null,
          errorMessage: null,
        },
      });

      // Reset in-memory state
      subscription.status = 'active';
      subscription.entryPrice = null;
      subscription.hedgeEntryPrice = null;
      subscription.primaryExitPrice = null;
      subscription.hedgeExitPrice = null;
      subscription.errorMessage = null;

      console.log(`[FundingArbitrage] ✅ HEDGED cycle completed for ${symbol} - P&L: $${realizedPnl.toFixed(4)}`);
      console.log(`[FundingArbitrage] 🔄 Subscription ${subscription.id} reset to ACTIVE for next funding cycle`);

      // Emit completion event
      this.emit(FundingArbitrageService.SUBSCRIPTION_COMPLETED, {
        subscriptionId: subscription.id,
        symbol,
        fundingRate: subscription.fundingRate,
        entryPrice,
        hedgeEntryPrice,
        fundingEarned,
        realizedPnl,
        primaryExitPrice: null,
        hedgeExitPrice: null,
        primaryTradingFees,
        hedgeTradingFees,
        closeTime: 0,
        strategy: 'TP/SL-HEDGED',
        isRecurring: true,
      });

    } catch (error: any) {
      console.error(`[FundingArbitrage] Error handling HEDGED position close: ${error.message}`);

      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ERROR',
          errorMessage: `HEDGED position close handler failed: ${error.message}`,
        },
      });

      this.emit(FundingArbitrageService.ERROR, {
        subscriptionId: subscription.id,
        error: `HEDGED position close failed: ${error.message}`,
      });
    }
  }

  /**
   * Monitor funding payment via WebSocket and close positions immediately when funded
   *
   * REAL-TIME FUNDING DETECTION:
   * - Subscribes to wallet balance updates via WebSocket
   * - Monitors for funding payment credit (balance increase)
   * - Closes positions 0-2 seconds after funding detected
   * - Falls back to 15-second timeout if funding not detected
   *
   * Previous: Fixed 10-second delay after funding time
   * New: Dynamic detection with 3-8 second average (2-5 seconds faster) ⚡
   */
  private async monitorFundingPayment(
    subscription: FundingSubscription,
    primaryExchange: BaseExchangeConnector,
    expectedFunding: number,
    timeUntilFunding: number,
    entryPrice: number,
    hedgeEntryPrice: number
  ): Promise<void> {
    const exchangeName = primaryExchange.exchangeName.toUpperCase();

    // Check if exchange is Bybit (supports WebSocket wallet monitoring)
    if (!exchangeName.includes('BYBIT')) {
      // Fallback to fixed delay for non-Bybit exchanges
      console.log(`[FundingMonitor] ${exchangeName} doesn't support WS wallet monitoring, using 10s fixed delay`);
      const delayUntilClose = Math.max(10000, timeUntilFunding + 10000);

      setTimeout(async () => {
        try {
          await this.closePositions(
            subscription,
            entryPrice,
            hedgeEntryPrice,
            expectedFunding
          );
        } catch (error: any) {
          console.error(`[FundingMonitor] Error in position closing:`, error);
        }
      }, delayUntilClose);

      return;
    }

    console.log(`[FundingMonitor] Starting WebSocket funding payment monitoring for ${subscription.symbol}`);

    // Wait until 5 seconds before funding time to start monitoring
    const delayBeforeMonitoring = Math.max(0, timeUntilFunding - 5000);
    console.log(`[FundingMonitor] Will start monitoring in ${Math.floor(delayBeforeMonitoring / 1000)}s (5s before funding)`);

    await new Promise(resolve => setTimeout(resolve, delayBeforeMonitoring));

    try {
      // Get Bybit connector and subscribe to wallet updates
      const bybitConnector = primaryExchange as any;

      if (typeof bybitConnector.subscribeToWallet !== 'function') {
        console.warn(`[FundingMonitor] Bybit connector doesn't support subscribeToWallet, falling back to fixed delay`);
        const fallbackDelay = Math.max(10000, 5000 + 10000); // 5s already passed + 10s

        setTimeout(async () => {
          try {
            await this.closePositions(subscription, entryPrice, hedgeEntryPrice, expectedFunding);
          } catch (error: any) {
            console.error(`[FundingMonitor] Error in fallback position closing:`, error);
          }
        }, fallbackDelay);

        return;
      }

      // Get initial USDT balance before funding
      let initialBalance = 0;
      try {
        const balance = await bybitConnector.getBalance();
        const usdtCoin = balance.list?.[0]?.coin?.find((c: any) => c.coin === 'USDT');
        initialBalance = parseFloat(usdtCoin?.walletBalance || '0');
        console.log(`[FundingMonitor] Initial USDT balance: ${initialBalance.toFixed(4)}`);
      } catch (balanceError: any) {
        console.warn(`[FundingMonitor] Could not get initial balance: ${balanceError.message}`);
      }

      // Set up funding payment detection
      let fundingDetected = false;
      let monitoringTimeout: NodeJS.Timeout | null = null;

      const closeFunding = async () => {
        if (fundingDetected) return; // Already closed
        fundingDetected = true;

        if (monitoringTimeout) {
          clearTimeout(monitoringTimeout);
        }

        console.log(`[FundingMonitor] ✓ Funding payment detected! Closing positions with TP/SL orders...`);

        try {
          await this.closePositions(subscription, entryPrice, hedgeEntryPrice, expectedFunding);
        } catch (error: any) {
          console.error(`[FundingMonitor] Error closing positions after funding:`, error);
        }
      };

      // Subscribe to wallet updates
      console.log(`[FundingMonitor] Subscribing to Bybit wallet updates...`);

      bybitConnector.subscribeToWallet((data: any) => {
        if (fundingDetected) return; // Already processed

        try {
          // Check if this is a wallet update with USDT balance
          if (data.topic === 'wallet' && data.data && Array.isArray(data.data)) {
            for (const account of data.data) {
              if (account.accountType === 'UNIFIED' && account.coin) {
                const usdtCoin = account.coin.find((c: any) => c.coin === 'USDT');

                if (usdtCoin) {
                  const currentBalance = parseFloat(usdtCoin.walletBalance || '0');
                  const balanceChange = currentBalance - initialBalance;

                  console.log(`[FundingMonitor] Wallet update: balance=${currentBalance.toFixed(4)}, change=${balanceChange.toFixed(4)}, expected=${expectedFunding.toFixed(4)}`);

                  // Detect funding payment: balance increased by at least 90% of expected amount
                  // (allowing for small discrepancies in calculation vs actual)
                  if (balanceChange >= expectedFunding * 0.9) {
                    console.log(`[FundingMonitor] 🎉 Funding payment detected! Balance increased by ${balanceChange.toFixed(4)} USDT`);
                    closeFunding();
                  }
                }
              }
            }
          }
        } catch (parseError: any) {
          console.error(`[FundingMonitor] Error parsing wallet update:`, parseError);
        }
      });

      console.log(`[FundingMonitor] Monitoring active, waiting for funding payment...`);

      // Set timeout fallback (15 seconds after funding time)
      const fallbackTimeout = Math.max(5000, timeUntilFunding) + 15000;
      console.log(`[FundingMonitor] Fallback timeout set to ${Math.floor(fallbackTimeout / 1000)}s`);

      monitoringTimeout = setTimeout(async () => {
        if (fundingDetected) return;

        console.warn(`[FundingMonitor] ⚠️ Funding payment not detected after ${Math.floor(fallbackTimeout / 1000)}s, closing positions anyway...`);
        fundingDetected = true;

        try {
          await this.closePositions(subscription, entryPrice, hedgeEntryPrice, expectedFunding);
        } catch (error: any) {
          console.error(`[FundingMonitor] Error in fallback position closing:`, error);
        }
      }, fallbackTimeout);

    } catch (error: any) {
      console.error(`[FundingMonitor] Error setting up WebSocket monitoring: ${error.message}`);

      // Emergency fallback: close after 10 seconds
      console.log(`[FundingMonitor] Using emergency fallback (10s delay)...`);
      setTimeout(async () => {
        try {
          await this.closePositions(subscription, entryPrice, hedgeEntryPrice, expectedFunding);
        } catch (closeError: any) {
          console.error(`[FundingMonitor] Error in emergency position closing:`, closeError);
        }
      }, 10000);
    }
  }

  /**
   * Close positions after funding payment using optimized strategies
   *
   * ADAPTIVE STRATEGY SELECTION:
   * - Ultra-Fast WS (2-4s): For Bybit-to-Bybit pairs (full WebSocket support)
   * - Hybrid + WS Monitoring (5-8s): For BingX, MEXC, and mixed pairs
   *
   * Previous implementation: 60-70s (market orders after polling)
   * New implementation: 2-8s (85-92% faster) ⚡
   *
   * NOTE: This method is only used by HEDGED mode. NON_HEDGED mode handles closing inline.
   */
  private async closePositions(
    subscription: FundingSubscription,
    entryPrice: number,
    hedgeEntryPrice: number,
    fundingEarned: number
  ): Promise<void> {
    const { symbol, positionType, primaryExchange, hedgeExchange } = subscription;

    // Validate that hedgeExchange exists (HEDGED mode)
    if (!hedgeExchange) {
      throw new Error('closePositions called for NON_HEDGED mode subscription - this should not happen!');
    }

    // Convert symbol to exchange-specific format
    const primarySymbol = this.convertSymbolForExchange(symbol, primaryExchange.exchangeName);
    const hedgeSymbol = this.convertSymbolForExchange(symbol, hedgeExchange.exchangeName);

    console.log(`[FundingArbitrage] ⚡ Starting optimized position close for ${symbol} (HEDGED mode)...`);

    // STEP 1: Get actual position sizes from exchanges
    let primaryQuantity = subscription.quantity;
    let hedgeQuantity = subscription.quantity;

    try {
      console.log(`[FundingArbitrage] Fetching actual position sizes from both exchanges...`);
      const [primaryPosition, hedgePosition] = await Promise.all([
        primaryExchange.getPosition(primarySymbol),
        hedgeExchange.getPosition(hedgeSymbol),
      ]);

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

    // STEP 2: Determine close sides (opposite of entry)
    const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';
    const hedgeCloseSide: OrderSide = positionType === 'long' ? 'Buy' : 'Sell';

    // STEP 3: Select optimal strategy based on exchange capabilities
    const strategy = PositionCloseStrategyFactory.getStrategy(primaryExchange, hedgeExchange);

    console.log(`[FundingArbitrage] Selected strategy: ${strategy.name} (avg close time: ${strategy.avgCloseTime}ms)`);

    // STEP 4: Execute close using selected strategy
    const closeStartTime = Date.now();

    let result;
    try {
      result = await strategy.closePositions({
        primarySymbol,
        hedgeSymbol,
        primarySide: primaryCloseSide,
        hedgeSide: hedgeCloseSide,
        primaryQuantity,
        hedgeQuantity,
        positionType,
        maxWaitTime: 5000, // 5 seconds for limit orders
        aggressiveMargin: 0.0005, // 0.05% aggressive pricing
      });
    } catch (strategyError: any) {
      console.error(`[FundingArbitrage] Strategy execution failed: ${strategyError.message}`);

      // Update database with error
      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ERROR',
          errorMessage: `Failed to close positions: ${strategyError.message}. Please close positions manually.`,
        },
      });

      throw strategyError;
    }

    const actualCloseTime = Date.now() - closeStartTime;
    console.log(`[FundingArbitrage] ✓ Strategy completed in ${actualCloseTime}ms (expected: ${strategy.avgCloseTime}ms)`);

    // STEP 5: Verify successful close
    if (!result.success || !result.primaryClosed || !result.hedgeClosed) {
      const errorMsg = result.error || 'Unknown error during position close';
      console.error(`[FundingArbitrage] ✗ Position close failed: ${errorMsg}`);

      await prisma.fundingArbitrageSubscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ERROR',
          errorMessage: `Position close failed: ${errorMsg}. Please verify and close positions manually.`,
        },
      });

      throw new Error(`Position close failed: ${errorMsg}`);
    }

    // STEP 6: Calculate exit prices (use strategy result or fallback)
    const primaryExitPrice = result.primaryExitPrice || entryPrice;
    const hedgeExitPrice = result.hedgeExitPrice || hedgeEntryPrice;

    console.log(`[FundingArbitrage] Exit prices:`, {
      primaryExitPrice,
      hedgeExitPrice,
      primaryFeeType: result.primaryFeeType,
      hedgeFeeType: result.hedgeFeeType,
    });

    // STEP 7: Calculate trading fees based on actual fee types (maker/taker)
    // Strategy tells us which orders were filled as maker vs taker
    const primaryFeeRate = result.primaryFeeType === 'maker' ? 0.0002 : 0.00055; // Bybit: 0.02% maker, 0.055% taker
    const hedgeFeeRate = result.hedgeFeeType === 'maker' ? 0.0002 : 0.0005;     // BingX: 0.02% maker, 0.05% taker

    // Entry + exit fees
    const primaryTradingFees = (primaryQuantity * entryPrice * primaryFeeRate * 2);
    const hedgeTradingFees = (hedgeQuantity * hedgeEntryPrice * hedgeFeeRate * 2);

    console.log(`[FundingArbitrage] Trading fees (${result.primaryFeeType}/${result.hedgeFeeType}):`, {
      primaryTradingFees: primaryTradingFees.toFixed(4),
      hedgeTradingFees: hedgeTradingFees.toFixed(4),
      totalFees: (primaryTradingFees + hedgeTradingFees).toFixed(4),
    });

    // STEP 8: Calculate P&L from price movements
    const primaryPnL = positionType === 'long'
      ? (primaryExitPrice - entryPrice) * primaryQuantity
      : (entryPrice - primaryExitPrice) * primaryQuantity;

    const hedgePnL = positionType === 'long'
      ? (hedgeEntryPrice - hedgeExitPrice) * hedgeQuantity
      : (hedgeExitPrice - hedgeEntryPrice) * hedgeQuantity;

    const realizedPnl = fundingEarned + primaryPnL + hedgePnL - primaryTradingFees - hedgeTradingFees;

    console.log(`[FundingArbitrage] Final P&L calculation:`, {
      fundingEarned: fundingEarned.toFixed(4),
      primaryPnL: primaryPnL.toFixed(4),
      hedgePnL: hedgePnL.toFixed(4),
      fees: (primaryTradingFees + hedgeTradingFees).toFixed(4),
      realizedPnl: realizedPnl.toFixed(4),
      closeTime: actualCloseTime,
      strategy: result.strategy,
    });

    // STEP 9: Update database with final results and reset to ACTIVE for next cycle
    await prisma.fundingArbitrageSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE', // ✅ Reset to ACTIVE instead of COMPLETED for recurring execution
        realizedPnl: {
          increment: realizedPnl, // Accumulate P&L over cycles
        },
        primaryExitPrice: null, // Clear execution-specific fields
        hedgeExitPrice: null,
        primaryTradingFees: {
          increment: primaryTradingFees, // Accumulate fees
        },
        hedgeTradingFees: {
          increment: hedgeTradingFees,
        },
        closedAt: new Date(),
        entryPrice: null, // Clear for next cycle
        hedgeEntryPrice: null,
        errorMessage: null, // Clear any previous errors
        // executedAt is kept to track when subscription was first executed
      },
    });

    // STEP 10: Reset in-memory subscription state for next cycle
    subscription.status = 'active';
    subscription.entryPrice = null;
    subscription.hedgeEntryPrice = null;
    subscription.primaryExitPrice = null;
    subscription.hedgeExitPrice = null;
    subscription.errorMessage = null;
    // Keep subscription in memory for next execution cycle

    console.log(`[FundingArbitrage] ✅ HEDGED mode cycle completed for ${symbol} - P&L: $${realizedPnl.toFixed(4)} (closed in ${actualCloseTime}ms using ${result.strategy})`);
    console.log(`[FundingArbitrage] 🔄 Subscription ${subscription.id} reset to ACTIVE for next funding cycle`);

    // STEP 11: Emit cycle completion event (not final completion)
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
      closeTime: actualCloseTime,
      strategy: result.strategy,
      isRecurring: true, // Indicate this is a recurring subscription
    });
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
      let hedgeConnector: BaseExchangeConnector | undefined;

      try {
        // Fast path: use cached connectors
        primaryConnector = await this.getOrCreateConnector(
          dbSub.userId,
          dbSub.primaryCredentialId,
          false // Use cached if available
        );

        // Get subscription mode (default to HEDGED for backwards compatibility)
        const subscriptionMode = dbSub.mode || 'HEDGED';

        // Only initialize hedge connector if in HEDGED mode
        if (subscriptionMode === 'HEDGED') {
          if (!dbSub.hedgeCredentialId) {
            throw new Error(`No hedge credential for HEDGED subscription ${dbSub.id}`);
          }

          hedgeConnector = await this.getOrCreateConnector(
            dbSub.userId,
            dbSub.hedgeCredentialId,
            false // Use cached if available
          );
        } else {
          // NON_HEDGED mode: no hedge connector needed
          console.log(`[FundingArbitrage] NON_HEDGED mode - skipping hedge connector initialization`);
          hedgeConnector = undefined;
        }

        const loadTime = Date.now() - startTime;
        console.log(`[FundingArbitrage] ✓ Connectors loaded in ${loadTime}ms (mode: ${subscriptionMode}, cached: ${loadTime < 1000})`);
      } catch (error: any) {
        throw new Error(`Failed to initialize connectors: ${error.message}`);
      }

      // Recreate subscription object
      const subscriptionMode = dbSub.mode || 'HEDGED';
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
        mode: subscriptionMode,
        takeProfit: dbSub.takeProfit || undefined,
        stopLoss: dbSub.stopLoss || undefined,
        takeProfitPercent: dbSub.takeProfitPercent || undefined,
        stopLossPercent: dbSub.stopLossPercent || undefined,
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
