import { NextRequest, NextResponse } from 'next/server';

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


    const response = await fetch(bitgetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Bitget funding rates', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();


    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
