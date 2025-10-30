/**
 * Triangular Arbitrage Opportunity Detection Service
 *
 * Detects profitable triangular arbitrage opportunities in real-time
 * using WebSocket price feeds.
 */

import { EventEmitter } from 'events';
import { MarketDataManager, SupportedExchange } from './market-data-manager.service';
import { TriangularArbitrageCalculator, ArbitrageResult } from '@/lib/triangular-arbitrage-calculator';
import { TriangleDiscovery, Triangle } from '@/lib/triangle-discovery';
import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';
import prisma from '@/lib/prisma';

export interface ScannerConfig {
  userId: string;
  exchange: string;
  credentialId: string;
  minProfitPercent: number;
  maxSlippagePercent: number;
  positionSize: number;
  autoExecute: boolean;
  makerFeeRate: number;
  takerFeeRate: number;
  connector?: BaseExchangeConnector; // Optional: exchange connector for reuse
}

export interface DetectedOpportunity {
  triangle: Triangle;
  result: ArbitrageResult;
  timestamp: number;
}

// Global singleton storage to persist across Next.js hot reloads and API routes
// Using globalThis directly ensures all API routes access the same instance
declare global {
  var __triangularArbScanners: Map<string, Map<string, OpportunityDetectionService>> | undefined;
}

// Initialize global storage
if (!globalThis.__triangularArbScanners) {
  // console.log('[OpportunityDetection] Initializing global scanner storage on globalThis');
  globalThis.__triangularArbScanners = new Map();
}

/**
 * Opportunity Detection Service
 * Scans for triangular arbitrage opportunities in real-time
 * Supports multiple exchanges per user simultaneously
 */
export class OpportunityDetectionService extends EventEmitter {
  // Direct reference to global storage - ensures all API routes use the same Map
  private static get instances(): Map<string, Map<string, OpportunityDetectionService>> {
    if (!globalThis.__triangularArbScanners) {
      // console.log('[OpportunityDetection] Re-initializing global scanner storage');
      globalThis.__triangularArbScanners = new Map();
    }
    return globalThis.__triangularArbScanners;
  }

  private config: ScannerConfig;
  private triangles: Triangle[] = [];
  private isScanning = false;
  private pendingCalculations = new Set<string>();
  private calculationTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_INTERVAL_MS = 500; // Calculate every 500ms (reduced from 100ms to prevent CPU overload)
  private readonly MAX_CALCULATIONS_PER_BATCH = 50; // Limit calculations per batch to prevent event loop blocking
  private readonly TRIANGLE_COOLDOWN_MS = 2000; // Don't recalculate same triangle within 2 seconds
  private lastCalculationTime = new Map<string, number>(); // Track last calculation time for each triangle
  private startTime: number = 0;
  private stats = {
    opportunitiesDetectedToday: 0,
    totalProfitToday: 0,
  };
  // Exchange-specific market data manager
  private marketDataManager: MarketDataManager;
  // Exchange connector (optional, for reuse in execution)
  private connector?: BaseExchangeConnector;

  private constructor(config: ScannerConfig) {
    super();
    this.config = config;
    this.connector = config.connector;

    // Initialize exchange-specific market data manager
    const exchangeNormalized = config.exchange.toUpperCase() as SupportedExchange;
    this.marketDataManager = MarketDataManager.getInstance(exchangeNormalized);

    console.log(`[OpportunityDetection] Created scanner for exchange: ${exchangeNormalized}`, {
      hasConnector: !!this.connector,
    });
  }

  /**
   * Check if scanner instance exists for user and exchange
   */
  static hasInstance(userId: string, exchange?: string): boolean {
    const userInstances = OpportunityDetectionService.instances.get(userId);
    if (!userInstances) return false;
    if (!exchange) return userInstances.size > 0; // Any exchange
    return userInstances.has(exchange);
  }

  /**
   * Get existing scanner instance for user and exchange (returns null if doesn't exist)
   */
  static getInstanceOrNull(userId: string, exchange: string): OpportunityDetectionService | null {
    const userInstances = OpportunityDetectionService.instances.get(userId);
    if (!userInstances) return null;
    return userInstances.get(exchange) || null;
  }

  /**
   * Get all scanner instances for a user (all exchanges)
   */
  static getAllInstancesForUser(userId: string): OpportunityDetectionService[] {
    const userInstances = OpportunityDetectionService.instances.get(userId);

    console.log(`[OpportunityDetection] getAllInstancesForUser called:`, {
      userId,
      hasUserMap: !!userInstances,
      scannerCount: userInstances ? userInstances.size : 0,
      exchanges: userInstances ? Array.from(userInstances.keys()) : [],
      totalUsers: OpportunityDetectionService.instances.size,
      allUserIds: Array.from(OpportunityDetectionService.instances.keys()),
    });

    if (!userInstances) return [];
    return Array.from(userInstances.values());
  }

  /**
   * Get or create scanner instance for user and exchange
   */
  static getInstance(userId: string, exchange: string, config?: ScannerConfig): OpportunityDetectionService {
    console.log(`[OpportunityDetection] getInstance called:`, {
      userId,
      exchange,
      hasConfig: !!config,
      totalUsers: OpportunityDetectionService.instances.size,
    });

    // Ensure user has an instances map
    if (!OpportunityDetectionService.instances.has(userId)) {
      console.log(`[OpportunityDetection] Creating new instances map for user: ${userId}`);
      OpportunityDetectionService.instances.set(userId, new Map());
    }

    const userInstances = OpportunityDetectionService.instances.get(userId)!;

    // Check if instance exists for this exchange
    const existingInstance = userInstances.get(exchange);

    if (existingInstance && config) {
      // Config provided - user wants to restart with new config
      console.log(`[OpportunityDetection] Stopping existing scanner to restart with new config:`, {
        userId,
        exchange,
        oldConfig: existingInstance.config,
        newConfig: config,
      });

      // Stop the old scanner
      existingInstance.stop().catch((err) => {
        console.error('[OpportunityDetection] Error stopping old scanner:', err);
      });

      // Remove old instance
      userInstances.delete(exchange);

      // Create new instance with new config
      console.log(`[OpportunityDetection] Creating new scanner instance with new config:`, {
        userId,
        exchange,
      });
      const newInstance = new OpportunityDetectionService(config);
      userInstances.set(exchange, newInstance);
      console.log(`[OpportunityDetection] New scanner instance created and added to map`);

      return newInstance;
    } else if (existingInstance) {
      // No config provided - return existing instance
      console.log(`[OpportunityDetection] Returning existing scanner instance:`, {
        userId,
        exchange,
      });
      return existingInstance;
    } else {
      // No existing instance - create new one
      if (!config) {
        throw new Error('Config required for new scanner instance');
      }
      console.log(`[OpportunityDetection] Creating new scanner instance:`, {
        userId,
        exchange,
        existingExchanges: Array.from(userInstances.keys()),
      });
      const instance = new OpportunityDetectionService(config);
      userInstances.set(exchange, instance);
      console.log(`[OpportunityDetection] Scanner instance created and added to map:`, {
        userId,
        exchange,
        totalScannersForUser: userInstances.size,
        allExchanges: Array.from(userInstances.keys()),
      });
      return instance;
    }
  }

  /**
   * Remove scanner instance for user and exchange
   */
  static removeInstance(userId: string, exchange: string): void {
    const userInstances = OpportunityDetectionService.instances.get(userId);
    if (!userInstances) return;

    userInstances.delete(exchange);

    // Clean up user entry if no more instances
    if (userInstances.size === 0) {
      OpportunityDetectionService.instances.delete(userId);
    }
  }

  /**
   * Filter out low-liquidity symbols based on 24h volume
   * Prevents including illiquid tokens with high slippage
   */
  private async filterLowLiquiditySymbols(symbols: string[], minVolumeUSD: number): Promise<string[]> {
    try {
      // Fetch ticker data for all symbols (includes 24h volume)
      const exchange = ExchangeFactory.createExchange(this.config.exchange, {
        apiKey: this.config.apiKey || '',
        apiSecret: this.config.apiSecret || '',
      });

      // Batch fetch all tickers
      const tickers = await exchange.fetchTickers(symbols.map(s => s.replace(/[-_]/g, '/')));

      const liquidSymbols: string[] = [];
      const filteredOut: string[] = [];

      for (const symbol of symbols) {
        const normalizedSymbol = symbol.replace(/[-_]/g, '/');
        const ticker = tickers[normalizedSymbol];

        if (!ticker || !ticker.quoteVolume) {
          // No volume data - be conservative and exclude
          filteredOut.push(symbol);
          continue;
        }

        const volumeUSD = ticker.quoteVolume; // Volume in quote currency (usually USDT)

        if (volumeUSD >= minVolumeUSD) {
          liquidSymbols.push(symbol);
        } else {
          filteredOut.push(symbol);
        }
      }

      console.log(`[OpportunityDetection] Liquidity filter results:`);
      console.log(`  Liquid symbols: ${liquidSymbols.length}`);
      console.log(`  Filtered out (low volume): ${filteredOut.length}`);
      if (filteredOut.length > 0 && filteredOut.length <= 10) {
        console.log(`  Examples: ${filteredOut.slice(0, 5).join(', ')}`);
      }

      return liquidSymbols;
    } catch (error: any) {
      console.error('[OpportunityDetection] Error filtering low-liquidity symbols:', error.message);
      // On error, return all symbols (fail-safe)
      return symbols;
    }
  }

  /**
   * Start scanning for opportunities
   */
  async start(symbols: string[]): Promise<void> {
    if (this.isScanning) {
      // console.log('[OpportunityDetection] Already scanning');
      return;
    }

    try {
      console.log(`[OpportunityDetection] Starting scanner for ${symbols.length} symbols`);

      // Filter out low-liquidity symbols before triangle discovery
      // This prevents including illiquid tokens that have high slippage
      const MINIMUM_VOLUME_USD = 100000; // Minimum $100k 24h volume
      const filteredSymbols = await this.filterLowLiquiditySymbols(symbols, MINIMUM_VOLUME_USD);
      console.log(`[OpportunityDetection] Filtered to ${filteredSymbols.length} liquid symbols (min volume: $${MINIMUM_VOLUME_USD})`);

      // Discover all valid triangles from symbols
      this.triangles = TriangleDiscovery.discoverTriangles(filteredSymbols);
      console.log(`[OpportunityDetection] Found ${this.triangles.length} valid triangles`);

      // Filter by base asset (USDT only for now)
      // Note: We CANNOT rotate/normalize triangles because symbols have fixed meanings
      // BTCUSDT always means BTC/USDT, we can't rotate it to mean USDT/BTC
      this.triangles = TriangleDiscovery.filterByBaseAsset(this.triangles, 'USDT');
      console.log(`[OpportunityDetection] Filtered to ${this.triangles.length} USDT-based triangles`);

      if (this.triangles.length === 0) {
        throw new Error('No valid triangles found');
      }

      // Initialize market data manager for this exchange
      await this.marketDataManager.initialize();

      // Get unique symbols needed for all triangles
      let uniqueSymbols = TriangleDiscovery.getUniqueSymbols(this.triangles);

      // Binance WebSocket has a limit of 300 streams per connection
      // If we exceed this limit, we need to reduce the number of triangles
      const MAX_SYMBOLS_PER_CONNECTION = 290; // Use 290 to be safe

      if (uniqueSymbols.length > MAX_SYMBOLS_PER_CONNECTION) {
        console.log(`[OpportunityDetection] Too many symbols (${uniqueSymbols.length}), limiting to ${MAX_SYMBOLS_PER_CONNECTION} to avoid WebSocket errors`);

        // Reduce triangles until we're under the symbol limit
        const symbolSet = new Set<string>();
        const filteredTriangles: typeof this.triangles = [];

        for (const triangle of this.triangles) {
          const triangleSymbols = triangle.symbols;
          const newSymbols = triangleSymbols.filter(s => !symbolSet.has(s));

          // If adding this triangle's symbols wouldn't exceed the limit, add it
          if (symbolSet.size + newSymbols.length <= MAX_SYMBOLS_PER_CONNECTION) {
            filteredTriangles.push(triangle);
            triangleSymbols.forEach(s => symbolSet.add(s));
          }
        }

        this.triangles = filteredTriangles;
        uniqueSymbols = Array.from(symbolSet);
        console.log(`[OpportunityDetection] Reduced to ${this.triangles.length} triangles using ${uniqueSymbols.length} unique symbols`);
      }

      console.log(`[OpportunityDetection] Subscribing to ${uniqueSymbols.length} unique symbols on ${this.config.exchange}`);

      // Subscribe to price updates for all symbols on this exchange
      for (const symbol of uniqueSymbols) {
        this.marketDataManager.subscribe(symbol, (price) => {
          this.onPriceUpdate(symbol, price);
        });
      }

      this.isScanning = true;
      this.startTime = Date.now();
      this.emit('started', { trianglesCount: this.triangles.length });

      // console.log('[OpportunityDetection] Scanner started successfully');
    } catch (error) {
      console.error('[OpportunityDetection] Error starting scanner:', error);
      throw error;
    }
  }

  /**
   * Stop scanning
   */
  async stop(): Promise<void> {
    if (!this.isScanning) {
      // console.log('[OpportunityDetection] Not scanning');
      return;
    }

    // console.log('[OpportunityDetection] Stopping scanner');

    // Clear calculation timer
    if (this.calculationTimer) {
      clearTimeout(this.calculationTimer);
      this.calculationTimer = null;
    }

    // Unsubscribe from all symbols
    const uniqueSymbols = TriangleDiscovery.getUniqueSymbols(this.triangles);
    for (const symbol of uniqueSymbols) {
      // Note: We need to keep the callback reference to unsubscribe properly
      // For now, we'll just clear the triangles and let garbage collection handle it
    }

    this.triangles = [];
    this.pendingCalculations.clear();
    this.lastCalculationTime.clear(); // Clear cooldown tracking
    this.isScanning = false;
    this.emit('stopped');

    // console.log('[OpportunityDetection] Scanner stopped');
  }

  /**
   * Price update handler (called by MarketDataManager)
   */
  private onPriceUpdate(symbol: string, price: number): void {
    if (!this.isScanning) return;

    // Find all triangles that include this symbol
    const affectedTriangles = this.triangles.filter((t) =>
      t.symbols.includes(symbol)
    );

    // DEBUG: Log first price update
    if (affectedTriangles.length > 0 && Math.random() < 0.001) {
      console.log(`[OpportunityDetection] Price update: ${symbol} = ${price}, affects ${affectedTriangles.length} triangles`);
    }

    // Mark them for recalculation
    for (const triangle of affectedTriangles) {
      const triangleId = this.getTriangleId(triangle);
      this.pendingCalculations.add(triangleId);
    }

    // Schedule batch calculation (debounced)
    this.scheduleBatchCalculation();
  }

  /**
   * Schedule batch calculation (debounced to avoid excessive CPU usage)
   */
  private scheduleBatchCalculation(): void {
    if (this.calculationTimer) {
      return; // Already scheduled
    }

    this.calculationTimer = setTimeout(() => {
      this.processPendingCalculations();
      this.calculationTimer = null;
    }, this.BATCH_INTERVAL_MS);
  }

  /**
   * Process all pending calculations in one batch
   */
  private async processPendingCalculations(): Promise<void> {
    if (this.pendingCalculations.size === 0) return;

    const now = Date.now();
    let allTriangleIds = Array.from(this.pendingCalculations);

    // Filter out triangles that were calculated recently (within cooldown period)
    const triangleIdsToCalculate = allTriangleIds.filter((triangleId) => {
      const lastCalcTime = this.lastCalculationTime.get(triangleId);
      if (!lastCalcTime) return true; // Never calculated before
      return (now - lastCalcTime) >= this.TRIANGLE_COOLDOWN_MS;
    });

    // Limit the number of calculations per batch to prevent event loop blocking
    const limitedTriangleIds = triangleIdsToCalculate.slice(0, this.MAX_CALCULATIONS_PER_BATCH);

    // Keep uncalculated triangles in pending queue for next batch
    this.pendingCalculations.clear();
    const skippedDueToCooldown = allTriangleIds.filter(id => !triangleIdsToCalculate.includes(id));
    const skippedDueToLimit = triangleIdsToCalculate.slice(this.MAX_CALCULATIONS_PER_BATCH);
    [...skippedDueToCooldown, ...skippedDueToLimit].forEach(id => this.pendingCalculations.add(id));

    if (limitedTriangleIds.length === 0) {
      // All triangles are in cooldown or already processed
      return;
    }

    // DEBUG: Log calculation batch with throttling info
    console.log(`[OpportunityDetection] Processing ${limitedTriangleIds.length}/${allTriangleIds.length} triangles (${skippedDueToCooldown.length} in cooldown, ${skippedDueToLimit.length} deferred)...`);

    // Calculate profits for selected triangles
    const opportunities: DetectedOpportunity[] = [];
    let calculatedCount = 0;
    let profitableCount = 0;

    for (const triangleId of limitedTriangleIds) {
      const triangle = this.triangles.find(
        (t) => this.getTriangleId(t) === triangleId
      );

      if (!triangle) continue;

      const result = await this.calculateProfit(triangle);
      calculatedCount++;

      // Update last calculation time
      this.lastCalculationTime.set(triangleId, now);

      if (result && result.isProfitable) {
        profitableCount++;
        opportunities.push({
          triangle,
          result: result.effectiveProfit,
          timestamp: Date.now(),
        });
      }
    }

    // DEBUG: Log calculation results
    console.log(`[OpportunityDetection] Calculated ${calculatedCount} triangles, found ${profitableCount} profitable (threshold: ${this.config.minProfitPercent}%)`);

    // Process profitable opportunities
    if (opportunities.length > 0) {
      console.log(
        `[OpportunityDetection] Found ${opportunities.length} profitable opportunities`
      );

      for (const opp of opportunities) {
        await this.handleOpportunity(opp);
      }
    }
  }

  /**
   * Calculate profit for a triangle
   */
  private async calculateProfit(
    triangle: Triangle
  ): Promise<{ isProfitable: boolean; effectiveProfit: ArbitrageResult } | null> {
    try {
      // Get current prices from cache (exchange-specific)
      const prices = this.marketDataManager.getPrices(triangle.symbols);

      // Check if all prices are available
      if (prices.size !== 3) {
        return null; // Not all prices available yet
      }

      const price1 = prices.get(triangle.symbols[0])!;
      const price2 = prices.get(triangle.symbols[1])!;
      const price3 = prices.get(triangle.symbols[2])!;

      // Calculate optimal profit (forward or backward)
      const result = TriangularArbitrageCalculator.calculateOptimalProfit(
        this.config.positionSize,
        {
          symbol1: triangle.symbols[0],
          symbol2: triangle.symbols[1],
          symbol3: triangle.symbols[2],
          price1,
          price2,
          price3,
          // TODO: Add bid/ask prices from WebSocket ticker for more accurate calculation
        },
        {
          baseAsset: triangle.assets.base,
          quoteAsset: triangle.assets.quote,
          bridgeAsset: triangle.assets.bridge,
          makerFeeRate: this.config.makerFeeRate,
          takerFeeRate: this.config.takerFeeRate,
          exchange: this.config.exchange,
        }
      );

      if (!result) return null;

      // Calculate REALISTIC profit accounting for ALL execution factors:
      // - Bid/ask spread
      // - Trading fees
      // - Gate.io cost buffer (5%)
      // - Slippage
      // - Precision rounding losses
      const realisticProfitPercent = TriangularArbitrageCalculator.calculateRealisticProfit(
        this.config.positionSize,
        {
          symbol1: triangle.symbols[0],
          symbol2: triangle.symbols[1],
          symbol3: triangle.symbols[2],
          price1,
          price2,
          price3,
        },
        {
          baseAsset: triangle.assets.base,
          quoteAsset: triangle.assets.quote,
          bridgeAsset: triangle.assets.bridge,
          makerFeeRate: this.config.makerFeeRate,
          takerFeeRate: this.config.takerFeeRate,
          exchange: this.config.exchange,
        },
        result.direction
      );

      console.log(`[OpportunityDetection] ${triangle.symbols.join(' → ')}: theoretical=${result.profitPercent.toFixed(2)}%, realistic=${realisticProfitPercent.toFixed(2)}%`);

      // Show all opportunities including unprofitable ones for analysis
      // Set to -10% to see even highly unprofitable triangles
      const MIN_REALISTIC_PROFIT = -10.0; // Show all triangles (even with -10% loss)
      const isProfitable = realisticProfitPercent >= MIN_REALISTIC_PROFIT;

      // Calculate effective profit after slippage (legacy, for comparison)
      const { effectiveProfit } =
        TriangularArbitrageCalculator.calculateEffectiveProfit(
          result,
          this.config.maxSlippagePercent,
          this.config.minProfitPercent
        );

      // Add realistic profit to result
      effectiveProfit.realisticProfitPercent = realisticProfitPercent;
      effectiveProfit.realisticProfitAmount = (realisticProfitPercent / 100) * this.config.positionSize;
      effectiveProfit.realisticFinalAmount = this.config.positionSize + effectiveProfit.realisticProfitAmount;

      return { isProfitable, effectiveProfit };
    } catch (error) {
      // Silently skip invalid triangles (e.g., symbol doesn't connect assets)
      // These are expected when triangle discovery creates invalid combinations
      return null;
    }
  }

  /**
   * Handle detected opportunity
   */
  private async handleOpportunity(opp: DetectedOpportunity): Promise<void> {
    try {
      // Save opportunity to database with SHORT expiry time (1 minute)
      // This prevents database from filling up with old opportunities
      const dbOpp = await prisma.triangularArbitrageOpportunity.create({
        data: {
          exchange: this.config.exchange,
          symbol1: opp.triangle.symbols[0],
          symbol2: opp.triangle.symbols[1],
          symbol3: opp.triangle.symbols[2],
          baseAsset: opp.triangle.assets.base,
          quoteAsset: opp.triangle.assets.quote,
          bridgeAsset: opp.triangle.assets.bridge,
          price1: this.marketDataManager.getPrice(opp.triangle.symbols[0])!,
          price2: this.marketDataManager.getPrice(opp.triangle.symbols[1])!,
          price3: this.marketDataManager.getPrice(opp.triangle.symbols[2])!,
          theoreticalProfit: opp.result.profitPercent,
          profitAfterFees: opp.result.profitPercent,
          wasExecuted: false,
          detectedAt: new Date(opp.timestamp),
          expiresAt: new Date(opp.timestamp + 60000), // Expires in 1 minute
        },
      });

      // Clean up expired opportunities to prevent database bloat
      // Delete opportunities older than 5 minutes
      await prisma.triangularArbitrageOpportunity.deleteMany({
        where: {
          detectedAt: {
            lt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          },
        },
      });

      // Update stats
      this.stats.opportunitiesDetectedToday++;
      if (this.isToday(new Date())) {
        this.stats.totalProfitToday += opp.result.profitAmount;
      }

      // Emit opportunity event for real-time WebSocket updates
      // Transform to match frontend TriangularOpportunity interface
      this.emit('opportunity', {
        id: dbOpp.id,
        exchange: this.config.exchange,

        // Transform triangle structure for frontend
        triangle: {
          assetA: opp.triangle.assets.base,
          assetB: opp.triangle.assets.quote,
          assetC: opp.triangle.assets.bridge,
          direction: opp.result.direction,
        },

        // Transform leg data (simplified - using current prices)
        leg1: {
          symbol: opp.triangle.symbols[0],
          bidPrice: this.marketDataManager.getPrice(opp.triangle.symbols[0]) || 0,
          askPrice: this.marketDataManager.getPrice(opp.triangle.symbols[0]) || 0,
          lastPrice: this.marketDataManager.getPrice(opp.triangle.symbols[0]) || 0,
          timestamp: opp.timestamp,
        },
        leg2: {
          symbol: opp.triangle.symbols[1],
          bidPrice: this.marketDataManager.getPrice(opp.triangle.symbols[1]) || 0,
          askPrice: this.marketDataManager.getPrice(opp.triangle.symbols[1]) || 0,
          lastPrice: this.marketDataManager.getPrice(opp.triangle.symbols[1]) || 0,
          timestamp: opp.timestamp,
        },
        leg3: {
          symbol: opp.triangle.symbols[2],
          bidPrice: this.marketDataManager.getPrice(opp.triangle.symbols[2]) || 0,
          askPrice: this.marketDataManager.getPrice(opp.triangle.symbols[2]) || 0,
          lastPrice: this.marketDataManager.getPrice(opp.triangle.symbols[2]) || 0,
          timestamp: opp.timestamp,
        },

        // Profitability metrics
        profitPercentage: opp.result.profitPercent,
        profitAmount: opp.result.profitAmount,
        estimatedSlippage: this.config.maxSlippagePercent,
        netProfitPercentage: opp.result.profitPercent, // After fees already calculated
        realisticProfitPercentage: opp.result.realisticProfitPercent, // Realistic profit with bid/ask, fees, slippage, cost buffer
        realisticProfitAmount: opp.result.realisticProfitAmount, // Realistic profit amount in USDT

        // Metadata
        detectedAt: opp.timestamp,
        expiresAt: opp.timestamp + 60000, // 1 minute

        // Execution readiness
        isExecutable: true,
      });

      console.log(
        `[OpportunityDetection] Detected opportunity: ${opp.triangle.symbols.join(' → ')} with ${opp.result.profitPercent.toFixed(4)}% profit`
      );

      // Auto-execute if enabled
      if (this.config.autoExecute) {
        // TODO: Trigger execution service
        // console.log('[OpportunityDetection] Auto-execute enabled - would execute now');
      }
    } catch (error) {
      console.error('[OpportunityDetection] Error handling opportunity:', error);
    }
  }

  /**
   * Get scanner configuration
   */
  getConfig(): ScannerConfig {
    return this.config;
  }

  /**
   * Get market data manager (for accessing current prices)
   */
  getMarketDataManager(): MarketDataManager {
    return this.marketDataManager;
  }

  /**
   * Get exchange connector (for reuse in execution)
   */
  getConnector(): BaseExchangeConnector | undefined {
    return this.connector;
  }

  /**
   * Check if scanner is running
   */
  get isRunning(): boolean {
    return this.isScanning;
  }

  /**
   * Get scanner status
   */
  getStatus() {
    return {
      isScanning: this.isScanning,
      status: this.isScanning ? 'scanning' : 'stopped',
      config: this.config,
      stats: {
        ...this.stats,
        runningFor: this.isScanning ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
        trianglesMonitored: this.triangles.length,
      },
    };
  }

  /**
   * Get triangle ID
   */
  private getTriangleId(triangle: Triangle): string {
    return triangle.symbols.sort().join('_');
  }

  /**
   * Check if date is today
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  /**
   * Cleanup - stop scanner(s) for user
   * @param userId - User ID
   * @param exchange - Optional: specific exchange to stop. If not provided, stops all scanners for user
   */
  static async cleanup(userId: string, exchange?: string): Promise<void> {
    const userInstances = OpportunityDetectionService.instances.get(userId);
    if (!userInstances) return;

    if (exchange) {
      // Stop specific exchange scanner
      const instance = userInstances.get(exchange);
      if (instance) {
        await instance.stop();
        OpportunityDetectionService.removeInstance(userId, exchange);
      }
    } else {
      // Stop all scanners for this user
      for (const [ex, instance] of userInstances.entries()) {
        await instance.stop();
      }
      OpportunityDetectionService.instances.delete(userId);
    }
  }
}
