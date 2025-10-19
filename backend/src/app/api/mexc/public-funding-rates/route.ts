import { NextRequest, NextResponse } from 'next/server';

/**
 * MEXC Public Funding Rates Proxy
 *
 * Proxies requests to MEXC public API to bypass CORS restrictions
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

    const data = await response.json();

    if (!data.success || data.code !== 0) {
      console.error('[MEXC Public Proxy] API returned error:', {
        code: data.code,
        success: data.success,
      });
    } else {
      const tickerCount = Array.isArray(data.data) ? data.data.length : 0;
      console.log(`[MEXC Public Proxy] Successfully fetched ${tickerCount} tickers`);
    }

    // Return with cache headers (30 seconds)
    return NextResponse.json(data, {
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
