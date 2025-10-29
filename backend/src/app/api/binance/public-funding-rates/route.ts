import { NextRequest, NextResponse } from 'next/server';

/**
 * Public Binance Funding Rates Proxy with Funding Intervals
 *
 * Proxies requests to Binance public API to bypass CORS restrictions.
 * Fetches both funding rates AND funding intervals from Binance API.
 * NO AUTHENTICATION REQUIRED - this is public data.
 *
 * GET /api/binance/public-funding-rates
 *
 * Binance API endpoints used:
 * - /fapi/v1/premiumIndex - Mark price and funding rate
 * - /fapi/v1/fundingInfo - Funding interval hours (1h, 4h, 8h)
 */
export async function GET(request: NextRequest) {
  try {

    // Fetch both endpoints in parallel
    const [premiumResponse, fundingInfoResponse] = await Promise.all([
      fetch('https://fapi.binance.com/fapi/v1/premiumIndex', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
      fetch('https://fapi.binance.com/fapi/v1/fundingInfo', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }),
    ]);

    if (!premiumResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Binance funding rates', details: premiumResponse.statusText },
        { status: premiumResponse.status }
      );
    }

    if (!fundingInfoResponse.ok) {
      // Continue without intervals if fundingInfo fails
    }

    const premiumData = await premiumResponse.json();
    const fundingInfoData = fundingInfoResponse.ok ? await fundingInfoResponse.json() : [];

    // Create map: symbol -> fundingIntervalHours
    const intervalMap = new Map<string, number>();
    for (const info of fundingInfoData) {
      if (info.symbol && info.fundingIntervalHours) {
        intervalMap.set(info.symbol, info.fundingIntervalHours);
      }
    }

    // Enrich premium data with funding intervals
    const enrichedData = premiumData.map((premium: any) => ({
      ...premium,
      fundingInterval: intervalMap.has(premium.symbol)
        ? `${intervalMap.get(premium.symbol)}h`
        : '8h', // Default to 8h
    }));


    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': 'public, max-age=30',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
