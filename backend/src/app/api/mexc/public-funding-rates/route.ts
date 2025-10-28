import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CACHE_TTL_SECONDS = 30; // Cache data for 30 seconds

/**
 * Known MEXC funding intervals (updated from official announcements)
 * MEXC API doesn't provide intervals in ticker endpoint, so we maintain this list
 * based on official announcements
 *
 * Source: https://www.mexc.com/support/ (funding rate adjustment announcements)
 * Last updated: 2025-10
 *
 * Note: MEXC uses collectCycle field in funding rate history API,
 * but requires individual requests per symbol (too slow for 800+ symbols)
 */
const MEXC_FUNDING_INTERVALS: Record<string, string> = {
  // 4-hour intervals (announced July 18, 2025)
  'LAYER_USDT': '4h',
  'LPT_USDT': '4h',
  'RVN_USDT': '4h',
  'DRIFT_USDT': '4h',
  'ZETA_USDT': '4h',
  'RDNT_USDT': '4h',
  'NTRN_USDT': '4h',
  'AUDIO_USDT': '4h',
  'BAL_USDT': '4h',
  'STORJ_USDT': '4h',
  'ANKR_USDT': '4h',
  'ALPACA_USDT': '4h',
  'GTC_USDT': '4h',
  'OGN_USDT': '4h',

  // Default: 8h for all others (MEXC standard)
};

/**
 * Calculate next funding time for MEXC
 * MEXC funding happens EVERY HOUR at :00 (e.g., 19:00, 20:00, 21:00, etc.)
 * Despite API returning "8h" interval string, actual funding happens hourly
 */
function calculateNextFundingTime(): number {
  const now = Date.now();
  const nowDate = new Date(now);

  // Get current UTC time
  const currentMinute = nowDate.getUTCMinutes();
  const currentSecond = nowDate.getUTCSeconds();

  // Calculate next funding time (next hour at :00)
  const nextFunding = new Date(nowDate);

  // Set to :00:00.000 of current hour first
  nextFunding.setUTCMinutes(0, 0, 0);

  // If we're past the hour mark (even by 1 second), move to next hour
  if (currentMinute > 0 || currentSecond > 0) {
    nextFunding.setUTCHours(nextFunding.getUTCHours() + 1);
  }

  return nextFunding.getTime();
}

/**
 * MEXC Public Funding Rates Proxy with Funding Intervals
 *
 * Proxies requests to MEXC public API to bypass CORS restrictions
 * Enriches data with funding intervals based on official MEXC announcements.
 * NO AUTHENTICATION REQUIRED - public endpoint
 *
 * Endpoint: GET /api/mexc/public-funding-rates
 * MEXC API: GET https://futures.mexc.com/api/v1/contract/ticker
 * Documentation: https://mexcdevelop.github.io/apidocs/contract_v1_en/#k-line-data
 */
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CACHE_TTL_SECONDS * 1000);

    // Step 1: Check if we have fresh data in DB
    const cachedCount = await prisma.publicFundingRate.count({
      where: {
        exchange: 'MEXC',
        timestamp: {
          gte: cacheThreshold,
        },
      },
    });

    console.log(`[MEXC Public] Cache check: ${cachedCount} fresh records (threshold: ${cacheThreshold.toISOString()})`);

    // Step 2: If fresh data exists, return from DB
    if (cachedCount > 0) {
      const cachedRates = await prisma.publicFundingRate.findMany({
        where: {
          exchange: 'MEXC',
          timestamp: {
            gte: cacheThreshold,
          },
        },
        orderBy: {
          symbol: 'asc',
        },
        distinct: ['symbol'], // Get latest record per symbol
      });

      console.log(`[MEXC Public] Returning ${cachedRates.length} rates from cache`);

      // Transform DB format to MEXC API format
      const transformedData = {
        success: true,
        code: 0,
        data: cachedRates.map(rate => ({
          symbol: rate.symbol.replace('/', '_'), // BTC/USDT → BTC_USDT
          fundingRate: rate.fundingRate,
          fundingInterval: `${rate.fundingInterval}h`,
          nextFundingTime: rate.nextFundingTime.getTime(),
        })),
      };

      return NextResponse.json(transformedData, {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          'X-Data-Source': 'database-cache',
        },
      });
    }

    // Step 3: No fresh data - fetch from MEXC API
    console.log('[MEXC Public] Cache miss - fetching from API...');

    const mexcUrl = 'https://futures.mexc.com/api/v1/contract/ticker';

    const response = await fetch(mexcUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MEXC Public Proxy] HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to fetch from MEXC', details: errorText },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    if (!rawData.success || rawData.code !== 0) {
      console.error('[MEXC Public Proxy] API returned error:', {
        code: rawData.code,
        success: rawData.success,
      });
    }

    // Enrich data with funding intervals and next funding time
    const nextFundingTime = calculateNextFundingTime();

    const enrichedData = {
      ...rawData,
      data: Array.isArray(rawData.data)
        ? rawData.data.map((ticker: any) => {
            // MEXC actual funding interval is 1h despite what their API says
            const fundingInterval = '1h';

            return {
              ...ticker,
              fundingInterval,
              nextFundingTime,
            };
          })
        : []
    };

    const customIntervals = enrichedData.data.filter((t: any) => t.fundingInterval !== '8h').length;
    console.log(`[MEXC Public] Successfully fetched ${enrichedData.data.length} tickers (${customIntervals} with non-8h intervals)`);

    // Step 4: Delete old MEXC records and insert new ones (atomic transaction)
    await prisma.$transaction(async (tx) => {
      // Delete old records for this exchange
      const deleted = await tx.publicFundingRate.deleteMany({
        where: {
          exchange: 'MEXC',
        },
      });
      console.log(`[MEXC Public] Deleted ${deleted.count} old MEXC records`);

      // Insert new records
      const createPromises = enrichedData.data.map((ticker: any) => {
        const symbol = ticker.symbol.replace('_', '/'); // BTC_USDT → BTC/USDT
        const fundingIntervalHours = 1; // MEXC is always 1h

        return tx.publicFundingRate.create({
          data: {
            symbol,
            exchange: 'MEXC',
            fundingRate: parseFloat(ticker.fundingRate || '0'),
            nextFundingTime: new Date(ticker.nextFundingTime),
            fundingInterval: fundingIntervalHours,
            markPrice: parseFloat(ticker.fairPrice || '0'),
            indexPrice: parseFloat(ticker.indexPrice || '0'),
            timestamp: now,
          },
        });
      });

      await Promise.all(createPromises);
    });

    console.log(`[MEXC Public] Saved ${enrichedData.data.length} rates to database`);

    // Step 5: Return with cache headers
    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Data-Source': 'api-fresh',
      },
    });
  } catch (error: any) {
    console.error('[MEXC Public Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
