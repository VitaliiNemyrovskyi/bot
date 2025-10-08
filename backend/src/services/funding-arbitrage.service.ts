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

          // Initialize primary exchange connector
          let primaryConnector;
          if (credential.exchange === 'BYBIT') {
            const { BybitConnector } = await import('@/connectors/bybit.connector');
            primaryConnector = new BybitConnector(
              credential.apiKey,
              credential.apiSecret,
              credential.environment === 'TESTNET'
            );
            await primaryConnector.initialize();
          } else {
            console.error(`[FundingArbitrage] Exchange ${credential.exchange} not supported for subscription ${dbSub.id}`);
            continue;
          }

          // Initialize hedge exchange connector
          let hedgeConnector;
          if (dbSub.hedgeExchange === 'MOCK' || !dbSub.hedgeCredentialId) {
            // Use mock exchange for testing or when no hedge credential provided
            const { MockExchangeConnector } = await import('@/connectors/mock-exchange.connector');
            hedgeConnector = new MockExchangeConnector();
            await hedgeConnector.initialize();
          } else {
            // Load hedge exchange credentials
            const hedgeCredential = await ExchangeCredentialsService.getCredentialById(
              dbSub.userId,
              dbSub.hedgeCredentialId
            );

            if (!hedgeCredential) {
              console.error(`[FundingArbitrage] Hedge credential ${dbSub.hedgeCredentialId} not found for subscription ${dbSub.id}`);
              await prisma.fundingArbitrageSubscription.update({
                where: { id: dbSub.id },
                data: { status: 'ERROR', errorMessage: 'Hedge credentials not found' },
              });
              continue;
            }

            // Initialize hedge exchange connector based on exchange type
            if (hedgeCredential.exchange === 'BYBIT') {
              const { BybitConnector } = await import('@/connectors/bybit.connector');
              hedgeConnector = new BybitConnector(
                hedgeCredential.apiKey,
                hedgeCredential.apiSecret,
                hedgeCredential.environment === 'TESTNET'
              );
              await hedgeConnector.initialize();
            } else if (hedgeCredential.exchange === 'BINGX') {
              const { BingXConnector } = await import('@/connectors/bingx.connector');
              hedgeConnector = new BingXConnector(
                hedgeCredential.apiKey,
                hedgeCredential.apiSecret,
                hedgeCredential.environment === 'TESTNET'
              );
              await hedgeConnector.initialize();
            } else {
              console.error(`[FundingArbitrage] Hedge exchange ${hedgeCredential.exchange} not supported for subscription ${dbSub.id}`);
              await prisma.fundingArbitrageSubscription.update({
                where: { id: dbSub.id },
                data: { status: 'ERROR', errorMessage: `Hedge exchange ${hedgeCredential.exchange} not supported` },
              });
              continue;
            }
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
          };

          // Add to memory
          this.subscriptions.set(dbSub.id, subscription);

          // Start countdown monitoring
          this.startCountdownMonitoring(subscription);

          console.log(`[FundingArbitrage] Restored subscription ${dbSub.id} - ${dbSub.symbol} - funding in ${Math.floor(timeUntilFunding / 1000)}s`);
        } catch (error: any) {
          console.error(`[FundingArbitrage] Error restoring subscription ${dbSub.id}:`, error.message);
        }
      }

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
  }): Promise<FundingSubscription> {
    // Save to database first
    const dbSubscription = await prisma.fundingArbitrageSubscription.create({
      data: {
        userId: params.userId,
        symbol: params.symbol,
        fundingRate: params.fundingRate,
        nextFundingTime: new Date(params.nextFundingTime),
        positionType: params.positionType,
        quantity: params.quantity,
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
    };

    this.subscriptions.set(dbSubscription.id, subscription);

    console.log(`[FundingArbitrage] New subscription created:`, {
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
   * Unsubscribe from funding rate arbitrage
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);

    // If in memory, clean up timers
    if (subscription) {
      // Clear countdown timer
      const timer = this.countdownTimers.get(subscriptionId);
      if (timer) {
        clearInterval(timer);
        this.countdownTimers.delete(subscriptionId);
      }

      // Delete from memory
      this.subscriptions.delete(subscriptionId);
    }

    // Always try to delete from database
    try {
      await prisma.fundingArbitrageSubscription.delete({
        where: { id: subscriptionId },
      });
      console.log(`[FundingArbitrage] Subscription ${subscriptionId} canceled and deleted from database`);
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found
        throw new Error(`Subscription ${subscriptionId} not found`);
      }
      throw error;
    }
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
   * Execute arbitrage orders
   */
  private async executeArbitrageOrders(subscription: FundingSubscription): Promise<void> {
    const { symbol, positionType, quantity, primaryExchange, hedgeExchange } = subscription;

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

    // 1. Notify user: Primary order executing
    this.emit(FundingArbitrageService.ORDER_EXECUTING, {
      subscriptionId: subscription.id,
      symbol,
      type: 'primary',
      side: primarySide,
      quantity,
      exchange: primaryExchange.exchangeName,
    });

    // 2. Execute primary order (funding farming position)
    const primaryOrder = await primaryExchange.placeMarketOrder(
      symbol,
      primarySide,
      quantity
    );

    console.log(`[FundingArbitrage] Primary order executed:`, primaryOrder);

    this.emit(FundingArbitrageService.ORDER_EXECUTED, {
      subscriptionId: subscription.id,
      symbol,
      type: 'primary',
      order: primaryOrder,
      timestamp: Date.now(),
    } as OrderExecutionEvent);

    // 3. Notify user: Hedge order executing
    this.emit(FundingArbitrageService.HEDGE_EXECUTING, {
      subscriptionId: subscription.id,
      symbol,
      type: 'hedge',
      side: hedgeSide,
      quantity,
      exchange: hedgeExchange.exchangeName,
    });

    // 4. Execute hedge order (opposite position)
    const hedgeOrder = await hedgeExchange.placeMarketOrder(
      symbol,
      hedgeSide,
      quantity
    );

    console.log(`[FundingArbitrage] Hedge order executed:`, hedgeOrder);

    this.emit(FundingArbitrageService.HEDGE_EXECUTED, {
      subscriptionId: subscription.id,
      symbol,
      type: 'hedge',
      order: hedgeOrder,
      timestamp: Date.now(),
    } as OrderExecutionEvent);

    // 5. Get actual entry prices from positions (market orders don't return avgPrice immediately)
    let entryPrice = primaryOrder.avgPrice || primaryOrder.price || 0;
    let hedgeEntryPrice = hedgeOrder.avgPrice || hedgeOrder.price || 0;

    // If price is not in order response, fetch from position
    if (entryPrice === 0) {
      console.log(`[FundingArbitrage] Fetching entry price from primary position...`);
      const primaryPosition = await primaryExchange.getPosition(symbol);
      entryPrice = parseFloat(primaryPosition.avgPrice || primaryPosition.entryPrice || '0');
      console.log(`[FundingArbitrage] Primary entry price: ${entryPrice}`);
    }

    if (hedgeEntryPrice === 0) {
      console.log(`[FundingArbitrage] Fetching entry price from hedge position...`);
      const hedgePosition = await hedgeExchange.getPosition(symbol);
      hedgeEntryPrice = parseFloat(hedgePosition.avgPrice || hedgePosition.entryPrice || '0');
      console.log(`[FundingArbitrage] Hedge entry price: ${hedgeEntryPrice}`);
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
      // Check if exchange supports transaction log (only real exchanges, not mock)
      if (primaryExchange.exchangeName === 'MOCK') {
        console.log(`[FundingArbitrage] Mock exchange - skipping funding verification`);
        return null; // Use calculated funding for mock
      }

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

    console.log(`[FundingArbitrage] Closing positions for ${symbol}...`);

    // Close positions (opposite direction from entry)
    const primaryCloseSide: OrderSide = positionType === 'long' ? 'Sell' : 'Buy';
    const hedgeCloseSide: OrderSide = positionType === 'long' ? 'Buy' : 'Sell';

    // 1. Close primary position using reduce-only market order
    const primaryCloseOrder = await primaryExchange.placeReduceOnlyOrder(
      symbol,
      primaryCloseSide,
      quantity
    );

    console.log(`[FundingArbitrage] Primary position closed:`, primaryCloseOrder);

    // 2. Close hedge position using reduce-only market order
    const hedgeCloseOrder = await hedgeExchange.placeReduceOnlyOrder(
      symbol,
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
        const position = await primaryExchange.getPosition(symbol);
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
        const position = await hedgeExchange.getPosition(symbol);
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

      // Recreate exchange connectors from stored credential ID
      const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
      const credential = await ExchangeCredentialsService.getCredentialById(
        dbSub.userId,
        dbSub.primaryCredentialId
      );

      if (!credential) {
        throw new Error(`Credential ${dbSub.primaryCredentialId} not found`);
      }

      // Initialize primary exchange connector
      let primaryConnector;
      if (credential.exchange === 'BYBIT') {
        const { BybitConnector } = await import('@/connectors/bybit.connector');
        primaryConnector = new BybitConnector(
          credential.apiKey,
          credential.apiSecret,
          credential.environment === 'TESTNET'
        );
        await primaryConnector.initialize();
      } else {
        throw new Error(`Exchange ${credential.exchange} not supported`);
      }

      // Initialize hedge exchange connector
      let hedgeConnector;
      if (dbSub.hedgeExchange === 'MOCK' || !dbSub.hedgeCredentialId) {
        // Use mock exchange for testing or when no hedge credential provided
        const { MockExchangeConnector } = await import('@/connectors/mock-exchange.connector');
        hedgeConnector = new MockExchangeConnector();
        await hedgeConnector.initialize();
      } else {
        // Load hedge exchange credentials
        const hedgeCredential = await ExchangeCredentialsService.getCredentialById(
          dbSub.userId,
          dbSub.hedgeCredentialId
        );

        if (!hedgeCredential) {
          throw new Error(`Hedge credential ${dbSub.hedgeCredentialId} not found`);
        }

        // Initialize hedge exchange connector based on exchange type
        if (hedgeCredential.exchange === 'BYBIT') {
          const { BybitConnector } = await import('@/connectors/bybit.connector');
          hedgeConnector = new BybitConnector(
            hedgeCredential.apiKey,
            hedgeCredential.apiSecret,
            hedgeCredential.environment === 'TESTNET'
          );
          await hedgeConnector.initialize();
        } else if (hedgeCredential.exchange === 'BINGX') {
          const { BingXConnector } = await import('@/connectors/bingx.connector');
          hedgeConnector = new BingXConnector(
            hedgeCredential.apiKey,
            hedgeCredential.apiSecret,
            hedgeCredential.environment === 'TESTNET'
          );
          await hedgeConnector.initialize();
        } else {
          throw new Error(`Hedge exchange ${hedgeCredential.exchange} not supported`);
        }
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
      };

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

    console.log(`[FundingArbitrage] Manually executing subscription ${subscriptionId}`);

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
