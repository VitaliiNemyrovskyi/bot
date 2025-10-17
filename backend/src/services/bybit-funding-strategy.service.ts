/**
 * Bybit Funding Strategy Service
 *
 * Implements automated funding rate collection strategy with take-profit/stop-loss:
 * 1. Monitors funding time countdown via WebSocket
 * 2. Opens position 5 seconds before funding with TP/SL
 * 3. TP = Expected funding - 10% (to secure profits before market moves)
 * 4. Reopens position if closed by TP/SL before funding time (00:00:00)
 * 5. Collects funding payment at 00:00:00
 *
 * Example:
 * - Margin: 100 USDT
 * - Leverage: 10x
 * - Funding Rate: 2%
 * - Expected Funding: 100 * 10 * 0.02 = 20 USDT
 * - Take Profit: 20 * 0.9 = 18 USDT (90% of expected funding)
 */

import { EventEmitter } from 'events';
import { BybitService } from '@/lib/bybit';
import { BybitConnector } from '@/connectors/bybit.connector';
import prisma from '@/lib/prisma';

export interface FundingStrategyConfig {
  userId: string;
  symbol: string;
  leverage: number;        // e.g., 10
  margin: number;          // in USDT, e.g., 100
  side: 'Buy' | 'Sell';    // Position side to collect funding
  executionDelay: number;  // Seconds before funding to open position (default: 5)
  takeProfitPercent: number; // Percentage of expected funding (default: 90 = 90%)
  stopLossPercent: number;   // Stop loss percentage (default: 50 = 50% of expected funding)
}

/**
 * Configuration for Precise Timing Strategy
 *
 * This strategy opens a position at exactly funding time + timingOffset (default 20ms)
 * - Determines position side automatically based on funding rate (opens side that PAYS funding)
 * - Uses latency compensation to ensure order EXECUTES at target time
 * - Optional WebSocket monitoring for positions
 * - Configurable auto-repeat for continuous operation
 */
export interface PreciseTimingStrategyConfig {
  userId: string;
  symbol: string;
  leverage: number;           // e.g., 10
  margin: number;             // in USDT, e.g., 100

  // Position side configuration
  positionSide: 'Auto' | 'Buy' | 'Sell';  // 'Auto' = determine from funding rate, otherwise manual

  // TP/SL settings (same format as regular strategy)
  takeProfitPercent: number;  // Percentage of expected funding (default: 90 = 90%)
  stopLossPercent: number;    // Stop loss percentage (default: 50 = 50% of expected funding)

  // Timing configuration
  timingOffset: number;       // Milliseconds after funding time to execute (default: 20ms)

  // Auto-repeat configuration
  autoRepeat: boolean;        // If true, automatically repeat strategy for next funding cycle

  // WebSocket monitoring (optional)
  enableWebSocketMonitoring?: boolean; // Enable real-time position monitoring (default: true)
}

export interface ActiveStrategy {
  id: string;
  dbId?: string;          // Database ID for persistence
  config: FundingStrategyConfig;
  connector: BybitConnector;
  bybitService: BybitService;

  // Funding info
  fundingRate: number;
  nextFundingTime: number; // timestamp in ms
  currentPrice: number;

  // First position (main position for funding collection)
  hasFirstPosition: boolean;
  firstPositionSide: 'Buy' | 'Sell';
  firstPositionSize: number;
  firstPositionEntry: number;
  firstPositionTP: number;
  firstPositionSL: number;

  // Second position (opposite side after funding time)
  hasSecondPosition: boolean;
  secondPositionSide: 'Buy' | 'Sell';
  secondPositionSize: number;
  secondPositionEntry: number;
  secondPositionTP: number;
  secondPositionSL: number;

  // Strategy state
  countdownTimer?: NodeJS.Timeout;
  positionReopenCount: number; // How many times first position was reopened in this cycle
  lastExecutionTime?: number;
  fundingTimeReached: boolean; // Flag to track if funding time (00:00:00) was reached
  secondPositionTimer?: NodeJS.Timeout; // Timer for opening second position after 100ms
  status: 'initializing' | 'monitoring' | 'executing' | 'position_1_open' | 'funding_time' | 'both_open' | 'cycling' | 'completed' | 'error';
  errorMessage?: string;

  // Failsafe optimization
  lastTPSLCheckTime: number;  // Timestamp of last TP/SL check (for throttling)
  isClosingPosition: boolean;  // Flag to prevent race conditions during closure

  // Credentials for restoration
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  credentialId: string;
}

/**
 * Service for managing automated funding strategies
 */
export class BybitFundingStrategyService extends EventEmitter {
  private strategies: Map<string, ActiveStrategy> = new Map();
  private strategyCounter = 0;

  // Event types
  static readonly COUNTDOWN = 'countdown';              // { strategyId, secondsRemaining, fundingRate }
  static readonly POSITION_OPENING = 'position_opening'; // { strategyId, symbol, side, price }
  static readonly POSITION_OPENED = 'position_opened';   // { strategyId, position, tpPrice, slPrice }
  static readonly POSITION_CLOSED = 'position_closed';   // { strategyId, reason: 'tp'|'sl'|'funding' }
  static readonly POSITION_REOPENING = 'position_reopening'; // { strategyId, attempt }
  static readonly FUNDING_COLLECTED = 'funding_collected'; // { strategyId, amount }
  static readonly ERROR = 'error';                        // { strategyId, error }

  constructor() {
    super();
  }

  /**
   * Initialize service and restore active strategies from database
   */
  async initialize(): Promise<void> {
    console.log('[BybitFundingStrategy] Initializing service and restoring active strategies...');

    try {
      // Query database for active strategies
      const activeSubscriptions = await prisma.fundingArbitrageSubscription.findMany({
        where: {
          mode: 'NON_HEDGED', // Only Bybit Funding Strategy uses NON_HEDGED mode
          status: {
            in: ['ACTIVE', 'WAITING', 'EXECUTING'],
          },
          strategyId: {
            not: null, // Only restore strategies that have strategyId (Bybit Funding Strategy)
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (activeSubscriptions.length === 0) {
        console.log('[BybitFundingStrategy] No active strategies to restore');
        return;
      }

      console.log(`[BybitFundingStrategy] Found ${activeSubscriptions.length} active strategies to restore`);

      // Restore each strategy
      let restoredCount = 0;
      let failedCount = 0;

      for (const subscription of activeSubscriptions) {
        try {
          // Get credentials
          const credential = await prisma.exchangeCredentials.findUnique({
            where: { id: subscription.primaryCredentialId },
          });

          if (!credential) {
            console.warn(`[BybitFundingStrategy] Credential not found for subscription ${subscription.id}, marking as ERROR`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: subscription.id },
              data: {
                status: 'ERROR',
                errorMessage: 'Credential not found',
                updatedAt: new Date(),
              },
            });
            failedCount++;
            continue;
          }

          // Check if strategy is already running (by strategyId)
          if (subscription.strategyId && this.strategies.has(subscription.strategyId)) {
            console.log(`[BybitFundingStrategy] Strategy ${subscription.strategyId} already running, skipping`);
            continue;
          }

          // Validate required fields
          if (!subscription.side || !subscription.executionDelay ||
              !subscription.takeProfitPercent || !subscription.stopLossPercent) {
            console.warn(`[BybitFundingStrategy] Missing required fields for subscription ${subscription.id}, marking as ERROR`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: subscription.id },
              data: {
                status: 'ERROR',
                errorMessage: 'Missing required strategy configuration',
                updatedAt: new Date(),
              },
            });
            failedCount++;
            continue;
          }

          // Check if funding time has already passed
          const now = Date.now();
          const fundingTime = subscription.nextFundingTime.getTime();
          if (fundingTime <= now) {
            console.log(`[BybitFundingStrategy] Funding time already passed for subscription ${subscription.id}, marking as COMPLETED`);
            await prisma.fundingArbitrageSubscription.update({
              where: { id: subscription.id },
              data: {
                status: 'COMPLETED',
                closedAt: new Date(),
                updatedAt: new Date(),
              },
            });
            continue;
          }

          console.log(`[BybitFundingStrategy] Restoring strategy for ${subscription.symbol} (user: ${subscription.userId})`);

          // Restore strategy
          const testnet = credential.environment === 'TESTNET';

          const strategyId = await this.startStrategy(
            {
              userId: subscription.userId,
              symbol: subscription.symbol,
              leverage: subscription.leverage,
              margin: subscription.margin || 100,
              side: subscription.side as 'Buy' | 'Sell',
              executionDelay: subscription.executionDelay,
              takeProfitPercent: subscription.takeProfitPercent,
              stopLossPercent: subscription.stopLossPercent,
            },
            credential.apiKey,
            credential.apiSecret,
            testnet,
            credential.id
          );

          // Update the database record with restored strategyId
          await prisma.fundingArbitrageSubscription.update({
            where: { id: subscription.id },
            data: {
              strategyId,
              status: 'ACTIVE',
              updatedAt: new Date(),
            },
          });

          console.log(`[BybitFundingStrategy] ✓ Strategy restored: ${strategyId}`);
          restoredCount++;
        } catch (error: any) {
          console.error(`[BybitFundingStrategy] Error restoring subscription ${subscription.id}:`, error.message);

          // Mark as ERROR in database
          try {
            await prisma.fundingArbitrageSubscription.update({
              where: { id: subscription.id },
              data: {
                status: 'ERROR',
                errorMessage: `Restoration failed: ${error.message}`,
                updatedAt: new Date(),
              },
            });
          } catch (dbError: any) {
            console.error(`[BybitFundingStrategy] Error updating database:`, dbError.message);
          }

          failedCount++;
        }
      }

      console.log(`[BybitFundingStrategy] Restoration complete: ${restoredCount} restored, ${failedCount} failed`);
    } catch (error: any) {
      console.error('[BybitFundingStrategy] Error during initialization:', error.message);
    }
  }

  /**
   * Start a new funding strategy
   *
   * @param config Strategy configuration
   * @param apiKey Bybit API key
   * @param apiSecret Bybit API secret
   * @param testnet Whether to use testnet
   * @param credentialId Exchange credential ID
   * @returns Strategy ID
   */
  async startStrategy(
    config: FundingStrategyConfig,
    apiKey: string,
    apiSecret: string,
    testnet: boolean = true,
    credentialId?: string
  ): Promise<string> {
    const strategyId = `strategy_${++this.strategyCounter}_${Date.now()}`;

    console.log(`[FundingStrategy] Starting new strategy ${strategyId}:`, {
      symbol: config.symbol,
      leverage: config.leverage,
      margin: config.margin,
      side: config.side,
      executionDelay: config.executionDelay,
    });

    try {
      // Initialize Bybit connector
      const connector = new BybitConnector(apiKey, apiSecret, testnet);
      await connector.initialize();

      // Get Bybit service for WebSocket
      const bybitService = connector.getBybitService();

      // Set leverage before starting (ignore if already set)
      try {
        await connector.setLeverage(config.symbol, config.leverage);
      } catch (error: any) {
        // If leverage is already set to the desired value, that's not an error
        if (error.message && error.message.includes('leverage not modified')) {
          console.log(`[FundingStrategy] Leverage already set for ${config.symbol} (leverage: ${config.leverage})`);
        } else {
          // Re-throw other errors
          throw error;
        }
      }

      // Fetch initial ticker data to get funding info
      const tickers = await bybitService.getTicker('linear', config.symbol);
      if (!tickers || tickers.length === 0) {
        throw new Error(`No ticker data found for ${config.symbol}`);
      }

      const ticker = tickers[0];
      const fundingRate = parseFloat(ticker.fundingRate || '0');
      const nextFundingTime = parseInt(ticker.nextFundingTime || '0');
      const currentPrice = parseFloat(ticker.lastPrice || '0');

      if (!fundingRate || !nextFundingTime || !currentPrice) {
        throw new Error(`Invalid ticker data for ${config.symbol}`);
      }

      // Save to database
      const dbRecord = await prisma.fundingArbitrageSubscription.create({
        data: {
          userId: config.userId,
          symbol: config.symbol,
          fundingRate,
          nextFundingTime: new Date(nextFundingTime),
          positionType: config.side.toLowerCase(), // "buy" -> "long", "sell" -> "short"
          side: config.side,
          quantity: 0, // Will be calculated when position opens
          leverage: config.leverage,
          margin: config.margin,
          mode: 'NON_HEDGED', // Bybit Funding Strategy uses single position
          executionDelay: config.executionDelay,
          takeProfitPercent: config.takeProfitPercent,
          stopLossPercent: config.stopLossPercent,
          positionReopenCount: 0,
          strategyId,
          primaryExchange: testnet ? 'BYBIT_TESTNET' : 'BYBIT_MAINNET',
          primaryCredentialId: credentialId || 'unknown',
          status: 'ACTIVE',
        },
      });

      console.log(`[FundingStrategy] Strategy saved to DB with ID: ${dbRecord.id}`);

      // Create strategy instance
      const strategy: ActiveStrategy = {
        id: strategyId,
        dbId: dbRecord.id,
        config,
        connector,
        bybitService,
        fundingRate,
        nextFundingTime,
        currentPrice,

        // First position (main position for funding)
        hasFirstPosition: false,
        firstPositionSide: config.side,
        firstPositionSize: 0,
        firstPositionEntry: 0,
        firstPositionTP: 0,
        firstPositionSL: 0,

        // Second position (opposite side)
        hasSecondPosition: false,
        secondPositionSide: config.side === 'Buy' ? 'Sell' : 'Buy',
        secondPositionSize: 0,
        secondPositionEntry: 0,
        secondPositionTP: 0,
        secondPositionSL: 0,

        positionReopenCount: 0,
        fundingTimeReached: false,
        status: 'initializing',
        lastTPSLCheckTime: 0,     // Initialize throttle timestamp
        isClosingPosition: false,  // Initialize race condition flag
        apiKey,
        apiSecret,
        testnet,
        credentialId: credentialId || 'unknown',
      };

      this.strategies.set(strategyId, strategy);

      // Start monitoring
      await this.startMonitoring(strategy);

      console.log(`[FundingStrategy] Strategy ${strategyId} started successfully`);
      return strategyId;
    } catch (error: any) {
      console.error(`[FundingStrategy] Error starting strategy:`, error.message);
      this.emit(BybitFundingStrategyService.ERROR, {
        strategyId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Update strategy status in database
   */
  private async updateDatabaseStatus(strategy: ActiveStrategy): Promise<void> {
    if (!strategy.dbId) return;

    try {
      await prisma.fundingArbitrageSubscription.update({
        where: { id: strategy.dbId },
        data: {
          positionReopenCount: strategy.positionReopenCount,
          entryPrice: strategy.firstPositionEntry || null,
          quantity: strategy.firstPositionSize || 0,
          errorMessage: strategy.errorMessage || null,
          status: this.mapInternalStatusToDBStatus(strategy.status),
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error(`[FundingStrategy] Error updating database:`, error.message);
    }
  }

  /**
   * Map internal status to database status
   */
  private mapInternalStatusToDBStatus(status: ActiveStrategy['status']): string {
    const mapping: Record<ActiveStrategy['status'], string> = {
      initializing: 'ACTIVE',
      monitoring: 'WAITING',
      executing: 'EXECUTING',
      position_1_open: 'EXECUTING',
      funding_time: 'EXECUTING',
      both_open: 'EXECUTING',
      cycling: 'ACTIVE',
      completed: 'COMPLETED',
      error: 'ERROR',
    };
    return mapping[status] || 'ACTIVE';
  }

  /**
   * Start monitoring funding countdown
   */
  private async startMonitoring(strategy: ActiveStrategy): Promise<void> {
    console.log(`[FundingStrategy] Starting monitoring for ${strategy.id}`);
    strategy.status = 'monitoring';

    // Subscribe to ticker updates via WebSocket to get real-time funding info
    strategy.bybitService.subscribeToTicker(strategy.config.symbol, (data: any) => {
      this.handleTickerUpdate(strategy.id, data);
    });

    // Subscribe to position updates to detect TP/SL closures
    strategy.bybitService.subscribeToPositions((data: any) => {
      this.handlePositionUpdate(strategy.id, data);
    });

    // Start countdown timer (updates every second)
    this.startCountdownTimer(strategy);
  }

  /**
   * Start countdown timer that checks every second
   */
  private startCountdownTimer(strategy: ActiveStrategy): void {
    if (strategy.countdownTimer) {
      clearInterval(strategy.countdownTimer);
    }

    strategy.countdownTimer = setInterval(async () => {
      try {
        await this.checkCountdown(strategy);
      } catch (error: any) {
        console.error(`[FundingStrategy] Error in countdown check:`, error.message);
        this.emit(BybitFundingStrategyService.ERROR, {
          strategyId: strategy.id,
          error: error.message,
        });
      }
    }, 1000); // Check every second
  }

  /**
   * Check countdown and execute strategy
   */
  private async checkCountdown(strategy: ActiveStrategy): Promise<void> {
    const now = Date.now();
    const secondsRemaining = Math.max(0, Math.floor((strategy.nextFundingTime - now) / 1000));

    // Emit countdown event
    this.emit(BybitFundingStrategyService.COUNTDOWN, {
      strategyId: strategy.id,
      symbol: strategy.config.symbol,
      secondsRemaining,
      fundingRate: strategy.fundingRate,
      nextFundingTime: strategy.nextFundingTime,
    });

    // Log countdown every 10 seconds
    if (secondsRemaining % 10 === 0 || secondsRemaining <= 10) {
      console.log(`[FundingStrategy] ${strategy.id} countdown: ${secondsRemaining}s remaining`);
    }

    // Execute FIRST position opening at executionDelay seconds before funding
    if (secondsRemaining === strategy.config.executionDelay && !strategy.hasFirstPosition) {
      console.log(`[FundingStrategy] ${strategy.id} - Execution time reached! Opening FIRST position...`);
      await this.openPosition(strategy);
    }

    // At funding time (00:00:00), open SECOND position after 100ms delay
    if (secondsRemaining === 0 && !strategy.fundingTimeReached) {
      console.log(`[FundingStrategy] ${strategy.id} - Funding time reached! Collecting funding...`);
      strategy.fundingTimeReached = true;
      strategy.status = 'funding_time';

      // Calculate expected funding
      const expectedFunding = strategy.config.margin * strategy.config.leverage * Math.abs(strategy.fundingRate);

      this.emit(BybitFundingStrategyService.FUNDING_COLLECTED, {
        strategyId: strategy.id,
        amount: expectedFunding,
        fundingRate: strategy.fundingRate,
        positionReopenCount: strategy.positionReopenCount,
      });

      console.log(`[FundingStrategy] ${strategy.id} - Funding collected: ${expectedFunding.toFixed(2)} USDT`);

      // Open SECOND position (opposite side) after 100ms delay
      console.log(`[FundingStrategy] ${strategy.id} - Waiting 100ms before opening SECOND position...`);

      strategy.secondPositionTimer = setTimeout(async () => {
        console.log(`[FundingStrategy] ${strategy.id} - 100ms elapsed, opening SECOND position (opposite side)...`);
        await this.openSecondPosition(strategy);

        // After opening second position, continue cycling (prepare for next funding time)
        await this.prepareNextCycle(strategy);
      }, 100);
    }
  }

  /**
   * Open first position (main position for funding collection)
   */
  private async openPosition(strategy: ActiveStrategy): Promise<void> {
    if (strategy.hasFirstPosition) {
      console.log(`[FundingStrategy] ${strategy.id} - First position already exists, skipping`);
      return;
    }

    strategy.status = 'executing';
    strategy.positionReopenCount++;

    const { symbol, margin, leverage } = strategy.config;
    const side = strategy.firstPositionSide;
    const currentPrice = strategy.currentPrice;

    console.log(`[FundingStrategy] ${strategy.id} - Opening FIRST ${side} position:`, {
      symbol,
      price: currentPrice,
      margin,
      leverage,
      attempt: strategy.positionReopenCount,
    });

    this.emit(BybitFundingStrategyService.POSITION_OPENING, {
      strategyId: strategy.id,
      symbol,
      side,
      price: currentPrice,
      margin,
      leverage,
      positionNumber: 1,
    });

    try {
      // Calculate position size based on margin and leverage
      // Size = (Margin * Leverage) / Price
      const positionValue = margin * leverage;
      const positionSize = positionValue / currentPrice;

      // Calculate TP/SL prices BEFORE opening position
      const { takeProfitPrice, stopLossPrice } = this.calculateTPSL(strategy, currentPrice, side);

      console.log(`[FundingStrategy] ${strategy.id} - Opening FIRST position with ATOMIC TP/SL protection:`, {
        side,
        size: positionSize,
        entryPrice: currentPrice,
        takeProfit: takeProfitPrice,
        stopLoss: stopLossPrice,
      });

      // Place market order with TP/SL atomically (no gap between open and protection)
      const order = await strategy.connector.placeMarketOrderWithTPSL(
        symbol,
        side,
        positionSize,
        takeProfitPrice,
        stopLossPrice
      );

      console.log(`[FundingStrategy] ${strategy.id} - FIRST position opened with TP/SL protection:`, order);

      // Update strategy state for first position
      strategy.hasFirstPosition = true;
      strategy.firstPositionSize = positionSize;
      strategy.firstPositionEntry = currentPrice;
      strategy.firstPositionTP = takeProfitPrice;
      strategy.firstPositionSL = stopLossPrice;
      strategy.status = 'position_1_open';
      strategy.lastExecutionTime = Date.now();

      // Update database
      await this.updateDatabaseStatus(strategy);

      console.log(`[FundingStrategy] ${strategy.id} - FIRST position TP/SL set:`, {
        entryPrice: currentPrice,
        takeProfit: takeProfitPrice,
        stopLoss: stopLossPrice,
      });

      this.emit(BybitFundingStrategyService.POSITION_OPENED, {
        strategyId: strategy.id,
        position: order,
        positionNumber: 1,
        side,
        tpPrice: takeProfitPrice,
        slPrice: stopLossPrice,
        entryPrice: currentPrice,
      });
    } catch (error: any) {
      console.error(`[FundingStrategy] ${strategy.id} - Error opening FIRST position:`, error.message);
      strategy.status = 'error';
      strategy.errorMessage = error.message;

      // Update database
      await this.updateDatabaseStatus(strategy);

      this.emit(BybitFundingStrategyService.ERROR, {
        strategyId: strategy.id,
        error: error.message,
        action: 'open_first_position',
      });
    }
  }

  /**
   * Open second position (opposite side after funding time)
   * Opens 100ms after funding time to avoid paying funding on this position
   */
  private async openSecondPosition(strategy: ActiveStrategy): Promise<void> {
    if (strategy.hasSecondPosition) {
      console.log(`[FundingStrategy] ${strategy.id} - Second position already exists, skipping`);
      return;
    }

    const { symbol, margin, leverage } = strategy.config;
    const side = strategy.secondPositionSide; // Opposite side
    const currentPrice = strategy.currentPrice;

    console.log(`[FundingStrategy] ${strategy.id} - Opening SECOND ${side} position (opposite side after funding):`, {
      symbol,
      price: currentPrice,
      margin,
      leverage,
    });

    this.emit(BybitFundingStrategyService.POSITION_OPENING, {
      strategyId: strategy.id,
      symbol,
      side,
      price: currentPrice,
      margin,
      leverage,
      positionNumber: 2,
    });

    try {
      // Calculate position size based on margin and leverage
      // Size = (Margin * Leverage) / Price
      const positionValue = margin * leverage;
      const positionSize = positionValue / currentPrice;

      // Calculate TP/SL prices BEFORE opening position (for opposite side)
      const { takeProfitPrice, stopLossPrice } = this.calculateTPSL(strategy, currentPrice, side);

      console.log(`[FundingStrategy] ${strategy.id} - Opening SECOND position with ATOMIC TP/SL protection:`, {
        side,
        size: positionSize,
        entryPrice: currentPrice,
        takeProfit: takeProfitPrice,
        stopLoss: stopLossPrice,
      });

      // Place market order with TP/SL atomically (no gap between open and protection)
      const order = await strategy.connector.placeMarketOrderWithTPSL(
        symbol,
        side,
        positionSize,
        takeProfitPrice,
        stopLossPrice
      );

      console.log(`[FundingStrategy] ${strategy.id} - SECOND position opened with TP/SL protection:`, order);

      // Update strategy state for second position
      strategy.hasSecondPosition = true;
      strategy.secondPositionSize = positionSize;
      strategy.secondPositionEntry = currentPrice;
      strategy.secondPositionTP = takeProfitPrice;
      strategy.secondPositionSL = stopLossPrice;
      strategy.status = 'both_open'; // Both positions are now open

      // Update database
      await this.updateDatabaseStatus(strategy);

      console.log(`[FundingStrategy] ${strategy.id} - SECOND position TP/SL set:`, {
        entryPrice: currentPrice,
        takeProfit: takeProfitPrice,
        stopLoss: stopLossPrice,
      });

      this.emit(BybitFundingStrategyService.POSITION_OPENED, {
        strategyId: strategy.id,
        position: order,
        positionNumber: 2,
        side,
        tpPrice: takeProfitPrice,
        slPrice: stopLossPrice,
        entryPrice: currentPrice,
      });
    } catch (error: any) {
      console.error(`[FundingStrategy] ${strategy.id} - Error opening SECOND position:`, error.message);
      strategy.errorMessage = error.message;

      // Update database
      await this.updateDatabaseStatus(strategy);

      this.emit(BybitFundingStrategyService.ERROR, {
        strategyId: strategy.id,
        error: error.message,
        action: 'open_second_position',
      });
    }
  }

  /**
   * Prepare strategy for the next funding cycle
   * Updates next funding time and resets flags
   */
  private async prepareNextCycle(strategy: ActiveStrategy): Promise<void> {
    console.log(`[FundingStrategy] ${strategy.id} - Preparing for next funding cycle...`);

    try {
      // Fetch updated ticker data to get next funding time
      const tickers = await strategy.bybitService.getTicker('linear', strategy.config.symbol);
      if (tickers && tickers.length > 0) {
        const ticker = tickers[0];
        const nextFundingTime = parseInt(ticker.nextFundingTime || '0');
        const fundingRate = parseFloat(ticker.fundingRate || '0');

        if (nextFundingTime && nextFundingTime > Date.now()) {
          strategy.nextFundingTime = nextFundingTime;
          strategy.fundingRate = fundingRate;
          strategy.fundingTimeReached = false;
          strategy.positionReopenCount = 0; // Reset for new cycle
          strategy.status = 'cycling';

          const secondsUntilNext = Math.floor((nextFundingTime - Date.now()) / 1000);
          console.log(`[FundingStrategy] ${strategy.id} - Next funding time: ${new Date(nextFundingTime).toISOString()} (in ${secondsUntilNext}s)`);
          console.log(`[FundingStrategy] ${strategy.id} - Next funding rate: ${(fundingRate * 100).toFixed(4)}%`);

          // Update database
          await this.updateDatabaseStatus(strategy);
        } else {
          console.warn(`[FundingStrategy] ${strategy.id} - Invalid next funding time received`);
        }
      }
    } catch (error: any) {
      console.error(`[FundingStrategy] ${strategy.id} - Error preparing next cycle:`, error.message);
    }
  }

  /**
   * Calculate TP/SL prices based on percentage of entry price
   *
   * Formula:
   * - takeProfitPercent: Percentage profit target (e.g., 90 = 90% gain)
   * - stopLossPercent: Percentage loss limit (e.g., 20 = 20% loss)
   *
   * For BUY (LONG):
   *   TP Price = Entry * (1 + takeProfitPercent / 100)   // Price goes UP for profit
   *   SL Price = Entry * (1 - stopLossPercent / 100)     // Price goes DOWN for loss
   *
   * For SELL (SHORT):
   *   TP Price = Entry * (1 - takeProfitPercent / 100)   // Price goes DOWN for profit
   *   SL Price = Entry * (1 + stopLossPercent / 100)     // Price goes UP for loss
   */
  private calculateTPSL(strategy: ActiveStrategy, entryPrice: number, side: 'Buy' | 'Sell'): {
    takeProfitPrice: number;
    stopLossPrice: number;
  } {
    const { takeProfitPercent, stopLossPercent } = strategy.config;

    // Calculate TP/SL prices based on percentage of entry price
    let takeProfitPrice: number;
    let stopLossPrice: number;

    if (side === 'Buy') {
      // LONG position: TP above entry (price increases), SL below entry (price decreases)
      takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
      stopLossPrice = entryPrice * (1 - stopLossPercent / 100);
    } else {
      // SHORT position: TP below entry (price decreases), SL above entry (price increases)
      takeProfitPrice = entryPrice * (1 - takeProfitPercent / 100);
      stopLossPrice = entryPrice * (1 + stopLossPercent / 100);
    }

    console.log(`[FundingStrategy] ${strategy.id} - TP/SL calculation:`, {
      side,
      entryPrice: entryPrice.toFixed(4),
      takeProfitPercent: `${takeProfitPercent}%`,
      stopLossPercent: `${stopLossPercent}%`,
      takeProfitPrice: takeProfitPrice.toFixed(4),
      stopLossPrice: stopLossPrice.toFixed(4),
    });

    return {
      takeProfitPrice: parseFloat(takeProfitPrice.toFixed(4)),
      stopLossPrice: parseFloat(stopLossPrice.toFixed(4)),
    };
  }

  /**
   * Handle ticker updates from WebSocket
   */
  private async handleTickerUpdate(strategyId: string, data: any): Promise<void> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    try {
      // Bybit WebSocket ticker format
      if (data.topic && data.topic.includes('tickers') && data.data) {
        const tickerData = data.data;

        // Update current price
        if (tickerData.lastPrice) {
          const newPrice = parseFloat(tickerData.lastPrice);
          strategy.currentPrice = newPrice;

          // IMPORTANT: Check if TP/SL should be triggered for FIRST position
          // This is a failsafe in case Bybit doesn't trigger TP/SL or WebSocket position updates are missed
          if (strategy.hasFirstPosition && strategy.firstPositionEntry > 0) {
            await this.checkTPSLTrigger(strategy, newPrice, 1);
          }

          // IMPORTANT: Check if TP/SL should be triggered for SECOND position
          if (strategy.hasSecondPosition && strategy.secondPositionEntry > 0) {
            await this.checkTPSLTrigger(strategy, newPrice, 2);
          }
        }

        // Update funding info if available
        if (tickerData.fundingRate) {
          strategy.fundingRate = parseFloat(tickerData.fundingRate);
        }
        if (tickerData.nextFundingTime) {
          strategy.nextFundingTime = parseInt(tickerData.nextFundingTime);
        }
      }
    } catch (error: any) {
      console.error(`[FundingStrategy] Error handling ticker update:`, error.message);
    }
  }

  /**
   * Check if TP/SL should be triggered based on current price
   * This is a failsafe mechanism in case Bybit doesn't trigger TP/SL automatically
   *
   * Optimizations:
   * - Throttled to max 1 check per second
   * - Cooldown period after position opens (3 seconds)
   * - Race condition prevention during closure
   * - Early exit for invalid states
   *
   * @param strategy - Active strategy instance
   * @param currentPrice - Current market price
   * @param positionNumber - 1 for first position, 2 for second position
   */
  private async checkTPSLTrigger(strategy: ActiveStrategy, currentPrice: number, positionNumber: 1 | 2): Promise<void> {
    const now = Date.now();

    // OPTIMIZATION 1: Prevent race condition - don't check if already closing
    if (strategy.isClosingPosition) {
      return;
    }

    // OPTIMIZATION 2: Throttling - check max once per second
    const timeSinceLastCheck = now - strategy.lastTPSLCheckTime;
    if (timeSinceLastCheck < 1000) {
      return; // Skip if checked less than 1 second ago
    }

    // OPTIMIZATION 3: Cooldown after position opens - give position 3 seconds to stabilize
    if (strategy.lastExecutionTime) {
      const timeSinceOpen = now - strategy.lastExecutionTime;
      if (timeSinceOpen < 3000) {
        return; // Skip if position opened less than 3 seconds ago
      }
    }

    // Get position-specific fields
    const isFirstPosition = positionNumber === 1;
    const hasPosition = isFirstPosition ? strategy.hasFirstPosition : strategy.hasSecondPosition;
    const side = isFirstPosition ? strategy.firstPositionSide : strategy.secondPositionSide;
    const entryPrice = isFirstPosition ? strategy.firstPositionEntry : strategy.secondPositionEntry;
    const takeProfitPrice = isFirstPosition ? strategy.firstPositionTP : strategy.secondPositionTP;
    const stopLossPrice = isFirstPosition ? strategy.firstPositionSL : strategy.secondPositionSL;

    // OPTIMIZATION 4: Early exit if position doesn't exist or TP/SL not set
    if (!hasPosition || !takeProfitPrice || !stopLossPrice || !entryPrice) {
      return;
    }

    // Update last check time
    strategy.lastTPSLCheckTime = now;

    let shouldClose = false;
    let reason = '';

    if (side === 'Buy') {
      // LONG position: TP above entry, SL below entry
      if (currentPrice >= takeProfitPrice) {
        shouldClose = true;
        reason = 'Take Profit reached';
      } else if (currentPrice <= stopLossPrice) {
        shouldClose = true;
        reason = 'Stop Loss reached';
      }
    } else {
      // SHORT position: TP below entry, SL above entry
      if (currentPrice <= takeProfitPrice) {
        shouldClose = true;
        reason = 'Take Profit reached';
      } else if (currentPrice >= stopLossPrice) {
        shouldClose = true;
        reason = 'Stop Loss reached';
      }
    }

    if (shouldClose) {
      // Set flag to prevent concurrent closure attempts
      strategy.isClosingPosition = true;

      console.warn(`[FundingStrategy] ${strategy.id} - Position ${positionNumber} ${reason} (Failsafe trigger):`, {
        positionNumber,
        side,
        entryPrice: entryPrice.toFixed(4),
        currentPrice: currentPrice.toFixed(4),
        takeProfitPrice: takeProfitPrice.toFixed(4),
        stopLossPrice: stopLossPrice.toFixed(4),
      });

      try {
        // Close position immediately (use side-specific close)
        await strategy.connector.closePosition(strategy.config.symbol, side);

        console.log(`[FundingStrategy] ${strategy.id} - Position ${positionNumber} closed by failsafe (${reason})`);

        // Mark position as closed based on position number
        if (isFirstPosition) {
          strategy.hasFirstPosition = false;
          strategy.firstPositionSize = 0;
        } else {
          strategy.hasSecondPosition = false;
          strategy.secondPositionSize = 0;
        }

        // Update database
        await this.updateDatabaseStatus(strategy);

        // Emit event
        this.emit(BybitFundingStrategyService.POSITION_CLOSED, {
          strategyId: strategy.id,
          positionNumber,
          side,
          reason: reason.toLowerCase().replace(' ', '_'),
          price: currentPrice,
          trigger: 'failsafe',
        });

        // IMPORTANT: Only reopen FIRST position if closed before funding time
        // SECOND position should NOT be reopened if closed by TP/SL
        if (isFirstPosition) {
          const secondsRemaining = Math.floor((strategy.nextFundingTime - now) / 1000);

          if (secondsRemaining > 0 && !strategy.fundingTimeReached) {
            console.log(`[FundingStrategy] ${strategy.id} - First position closed before funding time (${secondsRemaining}s remaining). Will reopen...`);

            this.emit(BybitFundingStrategyService.POSITION_REOPENING, {
              strategyId: strategy.id,
              attempt: strategy.positionReopenCount + 1,
              secondsRemaining,
              reason,
            });

            // Reopen FIRST position after a short delay
            setTimeout(async () => {
              strategy.isClosingPosition = false; // Reset flag before reopening
              await this.openPosition(strategy);
            }, 2000); // 2 second delay to ensure order is fully closed
          } else {
            console.log(`[FundingStrategy] ${strategy.id} - First position closed at/after funding time. Not reopening.`);
            strategy.isClosingPosition = false; // Reset flag
          }
        } else {
          console.log(`[FundingStrategy] ${strategy.id} - Second position closed by TP/SL. Not reopening.`);
          strategy.isClosingPosition = false; // Reset flag
        }
      } catch (error: any) {
        console.error(`[FundingStrategy] ${strategy.id} - Error in failsafe TP/SL trigger for position ${positionNumber}:`, error.message);
        strategy.isClosingPosition = false; // Reset flag on error
        this.emit(BybitFundingStrategyService.ERROR, {
          strategyId: strategy.id,
          positionNumber,
          error: error.message,
          action: 'failsafe_tpsl_trigger',
        });
      }
    }
  }

  /**
   * Handle position updates from WebSocket
   * Detects when position is closed by TP/SL and reopens if needed
   * Now supports dual position tracking (first position + second position)
   */
  private async handlePositionUpdate(strategyId: string, data: any): Promise<void> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // Skip if neither position exists
    if (!strategy.hasFirstPosition && !strategy.hasSecondPosition) return;

    try {
      // Bybit WebSocket position format
      if (data.topic && data.topic === 'position' && data.data) {
        const positions = Array.isArray(data.data) ? data.data : [data.data];

        for (const position of positions) {
          // Check if this is our symbol
          if (position.symbol !== strategy.config.symbol) continue;

          const positionSide = position.side; // 'Buy' or 'Sell'
          const size = parseFloat(position.size || '0');

          // Determine which position this is (first or second) by matching side
          const isFirstPosition = positionSide === strategy.firstPositionSide;
          const isSecondPosition = positionSide === strategy.secondPositionSide;

          // Position was closed (size = 0)
          if (size === 0) {
            // Handle FIRST position closure
            if (isFirstPosition && strategy.hasFirstPosition) {
              console.log(`[FundingStrategy] ${strategy.id} - FIRST position closed detected:`, {
                symbol: position.symbol,
                side: positionSide,
                previousSize: strategy.firstPositionSize,
              });

              strategy.hasFirstPosition = false;
              strategy.firstPositionSize = 0;

              // Update database
              await this.updateDatabaseStatus(strategy);

              this.emit(BybitFundingStrategyService.POSITION_CLOSED, {
                strategyId: strategy.id,
                positionNumber: 1,
                side: positionSide,
                reason: 'tp_or_sl',
              });

              // Check if we need to reopen FIRST position (if not at funding time yet)
              const now = Date.now();
              const secondsRemaining = Math.floor((strategy.nextFundingTime - now) / 1000);

              if (secondsRemaining > 0 && !strategy.fundingTimeReached) {
                console.log(`[FundingStrategy] ${strategy.id} - FIRST position closed before funding time (${secondsRemaining}s remaining). Reopening...`);

                this.emit(BybitFundingStrategyService.POSITION_REOPENING, {
                  strategyId: strategy.id,
                  positionNumber: 1,
                  attempt: strategy.positionReopenCount + 1,
                  secondsRemaining,
                });

                // Reopen FIRST position
                await this.openPosition(strategy);
              } else {
                console.log(`[FundingStrategy] ${strategy.id} - FIRST position closed at/after funding time. Not reopening.`);
              }
            }

            // Handle SECOND position closure
            if (isSecondPosition && strategy.hasSecondPosition) {
              console.log(`[FundingStrategy] ${strategy.id} - SECOND position closed detected:`, {
                symbol: position.symbol,
                side: positionSide,
                previousSize: strategy.secondPositionSize,
              });

              strategy.hasSecondPosition = false;
              strategy.secondPositionSize = 0;

              // Update database
              await this.updateDatabaseStatus(strategy);

              this.emit(BybitFundingStrategyService.POSITION_CLOSED, {
                strategyId: strategy.id,
                positionNumber: 2,
                side: positionSide,
                reason: 'tp_or_sl',
              });

              console.log(`[FundingStrategy] ${strategy.id} - SECOND position closed by TP/SL. Not reopening (by design).`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error(`[FundingStrategy] Error handling position update:`, error.message);
      this.emit(BybitFundingStrategyService.ERROR, {
        strategyId: strategy.id,
        error: error.message,
        action: 'handle_position_update',
      });
    }
  }

  /**
   * Complete funding cycle
   */
  private async completeCycle(strategy: ActiveStrategy): Promise<void> {
    console.log(`[FundingStrategy] ${strategy.id} - Completing cycle`);

    // Stop countdown timer
    if (strategy.countdownTimer) {
      clearInterval(strategy.countdownTimer);
      strategy.countdownTimer = undefined;
    }

    strategy.status = 'completed';

    // Calculate expected funding
    const expectedFunding = strategy.config.margin * strategy.config.leverage * Math.abs(strategy.fundingRate);

    // Update database with final status
    if (strategy.dbId) {
      try {
        await prisma.fundingArbitrageSubscription.update({
          where: { id: strategy.dbId },
          data: {
            status: 'COMPLETED',
            fundingEarned: expectedFunding,
            closedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error: any) {
        console.error(`[FundingStrategy] Error updating database on completion:`, error.message);
      }
    }

    // Emit funding collected event
    this.emit(BybitFundingStrategyService.FUNDING_COLLECTED, {
      strategyId: strategy.id,
      amount: expectedFunding,
      fundingRate: strategy.fundingRate,
      positionReopenCount: strategy.positionReopenCount,
    });

    console.log(`[FundingStrategy] ${strategy.id} - Cycle completed. Funding collected: ${expectedFunding.toFixed(2)} USDT`);
  }

  /**
   * Stop a strategy and close all open positions
   */
  async stopStrategy(strategyId: string): Promise<void> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    console.log(`[FundingStrategy] Stopping strategy ${strategyId}`);

    // Stop countdown timer
    if (strategy.countdownTimer) {
      clearInterval(strategy.countdownTimer);
    }

    // Stop second position timer if exists
    if (strategy.secondPositionTimer) {
      clearTimeout(strategy.secondPositionTimer);
    }

    // Unsubscribe from WebSocket
    strategy.bybitService.unsubscribeAll();

    // Close FIRST position if exists
    if (strategy.hasFirstPosition) {
      try {
        // Close position by symbol (Bybit will close based on current position mode)
        await strategy.connector.closePosition(strategy.config.symbol);
        console.log(`[FundingStrategy] ${strategyId} - FIRST position (${strategy.firstPositionSide}) closed`);
        strategy.hasFirstPosition = false;
        strategy.firstPositionSize = 0;
      } catch (error: any) {
        console.error(`[FundingStrategy] Error closing FIRST position:`, error.message);
      }
    }

    // Close SECOND position if exists
    if (strategy.hasSecondPosition) {
      try {
        // Close position by symbol (Bybit will close based on current position mode)
        await strategy.connector.closePosition(strategy.config.symbol);
        console.log(`[FundingStrategy] ${strategyId} - SECOND position (${strategy.secondPositionSide}) closed`);
        strategy.hasSecondPosition = false;
        strategy.secondPositionSize = 0;
      } catch (error: any) {
        console.error(`[FundingStrategy] Error closing SECOND position:`, error.message);
      }
    }

    // Update database status to CANCELLED
    if (strategy.dbId) {
      try {
        await prisma.fundingArbitrageSubscription.update({
          where: { id: strategy.dbId },
          data: {
            status: 'CANCELLED',
            closedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } catch (error: any) {
        console.error(`[FundingStrategy] Error updating database on stop:`, error.message);
      }
    }

    // Remove from strategies map
    this.strategies.delete(strategyId);

    console.log(`[FundingStrategy] Strategy ${strategyId} stopped`);
  }

  /**
   * Get strategy status
   */
  getStrategy(strategyId: string): ActiveStrategy | undefined {
    return this.strategies.get(strategyId);
  }

  /**
   * Get all active strategies
   */
  getAllStrategies(): ActiveStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Stop all strategies
   */
  async stopAll(): Promise<void> {
    const strategyIds = Array.from(this.strategies.keys());

    for (const strategyId of strategyIds) {
      try {
        await this.stopStrategy(strategyId);
      } catch (error: any) {
        console.error(`Error stopping strategy ${strategyId}:`, error.message);
      }
    }
  }

  // ============================================================================
  // PRECISE TIMING STRATEGY
  // ============================================================================

  /**
   * Start Precise Timing Strategy
   *
   * This strategy opens a position at exactly funding time + timingOffset (default 20ms).
   * Key features:
   * - Determines position side automatically based on funding rate (opens side that PAYS funding)
   * - Uses latency compensation to ensure order EXECUTES at target time
   * - Optional WebSocket monitoring for positions
   * - Configurable auto-repeat for continuous operation
   *
   * @param config Precise timing strategy configuration
   * @param apiKey Bybit API key
   * @param apiSecret Bybit API secret
   * @param testnet Whether to use testnet
   * @param credentialId Exchange credential ID
   * @returns Strategy ID
   */
  async startPreciseTimingStrategy(
    config: PreciseTimingStrategyConfig,
    apiKey: string,
    apiSecret: string,
    testnet: boolean = true,
    credentialId?: string
  ): Promise<string> {
    const strategyId = `precise_timing_${++this.strategyCounter}_${Date.now()}`;

    console.log(`[PreciseTimingStrategy] Starting new strategy ${strategyId}:`, {
      symbol: config.symbol,
      leverage: config.leverage,
      margin: config.margin,
      positionSide: config.positionSide,
      timingOffset: config.timingOffset,
      autoRepeat: config.autoRepeat,
    });

    try {
      // Initialize Bybit connector
      const connector = new BybitConnector(apiKey, apiSecret, testnet);
      await connector.initialize();

      // Get Bybit service for WebSocket and time sync
      const bybitService = connector.getBybitService();

      // STEP 1: Start time synchronization (every 5 seconds)
      console.log(`[PreciseTimingStrategy] ${strategyId} - Starting precise time synchronization...`);
      bybitService.startPeriodicSync();

      // Perform initial sync
      await bybitService.syncTime();
      console.log(`[PreciseTimingStrategy] ${strategyId} - Time synchronized, offset: ${bybitService.getTimeOffset()}ms`);

      // Set leverage before starting
      try {
        await connector.setLeverage(config.symbol, config.leverage);
      } catch (error: any) {
        if (error.message && error.message.includes('leverage not modified')) {
          console.log(`[PreciseTimingStrategy] ${strategyId} - Leverage already set for ${config.symbol}`);
        } else {
          throw error;
        }
      }

      // STEP 2: Fetch funding rate and next funding time
      const tickers = await bybitService.getTicker('linear', config.symbol);
      if (!tickers || tickers.length === 0) {
        throw new Error(`No ticker data found for ${config.symbol}`);
      }

      const ticker = tickers[0];
      const fundingRate = parseFloat(ticker.fundingRate || '0');
      const nextFundingTime = parseInt(ticker.nextFundingTime || '0');
      const currentPrice = parseFloat(ticker.lastPrice || '0');

      if (!fundingRate || !nextFundingTime || !currentPrice) {
        throw new Error(`Invalid ticker data for ${config.symbol}`);
      }

      console.log(`[PreciseTimingStrategy] ${strategyId} - Funding info:`, {
        fundingRate: (fundingRate * 100).toFixed(4) + '%',
        nextFundingTime: new Date(nextFundingTime).toISOString(),
        currentPrice,
      });

      // STEP 3: Determine position side based on funding rate
      const side = this.determinePreciseTimingSide(config.positionSide, fundingRate);
      console.log(`[PreciseTimingStrategy] ${strategyId} - Determined position side: ${side} (funding rate: ${(fundingRate * 100).toFixed(4)}%)`);

      // Save to database
      const dbRecord = await prisma.fundingArbitrageSubscription.create({
        data: {
          userId: config.userId,
          symbol: config.symbol,
          fundingRate,
          nextFundingTime: new Date(nextFundingTime),
          positionType: side.toLowerCase(), // "buy" -> "long", "sell" -> "short"
          side,
          quantity: 0, // Will be calculated when position opens
          leverage: config.leverage,
          margin: config.margin,
          mode: 'NON_HEDGED', // Bybit Funding Strategy uses single position
          executionDelay: 0, // Not used for precise timing (uses timingOffset instead)
          takeProfitPercent: config.takeProfitPercent,
          stopLossPercent: config.stopLossPercent,
          positionReopenCount: 0,
          strategyId,
          primaryExchange: testnet ? 'BYBIT_TESTNET' : 'BYBIT_MAINNET',
          primaryCredentialId: credentialId || 'unknown',
          status: 'ACTIVE',
        },
      });

      console.log(`[PreciseTimingStrategy] Strategy saved to DB with ID: ${dbRecord.id}`);

      // STEP 4: Calculate target execution time with latency compensation
      // Target time = funding time + timingOffset
      // But we need to send the order EARLIER by the estimated latency
      const targetExecutionTime = nextFundingTime + config.timingOffset;
      const estimatedLatency = await this.estimateLatency(bybitService);
      const orderSendTime = targetExecutionTime - estimatedLatency;

      console.log(`[PreciseTimingStrategy] ${strategyId} - Timing calculation:`, {
        fundingTime: new Date(nextFundingTime).toISOString(),
        targetExecutionTime: new Date(targetExecutionTime).toISOString(),
        estimatedLatency: `${estimatedLatency}ms`,
        orderSendTime: new Date(orderSendTime).toISOString(),
      });

      // STEP 5: Create ActiveStrategy instance (simplified for single position)
      const strategy: ActiveStrategy = {
        id: strategyId,
        dbId: dbRecord.id,
        config: {
          userId: config.userId,
          symbol: config.symbol,
          leverage: config.leverage,
          margin: config.margin,
          side, // Determined side
          executionDelay: 0, // Not used for precise timing
          takeProfitPercent: config.takeProfitPercent,
          stopLossPercent: config.stopLossPercent,
        },
        connector,
        bybitService,
        fundingRate,
        nextFundingTime,
        currentPrice,

        // Single position tracking (using second position fields since this opens AFTER funding)
        hasFirstPosition: false,
        firstPositionSide: side,
        firstPositionSize: 0,
        firstPositionEntry: 0,
        firstPositionTP: 0,
        firstPositionSL: 0,

        hasSecondPosition: false,
        secondPositionSide: side,
        secondPositionSize: 0,
        secondPositionEntry: 0,
        secondPositionTP: 0,
        secondPositionSL: 0,

        positionReopenCount: 0,
        fundingTimeReached: false,
        status: 'initializing',
        lastTPSLCheckTime: 0,
        isClosingPosition: false,
        apiKey,
        apiSecret,
        testnet,
        credentialId: credentialId || 'unknown',
      };

      this.strategies.set(strategyId, strategy);

      // STEP 6: Schedule order execution at precise time
      await this.schedulePreciseOrderExecution(
        strategy,
        orderSendTime,
        targetExecutionTime,
        config
      );

      console.log(`[PreciseTimingStrategy] ${strategyId} - Strategy started successfully`);
      return strategyId;
    } catch (error: any) {
      console.error(`[PreciseTimingStrategy] Error starting strategy:`, error.message);
      this.emit(BybitFundingStrategyService.ERROR, {
        strategyId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Determine position side for precise timing strategy
   *
   * Logic:
   * - If positionSide is 'Auto': Open the side that PAYS funding
   *   - Positive funding rate: Longs pay shorts → Open LONG (Buy)
   *   - Negative funding rate: Shorts pay longs → Open SHORT (Sell)
   * - Otherwise: Use specified side
   *
   * @param configuredSide Configured position side ('Auto', 'Buy', 'Sell')
   * @param fundingRate Current funding rate
   * @returns Position side ('Buy' or 'Sell')
   */
  private determinePreciseTimingSide(
    configuredSide: 'Auto' | 'Buy' | 'Sell',
    fundingRate: number
  ): 'Buy' | 'Sell' {
    if (configuredSide !== 'Auto') {
      console.log(`[PreciseTimingStrategy] Using configured side: ${configuredSide}`);
      return configuredSide;
    }

    // Positive funding rate = Longs pay shorts → Open LONG to pay funding and collect hedge profit
    // Negative funding rate = Shorts pay longs → Open SHORT to pay funding and collect hedge profit
    const side = fundingRate >= 0 ? 'Buy' : 'Sell';

    console.log(`[PreciseTimingStrategy] Auto-determined side: ${side} (funding rate: ${(fundingRate * 100).toFixed(4)}%)`);
    return side;
  }

  /**
   * Estimate latency to Bybit API
   *
   * Performs a quick request to estimate round-trip time
   * Returns half of the round-trip time as estimated latency
   *
   * @param bybitService Bybit service instance
   * @returns Estimated latency in milliseconds
   */
  private async estimateLatency(bybitService: BybitService): Promise<number> {
    try {
      const startTime = Date.now();
      await bybitService.getServerTime();
      const endTime = Date.now();

      const roundTripTime = endTime - startTime;
      const latency = Math.ceil(roundTripTime / 2);

      console.log(`[PreciseTimingStrategy] Estimated latency: ${latency}ms (RTT: ${roundTripTime}ms)`);
      return latency;
    } catch (error: any) {
      console.warn(`[PreciseTimingStrategy] Error estimating latency, using default 50ms:`, error.message);
      return 50; // Default to 50ms if estimation fails
    }
  }

  /**
   * Schedule precise order execution
   *
   * Sets up a timer to execute the order at exactly the calculated send time,
   * compensating for network latency so the order EXECUTES at the target time.
   *
   * @param strategy Active strategy instance
   * @param orderSendTime When to send the order (compensated for latency)
   * @param targetExecutionTime Target execution time (funding time + offset)
   * @param config Precise timing strategy configuration
   */
  private async schedulePreciseOrderExecution(
    strategy: ActiveStrategy,
    orderSendTime: number,
    targetExecutionTime: number,
    config: PreciseTimingStrategyConfig
  ): Promise<void> {
    const now = Date.now();
    const msUntilExecution = orderSendTime - now;

    if (msUntilExecution < 0) {
      throw new Error(
        `Order send time has already passed! ` +
        `orderSendTime: ${new Date(orderSendTime).toISOString()}, ` +
        `now: ${new Date(now).toISOString()}`
      );
    }

    console.log(`[PreciseTimingStrategy] ${strategy.id} - Scheduling order execution:`, {
      msUntilExecution: `${msUntilExecution}ms`,
      orderSendTime: new Date(orderSendTime).toISOString(),
      targetExecutionTime: new Date(targetExecutionTime).toISOString(),
    });

    strategy.status = 'monitoring';

    // Optional: Enable WebSocket monitoring
    if (config.enableWebSocketMonitoring !== false) {
      console.log(`[PreciseTimingStrategy] ${strategy.id} - Enabling WebSocket monitoring`);

      // Subscribe to ticker updates
      strategy.bybitService.subscribeToTicker(strategy.config.symbol, (data: any) => {
        this.handleTickerUpdate(strategy.id, data);
      });

      // Subscribe to position updates
      strategy.bybitService.subscribeToPositions((data: any) => {
        this.handlePositionUpdate(strategy.id, data);
      });
    }

    // Set timeout to execute order at precise time
    setTimeout(async () => {
      try {
        console.log(`[PreciseTimingStrategy] ${strategy.id} - EXECUTING ORDER NOW at ${new Date().toISOString()}`);
        await this.executePreciseTimingOrder(strategy, config);

        // If auto-repeat is enabled, schedule next cycle
        if (config.autoRepeat) {
          console.log(`[PreciseTimingStrategy] ${strategy.id} - Auto-repeat enabled, scheduling next cycle...`);
          await this.scheduleNextPreciseTimingCycle(strategy, config);
        }
      } catch (error: any) {
        console.error(`[PreciseTimingStrategy] ${strategy.id} - Error executing order:`, error.message);
        strategy.status = 'error';
        strategy.errorMessage = error.message;

        this.emit(BybitFundingStrategyService.ERROR, {
          strategyId: strategy.id,
          error: error.message,
          action: 'execute_precise_order',
        });
      }
    }, msUntilExecution);

    console.log(`[PreciseTimingStrategy] ${strategy.id} - Order execution scheduled in ${msUntilExecution}ms`);
  }

  /**
   * Execute precise timing order
   *
   * Opens position with TP/SL at the precise calculated time
   *
   * @param strategy Active strategy instance
   * @param config Precise timing strategy configuration
   */
  private async executePreciseTimingOrder(
    strategy: ActiveStrategy,
    config: PreciseTimingStrategyConfig
  ): Promise<void> {
    strategy.status = 'executing';

    const { symbol, margin, leverage, side } = strategy.config;
    const currentPrice = strategy.currentPrice;

    console.log(`[PreciseTimingStrategy] ${strategy.id} - Opening ${side} position:`, {
      symbol,
      price: currentPrice,
      margin,
      leverage,
    });

    this.emit(BybitFundingStrategyService.POSITION_OPENING, {
      strategyId: strategy.id,
      symbol,
      side,
      price: currentPrice,
      margin,
      leverage,
      positionNumber: 2, // Using second position (after funding time)
    });

    try {
      // Calculate position size
      const positionValue = margin * leverage;
      const positionSize = positionValue / currentPrice;

      // Calculate TP/SL prices
      const { takeProfitPrice, stopLossPrice } = this.calculateTPSL(strategy, currentPrice, side);

      console.log(`[PreciseTimingStrategy] ${strategy.id} - Opening position with TP/SL:`, {
        side,
        size: positionSize,
        entryPrice: currentPrice,
        takeProfit: takeProfitPrice,
        stopLoss: stopLossPrice,
      });

      // Place market order with TP/SL
      const order = await strategy.connector.placeMarketOrderWithTPSL(
        symbol,
        side,
        positionSize,
        takeProfitPrice,
        stopLossPrice
      );

      console.log(`[PreciseTimingStrategy] ${strategy.id} - Position opened:`, order);

      // Update strategy state (using second position tracking)
      strategy.hasSecondPosition = true;
      strategy.secondPositionSize = positionSize;
      strategy.secondPositionEntry = currentPrice;
      strategy.secondPositionTP = takeProfitPrice;
      strategy.secondPositionSL = stopLossPrice;
      strategy.status = 'position_1_open';
      strategy.lastExecutionTime = Date.now();

      this.emit(BybitFundingStrategyService.POSITION_OPENED, {
        strategyId: strategy.id,
        position: order,
        positionNumber: 2,
        side,
        tpPrice: takeProfitPrice,
        slPrice: stopLossPrice,
        entryPrice: currentPrice,
      });
    } catch (error: any) {
      console.error(`[PreciseTimingStrategy] ${strategy.id} - Error opening position:`, error.message);
      throw error;
    }
  }

  /**
   * Schedule next precise timing cycle (if auto-repeat is enabled)
   *
   * Fetches next funding time and schedules execution for next cycle
   *
   * @param strategy Active strategy instance
   * @param config Precise timing strategy configuration
   */
  private async scheduleNextPreciseTimingCycle(
    strategy: ActiveStrategy,
    config: PreciseTimingStrategyConfig
  ): Promise<void> {
    try {
      console.log(`[PreciseTimingStrategy] ${strategy.id} - Fetching next funding time...`);

      // Wait a bit before fetching (to ensure funding time has updated)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch updated ticker data
      const tickers = await strategy.bybitService.getTicker('linear', strategy.config.symbol);
      if (!tickers || tickers.length === 0) {
        throw new Error(`No ticker data found for ${strategy.config.symbol}`);
      }

      const ticker = tickers[0];
      const fundingRate = parseFloat(ticker.fundingRate || '0');
      const nextFundingTime = parseInt(ticker.nextFundingTime || '0');

      if (!nextFundingTime || nextFundingTime <= Date.now()) {
        throw new Error(`Invalid next funding time: ${nextFundingTime}`);
      }

      // Update strategy
      strategy.fundingRate = fundingRate;
      strategy.nextFundingTime = nextFundingTime;

      // Re-determine side based on new funding rate
      const side = this.determinePreciseTimingSide(config.positionSide, fundingRate);
      strategy.secondPositionSide = side;

      console.log(`[PreciseTimingStrategy] ${strategy.id} - Next cycle scheduled:`, {
        nextFundingTime: new Date(nextFundingTime).toISOString(),
        fundingRate: (fundingRate * 100).toFixed(4) + '%',
        side,
      });

      // Calculate new target execution time
      const targetExecutionTime = nextFundingTime + config.timingOffset;
      const estimatedLatency = await this.estimateLatency(strategy.bybitService);
      const orderSendTime = targetExecutionTime - estimatedLatency;

      // Schedule execution
      await this.schedulePreciseOrderExecution(
        strategy,
        orderSendTime,
        targetExecutionTime,
        config
      );
    } catch (error: any) {
      console.error(`[PreciseTimingStrategy] ${strategy.id} - Error scheduling next cycle:`, error.message);
      strategy.status = 'error';
      strategy.errorMessage = error.message;

      this.emit(BybitFundingStrategyService.ERROR, {
        strategyId: strategy.id,
        error: error.message,
        action: 'schedule_next_cycle',
      });
    }
  }
}

// Export singleton instance
export const bybitFundingStrategyService = new BybitFundingStrategyService();
