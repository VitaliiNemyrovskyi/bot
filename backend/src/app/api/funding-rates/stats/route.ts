import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { getFundingRateStats } from '@/services/funding-rate.service';
import { Exchange } from '@prisma/client';

/**
 * GET /api/funding-rates/stats
 *
 * Get funding rate statistics for a specific symbol
 *
 * Query Parameters:
 * - exchange (required): BYBIT, BINANCE, etc.
 * - symbol (required): Trading pair (e.g., BTCUSDT)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // 2. Get query parameters
    const { searchParams } = new URL(request.url);
    const exchangeParam = searchParams.get('exchange')?.toUpperCase();
    const symbol = searchParams.get('symbol');

    if (!exchangeParam || !symbol) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
          message: 'Both exchange and symbol parameters are required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 3. Validate exchange
    const exchange = exchangeParam as Exchange;
    if (!['BYBIT', 'BINANCE'].includes(exchange)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid exchange',
          message: 'Supported exchanges: BYBIT, BINANCE',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 4. Get funding rate stats
    const stats = await getFundingRateStats(exchange, symbol);

    if (!stats) {
      return NextResponse.json(
        {
          success: false,
          error: 'No data found',
          message: `No funding rate data found for ${symbol} on ${exchange}`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingStats] Error getting funding rate stats:', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get funding rate stats',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
