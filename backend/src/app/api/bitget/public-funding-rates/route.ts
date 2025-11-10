import { NextRequest, NextResponse } from 'next/server';

// Use Node.js runtime instead of Edge runtime for fetch compatibility
export const runtime = 'nodejs';

/**
 * Normalize symbol by removing separators and suffixes
 * Examples: BTC-USDT-SWAP → BTCUSDT, BTC/USDT → BTCUSDT, BTC_USDT_PERP → BTCUSDT
 */
function normalizeSymbol(symbol: string): string {
  // Remove separators
  let normalized = symbol.replace(/[-_/:]/g, '');
  // Remove suffixes
  normalized = normalized.replace(/(SWAP|PERP|PERPETUAL|FUTURES?)$/i, '');
  return normalized;
}

/**
 * Public Bitget Funding Rates Proxy
 *
 * Proxies requests to Bitget public API to bypass CORS restrictions.
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/bitget/public-funding-rates
 */
export async function GET(_request: NextRequest) {
  try {
    // Bitget requires productType parameter - we'll fetch USDT perpetuals
    const bitgetUrl = 'https://api.bitget.com/api/v2/mix/market/current-fund-rate?productType=USDT-FUTURES';

    console.log('[Bitget] Fetching funding rates from:', bitgetUrl);

    const response = await fetch(bitgetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
      // Add signal with timeout
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('[Bitget] Response status:', response.status);

    if (!response.ok) {
      console.error('[Bitget] Request failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch Bitget funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Bitget] Successfully fetched', data?.data?.length || 0, 'rates');

    // Transform to unified format
    const unifiedData = {
      code: '0',
      msg: '',
      data: (data?.data || []).map((item: any) => ({
        symbol: normalizeSymbol(item.symbol),
        fundingRate: item.fundingRate || '0',
        nextFundingTime: (item.nextFundingTime || '0').toString(),
        fundingInterval: item.fundingRateInterval || 0,
        last: item.lastPr || item.last || '0',
        markPx: item.markPrice || item.markPr || '0',
        idxPx: item.indexPrice || item.indexPr || '0',
      })),
    };

    return NextResponse.json(unifiedData, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error: any) {
    console.error('[Bitget] Error:', error);
    console.error('[Bitget] Error stack:', error.stack);
    console.error('[Bitget] Error cause:', error.cause);

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        cause: error.cause?.message || 'Unknown cause',
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}
