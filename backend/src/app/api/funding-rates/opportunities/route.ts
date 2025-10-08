import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { getArbitrageOpportunities } from '@/services/funding-rate.service';
import { Exchange } from '@prisma/client';

/**
 * GET /api/funding-rates/opportunities
 *
 * Get top funding rate arbitrage opportunities
 *
 * Query Parameters:
 * - exchange (optional): BYBIT, BINANCE (default: BYBIT)
 * - minRate (optional): Minimum annualized rate percentage (default: 10)
 * - limit (optional): Maximum number of results (default: 20)
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
    const exchangeParam = searchParams.get('exchange')?.toUpperCase() || 'BYBIT';
    const minRate = parseFloat(searchParams.get('minRate') || '10');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // 4. Get arbitrage opportunities
    console.log(`[FundingOpportunities] Fetching opportunities - exchange: ${exchange}, minRate: ${minRate}%, limit: ${limit}`);

    const opportunities = await getArbitrageOpportunities(exchange, minRate, limit);

    console.log(`[FundingOpportunities] Found ${opportunities.length} opportunities`);

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        data: opportunities,
        count: opportunities.length,
        filters: {
          exchange,
          minAnnualizedRate: minRate,
          limit
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingOpportunities] Error getting arbitrage opportunities:', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get arbitrage opportunities',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
