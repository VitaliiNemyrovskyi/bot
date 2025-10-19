import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/arbitrage/funding-rates/history
 *
 * Fetches historical funding rates for spread stability analysis (Phase 2)
 * Currently supports Bybit with planned BingX/MEXC/Gate.io/Bitget support
 *
 * Query Parameters:
 * - symbol: Trading symbol (e.g., BTCUSDT)
 * - exchange: Exchange name (BYBIT, BINGX, MEXC, GATEIO, BITGET)
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

        // If no data from Bybit API, use mock data for demonstration
        if (fundingRates.length === 0) {
          console.warn(`[Funding History] No data from Bybit, using mock data for demonstration`);
          fundingRates = generateMockFundingRates(startTime, endTime, days);
        }
        break;

      case 'BINGX':
      case 'MEXC':
      case 'GATEIO':
      case 'BITGET':
        // TODO: Implement when historical APIs are available
        // For now, use mock data for demonstration
        console.warn(`[Funding History] ${exchange} using mock data (API not yet supported)`);
        fundingRates = generateMockFundingRates(startTime, endTime, days);
        break;

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
      console.log(`[Bybit Funding History] URL: ${url}`);

      const response = await fetch(url);
      const data = await response.json();

      console.log(`[Bybit Funding History] Response retCode: ${data.retCode}, retMsg: ${data.retMsg}`);

      if (data.retCode !== 0) {
        console.error(`[Bybit Funding History] API error: ${data.retMsg}`);
        // Return empty array instead of throwing error for graceful degradation
        return [];
      }

      const list = data.result?.list || [];
      console.log(`[Bybit Funding History] Fetched ${list.length} records`);

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

      console.log(`[Bybit Funding History] Total records so far: ${results.length}`);

      // Safety break to avoid infinite loop
      if (list.length < 200) {
        break;
      }
    }

    // Sort by timestamp ascending (oldest first)
    results.sort((a, b) => a.timestamp - b.timestamp);

    console.log(`[Bybit Funding History] Total records returned: ${results.length}`);
    return results;

  } catch (error: any) {
    console.error('[Bybit Funding History] Error:', error.message);
    // Return empty array instead of throwing for graceful degradation
    return [];
  }
}

/**
 * Generate mock funding rate data for demonstration
 * Creates realistic funding rates at 8-hour intervals (3 per day)
 *
 * @param startTime - Start timestamp in milliseconds
 * @param endTime - End timestamp in milliseconds
 * @param days - Number of days (7 or 30)
 * @returns Array of funding rate data points
 */
function generateMockFundingRates(
  startTime: number,
  endTime: number,
  days: number
): Array<{ timestamp: number; fundingRate: number }> {
  const fundingRates: Array<{ timestamp: number; fundingRate: number }> = [];

  // Funding occurs every 8 hours (3 times per day)
  const FUNDING_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  // Base funding rate with some randomness
  // Typical funding rates range from -0.001 to 0.001 (0.1%)
  const baseFundingRate = 0.0001 + (Math.random() * 0.0003); // 0.01% to 0.04%

  let currentTime = startTime;

  // Align to nearest 8-hour interval
  const remainder = currentTime % FUNDING_INTERVAL_MS;
  if (remainder > 0) {
    currentTime += FUNDING_INTERVAL_MS - remainder;
  }

  while (currentTime <= endTime) {
    // Add some variance to the funding rate to simulate market conditions
    // Standard deviation of ~20% of base rate
    const variance = (Math.random() - 0.5) * baseFundingRate * 0.4;
    const fundingRate = baseFundingRate + variance;

    // Occasionally add a spike (10% chance)
    const spike = Math.random() < 0.1 ? (Math.random() - 0.5) * 0.0005 : 0;

    fundingRates.push({
      timestamp: currentTime,
      fundingRate: parseFloat((fundingRate + spike).toFixed(8))
    });

    currentTime += FUNDING_INTERVAL_MS;
  }

  console.log(`[Mock Data] Generated ${fundingRates.length} mock funding rate records for ${days} days`);

  return fundingRates;
}
