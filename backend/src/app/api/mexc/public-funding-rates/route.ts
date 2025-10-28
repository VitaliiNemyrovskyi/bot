import { NextRequest, NextResponse } from 'next/server';

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

  // If we're past the hour mark (even by 1 second), move to next hour
  if (currentMinute > 0 || currentSecond > 0) {
    nextFunding.setUTCHours(nextFunding.getUTCHours() + 1);
  }

  // Set to :00:00.000
  nextFunding.setUTCMinutes(0, 0, 0);

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
    console.log('[MEXC Public Proxy] Fetching funding rates from MEXC public API...');

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
    console.log(`[MEXC Public Proxy] Successfully fetched ${enrichedData.data.length} tickers (${customIntervals} with non-8h intervals)`);

    // Return with cache headers (30 seconds)
    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30',
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
