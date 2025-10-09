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
  executionDelay?: number; // Seconds before funding time to execute (default: 5)
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
 * - Executes orders 5 seconds before funding
 * - Opens hedge position on secondary exchange
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
      const dbSubscriptions = await prisma.fundingArbitrageSubscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'WAITING'] },
        },
      });

      console.log(`[FundingArbitrage] Found ${dbSubscriptions.length} active subscriptions in database`);

      // Restore each subscription
      for (const dbSub of dbSubscriptions) {
        try {
          // Check if subscription is still valid (not expired)
          const timeUntilFunding = dbSub.nextFundingTime.getTime() - Date.now();
          if (timeUntilFunding < -60000) {
            // More than 1 minute past funding time - mark as failed
            await prisma.fundingArbitrageSubscription.update({
              where: { id: dbSub.id },
              data: { status: 'ERROR', errorMessage: 'Expired - funding time passed' },
            });
            console.log(`[FundingArbitrage] Subscription ${dbSub.id} expired - marked as ERROR`);
            continue;
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

          // Start countdown monitoring
          this.startCountdownMonitoring(subscription);

          console.log(`[FundingArbitrage] Restored subscription ${dbSub.id} - ${dbSub.symbol} - funding in ${Math.floor(timeUntilFunding / 1000)}s`);
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
    const checkInterval = 1000; // Check every second
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
   * Convert normalized symbol to exchange-specific format
   * BingX requires hyphenated format: "H-USDT", "BTC-USDT"
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
    const { symbol, positionType, quantity, primaryExchange, hedgeExchange } = subscription;

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

    console.log(`[FundingArbitrage] Executing ${positionType} position:`, {
      symbol,
      primarySide,
      hedgeSide,
      quantity,
    });

    // STEP 0: Synchronize leverage on both exchanges BEFORE opening positions
    // Use subscription leverage setting (default: 3x if not specified)
    const leverage = subscription.leverage ?? 3;

    try {
      console.log(`[FundingArbitrage] Synchronizing leverage to ${leverage}x on both exchanges...`);

      // Synchronize leverage in parallel for speed
      await Promise.all([
        this.setExchangeLeverage(primaryExchange, primarySymbol, leverage),
        this.setExchangeLeverage(hedgeExchange, hedgeSymbol, leverage),
      ]);

      console.log(`[FundingArbitrage] Leverage synchronized successfully on both exchanges (${leverage}x)`);
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

    // 1. Notify user: Both orders executing
    this.emit(FundingArbitrageService.ORDER_EXECUTING, {
      subscriptionId: subscription.id,
      symbol,
      type: 'primary',
      side: primarySide,
      quantity,
      exchange: primaryExchange.exchangeName,
    });

    this.emit(FundingArbitrageService.HEDGE_EXECUTING, {
      subscriptionId: subscription.id,
      symbol,
      type: 'hedge',
      side: hedgeSide,
      quantity,
      exchange: hedgeExchange.exchangeName,
    });

    // 2. Execute BOTH orders in parallel for speed ⚡
    console.log(`[FundingArbitrage] ⚡ Executing orders in parallel...`);
    const orderStartTime = Date.now();

    const [primaryOrder, hedgeOrder] = await Promise.all([
      primaryExchange.placeMarketOrder(primarySymbol, primarySide, quantity),
      hedgeExchange.placeMarketOrder(hedgeSymbol, hedgeSide, quantity),
    ]);

    const orderExecutionTime = Date.now() - orderStartTime;
    console.log(`[FundingArbitrage] ✓ Both orders executed in ${orderExecutionTime}ms (parallel)`);
    console.log(`[FundingArbitrage] Primary order:`, primaryOrder);
    console.log(`[FundingArbitrage] Hedge order:`, hedgeOrder);

    // 3. Notify orders executed
    this.emit(FundingArbitrageService.ORDER_EXECUTED, {
      subscriptionId: subscription.id,
      symbol,
      type: 'primary',
      order: primaryOrder,
      timestamp: Date.now(),
    } as OrderExecutionEvent);

    this.emit(FundingArbitrageService.HEDGE_EXECUTED, {
      subscriptionId: subscription.id,
      symbol,
      type: 'hedge',
      order: hedgeOrder,
      timestamp: Date.now(),
    } as OrderExecutionEvent);

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
    const timeUntilFunding = subscription.nextFundingTime - Date.now();
    const delayUntilFundingCheck = Math.max(10000, timeUntilFunding + 10000); // Wait 10 seconds after funding time to start polling

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
   * Close positions after funding payment
   */
  private async closePositions(
    subscription: FundingSubscription,
    entryPrice: number,
    hedgeEntryPrice: number,
    fundingEarned: number
  ): Promise<void> {
    const { symbol, quantity, positionType, primaryExchange, hedgeExchange } = subscription;

    // Convert symbol to exchange-specific format
    const primarySymbol = this.convertSymbolForExchange(symbol, primaryExchange.exchangeName);
    const hedgeSymbol = this.convertSymbolForExchange(symbol, hedgeExchange.exchangeName);

    console.log(`[FundingArbitrage] Closing positions for ${symbol}...`);

    // Close positions (opposite direction from entry)
    const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';
    const hedgeCloseSide: OrderSide = positionType === 'long' ? 'Buy' : 'Sell';

    // 1. Close primary position using reduce-only market order
    const primaryCloseOrder = await primaryExchange.placeReduceOnlyOrder(
      primarySymbol,
      primaryCloseSide,
      quantity
    );

    console.log(`[FundingArbitrage] Primary position closed:`, primaryCloseOrder);

    // 2. Close hedge position using reduce-only market order
    const hedgeCloseOrder = await hedgeExchange.placeReduceOnlyOrder(
      hedgeSymbol,
      hedgeCloseSide,
      quantity
    );

    console.log(`[FundingArbitrage] Hedge position closed:`, hedgeCloseOrder);

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

    // 4. Calculate trading fees
    // Extract fees from order responses or estimate using typical maker/taker fees
    const primaryEntryFee = primaryCloseOrder.commission || 0;
    const hedgeEntryFee = hedgeCloseOrder.commission || 0;

    // Estimate fees if not provided (typical taker fee: 0.055% for Bybit, 0.05% for BingX)
    const estimatedPrimaryFee = primaryEntryFee || (quantity * entryPrice * 0.00055);
    const estimatedHedgeFee = hedgeEntryFee || (quantity * hedgeEntryPrice * 0.0005);

    // Total fees include both entry and exit
    // For simplicity, we double the exit order fee as we had entry fees too
    const primaryTradingFees = estimatedPrimaryFee * 2;
    const hedgeTradingFees = estimatedHedgeFee * 2;

    console.log(`[FundingArbitrage] Trading fees calculated:`, {
      primaryTradingFees,
      hedgeTradingFees,
      totalFees: primaryTradingFees + hedgeTradingFees,
    });

    // 5. Calculate P&L from price movements
    // For long primary: P&L = (exitPrice - entryPrice) * quantity
    // For short primary: P&L = (entryPrice - exitPrice) * quantity
    const primaryPnL = positionType === 'long'
      ? (primaryExitPrice - entryPrice) * quantity
      : (entryPrice - primaryExitPrice) * quantity;

    // Hedge has opposite P&L
    const hedgePnL = positionType === 'long'
      ? (hedgeEntryPrice - hedgeExitPrice) * quantity
      : (hedgeExitPrice - hedgeEntryPrice) * quantity;

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
