/**
 * Funding Arbitrage Monitor Service
 *
 * Monitors funding rates and identifies profitable arbitrage opportunities
 * Automatically prepares trading opportunities for the FundingPaymentArbBot
 */

import { PrismaClient } from '@prisma/client';
import { BybitService } from '@/lib/bybit';
import prisma from '@/lib/prisma';
import {
  calculateLiquidityScore,
  estimatePriceDropFromLiquidity,
  calculateExpectedNetReturn,
  getRiskLevel,
  getLiquidityDescription,
} from '../../../shared/lib/liquidity-score.utils';

export interface FundingArbOpportunity {
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingRatePercent: string; // e.g., "-2.5000%"
  nextFundingTime: Date;
  timeUntilFunding: number; // milliseconds
  fundingInterval: number; // hours
  estimatedProfit: number; // % (rough estimate based on analysis)
  isReady: boolean; // true if within 10 minutes of funding
  lastPrice?: number;
  // Liquidity analysis fields
  liquidityScore?: number;
  bidSize?: number;
  askSize?: number;
  estimatedPriceDropPercent?: number;
  expectedNetReturnPercent?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  liquidityDescription?: string;
}

export interface MonitorConfig {
  minFundingRate: number; // Minimum negative rate (e.g., -0.01 = -1%)
  maxTimeBeforeFunding: number; // Max milliseconds before funding to consider (e.g., 10 min)
  exchanges: string[]; // ['BYBIT']
  updateInterval: number; // Milliseconds between checks (e.g., 60000 = 1 min)
}

export class FundingArbMonitorService {
  private prisma: PrismaClient;
  private bybit: BybitService;
  private config: MonitorConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastOpportunities: FundingArbOpportunity[] = [];
  private orderBookCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 10000; // 10 seconds cache

  constructor(config?: Partial<MonitorConfig>) {
    this.prisma = prisma;
    this.bybit = new BybitService(); // Public API, no credentials needed for order book
    this.config = {
      minFundingRate: -0.01, // -1% or lower
      maxTimeBeforeFunding: 10 * 60 * 1000, // 10 minutes
      exchanges: ['BYBIT'],
      updateInterval: 60 * 1000, // 1 minute
      ...config,
    };
  }

  /**
   * Start monitoring for opportunities
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('🔍 Starting Funding Arbitrage Monitor');
    console.log(`   Min Funding Rate: ${(this.config.minFundingRate * 100).toFixed(2)}%`);
    console.log(`   Max Time Before Funding: ${(this.config.maxTimeBeforeFunding / 60000).toFixed(0)} minutes`);
    console.log(`   Update Interval: ${(this.config.updateInterval / 1000).toFixed(0)} seconds`);
    console.log(`   Exchanges: ${this.config.exchanges.join(', ')}\n`);

    // Initial scan
    await this.scan();

    // Set up periodic scanning
    this.intervalId = setInterval(async () => {
      await this.scan();
    }, this.config.updateInterval);
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Funding Arbitrage Monitor stopped');
  }

  /**
   * Scan for opportunities
   */
  private async scan(): Promise<void> {
    try {
      const opportunities = await this.findOpportunities();

      if (opportunities.length > 0) {
        console.log(`\n⭐ Found ${opportunities.length} funding arbitrage opportunities:\n`);

        for (const opp of opportunities) {
          const readyIcon = opp.isReady ? '🟢' : '🟡';
          const timeStr = this.formatTimeUntilFunding(opp.timeUntilFunding);

          console.log(
            `${readyIcon} ${opp.symbol.padEnd(12)} | ` +
            `Rate: ${opp.fundingRatePercent.padStart(8)} | ` +
            `Next: ${timeStr.padEnd(12)} | ` +
            `Est. Profit: ~${opp.estimatedProfit.toFixed(2)}%`
          );
        }
        console.log('');
      } else {
        console.log('🔍 No opportunities found (all funding rates above threshold)');
      }

      this.lastOpportunities = opportunities;

    } catch (error: any) {
      console.error('❌ Error during scan:', error.message);
    }
  }

  /**
   * Get order book with caching
   */
  private async getOrderBookCached(symbol: string): Promise<any | null> {
    try {
      // Check cache
      const cached = this.orderBookCache.get(symbol);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < this.CACHE_TTL_MS) {
        return cached.data;
      }

      // Fetch fresh data
      const orderBook = await this.bybit.getOrderBook('linear', symbol, 1);

      // Cache it
      this.orderBookCache.set(symbol, { data: orderBook, timestamp: now });

      return orderBook;
    } catch (error: any) {
      console.error(`Error fetching order book for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Find current funding arbitrage opportunities
   */
  async findOpportunities(): Promise<FundingArbOpportunity[]> {
    // Get all pairs with negative funding rates below threshold
    const fundingRates = await this.prisma.publicFundingRate.findMany({
      where: {
        exchange: {
          in: this.config.exchanges,
        },
        fundingRate: {
          lt: this.config.minFundingRate,
        },
      },
      orderBy: {
        fundingRate: 'asc', // Most negative first
      },
    });

    const now = Date.now();
    const opportunities: FundingArbOpportunity[] = [];

    for (const rate of fundingRates) {
      const nextFundingTime = this.calculateNextFundingTime(
        rate.nextFundingTime,
        rate.fundingInterval
      );

      const timeUntilFunding = nextFundingTime.getTime() - now;

      // Skip if funding time is too far in the future
      // (but always include opportunities within monitoring window)
      if (timeUntilFunding < 0) {
        // Funding time has passed, calculate next one
        continue;
      }

      // Estimate profit based on analysis results
      // Analysis showed: SHORT profit (2-3%) + LONG profit (0.7-1.8%) + Funding (rate%)
      // Conservative estimate: 2% (SHORT) + 0.7% (LONG) + rate%
      const fundingRatePercent = Math.abs(rate.fundingRate) * 100;
      const estimatedProfit = 2.0 + 0.7 + fundingRatePercent;

      // Mark as ready if within 10 minutes of funding
      const isReady = timeUntilFunding <= this.config.maxTimeBeforeFunding;

      // Get order book and calculate liquidity score
      const orderBook = await this.getOrderBookCached(rate.symbol);
      let liquidityScore: number | undefined;
      let bidSize: number | undefined;
      let askSize: number | undefined;
      let estimatedPriceDropPercent: number | undefined;
      let expectedNetReturnPercent: number | undefined;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' | undefined;
      let liquidityDescription: string | undefined;

      if (orderBook && orderBook.bids.length > 0 && orderBook.asks.length > 0) {
        bidSize = parseFloat(orderBook.bids[0][1]); // First bid size
        askSize = parseFloat(orderBook.asks[0][1]); // First ask size

        liquidityScore = calculateLiquidityScore(bidSize, askSize);
        estimatedPriceDropPercent = estimatePriceDropFromLiquidity(liquidityScore);
        expectedNetReturnPercent = calculateExpectedNetReturn(rate.fundingRate, liquidityScore);
        riskLevel = getRiskLevel(liquidityScore);
        liquidityDescription = getLiquidityDescription(liquidityScore);
      }

      opportunities.push({
        symbol: rate.symbol,
        exchange: rate.exchange,
        fundingRate: rate.fundingRate,
        fundingRatePercent: `${(rate.fundingRate * 100).toFixed(4)}%`,
        nextFundingTime,
        timeUntilFunding,
        fundingInterval: rate.fundingInterval,
        estimatedProfit,
        isReady,
        lastPrice: rate.markPrice ? parseFloat(rate.markPrice) : undefined,
        liquidityScore,
        bidSize,
        askSize,
        estimatedPriceDropPercent,
        expectedNetReturnPercent,
        riskLevel,
        liquidityDescription,
      });
    }

    return opportunities;
  }

  /**
   * Get ready opportunities (within maxTimeBeforeFunding)
   */
  async getReadyOpportunities(): Promise<FundingArbOpportunity[]> {
    const opportunities = await this.findOpportunities();
    return opportunities.filter(opp => opp.isReady);
  }

  /**
   * Get best opportunity (highest estimated profit that's ready)
   */
  async getBestOpportunity(): Promise<FundingArbOpportunity | null> {
    const readyOpps = await this.getReadyOpportunities();

    if (readyOpps.length === 0) {
      return null;
    }

    // Sort by estimated profit (descending)
    readyOpps.sort((a, b) => b.estimatedProfit - a.estimatedProfit);

    return readyOpps[0];
  }

  /**
   * Get last scanned opportunities
   */
  getLastOpportunities(): FundingArbOpportunity[] {
    return this.lastOpportunities;
  }

  /**
   * Calculate next funding time based on interval
   */
  private calculateNextFundingTime(nextFundingTime: Date, fundingInterval: number): Date {
    const now = Date.now();
    let fundingTime = new Date(nextFundingTime).getTime();

    // If funding time has passed, calculate next occurrence
    while (fundingTime < now) {
      fundingTime += fundingInterval * 60 * 60 * 1000; // Convert hours to ms
    }

    return new Date(fundingTime);
  }

  /**
   * Format time until funding as human-readable string
   */
  private formatTimeUntilFunding(ms: number): string {
    if (ms < 0) {
      return 'PASSED';
    }

    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);

    if (minutes === 0) {
      return `${seconds}s`;
    } else if (minutes < 60) {
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Check if a specific symbol has a good opportunity
   */
  async checkSymbol(symbol: string): Promise<FundingArbOpportunity | null> {
    const opportunities = await this.findOpportunities();
    return opportunities.find(opp => opp.symbol === symbol) || null;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<{
    totalOpportunities: number;
    readyOpportunities: number;
    avgEstimatedProfit: number;
    bestOpportunity: FundingArbOpportunity | null;
  }> {
    const opportunities = await this.findOpportunities();
    const readyOpps = opportunities.filter(opp => opp.isReady);

    const avgProfit = opportunities.length > 0
      ? opportunities.reduce((sum, opp) => sum + opp.estimatedProfit, 0) / opportunities.length
      : 0;

    const bestOpp = opportunities.length > 0
      ? opportunities.reduce((best, current) =>
          current.estimatedProfit > best.estimatedProfit ? current : best
        )
      : null;

    return {
      totalOpportunities: opportunities.length,
      readyOpportunities: readyOpps.length,
      avgEstimatedProfit: avgProfit,
      bestOpportunity: bestOpp,
    };
  }
}

// Singleton instance for application-wide monitoring
let monitorInstance: FundingArbMonitorService | null = null;

/**
 * Get or create singleton monitor instance
 */
export function getFundingArbMonitor(config?: Partial<MonitorConfig>): FundingArbMonitorService {
  if (!monitorInstance) {
    monitorInstance = new FundingArbMonitorService(config);
  }
  return monitorInstance;
}

/**
 * Stop and clear singleton instance
 */
export function stopFundingArbMonitor(): void {
  if (monitorInstance) {
    monitorInstance.stop();
    monitorInstance = null;
  }
}
