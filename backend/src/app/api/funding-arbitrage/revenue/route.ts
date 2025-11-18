import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * GET /api/funding-arbitrage/revenue
 *
 * Comprehensive revenue statistics and reporting for funding arbitrage deals
 *
 * Query parameters (all optional):
 * - startDate: ISO date string (default: 30 days ago)
 * - endDate: ISO date string (default: now)
 * - exchange: Filter by primary exchange (e.g., "BYBIT")
 * - symbol: Filter by symbol (e.g., "BTCUSDT")
 *
 * Response includes:
 * - summary: Overall statistics and metrics
 * - bySymbol: Revenue grouped by trading symbol
 * - byExchange: Revenue grouped by exchange
 * - deals: Individual completed deals with full details
 * - timeline: Daily revenue aggregation
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
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);

    // Date range (default: last 30 days)
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);

    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : defaultStartDate;

    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date();

    // Filters
    const exchange = searchParams.get('exchange');
    const symbol = searchParams.get('symbol');

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format',
          message: 'startDate and endDate must be valid ISO date strings',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date range',
          message: 'startDate must be before endDate',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Build query filters
    const whereClause: any = {
      userId,
      status: 'COMPLETED',
      closedAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (exchange) {
      whereClause.primaryExchange = {
        contains: exchange,
        mode: 'insensitive',
      };
    }

    if (symbol) {
      whereClause.symbol = symbol;
    }

    // 4. Fetch all completed deals
    const deals = await prisma.fundingArbitrageSubscription.findMany({
      where: whereClause,
      orderBy: {
        closedAt: 'desc',
      },
      select: {
        id: true,
        symbol: true,
        primaryExchange: true,
        hedgeExchange: true,
        fundingRate: true,
        positionType: true,
        quantity: true,
        entryPrice: true,
        hedgeEntryPrice: true,
        primaryExitPrice: true,
        hedgeExitPrice: true,
        fundingEarned: true,
        realizedPnl: true,
        primaryTradingFees: true,
        hedgeTradingFees: true,
        executedAt: true,
        closedAt: true,
      },
    });

    // 5. Calculate summary statistics
    const totalDeals = deals.length;
    const totalRevenue = deals.reduce((sum, deal) => sum + (deal.realizedPnl || 0), 0);
    const totalFundingEarned = deals.reduce((sum, deal) => sum + (deal.fundingEarned || 0), 0);
    const totalTradingPnl = totalRevenue - totalFundingEarned;
    const avgRevenuePerDeal = totalDeals > 0 ? totalRevenue / totalDeals : 0;

    const profitableDeals = deals.filter(deal => (deal.realizedPnl || 0) > 0).length;
    const losingDeals = deals.filter(deal => (deal.realizedPnl || 0) < 0).length;
    const winRate = totalDeals > 0 ? (profitableDeals / totalDeals) * 100 : 0;

    // Find best and worst deals
    let bestDeal = null;
    let worstDeal = null;

    if (deals.length > 0) {
      const sortedByPnl = [...deals].sort((a, b) => (b.realizedPnl || 0) - (a.realizedPnl || 0));
      const best = sortedByPnl[0];
      const worst = sortedByPnl[sortedByPnl.length - 1];

      if (best) {
        bestDeal = {
          symbol: best.symbol,
          revenue: best.realizedPnl || 0,
          date: best.closedAt?.toISOString() || null,
        };
      }

      if (worst) {
        worstDeal = {
          symbol: worst.symbol,
          revenue: worst.realizedPnl || 0,
          date: worst.closedAt?.toISOString() || null,
        };
      }
    }

    const summary = {
      totalDeals,
      totalRevenue,
      totalFundingEarned,
      totalTradingPnl,
      avgRevenuePerDeal,
      winRate,
      profitableDeals,
      losingDeals,
      bestDeal,
      worstDeal,
    };

    // 6. Group by symbol
    const bySymbolMap = new Map<string, {
      deals: number;
      revenue: number;
      fundingEarned: number;
    }>();

    deals.forEach(deal => {
      const existing = bySymbolMap.get(deal.symbol) || {
        deals: 0,
        revenue: 0,
        fundingEarned: 0,
      };

      bySymbolMap.set(deal.symbol, {
        deals: existing.deals + 1,
        revenue: existing.revenue + (deal.realizedPnl || 0),
        fundingEarned: existing.fundingEarned + (deal.fundingEarned || 0),
      });
    });

    const bySymbol = Array.from(bySymbolMap.entries())
      .map(([symbol, data]) => ({
        symbol,
        deals: data.deals,
        revenue: data.revenue,
        avgRevenue: data.revenue / data.deals,
        fundingEarned: data.fundingEarned,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 7. Group by exchange
    const byExchangeMap = new Map<string, {
      deals: number;
      revenue: number;
    }>();

    deals.forEach(deal => {
      const existing = byExchangeMap.get(deal.primaryExchange) || {
        deals: 0,
        revenue: 0,
      };

      byExchangeMap.set(deal.primaryExchange, {
        deals: existing.deals + 1,
        revenue: existing.revenue + (deal.realizedPnl || 0),
      });
    });

    const byExchange = Array.from(byExchangeMap.entries())
      .map(([exchange, data]) => ({
        exchange,
        deals: data.deals,
        revenue: data.revenue,
        avgRevenue: data.revenue / data.deals,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 8. Create daily timeline
    const timelineMap = new Map<string, {
      deals: number;
      revenue: number;
      fundingEarned: number;
    }>();

    deals.forEach(deal => {
      if (!deal.closedAt) return;

      const dateKey = deal.closedAt.toISOString().split('T')[0] ?? ''; // YYYY-MM-DD
      const existing = timelineMap.get(dateKey) || {
        deals: 0,
        revenue: 0,
        fundingEarned: 0,
      };

      timelineMap.set(dateKey, {
        deals: existing.deals + 1,
        revenue: existing.revenue + (deal.realizedPnl || 0),
        fundingEarned: existing.fundingEarned + (deal.fundingEarned || 0),
      });
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        deals: data.deals,
        revenue: data.revenue,
        fundingEarned: data.fundingEarned,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 9. Format deals for response
    const formattedDeals = deals.map(deal => {
      const duration = deal.executedAt && deal.closedAt
        ? (deal.closedAt.getTime() - deal.executedAt.getTime()) / 1000 // in seconds
        : null;

      return {
        id: deal.id,
        symbol: deal.symbol,
        primaryExchange: deal.primaryExchange,
        hedgeExchange: deal.hedgeExchange,
        fundingRate: deal.fundingRate,
        positionType: deal.positionType,
        quantity: deal.quantity,
        entryPrice: deal.entryPrice,
        hedgeEntryPrice: deal.hedgeEntryPrice,
        primaryExitPrice: deal.primaryExitPrice,
        hedgeExitPrice: deal.hedgeExitPrice,
        fundingEarned: deal.fundingEarned,
        realizedPnl: deal.realizedPnl,
        primaryTradingFees: deal.primaryTradingFees,
        hedgeTradingFees: deal.hedgeTradingFees,
        executedAt: deal.executedAt?.toISOString() || null,
        closedAt: deal.closedAt?.toISOString() || null,
        duration,
      };
    });

    // 10. Return comprehensive response
    return NextResponse.json(
      {
        success: true,
        data: {
          summary,
          bySymbol,
          byExchange,
          deals: formattedDeals,
          timeline,
        },
        filters: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          exchange: exchange || null,
          symbol: symbol || null,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingArbitrageRevenueAPI] Error fetching revenue data:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch revenue data',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
