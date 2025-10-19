import { NextRequest, NextResponse } from 'next/server';

/**
 * Public Gate.io Funding Rates Proxy
 *
 * Proxies requests to Gate.io public API to bypass CORS restrictions.
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/gateio/public-funding-rates
 */
export async function GET(request: NextRequest) {
  try {
    // Get all funding rates for USDT perpetual futures contracts
    const gateioUrl = 'https://api.gateio.ws/api/v4/futures/usdt/contracts';

    console.log('[Gate.io Public Proxy] Fetching funding rates...');

    const response = await fetch(gateioUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Gate.io Public Proxy] API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch Gate.io funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`[Gate.io Public Proxy] Successfully fetched ${data?.length || 0} funding rates`);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error: any) {
    console.error('[Gate.io Public Proxy] Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
