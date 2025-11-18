import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingShortStrategyService } from '@/services/funding-short-strategy.service';
import prisma from '@/lib/prisma';

/**
 * GET /api/funding-short-strategy/status
 * Get current strategy status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get strategy configuration
    const config = fundingShortStrategyService.getConfig();

    // Get active trades
    const activeTrades = fundingShortStrategyService.getActiveTrades();

    // Get statistics
    const statistics = await fundingShortStrategyService.getTradeStatistics();

    // Get recent trades from database
    const recentTrades = await prisma.fundingShortTrade.findMany({
      where: {
        status: 'EXITED'
      },
      orderBy: {
        exitTime: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      config,
      activeTrades,
      statistics,
      recentTrades
    });

  } catch (error: any) {
    console.error('Error getting strategy status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get strategy status' },
      { status: 500 }
    );
  }
}
