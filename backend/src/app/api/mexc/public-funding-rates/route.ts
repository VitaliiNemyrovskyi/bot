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
 * DEPRECATED: Do NOT use this function!
 *
 * MEXC funding intervals vary by SYMBOL and can change over time:
 * - Some symbols: 1h (every hour)
 * - Some symbols: 4h (every 4 hours)
 * - Some symbols: 8h (every 8 hours)
 *
 * Always get nextSettleTime and collectCycle from MEXC API per symbol.
 * This function is kept only for backward compatibility but should NOT be used.
 */
function calculateNextFundingTime_DEPRECATED_DO_NOT_USE(): number {
  throw new Error('calculateNextFundingTime is deprecated - use MEXC API nextSettleTime instead');
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

    // IMPORTANT: MEXC ticker API does NOT provide nextSettleTime or collectCycle
    // We need to fetch individual funding rates to get accurate data
    // For now, use ticker data but mark interval as unknown

    console.log(`[MEXC Public] WARNING: Using ticker data without accurate nextFundingTime and collectCycle`);
    console.log(`[MEXC Public] For accurate data, use individual symbol API: /api/v1/contract/funding_rate/{symbol}`);

    const enrichedData = {
      ...rawData,
      data: Array.isArray(rawData.data)
        ? rawData.data.map((ticker: any) => {
            // We DON'T know the actual interval from ticker API
            // Mark as unknown so consumers know this is unreliable
            const fundingInterval = 'unknown';

            // Set nextFundingTime to 0 to indicate it's not available from this endpoint
            const nextFundingTime = 0;

            return {
              ...ticker,
              fundingInterval,
              nextFundingTime,
            };
          })
        : []
    };

    console.log(`[MEXC Public] Successfully fetched ${enrichedData.data.length} tickers (intervals UNKNOWN - use individual API for accuracy)`);

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
        // Set interval to 0 to indicate unknown (will be updated by individual API calls)
        const fundingIntervalHours = 0;

        return tx.publicFundingRate.create({
          data: {
            symbol,
            exchange: 'MEXC',
            fundingRate: parseFloat(ticker.fundingRate || '0'),
            nextFundingTime: new Date(0), // Set to epoch to indicate unknown
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
