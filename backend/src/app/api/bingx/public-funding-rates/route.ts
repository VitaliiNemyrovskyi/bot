import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';
import { EXCHANGE_ENDPOINTS } from '@/lib/exchange-api-endpoints';
import { redisService } from '@/lib/redis';

// Use Node.js runtime instead of Edge runtime for database access
export const runtime = 'nodejs';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

// In-memory cache for funding intervals (rarely change)
const fundingIntervalCache = new Map<string, number>();

/**
 * Calculate BingX funding interval dynamically from historical data
 */
async function calculateBingXFundingInterval(bingxSymbol: string, normalizedSymbol: string): Promise<number> {
  try {
    // Check in-memory cache first (fastest)
    const cacheKey = `BINGX-${normalizedSymbol}`;
    const cached = fundingIntervalCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Try to fetch from API first (most accurate, always fresh)
    const historyResponse = await fetchWithTimeout(
      EXCHANGE_ENDPOINTS.BINGX.FUNDING_RATE_HISTORY(bingxSymbol),
      { timeout: 5000 }
    );
    const historyData = await historyResponse.json();

    if (historyData.code === 0 && historyData.data && historyData.data.length >= 2) {
      // Calculate interval from first two records
      // Use absolute value in case API returns records in different order
      const timeDiff = Math.abs(historyData.data[0].fundingTime - historyData.data[1].fundingTime);
      const hoursInterval = Math.round(timeDiff / (1000 * 60 * 60));

      if (hoursInterval > 0 && hoursInterval <= 24) {
        fundingIntervalCache.set(cacheKey, hoursInterval);
        return hoursInterval;
      }
    }

    // Fallback: Try to get from database if API fails
    const existingRecord = await prisma.publicFundingRate.findFirst({
      where: {
        exchange: 'BINGX',
        symbol: normalizedSymbol,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    if (existingRecord && existingRecord.fundingInterval > 0) {
      console.log(`[BingX] Using database fallback for ${normalizedSymbol}: ${existingRecord.fundingInterval}h`);
      fundingIntervalCache.set(cacheKey, existingRecord.fundingInterval);
      return existingRecord.fundingInterval;
    }

    // Ultimate fallback: 0 means unknown
    return 0;
  } catch (error) {
    console.error(`[BingX] Error calculating interval for ${bingxSymbol}:`, error);

    // Try database as last resort
    try {
      const existingRecord = await prisma.publicFundingRate.findFirst({
        where: {
          exchange: 'BINGX',
          symbol: normalizedSymbol,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      if (existingRecord && existingRecord.fundingInterval > 0) {
        console.log(`[BingX] Using database fallback after error for ${normalizedSymbol}`);
        return existingRecord.fundingInterval;
      }
    } catch (dbError) {
      console.error(`[BingX] Database fallback also failed for ${bingxSymbol}`);
    }

    return 0; // 0 means unknown
  }
}

/**
 * Public BingX Funding Rates with DB Cache
 *
 * Real-time approach:
 * 1. Check if fresh data exists in DB (< 30 seconds old)
 * 2. If yes → return from DB (fast)
 * 3. If no → fetch from BingX API → save to DB → return
 *
 * Benefits:
 * - Always fresh data (max 30s old)
 * - Fast response (DB cache)
 * - Unified format across all exchanges
 * - Historical data preserved
 *
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/bingx/public-funding-rates
 */
export async function GET(_request: NextRequest) {
  try {
    // Step 1: Try Redis cache first (ultra-fast, ~5ms)
    const cachedData = await redisService.getBulkFundingRates('BINGX');

    if (cachedData) {
      return NextResponse.json(cachedData.data, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'redis-cache',
          'X-Cache-Age': Math.floor((Date.now() - cachedData.timestamp) / 1000).toString(),
        },
      });
    }

    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 2: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'BINGX',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });


    // Step 3: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'BINGX',
          timestamp: {
            gte: cacheThreshold,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
        distinct: ['symbol'], // Get latest record per symbol
      });


      // Transform DB format to BingX API format
      const transformedData = {
        code: 0,
        msg: '',
        data: cachedRates.map(rate => ({
          symbol: rate.symbol.replace('/', '-'), // BTC/USDT → BTC-USDT
          lastFundingRate: rate.fundingRate.toString(),
          nextFundingTime: Math.floor(rate.nextFundingTime.getTime()),
          markPrice: rate.markPrice?.toString() || '0',
          indexPrice: rate.indexPrice?.toString() || '0',
          fundingInterval: rate.fundingInterval > 0 ? `${rate.fundingInterval}h` : '', // Empty if unknown
        })),
      };

      // Store in Redis for next request (non-blocking)
      redisService.cacheBulkFundingRates('BINGX', transformedData, CACHE_TTL_SECONDS).catch(err => {
        console.error('[BingX] Failed to cache in Redis:', err.message);
      });

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
        },
      });
    }

    // Step 4: No fresh data - fetch from BingX API

    const bingxUrl = 'https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex';
    const response = await fetchWithTimeout(bingxUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch BingX funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const rawData = await response.json();
    const allData = rawData.data || [];

    // Step 4: Filter out non-trading or delisted contracts
    // Only include contracts with valid mark price (indicates active trading)
    const data = allData.filter((item: any) => {
      // Filter out contracts without mark price (not trading)
      if (!item.markPrice || parseFloat(item.markPrice) === 0) {
        console.log(`[BingX] Skipping non-trading contract: ${item.symbol}`);
        return false;
      }
      return true;
    });

    console.log(`[BingX] Filtered ${allData.length - data.length} non-trading contracts. Active: ${data.length}`);

    // Step 5: Calculate funding intervals ONCE and cache them (FIX: No duplicate calls)
    const symbolIntervalMap = new Map<string, number>();
    for (const item of data) {
      const symbol = item.symbol.replace('-', '/'); // BTC-USDT → BTC/USDT
      const fundingInterval = await calculateBingXFundingInterval(item.symbol, symbol);
      symbolIntervalMap.set(symbol, fundingInterval);
    }

    // Step 6: Upsert records using pre-calculated intervals
    const upsertPromises = data.map(async (item: any) => {
      const symbol = item.symbol.replace('-', '/');
      const fundingInterval = symbolIntervalMap.get(symbol) || 0;

      return prisma.publicFundingRate.upsert({
        where: {
          symbol_exchange: {
            symbol: symbol,
            exchange: 'BINGX',
          },
        } as any,
        update: {
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime || Date.now()),
          fundingInterval,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
        create: {
          symbol,
          exchange: 'BINGX',
          fundingRate: parseFloat(item.lastFundingRate || '0'),
          nextFundingTime: new Date(item.nextFundingTime || Date.now()),
          fundingInterval,
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        },
      });
    });

    await Promise.all(upsertPromises);

    // Step 7: Return transformed data with pre-calculated funding intervals
    const enrichedData = {
      ...rawData,
      data: data.map((item: any) => {
        const symbol = item.symbol.replace('-', '/');
        const intervalHours = symbolIntervalMap.get(symbol) || 0;
        return {
          ...item,
          fundingInterval: intervalHours > 0 ? `${intervalHours}h` : '',
        };
      }),
    };

    // Store in Redis for next request (non-blocking)
    redisService.cacheBulkFundingRates('BINGX', enrichedData, CACHE_TTL_SECONDS).catch(err => {
      console.error('[BingX] Failed to cache in Redis:', err.message);
    });

    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
