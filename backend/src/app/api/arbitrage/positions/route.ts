import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PriceArbitragePositionDTO } from '@/types/price-arbitrage';
import { PriceArbitrageStatus } from '@prisma/client';
// import { graduatedEntryArbitrageService } from '@/services/graduated-entry-arbitrage.service';

/**
 * GET /api/arbitrage/positions
 *
 * Get all price arbitrage positions for the authenticated user.
 * Supports optional filtering by status and symbol.
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - status: Filter by position status (OPENING, ACTIVE, CLOSING, COMPLETED, PARTIAL, ERROR)
 * - symbol: Filter by trading symbol (e.g., BTCUSDT)
 * - limit: Maximum number of results (default: 100)
 * - offset: Number of records to skip for pagination (default: 0)
 *
 * Example: /api/arbitrage/positions?status=ACTIVE&symbol=BTCUSDT&limit=50
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "xxx",
 *       "userId": "yyy",
 *       "symbol": "BTCUSDT",
 *       "primaryExchange": "BYBIT",
 *       "hedgeExchange": "BINGX",
 *       "primaryLeverage": 10,
 *       "primaryMargin": 100,
 *       "hedgeLeverage": 10,
 *       "hedgeMargin": 100,
 *       "entryPrimaryPrice": 50000,
 *       "entryHedgePrice": 49900,
 *       "entrySpread": 0.002,
 *       "entrySpreadPercent": 0.2,
 *       "exitPrimaryPrice": 49950,
 *       "exitHedgePrice": 49950,
 *       "exitSpread": 0,
 *       "exitSpreadPercent": 0,
 *       "primaryPnl": 10,
 *       "hedgePnl": 10,
 *       "totalPnl": 18,
 *       "primaryFees": 1,
 *       "hedgeFees": 1,
 *       "status": "COMPLETED",
 *       "createdAt": "2025-10-12T00:00:00.000Z",
 *       "openedAt": "2025-10-12T00:00:10.000Z",
 *       "closedAt": "2025-10-12T00:30:00.000Z",
 *       "holdingTimeSeconds": 1790
 *     }
 *   ],
 *   "pagination": {
 *     "total": 42,
 *     "limit": 50,
 *     "offset": 0,
 *     "hasMore": false
 *   },
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    console.log('[PriceArbitrageAPI] Authenticating user for list positions request');
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      console.log('[PriceArbitrageAPI] Authentication failed:', authResult.error);
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
    console.log('[PriceArbitrageAPI] User authenticated:', userId);

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');
    const symbol = searchParams.get('symbol');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Validate and parse limit (default: 100, max: 1000)
    let limit = 100;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
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
      limit = Math.min(parsedLimit, 1000);
    }

    // Validate and parse offset (default: 0)
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid offset',
            message: 'Offset must be a non-negative integer',
            code: 'INVALID_OFFSET',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Validate status if provided
    const validStatuses: PriceArbitrageStatus[] = [
      'OPENING',
      'ACTIVE',
      'CLOSING',
      'COMPLETED',
      'PARTIAL',
      'ERROR',
    ];
    if (statusParam && !validStatuses.includes(statusParam as PriceArbitrageStatus)) {
      console.error('[PriceArbitrageAPI] Invalid status filter:', statusParam);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('[PriceArbitrageAPI] Query filters:', {
      status: statusParam || 'all',
      symbol: symbol || 'all',
      limit,
      offset,
    });

    // 3. Build query filters
    const whereClause: any = {
      userId,
    };

    if (statusParam) {
      whereClause.status = statusParam as PriceArbitrageStatus;
    }

    if (symbol) {
      whereClause.symbol = symbol;
    }

    // 4. Query database for positions
    console.log('[PriceArbitrageAPI] Querying positions from database...');
    const [positions, total] = await Promise.all([
      prisma.priceArbitragePosition.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.priceArbitragePosition.count({
        where: whereClause,
      }),
    ]);

    console.log('[PriceArbitrageAPI] Found positions:', {
      count: positions.length,
      total,
    });

    // 5. Transform to DTOs with holding time calculation
    const positionDTOs: PriceArbitragePositionDTO[] = positions.map((position) => {
      // Calculate holding time if position was opened
      let holdingTimeSeconds: number | undefined;
      if (position.openedAt) {
        const endTime = position.closedAt || new Date();
        holdingTimeSeconds = Math.floor((endTime.getTime() - position.openedAt.getTime()) / 1000);
      }

      return {
        id: position.id,
        userId: position.userId,
        symbol: position.symbol,
        primaryExchange: position.primaryExchange,
        hedgeExchange: position.hedgeExchange,
        primaryLeverage: position.primaryLeverage,
        primaryMargin: position.primaryMargin,
        primaryQuantity: position.primaryQuantity,
        hedgeLeverage: position.hedgeLeverage,
        hedgeMargin: position.hedgeMargin,
        hedgeQuantity: position.hedgeQuantity,
        entryPrimaryPrice: position.entryPrimaryPrice,
        entryHedgePrice: position.entryHedgePrice,
        entrySpread: position.entrySpread,
        entrySpreadPercent: position.entrySpreadPercent,
        exitPrimaryPrice: position.exitPrimaryPrice || undefined,
        exitHedgePrice: position.exitHedgePrice || undefined,
        exitSpread: position.exitSpread || undefined,
        exitSpreadPercent: position.exitSpreadPercent || undefined,
        primaryPnl: position.primaryPnl || undefined,
        hedgePnl: position.hedgePnl || undefined,
        totalPnl: position.totalPnl || undefined,
        primaryFees: position.primaryFees,
        hedgeFees: position.hedgeFees,
        status: position.status,
        errorMessage: position.errorMessage || undefined,
        createdAt: position.createdAt,
        openedAt: position.openedAt || undefined,
        closedAt: position.closedAt || undefined,
        holdingTimeSeconds,
      };
    });

    // 6. Return response with pagination
    const hasMore = offset + limit < total;

    return NextResponse.json(
      {
        success: true,
        data: positionDTOs,
        pagination: {
          total,
          limit,
          offset,
          hasMore,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PriceArbitrageAPI] Error listing positions:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list positions',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
