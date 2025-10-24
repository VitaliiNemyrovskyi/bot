import { NextRequest, NextResponse } from 'next/server';

/**
 * Public Binance Funding Rates Proxy
 *
 * Proxies requests to Binance public API to bypass CORS restrictions.
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/binance/public-funding-rates
 */
export async function GET(request: NextRequest) {
  try {
    const binanceUrl = 'https://fapi.binance.com/fapi/v1/premiumIndex';

    console.log('[Binance Public Proxy] Fetching funding rates...');

    const response = await fetch(binanceUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Binance Public Proxy] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch Binance funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[Binance Public Proxy] Successfully fetched funding rates`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error: any) {
    console.error('[Binance Public Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
