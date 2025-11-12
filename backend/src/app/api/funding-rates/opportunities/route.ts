import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { getArbitrageOpportunities, ArbitrageOpportunity } from '@/services/funding-rate.service';
import { getFundingRateCollector } from '@/services/funding-rate-collector.service';

/**
 * GET /api/funding-rates/opportunities
 *
 * Get top funding rate arbitrage opportunities from all available exchanges.
 * The results are sorted by the absolute value of the funding rate in descending order.
 *
 * Query Parameters:
 * - limit (optional): Maximum number of results (default: 100)
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
    const limit = parseInt(searchParams.get('limit') || '100');

    // 3. Get all tracked exchanges
    const collector = getFundingRateCollector();
    // @ts-ignore - TRACKED_EXCHANGES is private, but we need it here for now.
    const exchanges = collector.TRACKED_EXCHANGES || [];

    // 4. Get arbitrage opportunities from all exchanges
    console.log(`[FundingOpportunities] Fetching opportunities from all exchanges, limit: ${limit}`);

    let allOpportunities: ArbitrageOpportunity[] = [];

    for (const exchange of exchanges) {
      try {
        // Fetch all opportunities from each exchange (minRate=0, high limit)
        const opportunities = await getArbitrageOpportunities(exchange, 0, 1000);
        // Add exchange info to each opportunity
        const opportunitiesWithExchange = opportunities.map(op => ({ ...op, exchange }));
        allOpportunities.push(...opportunitiesWithExchange);
      } catch (error: any) {
        console.warn(`[FundingOpportunities] Could not fetch opportunities for ${exchange}: ${error.message}`);
      }
    }

    // 5. Sort all opportunities by absolute funding rate
    allOpportunities.sort((a, b) => Math.abs(b.fundingRate) - Math.abs(a.fundingRate));

    // 6. Apply limit
    const limitedOpportunities = allOpportunities.slice(0, limit);

    console.log(`[FundingOpportunities] Found ${allOpportunities.length} total opportunities, returning ${limitedOpportunities.length}`);

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: limitedOpportunities,
        count: limitedOpportunities.length,
        filters: {
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
