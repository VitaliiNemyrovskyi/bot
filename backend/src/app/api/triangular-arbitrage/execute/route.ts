import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { triangularArbitrageExecutionService } from '@/services/triangular-arbitrage-execution.service';
import prisma from '@/lib/prisma';
import { OpportunityDetectionService } from '@/services/triangular-arbitrage-opportunity.service';
import { TriangularArbitrageCalculator } from '@/lib/triangular-arbitrage-calculator';

/**
 * POST /api/triangular-arbitrage/execute
 * Execute a triangular arbitrage opportunity
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.userId;

    const body = await request.json();
    const {
      opportunityId,
      positionSize: requestedPositionSize,
      maxSlippage = 0.1,
      dryRun = false,
    } = body;

    // Validate required fields
    if (!opportunityId) {
      return NextResponse.json(
        { error: 'Opportunity ID is required' },
        { status: 400 }
      );
    }

    // Get opportunity from database
    const opportunity = await prisma.triangularArbitrageOpportunity.findUnique({
      where: { id: opportunityId },
    });

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Use requested position size, or fall back to opportunity's position size
    const positionSize = requestedPositionSize || opportunity.entryQuantity || 100;
    const maxSlippagePercent = maxSlippage;

    // Get scanner instance to access current market prices
    const scanner = OpportunityDetectionService.getInstance(userId, opportunity.exchange);

    if (!scanner || !scanner.isRunning) {
      return NextResponse.json(
        { error: 'Scanner is not running for this exchange. Please start the scanner first.' },
        { status: 400 }
      );
    }

    // Get current prices from scanner's market data manager
    const marketDataManager = scanner.getMarketDataManager();
    const price1 = marketDataManager.getPrice(opportunity.symbol1);
    const price2 = marketDataManager.getPrice(opportunity.symbol2);
    const price3 = marketDataManager.getPrice(opportunity.symbol3);

    if (!price1 || !price2 || !price3) {
      return NextResponse.json(
        { error: `Current prices not available for symbols: ${!price1 ? opportunity.symbol1 : ''} ${!price2 ? opportunity.symbol2 : ''} ${!price3 ? opportunity.symbol3 : ''}`.trim() },
        { status: 400 }
      );
    }

    // Recalculate profit with current prices
    const result = TriangularArbitrageCalculator.calculateOptimalProfit(
      positionSize,
      {
        symbol1: opportunity.symbol1,
        symbol2: opportunity.symbol2,
        symbol3: opportunity.symbol3,
        price1,
        price2,
        price3,
      },
      {
        baseAsset: opportunity.baseAsset,
        quoteAsset: opportunity.quoteAsset,
        bridgeAsset: opportunity.bridgeAsset,
        makerFeeRate: 0.0001,
        takerFeeRate: 0.0006,
      }
    );

    if (!result || result.profitPercent <= 0) {
      return NextResponse.json(
        { error: 'Opportunity is no longer profitable' },
        { status: 400 }
      );
    }

    if (dryRun) {
      // Just return estimated results without executing
      return NextResponse.json({
        success: true,
        dryRun: true,
        estimatedProfit: {
          amount: result.profitAmount,
          percent: result.profitPercent,
        },
        legs: result.legs.map((leg, i) => ({
          leg: i + 1,
          symbol: leg.symbol,
          side: leg.side,
          quantity: leg.inputAmount,
          estimatedPrice: leg.inputAmount / leg.outputAmount,
        })),
        message: 'Dry run completed',
      });
    }

    // Execute the opportunity
    // Note: We need to get credentialId from somewhere (from scanner config or user's active credentials)
    const credentials = await prisma.exchangeCredentials.findFirst({
      where: {
        userId: userId,
        exchange: opportunity.exchange,
        isActive: true,
      },
    });

    if (!credentials) {
      return NextResponse.json(
        { error: 'No active credentials found for this exchange' },
        { status: 400 }
      );
    }

    // Get connector from scanner for reuse (to avoid API timeout)
    const connector = scanner.getConnector();

    const executionResult = await triangularArbitrageExecutionService.executeOpportunity(
      opportunityId,
      result,
      {
        userId: userId,
        credentialId: credentials.id,
        exchange: opportunity.exchange,
        positionSize,
        maxSlippagePercent,
        executionTimeoutMs: 5000,
        connector, // Reuse scanner's connector to avoid initialization timeout
      }
    );

    return NextResponse.json(executionResult);
  } catch (error: any) {
    console.error('[TriArb] Error executing opportunity:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute opportunity' },
      { status: 500 }
    );
  }
}
