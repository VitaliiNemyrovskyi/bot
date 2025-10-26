/**
 * GET /api/arbitrage/graduated-entry/opportunities
 *
 * Find Graduated Entry Arbitrage opportunities (Spot + Futures strategy)
 *
 * This endpoint identifies opportunities where:
 * - User buys spot asset on an exchange
 * - User opens SHORT futures position on same exchange
 * - User earns the FULL funding rate (not just the differential)
 *
 * Strategy is profitable when funding rates are POSITIVE (longs pay shorts).
 * Unlike cross-exchange arbitrage which earns only the difference between rates,
 * spot+futures arbitrage earns the full funding rate on the futures position.
 *
 * Returns opportunities with realistic metrics based on 7-day historical funding data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Exchange } from '@prisma/client';
import { redisService } from '@/lib/redis';
import { calculateRealisticROI, calculateFundingRateMetrics } from '@/lib/metrics-calculator';

interface GraduatedEntryOpportunity {
  symbol: string;           // Normalized symbol (BTCUSDT)
  exchange: string;         // Exchange name (BINGX, BYBIT, etc.)

  // Current funding rate data
  fundingRate: number;      // Current funding rate (% per 8h)
  nextFundingTime: Date;    // Next funding payment time
  fundingInterval: number;  // Interval in hours (usually 8)

  // Price data
  spotPrice: number;        // Current spot price
  futuresPrice: number;     // Current futures price (mark price)
  priceDiff: number;        // Price difference (futures - spot)
  priceDiffPercent: number; // Price difference as percentage

  // Legacy metrics (instant calculations)
  expectedDailyReturn: number;   // Legacy: fundingRate * 3 (if 8h funding)
  estimatedMonthlyROI: number;   // Legacy: fundingRate * 90

  // REALISTIC METRICS - based on historical data
  realisticMetrics?: {
    // Daily return scenarios (%)
    dailyReturn: {
      pessimistic: number;  // avg - 1 stddev
      realistic: number;    // avg
      optimistic: number;   // avg + 1 stddev
    };
    // Monthly ROI scenarios (%)
    monthlyROI: {
      pessimistic: number;
      realistic: number;
      optimistic: number;
    };
    // Confidence score (0-100)
    confidence: number;
    // Data quality indicators
    dataPoints?: number;
    historicalPeriodDays?: number;
  };

  // Liquidity and volume
  volume24h?: number;       // 24h trading volume
  openInterest?: number;    // Open interest

  // Risk indicators
  volatility24h?: number;   // 24h price volatility
}

/**
 * GET handler - Get graduated entry arbitrage opportunities
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] Getting graduated entry arbitrage opportunities...');

    const prisma = new PrismaClient();

    try {
      // Get query parameters
      const searchParams = request.nextUrl.searchParams;
      const minFundingRate = parseFloat(searchParams.get('minFundingRate') || '0.01'); // Default 0.01% = 0.0001
      const exchanges = searchParams.get('exchanges')?.split(',') || ['BINGX', 'BYBIT', 'BINANCE', 'GATEIO', 'OKX'];

      // Symbols to analyze (can be expanded)
      const symbols = [
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

      const opportunities: GraduatedEntryOpportunity[] = [];

      // For each symbol, find exchanges with positive funding rates
      for (const symbol of symbols) {
        for (const exchange of exchanges) {
          try {
            const exchangeEnum = exchange.toUpperCase() as Exchange;

            // Try to get funding rate from Redis cache first
            let fundingRate: number | null = null;
            let nextFundingTime: Date | null = null;
            let markPrice: number | null = null;

            try {
              const cachedData = await redisService.getFundingRate(exchangeEnum, symbol);
              if (cachedData) {
                fundingRate = cachedData.fundingRate;
                nextFundingTime = cachedData.nextFundingTime;
                markPrice = cachedData.markPrice || null;
              }
            } catch (cacheError) {
              console.warn(`[GraduatedEntry] Redis cache miss for ${exchange}:${symbol}`);
            }

            // If not in cache, get latest from database
            if (fundingRate === null) {
              const latestFundingRate = await prisma.publicFundingRate.findFirst({
                where: {
                  symbol,
                  exchange: exchangeEnum,
                },
                orderBy: {
                  timestamp: 'desc',
                },
              });

              if (latestFundingRate) {
                fundingRate = latestFundingRate.fundingRate;
                nextFundingTime = latestFundingRate.nextFundingTime;
                markPrice = latestFundingRate.markPrice || null;
              }
            }

            // Skip if no funding data or funding is not positive
            if (!fundingRate || fundingRate <= minFundingRate) {
              continue;
            }

            // Calculate realistic metrics based on historical data
            const realisticMetrics = await calculateRealisticROI(
              exchangeEnum,
              exchangeEnum, // Same exchange for spot+futures
              symbol,
              0, // No price spread for spot+futures
              7  // 7 days historical data
            );

            // Also get raw funding metrics for data quality info
            const fundingMetrics = await calculateFundingRateMetrics(
              exchangeEnum,
              symbol,
              7
            );

            // Calculate legacy metrics (instant calculations)
            // Funding payments per day (assuming 8-hour intervals = 3 payments/day)
            const paymentsPerDay = 3;
            const expectedDailyReturn = fundingRate * paymentsPerDay * 100; // Convert to percentage
            const estimatedMonthlyROI = fundingRate * paymentsPerDay * 30 * 100;

            // Create opportunity
            const opportunity: GraduatedEntryOpportunity = {
              symbol,
              exchange,
              fundingRate: fundingRate * 100, // Convert to percentage for display
              nextFundingTime: nextFundingTime || new Date(),
              fundingInterval: 8, // Default to 8 hours
              spotPrice: markPrice || 0, // Use mark price as proxy for spot
              futuresPrice: markPrice || 0,
              priceDiff: 0, // Spot+futures on same exchange, minimal diff
              priceDiffPercent: 0,
              expectedDailyReturn,
              estimatedMonthlyROI,
              // Add realistic metrics if available
              ...(realisticMetrics && {
                realisticMetrics: {
                  dailyReturn: {
                    pessimistic: realisticMetrics.expectedDailyReturn.pessimistic,
                    realistic: realisticMetrics.expectedDailyReturn.realistic,
                    optimistic: realisticMetrics.expectedDailyReturn.optimistic,
                  },
                  monthlyROI: {
                    pessimistic: realisticMetrics.expectedMonthlyROI.pessimistic,
                    realistic: realisticMetrics.expectedMonthlyROI.realistic,
                    optimistic: realisticMetrics.expectedMonthlyROI.optimistic,
                  },
                  confidence: realisticMetrics.confidence,
                  dataPoints: fundingMetrics?.dataPoints,
                  historicalPeriodDays: 7,
                }
              }),
            };

            opportunities.push(opportunity);

          } catch (symbolError: any) {
            console.error(`[GraduatedEntry] Error processing ${exchange}:${symbol}:`, symbolError.message);
            continue;
          }
        }
      }

      // Sort by realistic daily return (or legacy if not available)
      opportunities.sort((a, b) => {
        const aReturn = a.realisticMetrics?.dailyReturn.realistic || a.expectedDailyReturn;
        const bReturn = b.realisticMetrics?.dailyReturn.realistic || b.expectedDailyReturn;
        return bReturn - aReturn;
      });

      console.log(`[API] Found ${opportunities.length} graduated entry opportunities`);

      return NextResponse.json({
        success: true,
        data: opportunities,
        stats: {
          totalOpportunities: opportunities.length,
          exchangesAnalyzed: exchanges.length,
          symbolsAnalyzed: symbols.length,
          withRealisticMetrics: opportunities.filter(o => o.realisticMetrics).length,
        },
        timestamp: new Date().toISOString(),
      });

    } finally {
      await prisma.$disconnect();
    }

  } catch (error: any) {
    console.error('[API] Error getting graduated entry opportunities:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get graduated entry opportunities',
      },
      { status: 500 }
    );
  }
}
