import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/triangular-arbitrage/positions
 * List triangular arbitrage positions
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const exchange = searchParams.get('exchange');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {
      userId: userId,
    };
    if (status) where.status = status;
    if (exchange) where.exchange = exchange;

    // Fetch positions from database
    const positions = await prisma.triangularArbitragePosition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate summary statistics
    const completedPositions = positions.filter(
      (p) => p.status === 'COMPLETED'
    );
    const activePositions = positions.filter((p) =>
      ['EXECUTING_LEG1', 'EXECUTING_LEG2', 'EXECUTING_LEG3'].includes(p.status)
    );

    const totalProfit = completedPositions.reduce(
      (sum, p) => sum + (p.actualProfitAmount || 0),
      0
    );

    const avgProfitPercent =
      completedPositions.length > 0
        ? completedPositions.reduce(
            (sum, p) => sum + (p.actualProfitPercent || 0),
            0
          ) / completedPositions.length
        : 0;

    const successRate =
      positions.length > 0
        ? (completedPositions.length / positions.length) * 100
        : 0;

    // Transform for frontend to match TriangularPosition model
    const transformed = positions.map((pos) => {
      // Map database status to frontend PositionStatus
      const mapStatus = (dbStatus: string): string => {
        if (dbStatus === 'COMPLETED') return 'completed';
        if (dbStatus === 'ERROR' || dbStatus === 'FAILED') return 'failed';
        if (dbStatus === 'CANCELLED') return 'cancelled';
        if (['EXECUTING_LEG1', 'EXECUTING_LEG2', 'EXECUTING_LEG3'].includes(dbStatus)) return 'executing';
        return 'pending';
      };

      // Map leg status
      const getLegStatus = (filledQty: number, legNumber: number, currentStatus: string): string => {
        if (filledQty > 0) return 'completed';
        if (currentStatus === `EXECUTING_LEG${legNumber}`) return 'executing';
        if (currentStatus === 'ERROR') return 'error';
        return 'pending';
      };

      return {
        id: pos.positionId,
        opportunityId: pos.positionId, // Use same ID (no separate opportunity ID in schema)
        exchange: pos.exchange,
        triangle: {
          assetA: pos.baseAsset,
          assetB: pos.quoteAsset,
          assetC: pos.bridgeAsset,
          direction: 'forward' as const, // Inferred - always forward for now
        },
        config: {
          exchange: pos.exchange,
          minProfitPercentage: pos.minProfitAfterFeesPercent || 0.05,
          maxSlippage: pos.maxSlippagePercent,
          positionSize: pos.entryQuantity,
          autoExecute: false, // Not stored in position
        },
        status: mapStatus(pos.status),
        entryAmount: pos.entryQuantity,
        expectedProfit: pos.expectedProfitAmount,
        expectedProfitPercentage: pos.expectedProfitPercent,
        actualProfit: pos.actualProfitAmount || undefined,
        actualProfitPercentage: pos.actualProfitPercent || undefined,
        legs: [
          {
            legNumber: 1 as const,
            symbol: pos.leg1Symbol || '',
            side: pos.leg1Side?.toLowerCase() === 'buy' ? 'buy' : 'sell',
            status: getLegStatus(pos.leg1FilledQty, 1, pos.status),
            orderId: pos.leg1OrderId,
            targetQuantity: pos.leg1Quantity || 0,
            filledQuantity: pos.leg1FilledQty,
            averagePrice: pos.leg1AvgPrice,
            estimatedPrice: pos.leg1Price || 0,
            actualPrice: pos.leg1AvgPrice,
            slippage: pos.leg1Slippage,
            fee: pos.leg1Fees,
            startedAt: pos.status === 'EXECUTING_LEG1' && pos.executionStartedAt
              ? pos.executionStartedAt.getTime()
              : undefined,
            completedAt: pos.leg1ExecutedAt?.getTime(),
          },
          {
            legNumber: 2 as const,
            symbol: pos.leg2Symbol || '',
            side: pos.leg2Side?.toLowerCase() === 'buy' ? 'buy' : 'sell',
            status: getLegStatus(pos.leg2FilledQty, 2, pos.status),
            orderId: pos.leg2OrderId,
            targetQuantity: pos.leg2Quantity || 0,
            filledQuantity: pos.leg2FilledQty,
            averagePrice: pos.leg2AvgPrice,
            estimatedPrice: pos.leg2Price || 0,
            actualPrice: pos.leg2AvgPrice,
            slippage: pos.leg2Slippage,
            fee: pos.leg2Fees,
            startedAt: pos.status === 'EXECUTING_LEG2' && pos.leg1ExecutedAt
              ? pos.leg1ExecutedAt.getTime()
              : undefined,
            completedAt: pos.leg2ExecutedAt?.getTime(),
          },
          {
            legNumber: 3 as const,
            symbol: pos.leg3Symbol || '',
            side: pos.leg3Side?.toLowerCase() === 'buy' ? 'buy' : 'sell',
            status: getLegStatus(pos.leg3FilledQty, 3, pos.status),
            orderId: pos.leg3OrderId,
            targetQuantity: pos.leg3Quantity || 0,
            filledQuantity: pos.leg3FilledQty,
            averagePrice: pos.leg3AvgPrice,
            estimatedPrice: pos.leg3Price || 0,
            actualPrice: pos.leg3AvgPrice,
            slippage: pos.leg3Slippage,
            fee: pos.leg3Fees,
            startedAt: pos.status === 'EXECUTING_LEG3' && pos.leg2ExecutedAt
              ? pos.leg2ExecutedAt.getTime()
              : undefined,
            completedAt: pos.leg3ExecutedAt?.getTime(),
          },
        ],
        totalFees: pos.totalFees,
        totalSlippage: pos.totalSlippage || 0,
        createdAt: pos.createdAt.getTime(),
        startedAt: pos.executionStartedAt?.getTime(),
        completedAt: pos.executionCompletedAt?.getTime(),
        executionTimeMs: pos.totalExecutionTimeMs || undefined,
        error: pos.errorMessage || undefined,
      };
    });

    return NextResponse.json({
      positions: transformed,
      count: transformed.length,
      summary: {
        totalPositions: positions.length,
        activePositions: activePositions.length,
        completedPositions: completedPositions.length,
        totalProfit,
        avgProfitPercent,
        successRate,
      },
    });
  } catch (error: any) {
    console.error('[TriArb] Error fetching positions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}
