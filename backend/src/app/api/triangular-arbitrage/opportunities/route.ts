import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/triangular-arbitrage/opportunities
 * List detected triangular arbitrage opportunities
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const exchange = searchParams.get('exchange');
    const minProfit = searchParams.get('minProfit');
    const wasExecuted = searchParams.get('wasExecuted');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause - only return NON-EXPIRED opportunities
    const where: any = {
      expiresAt: { gt: new Date() }, // Only opportunities that haven't expired yet
    };
    if (exchange) where.exchange = exchange;
    if (minProfit) where.profitAfterFees = { gte: parseFloat(minProfit) };
    if (wasExecuted !== null) {
      where.wasExecuted = wasExecuted === 'true';
    }

    // Fetch opportunities from database
    const opportunities = await prisma.triangularArbitrageOpportunity.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      take: limit,
    });

    // Transform for frontend - match TriangularOpportunity model
    const transformed = opportunities.map((opp) => ({
      id: opp.id,
      exchange: opp.exchange,

      // Triangle path - map database fields to frontend model
      triangle: {
        assetA: opp.baseAsset,
        assetB: opp.bridgeAsset,
        assetC: opp.quoteAsset,
        direction: 'forward' as const, // TODO: Calculate actual direction from trade flow
      },

      // Price information for each leg
      leg1: {
        symbol: opp.symbol1,
        bidPrice: opp.price1,
        askPrice: opp.price1,
        lastPrice: opp.price1,
        timestamp: opp.detectedAt.getTime(),
      },
      leg2: {
        symbol: opp.symbol2,
        bidPrice: opp.price2,
        askPrice: opp.price2,
        lastPrice: opp.price2,
        timestamp: opp.detectedAt.getTime(),
      },
      leg3: {
        symbol: opp.symbol3,
        bidPrice: opp.price3,
        askPrice: opp.price3,
        lastPrice: opp.price3,
        timestamp: opp.detectedAt.getTime(),
      },

      // Profitability metrics (flat structure)
      // profitAfterFees is stored as percentage (e.g., 0.1 = 0.1%)
      profitPercentage: Math.min(Math.abs(opp.profitAfterFees), 100), // Cap at 100% and take absolute value
      profitAmount: Math.min(Math.abs(opp.profitAfterFees), 100), // Same as percentage for $100 position
      estimatedSlippage: 0.1,
      netProfitPercentage: Math.min(Math.abs(opp.profitAfterFees), 100),

      // Metadata
      detectedAt: opp.detectedAt.getTime(), // Convert to timestamp number
      expiresAt: opp.expiresAt.getTime(),
      volume24h: undefined,

      // Execution readiness
      isExecutable: !opp.wasExecuted && opp.profitAfterFees > 0.001,
      warningMessage: opp.wasExecuted ? 'Already executed' : undefined,
    }));

    return NextResponse.json({
      opportunities: transformed,
      count: transformed.length,
    });
  } catch (error: any) {
    console.error('[TriArb] Error fetching opportunities:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}
