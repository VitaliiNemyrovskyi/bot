import { NextRequest, NextResponse } from 'next/server';

/**
 * Public BingX Funding Rates Proxy
 *
 * Proxies requests to BingX public API to bypass CORS restrictions.
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/bingx/public-funding-rates
 */
export async function GET(request: NextRequest) {
  try {
    const bingxUrl = 'https://open-api.bingx.com/openApi/swap/v2/quote/premiumIndex';

    console.log('[BingX Public Proxy] Fetching funding rates...');

    const response = await fetch(bingxUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[BingX Public Proxy] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch BingX funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[BingX Public Proxy] Successfully fetched ${data?.data?.length || 0} funding rates`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error: any) {
    console.error('[BingX Public Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
