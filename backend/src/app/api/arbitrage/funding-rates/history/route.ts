import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrage/funding-rates/history
 *
 * Fetches historical funding rates for spread stability analysis (Phase 2)
 * Currently supports Bybit with planned BingX/MEXC support
 *
 * Query Parameters:
 * - symbol: Trading symbol (e.g., BTCUSDT)
 * - exchange: Exchange name (BYBIT, BINGX, MEXC)
 * - days: Number of days (7 or 30)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     { "timestamp": 1234567890000, "fundingRate": 0.0001 },
 *     ...
 *   ],
 *   "metadata": { "symbol": "BTCUSDT", "exchange": "BYBIT", "count": 21 }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const exchange = searchParams.get('exchange')?.toUpperCase();
    const days = parseInt(searchParams.get('days') || '7');

    if (!symbol || !exchange) {
      return NextResponse.json(
        { success: false, error: 'symbol and exchange are required' },
        { status: 400 }
      );
    }

    console.log(`[Funding History] Fetching ${exchange} ${symbol} for ${days} days`);

    // Calculate date range
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);

    let fundingRates: Array<{ timestamp: number; fundingRate: number }> = [];

    // Fetch based on exchange
    switch (exchange) {
      case 'BYBIT':
        fundingRates = await fetchBybitFundingHistory(symbol, startTime, endTime);
        break;

      case 'BINGX':
      case 'MEXC':
        // TODO: Implement when historical APIs are available
        // For now, return empty array with message
        console.warn(`[Funding History] ${exchange} historical funding rates not yet supported`);
        return NextResponse.json({
          success: true,
          data: [],
          metadata: {
            symbol,
            exchange,
            count: 0,
            message: `${exchange} historical data collection in progress. Please check back later.`
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: `Exchange ${exchange} not supported` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: fundingRates,
      metadata: {
        symbol,
        exchange,
        days,
        count: fundingRates.length,
        startTime,
        endTime
      }
    });

  } catch (error: any) {
    console.error('[Funding History] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch funding rate history', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Fetch Bybit historical funding rates
 * API: GET /v5/market/history-fund-rate
 */
async function fetchBybitFundingHistory(
  symbol: string,
  startTime: number,
  endTime: number
): Promise<Array<{ timestamp: number; fundingRate: number }>> {
  try {
    const results: Array<{ timestamp: number; fundingRate: number }> = [];
    let currentStartTime = startTime;

    // Bybit limits to 200 records per request, fetch in batches if needed
    while (currentStartTime < endTime) {
      const url = `https://api.bybit.com/v5/market/history-fund-rate?category=linear&symbol=${symbol}&startTime=${currentStartTime}&endTime=${endTime}&limit=200`;

      console.log(`[Bybit Funding History] Fetching batch from ${new Date(currentStartTime).toISOString()}`);

      const response = await fetch(url);
      const data = await response.json();

      if (data.retCode !== 0) {
        throw new Error(`Bybit API error: ${data.retMsg}`);
      }

      const list = data.result?.list || [];

      if (list.length === 0) {
        break; // No more data
      }

      // Convert and add to results
      for (const item of list) {
        results.push({
          timestamp: parseInt(item.fundingRateTimestamp),
          fundingRate: parseFloat(item.fundingRate)
        });
      }

      // Update startTime for next batch (last item timestamp + 1ms)
      const lastTimestamp = parseInt(list[list.length - 1].fundingRateTimestamp);
      currentStartTime = lastTimestamp + 1;

      console.log(`[Bybit Funding History] Fetched ${list.length} records, total: ${results.length}`);

      // Safety break to avoid infinite loop
      if (list.length < 200) {
        break;
      }
    }

    // Sort by timestamp ascending (oldest first)
    results.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[Bybit Funding History] Total records: ${results.length}`);
    return results;

  } catch (error) {
    console.error('[Bybit Funding History] Error:', error);
    throw error;
  }
}
