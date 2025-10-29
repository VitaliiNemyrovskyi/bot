import { PrismaClient, Exchange } from '@prisma/client';
import { BingXService } from '../lib/bingx';
import { BybitService } from '../lib/bybit';
import { redisService } from '../lib/redis';

/**
 * Background service for collecting historical funding rates
 * Runs every hour to:
 * - Save funding rates to PostgreSQL for historical analysis
 * - Cache funding rates in Redis for fast real-time access (60s TTL)
 */
export class FundingRateCollectorService {
  private prisma: PrismaClient;
  private collectionInterval: NodeJS.Timeout | null = null;
  private readonly COLLECTION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

  // Symbols to track (can be expanded)
  private readonly TRACKED_SYMBOLS = [
    'BTC/USDT',
    'ETH/USDT',
    'BNB/USDT',
    'SOL/USDT',
    'ARB/USDT',
    'OP/USDT',
    'MATIC/USDT',
    'AVAX/USDT',
    'DOT/USDT',
    'LINK/USDT',
  ];

  // Exchanges to track
  private readonly TRACKED_EXCHANGES: Exchange[] = [
    Exchange.BINGX,
    Exchange.BYBIT,
    Exchange.BINANCE,
    Exchange.GATEIO,
    Exchange.OKX,
  ];

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Start periodic funding rate collection
   */
  start(): void {
    // console.log('[FundingRateCollector] Starting periodic funding rate collection...');

    // Collect immediately on start
    this.collectAllFundingRates();

    // Then collect every hour
    this.collectionInterval = setInterval(() => {
      this.collectAllFundingRates();
    }, this.COLLECTION_INTERVAL_MS);

    console.log(`[FundingRateCollector] Collection scheduled every ${this.COLLECTION_INTERVAL_MS / 1000 / 60} minutes`);
  }

  /**
   * Stop periodic collection
   */
  stop(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
      // console.log('[FundingRateCollector] Stopped periodic collection');
    }
  }

  /**
   * Collect funding rates from all exchanges for all symbols
   */
  private async collectAllFundingRates(): Promise<void> {
    const startTime = Date.now();
    // console.log('[FundingRateCollector] Starting collection cycle...');

    let totalCollected = 0;
    let totalErrors = 0;

    for (const exchange of this.TRACKED_EXCHANGES) {
      for (const symbol of this.TRACKED_SYMBOLS) {
        try {
          await this.collectFundingRate(exchange, symbol);
          totalCollected++;

          // Small delay to avoid rate limits
          await this.delay(100);
        } catch (error: any) {
          totalErrors++;
          console.error(`[FundingRateCollector] Error collecting ${exchange}:${symbol}:`, error.message);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[FundingRateCollector] Collection cycle completed in ${duration}ms. Collected: ${totalCollected}, Errors: ${totalErrors}`);
  }

  /**
   * Collect funding rate for specific exchange and symbol
   */
  private async collectFundingRate(exchange: Exchange, symbol: string): Promise<void> {
    try {
      let fundingData: {
        fundingRate: number;
        nextFundingTime: Date;
        fundingInterval: number;
        markPrice?: number;
        indexPrice?: number;
      } | null = null;

      // Fetch from exchange
      switch (exchange) {
        case Exchange.BINGX:
          fundingData = await this.fetchBingXFunding(symbol);
          break;
        case Exchange.BYBIT:
          fundingData = await this.fetchBybitFunding(symbol);
          break;
        // Add other exchanges as needed
        default:
          console.log(`[FundingRateCollector] ${exchange} not implemented yet`);
          return;
      }

      if (!fundingData) {
        return;
      }

      // Save to database (for historical analysis)
      await this.prisma.publicFundingRate.create({
        data: {
          symbol,
          exchange,
          fundingRate: fundingData.fundingRate,
          nextFundingTime: fundingData.nextFundingTime,
          fundingInterval: fundingData.fundingInterval,
          markPrice: fundingData.markPrice,
          indexPrice: fundingData.indexPrice,
        },
      });

      // Save to Redis cache (for real-time access with 60s TTL)
      await redisService.cacheFundingRate(
        exchange,
        symbol,
        fundingData.fundingRate,
        fundingData.nextFundingTime,
        fundingData.markPrice,
        fundingData.indexPrice
      );

      console.log(`[FundingRateCollector] ✓ ${exchange}:${symbol} - Rate: ${(fundingData.fundingRate * 100).toFixed(4)}%`);
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Fetch funding rate from BingX
   */
  private async fetchBingXFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    try {
      // BingX uses different symbol format
      const bingxSymbol = symbol.replace('/', '-');

      const response = await fetch(`https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex?symbol=${bingxSymbol}`);
      const data = await response.json();

      if (data.code !== 0 || !data.data) {
        return null;
      }

      const fundingInfo = data.data;

      return {
        fundingRate: parseFloat(fundingInfo.lastFundingRate || '0'),
        nextFundingTime: new Date(fundingInfo.nextFundingTime),
        fundingInterval: 8, // BingX has 8-hour funding
        markPrice: parseFloat(fundingInfo.markPrice || '0'),
        indexPrice: parseFloat(fundingInfo.indexPrice || '0'),
      };
    } catch (error) {
      console.error(`[FundingRateCollector] BingX fetch error for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Fetch funding rate from Bybit
   */
  private async fetchBybitFunding(symbol: string): Promise<{
    fundingRate: number;
    nextFundingTime: Date;
    fundingInterval: number;
    markPrice?: number;
    indexPrice?: number;
  } | null> {
    try {
      const bybitSymbol = symbol.replace('/', '');

      const response = await fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${bybitSymbol}`);
      const data = await response.json();

      if (data.retCode !== 0 || !data.result?.list?.[0]) {
        return null;
      }

      const ticker = data.result.list[0];

      return {
        fundingRate: parseFloat(ticker.fundingRate || '0'),
        nextFundingTime: new Date(parseInt(ticker.nextFundingTime)),
        fundingInterval: 8, // Bybit has 8-hour funding
        markPrice: parseFloat(ticker.markPrice || '0'),
        indexPrice: parseFloat(ticker.indexPrice || '0'),
      };
    } catch (error) {
      console.error(`[FundingRateCollector] Bybit fetch error for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Helper to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean up old data (keep last 90 days)
   */
  async cleanupOldData(): Promise<void> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await this.prisma.publicFundingRate.deleteMany({
      where: {
        timestamp: {
          lt: ninetyDaysAgo,
        },
      },
    });

    console.log(`[FundingRateCollector] Cleaned up ${deleted.count} old records (older than 90 days)`);
  }
}

// Singleton instance
let collectorInstance: FundingRateCollectorService | null = null;

export function getFundingRateCollector(): FundingRateCollectorService {
  if (!collectorInstance) {
    collectorInstance = new FundingRateCollectorService();
  }
  return collectorInstance;
}
