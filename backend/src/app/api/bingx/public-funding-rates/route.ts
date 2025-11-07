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

// Valid funding intervals (hours) - only these values are allowed
const VALID_FUNDING_INTERVALS = [1, 4, 8];

/**
 * Calculate BingX funding interval dynamically from historical data
 * NO FALLBACKS TO DEFAULTS - Always get from API
 */
async function calculateBingXFundingInterval(bingxSymbol: string, normalizedSymbol: string): Promise<number> {
  // Check in-memory cache first (fastest)
  const cacheKey = `BINGX-${normalizedSymbol}`;
  const cached = fundingIntervalCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API - this is the ONLY source of truth
  const historyResponse = await fetchWithTimeout(
    EXCHANGE_ENDPOINTS.BINGX.FUNDING_RATE_HISTORY(bingxSymbol),
    { timeout: 10000 } // 10 second timeout for consistency
  );
  const historyData = await historyResponse.json();

  if (historyData.code !== 0 || !historyData.data || historyData.data.length < 3) {
    throw new Error(`BingX API returned insufficient data for ${bingxSymbol}: ${historyData.msg || 'unknown error'}`);
  }

  // Analyze multiple records to find the actual funding collection interval
  // BingX may return intermediate updates, so we need to look for the pattern
  const intervals: number[] = [];

  // Calculate intervals between consecutive records (analyze up to 10 records)
  const recordsToAnalyze = Math.min(10, historyData.data.length);
  for (let i = 0; i < recordsToAnalyze - 1; i++) {
    const timeDiff = Math.abs(historyData.data[i].fundingTime - historyData.data[i + 1].fundingTime);
    const hours = Math.round(timeDiff / (1000 * 60 * 60));

    // Only consider valid intervals
    if (VALID_FUNDING_INTERVALS.includes(hours)) {
      intervals.push(hours);
    }
  }

  if (intervals.length === 0) {
    throw new Error(`Could not determine valid funding interval for ${bingxSymbol} from ${recordsToAnalyze} records`);
  }

  // Find the most common interval (mode)
  const intervalCounts = new Map<number, number>();
  for (const interval of intervals) {
    intervalCounts.set(interval, (intervalCounts.get(interval) || 0) + 1);
  }

  // Get the interval with highest frequency
  let mostCommonInterval = 0;
  let maxCount = 0;
  for (const [interval, count] of intervalCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      mostCommonInterval = interval;
    }
  }

  if (mostCommonInterval === 0) {
    throw new Error(`Could not determine funding interval for ${bingxSymbol}: no valid pattern found`);
  }

  // Log the analysis for debugging
  console.log(`[BingX] ${normalizedSymbol}: Analyzed ${intervals.length} intervals, most common: ${mostCommonInterval}h (${maxCount}/${intervals.length} records)`);

  // Cache and return
  fundingIntervalCache.set(cacheKey, mostCommonInterval);
  return mostCommonInterval;
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
          fundingInterval: rate.fundingInterval, // Pure number: 0 means unknown
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

    // Step 5: Get existing intervals from DB
    const existingRates = await prisma.publicFundingRate.findMany({
      where: {
        exchange: 'BINGX',
      },
      select: {
        symbol: true,
        fundingInterval: true,
      },
    });

    const intervalMap = new Map<string, number>();
    for (const rate of existingRates) {
      intervalMap.set(rate.symbol, rate.fundingInterval);
    }

    // Step 6: Identify symbols with missing intervals (interval=0 or not in DB)
    const symbolsNeedingInterval: Array<{ bingxSymbol: string; normalizedSymbol: string }> = [];
    for (const item of data) {
      const normalizedSymbol = item.symbol.replace('-', '/');
      const existingInterval = intervalMap.get(normalizedSymbol);

      // Only calculate if interval is 0 or symbol is new
      if (!existingInterval || existingInterval === 0) {
        symbolsNeedingInterval.push({
          bingxSymbol: item.symbol,
          normalizedSymbol,
        });
      }
    }

    // Step 7: Calculate missing intervals in small batches (10 at a time) to avoid memory crash
    if (symbolsNeedingInterval.length > 0) {
      console.log(`[BingX] Calculating intervals for ${symbolsNeedingInterval.length} symbols in batches of 10...`);
      const batchSize = 10;

      for (let i = 0; i < symbolsNeedingInterval.length; i += batchSize) {
        const batch = symbolsNeedingInterval.slice(i, i + batchSize);
        const batchPromises = batch.map(async ({ bingxSymbol, normalizedSymbol }) => {
          const interval = await calculateBingXFundingInterval(bingxSymbol, normalizedSymbol);
          if (interval > 0) {
            intervalMap.set(normalizedSymbol, interval);
            console.log(`[BingX] Calculated interval for ${normalizedSymbol}: ${interval}h`);
          }
        });

        // Wait for batch to complete before starting next batch
        await Promise.all(batchPromises);
      }
    }

    // Step 8: Upsert records with calculated or existing intervals
    const upsertPromises = data.map(async (item: any) => {
      const symbol = item.symbol.replace('-', '/');
      const fundingInterval = intervalMap.get(symbol) || 0;

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

    // Step 9: Return transformed data with fresh or existing intervals
    const enrichedData = {
      ...rawData,
      data: data.map((item: any) => {
        const symbol = item.symbol.replace('-', '/');
        const intervalHours = intervalMap.get(symbol) || 0;
        return {
          ...item,
          fundingInterval: intervalHours, // Pure number: 0 means unknown
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
