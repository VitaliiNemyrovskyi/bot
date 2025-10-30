import { NextRequest, NextResponse } from 'next/server';
import { MEXCService } from '@/lib/mexc';

/**
 * MEXC Funding Rate for Single Symbol
 *
 * Returns funding rate with accurate nextSettleTime and collectCycle from MEXC API
 *
 * Endpoint: GET /api/mexc/funding-rate/:symbol
 * Example: GET /api/mexc/funding-rate/SHELL_USDT
 *
 * Response: {
 *   symbol: "SHELL_USDT",
 *   fundingRate: -0.00942,
 *   nextSettleTime: 1761724800000,  // timestamp in ms
 *   collectCycle: 4,                  // hours
 *   fundingInterval: "4h"
 * }
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    console.log(`[MEXC Single Funding Rate] Fetching for ${symbol}...`);

    // Create MEXC service instance (no auth needed for public endpoint)
    const mexcService = new MEXCService({
      apiKey: '',
      apiSecret: '',
      enableRateLimit: true,
    });

    // Fetch funding rate data from MEXC API
    const fundingData = await mexcService.getFundingRate(symbol);

    console.log(`[MEXC Single Funding Rate] ${symbol}:`, {
      fundingRate: fundingData.fundingRate,
      nextSettleTime: fundingData.nextSettleTime,
      collectCycle: fundingData.collectCycle,
    });

    // Return formatted response
    return NextResponse.json({
      symbol: fundingData.symbol,
      fundingRate: fundingData.fundingRate,
      nextSettleTime: fundingData.nextSettleTime,
      collectCycle: fundingData.collectCycle,
      fundingInterval: fundingData.collectCycle ? `${fundingData.collectCycle}h` : '8h',
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[MEXC Single Funding Rate] Error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch funding rate', details: errorMessage },
      { status: 500 }
    );
  }
}
