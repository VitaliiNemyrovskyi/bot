import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/funding-short-strategy/trades
 * Get trade history with pagination and filters
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const symbol = searchParams.get('symbol');
    const paperTrade = searchParams.get('paperTrade');

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (symbol) {
      where.symbol = symbol;
    }

    if (paperTrade !== null) {
      where.paperTrade = paperTrade === 'true';
    }

    // Get total count
    const totalCount = await prisma.fundingShortTrade.count({ where });

    // Get trades
    const trades = await prisma.fundingShortTrade.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Calculate summary statistics
    const completedTrades = await prisma.fundingShortTrade.findMany({
      where: {
        ...where,
        status: 'EXITED'
      }
    });

    const totalProfit = completedTrades.reduce((sum, t) => sum + (t.realizedPnL || 0), 0);
    const profitableTrades = completedTrades.filter(t => (t.realizedPnL || 0) > 0).length;
    const avgProfit = completedTrades.length > 0
      ? totalProfit / completedTrades.length
      : 0;

    return NextResponse.json({
      success: true,
      trades,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize)
      },
      summary: {
        totalTrades: completedTrades.length,
        profitableTrades,
        winRate: completedTrades.length > 0 ? (profitableTrades / completedTrades.length) * 100 : 0,
        totalProfit,
        avgProfit
      }
    });

  } catch (error: any) {
    console.error('Error getting trades:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get trades' },
      { status: 500 }
    );
  }
}
