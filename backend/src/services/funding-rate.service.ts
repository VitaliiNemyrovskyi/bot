/**
 * Funding Rate Service
 *
 * Handles fetching, storing, and analyzing funding rates for cryptocurrency perpetual futures.
 * Features:
 * - Stores historical funding rate data in database
 * - Calculates average rates over time periods
 * - Identifies arbitrage opportunities
 * - Provides funding rate statistics and trends
 * - Auto-sync funding rates from exchanges
 */

import { Exchange } from '@prisma/client';
import NodeCache from 'node-cache';
import prisma from '@/lib/prisma';
import { BybitService } from '@/lib/bybit';

// Cache configuration: 5 minutes TTL for current rates
const fundingRateCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export interface FundingRateData {
  symbol: string;
  fundingRate: number;
  fundingRateTimestamp: Date;
  nextFundingTime: Date;
  predictedRate?: number;
  markPrice?: number;
  indexPrice?: number;
  openInterest?: number;
  volume24h?: number;
  annualizedRate?: number; // Calculated field
}

export interface FundingRateStats {
  symbol: string;
  currentRate: number;
  avgRate24h: number;
  avgRate7d: number;
  avgRate30d: number;
  minRate24h: number;
  maxRate24h: number;
  annualizedRate: number;
  arbitrageScore: number; // Higher = better opportunity
  lastUpdated: Date;
}

export interface ArbitrageOpportunity {
  symbol: string;
  fundingRate: number;
  annualizedRate: number;
  nextFundingTime: Date;
  estimatedProfit8h: number; // Profit per funding period
  estimatedProfitAnnual: number; // Annualized profit
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  markPrice: number;
  volume24h: number;
  openInterest: number;
}

/**
 * Store funding rate data in database
 */
export async function storeFundingRate(
  exchange: Exchange,
  data: FundingRateData
): Promise<void> {
  try {
    await prisma.fundingRate.upsert({
      where: {
        exchange_symbol_fundingRateTimestamp: {
          exchange,
          symbol: data.symbol,
          fundingRateTimestamp: data.fundingRateTimestamp
        }
      },
      update: {
        fundingRate: data.fundingRate,
        nextFundingTime: data.nextFundingTime,
        predictedRate: data.predictedRate,
        markPrice: data.markPrice,
        indexPrice: data.indexPrice,
        openInterest: data.openInterest,
        volume24h: data.volume24h,
        recordedAt: new Date()
      },
      create: {
        exchange,
        symbol: data.symbol,
        fundingRate: data.fundingRate,
        fundingRateTimestamp: data.fundingRateTimestamp,
        nextFundingTime: data.nextFundingTime,
        predictedRate: data.predictedRate,
        markPrice: data.markPrice,
        indexPrice: data.indexPrice,
        openInterest: data.openInterest,
        volume24h: data.volume24h
      }
    });
  } catch (error) {
    console.error(`❌ Error storing funding rate for ${data.symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch and store current funding rates from Bybit
 */
export async function syncBybitFundingRates(
  apiKey: string,
  apiSecret: string,
  testnet: boolean = false
): Promise<number> {
  try {
    const bybitService = new BybitService({
      apiKey,
      apiSecret,
      testnet,
      enableRateLimit: true,
      userId: 'system' // System-level sync
    });

    // Fetch all linear tickers (includes funding rates)
    const tickers = await bybitService.getTicker('linear');

    let syncedCount = 0;

    for (const ticker of tickers) {
      // Only process if funding rate data exists
      if (ticker.fundingRate && ticker.nextFundingTime) {
        const fundingRateData: FundingRateData = {
          symbol: ticker.symbol,
          fundingRate: parseFloat(ticker.fundingRate),
          fundingRateTimestamp: new Date(),
          nextFundingTime: new Date(parseInt(ticker.nextFundingTime)),
          predictedRate: ticker.predictedFundingRate
            ? parseFloat(ticker.predictedFundingRate)
            : undefined,
          markPrice: ticker.markPrice ? parseFloat(ticker.markPrice) : undefined,
          indexPrice: ticker.indexPrice ? parseFloat(ticker.indexPrice) : undefined,
          openInterest: ticker.openInterest ? parseFloat(ticker.openInterest) : undefined,
          volume24h: ticker.volume24h ? parseFloat(ticker.volume24h) : undefined
        };

        await storeFundingRate('BYBIT', fundingRateData);
        syncedCount++;
      }
    }

    console.log(`✅ Synced ${syncedCount} funding rates from Bybit`);

    // Invalidate cache
    fundingRateCache.flushAll();

    return syncedCount;
  } catch (error) {
    console.error('❌ Error syncing Bybit funding rates:', error);
    throw error;
  }
}

/**
 * Calculate annualized funding rate
 * Bybit charges funding every 8 hours (3 times per day)
 */
export function calculateAnnualizedRate(fundingRate: number): number {
  const periodsPerDay = 3; // 8-hour funding periods
  const daysPerYear = 365;
  return fundingRate * periodsPerDay * daysPerYear * 100; // Convert to percentage
}

/**
 * Get funding rate statistics for a symbol
 */
export async function getFundingRateStats(
  exchange: Exchange,
  symbol: string
): Promise<FundingRateStats | null> {
  const cacheKey = `stats:${exchange}:${symbol}`;

  // Check cache
  const cached = fundingRateCache.get<FundingRateStats>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get current rate
    const currentRate = await prisma.fundingRate.findFirst({
      where: { exchange, symbol },
      orderBy: { recordedAt: 'desc' }
    });

    if (!currentRate) {
      return null;
    }

    // Calculate 24h stats
    const rates24h = await prisma.fundingRate.findMany({
      where: {
        exchange,
        symbol,
        recordedAt: { gte: oneDayAgo }
      },
      select: { fundingRate: true }
    });

    // Calculate 7d average
    const rates7d = await prisma.fundingRate.findMany({
      where: {
        exchange,
        symbol,
        recordedAt: { gte: sevenDaysAgo }
      },
      select: { fundingRate: true }
    });

    // Calculate 30d average
    const rates30d = await prisma.fundingRate.findMany({
      where: {
        exchange,
        symbol,
        recordedAt: { gte: thirtyDaysAgo }
      },
      select: { fundingRate: true }
    });

    const avg24h = rates24h.length > 0
      ? rates24h.reduce((sum, r) => sum + r.fundingRate, 0) / rates24h.length
      : currentRate.fundingRate;

    const avg7d = rates7d.length > 0
      ? rates7d.reduce((sum, r) => sum + r.fundingRate, 0) / rates7d.length
      : currentRate.fundingRate;

    const avg30d = rates30d.length > 0
      ? rates30d.reduce((sum, r) => sum + r.fundingRate, 0) / rates30d.length
      : currentRate.fundingRate;

    const min24h = rates24h.length > 0
      ? Math.min(...rates24h.map(r => r.fundingRate))
      : currentRate.fundingRate;

    const max24h = rates24h.length > 0
      ? Math.max(...rates24h.map(r => r.fundingRate))
      : currentRate.fundingRate;

    const annualizedRate = calculateAnnualizedRate(currentRate.fundingRate);

    // Calculate arbitrage score (0-100)
    // Higher score = better opportunity
    const absRate = Math.abs(currentRate.fundingRate);
    const volatility = max24h - min24h;
    const arbitrageScore = Math.min(100, (absRate * 10000 + volatility * 5000));

    const stats: FundingRateStats = {
      symbol,
      currentRate: currentRate.fundingRate,
      avgRate24h: avg24h,
      avgRate7d: avg7d,
      avgRate30d: avg30d,
      minRate24h: min24h,
      maxRate24h: max24h,
      annualizedRate,
      arbitrageScore,
      lastUpdated: currentRate.recordedAt
    };

    // Cache the result
    fundingRateCache.set(cacheKey, stats);

    return stats;
  } catch (error) {
    console.error(`❌ Error getting funding rate stats for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get top arbitrage opportunities
 */
export async function getArbitrageOpportunities(
  exchange: Exchange,
  minAnnualizedRate: number = 10, // 10% annualized minimum
  limit: number = 20
): Promise<ArbitrageOpportunity[]> {
  try {
    // Get latest funding rates for all symbols
    const latestRates = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT ON (symbol)
        symbol,
        "fundingRate",
        "nextFundingTime",
        "markPrice",
        volume24h,
        "openInterest",
        "recordedAt"
      FROM funding_rates
      WHERE exchange = ${exchange}
      ORDER BY symbol, "recordedAt" DESC
    `;

    const opportunities: ArbitrageOpportunity[] = [];

    for (const rate of latestRates) {
      const annualizedRate = calculateAnnualizedRate(rate.fundingRate);
      const absAnnualizedRate = Math.abs(annualizedRate);

      // Skip symbols without valid price data
      const markPrice = rate.markPrice || 0;
      if (markPrice <= 0) {
        console.log(`[FundingRateService] Filtered out ${rate.symbol} from opportunities - no valid price data (markPrice: ${rate.markPrice})`);
        continue;
      }

      // Filter by minimum annualized rate
      if (absAnnualizedRate >= minAnnualizedRate) {
        const estimatedProfit8h = Math.abs(rate.fundingRate) * 100; // Percentage profit per 8h
        const estimatedProfitAnnual = absAnnualizedRate;

        // Determine risk level based on volume and open interest
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
        const volume = rate.volume24h || 0;
        const oi = rate.openInterest || 0;

        if (volume > 100000000 && oi > 50000000) {
          riskLevel = 'LOW'; // High liquidity, low risk
        } else if (volume < 10000000 || oi < 5000000) {
          riskLevel = 'HIGH'; // Low liquidity, high risk
        }

        opportunities.push({
          symbol: rate.symbol,
          fundingRate: rate.fundingRate,
          annualizedRate,
          nextFundingTime: new Date(rate.nextFundingTime),
          estimatedProfit8h,
          estimatedProfitAnnual,
          riskLevel,
          markPrice: rate.markPrice || 0,
          volume24h: volume,
          openInterest: oi
        });
      }
    }

    // Sort by annualized rate (absolute value)
    opportunities.sort((a, b) =>
      Math.abs(b.annualizedRate) - Math.abs(a.annualizedRate)
    );

    return opportunities.slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting arbitrage opportunities:', error);
    throw error;
  }
}

/**
 * Get historical funding rates for a symbol
 */
export async function getHistoricalFundingRates(
  exchange: Exchange,
  symbol: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<FundingRateData[]> {
  try {
    const rates = await prisma.fundingRate.findMany({
      where: {
        exchange,
        symbol,
        recordedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { recordedAt: 'asc' }
    });

    return rates.map(rate => ({
      symbol: rate.symbol,
      fundingRate: rate.fundingRate,
      fundingRateTimestamp: rate.fundingRateTimestamp,
      nextFundingTime: rate.nextFundingTime,
      predictedRate: rate.predictedRate ?? undefined,
      markPrice: rate.markPrice ?? undefined,
      indexPrice: rate.indexPrice ?? undefined,
      openInterest: rate.openInterest ?? undefined,
      volume24h: rate.volume24h ?? undefined,
      annualizedRate: calculateAnnualizedRate(rate.fundingRate)
    }));
  } catch (error) {
    console.error(`❌ Error getting historical funding rates for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Clear funding rate cache
 */
export function clearFundingRateCache(): void {
  fundingRateCache.flushAll();
  console.log('🗑️ Funding rate cache cleared');
}
