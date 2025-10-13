import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { FundingArbitrageStatus } from '@prisma/client';
import { TradeHistoryDTO } from '@/types/trade-history';

/**
 * GET /api/arbitrage/trade-history
 *
 * Get trade history from FundingArbitrageSubscription table.
 * Returns closed positions (COMPLETED, CANCELLED, ERROR) ordered by most recent first.
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - symbol (optional): Trading symbol (e.g., "BTCUSDT") - if omitted, returns all symbols
 * - exchange (optional): Exchange name (e.g., "BYBIT") - if omitted, returns all exchanges
 * - limit (optional): Number of records to return (default: 50, max: 200)
 *
 * Examples:
 * - Specific coin on specific exchange: /api/arbitrage/trade-history?symbol=BTCUSDT&exchange=BYBIT&limit=50
 * - All coins on specific exchange: /api/arbitrage/trade-history?exchange=BYBIT&limit=100
 * - Specific coin on all exchanges: /api/arbitrage/trade-history?symbol=BTCUSDT&limit=100
 * - All coins on all exchanges (general report): /api/arbitrage/trade-history?limit=200
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "xxx",
 *       "symbol": "BTCUSDT",
 *       "executedAt": "2025-01-15T16:00:00Z",
 *       "closedAt": "2025-01-15T16:00:05Z",
 *       "positionSizeUsdt": 1000.00,
 *       "fundingEarned": 10.50,
 *       "realizedPnl": 8.30,
 *       "entryPrice": 50000.00,
 *       "exitPrice": 50005.00,
 *       "leverage": 10,
 *       "quantity": 0.02,
 *       "status": "COMPLETED",
 *       "margin": 100.00,
 *       "primaryExchange": "BYBIT",
 *       "hedgeExchange": "BINGX",
 *       "mode": "HEDGED",
 *       "positionType": "long",
 *       "fundingRate": 0.0001,
 *       "primaryTradingFees": 1.50,
 *       "hedgeTradingFees": 1.20,
 *       "totalFees": 2.70,
 *       "netPnl": 5.60
 *     }
 *   ],
 *   "count": 1,
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 *
 * Response (Error - 400):
 * {
 *   "success": false,
 *   "error": "Missing required parameters",
 *   "message": "Both symbol and exchange parameters are required",
 *   "code": "MISSING_PARAMETERS",
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 *
 * Response (Error - 401):
 * {
 *   "success": false,
 *   "error": "Unauthorized",
 *   "message": "Authentication required. Please log in.",
 *   "code": "AUTH_REQUIRED",
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    console.log('[TradeHistoryAPI] Authenticating user for trade history request');
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      console.log('[TradeHistoryAPI] Authentication failed:', authResult.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required. Please log in.',
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    console.log('[TradeHistoryAPI] User authenticated:', userId);

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;
    const exchange = searchParams.get('exchange') || undefined;
    const limitParam = searchParams.get('limit');

    // Validate and parse limit (default: 50, max: 200)
    let limit = 50;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        console.error('[TradeHistoryAPI] Invalid limit parameter:', limitParam);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid limit',
            message: 'Limit must be a positive integer',
            code: 'INVALID_LIMIT',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 200);
    }

    console.log('[TradeHistoryAPI] Query parameters:', {
      symbol,
      exchange,
      limit,
      userId,
    });

    // 3. Define closed position statuses
    const closedStatuses: FundingArbitrageStatus[] = ['COMPLETED', 'CANCELLED', 'ERROR'];

    // 4. Build dynamic where clause based on provided parameters
    const whereClause: any = {
      userId: userId,
      status: {
        in: closedStatuses,
      },
      closedAt: {
        not: null,
      },
    };

    // Add optional filters
    if (symbol) {
      whereClause.symbol = symbol;
    }
    if (exchange) {
      whereClause.primaryExchange = exchange;
    }

    // 5. Query database for closed positions
    console.log('[TradeHistoryAPI] Querying trade history from database...', {
      filters: { symbol: symbol || 'all', exchange: exchange || 'all', limit },
    });

    const subscriptions = await prisma.fundingArbitrageSubscription.findMany({
      where: whereClause,
      orderBy: {
        closedAt: 'desc',
      },
      take: limit,
    });

    console.log('[TradeHistoryAPI] Found trade history records:', {
      count: subscriptions.length,
    });

    // 6. Transform to DTOs
    const tradeHistoryDTOs: TradeHistoryDTO[] = subscriptions.map((sub) => {
      // Calculate position size in USDT
      // If margin is available, use margin * leverage
      // Otherwise, calculate from quantity and entry price
      let positionSizeUsdt: number;
      if (sub.margin !== null) {
        positionSizeUsdt = sub.margin * sub.leverage;
      } else {
        // Fallback calculation: quantity * entryPrice (approximate)
        positionSizeUsdt = sub.quantity * (sub.entryPrice || 0);
      }

      // Calculate total fees
      const primaryFees = sub.primaryTradingFees || 0;
      const hedgeFees = sub.hedgeTradingFees || 0;
      const totalFees = primaryFees + hedgeFees;

      // Calculate net P&L (realized P&L minus fees)
      let netPnl: number | null = null;
      if (sub.realizedPnl !== null) {
        netPnl = sub.realizedPnl - totalFees;
      }

      return {
        id: sub.id,
        symbol: sub.symbol,
        executedAt: sub.executedAt ? sub.executedAt.toISOString() : null,
        closedAt: sub.closedAt ? sub.closedAt.toISOString() : null,
        positionSizeUsdt: positionSizeUsdt,
        fundingEarned: sub.fundingEarned,
        realizedPnl: sub.realizedPnl,
        entryPrice: sub.entryPrice,
        exitPrice: sub.primaryExitPrice, // Use primaryExitPrice as exitPrice
        leverage: sub.leverage,
        quantity: sub.quantity,
        status: sub.status,
        margin: sub.margin,
        primaryExchange: sub.primaryExchange,
        hedgeExchange: sub.hedgeExchange,
        mode: sub.mode,
        positionType: sub.positionType,
        fundingRate: sub.fundingRate,
        primaryTradingFees: sub.primaryTradingFees,
        hedgeTradingFees: sub.hedgeTradingFees,
        totalFees: totalFees,
        netPnl: netPnl,
      };
    });

    // 7. Return successful response
    console.log('[TradeHistoryAPI] Successfully retrieved trade history');
    return NextResponse.json(
      {
        success: true,
        data: tradeHistoryDTOs,
        count: tradeHistoryDTOs.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[TradeHistoryAPI] Error retrieving trade history:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve trade history',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
