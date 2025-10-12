import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PriceArbitragePositionDTO } from '@/types/price-arbitrage';

/**
 * GET /api/arbitrage/positions/[id]
 *
 * Get detailed information about a specific price arbitrage position.
 * Returns all position data including entry/exit prices, P&L, and status.
 *
 * Authentication: Required (Bearer token)
 * Authorization: User must own the position
 *
 * Path Parameters:
 * - id: Position ID (cuid)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "xxx",
 *     "userId": "yyy",
 *     "symbol": "BTCUSDT",
 *     "primaryExchange": "BYBIT",
 *     "hedgeExchange": "BINGX",
 *     "primaryLeverage": 10,
 *     "primaryMargin": 100,
 *     "hedgeLeverage": 10,
 *     "hedgeMargin": 100,
 *     "entryPrimaryPrice": 50000,
 *     "entryHedgePrice": 49900,
 *     "entrySpread": 0.002,
 *     "entrySpreadPercent": 0.2,
 *     "exitPrimaryPrice": 49950,
 *     "exitHedgePrice": 49950,
 *     "exitSpread": 0,
 *     "exitSpreadPercent": 0,
 *     "primaryPnl": 10,
 *     "hedgePnl": 10,
 *     "totalPnl": 18,
 *     "primaryFees": 1,
 *     "hedgeFees": 1,
 *     "status": "COMPLETED",
 *     "createdAt": "2025-10-12T00:00:00.000Z",
 *     "openedAt": "2025-10-12T00:00:10.000Z",
 *     "closedAt": "2025-10-12T00:30:00.000Z",
 *     "holdingTimeSeconds": 1790
 *   },
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 *
 * Response (Error - 404):
 * {
 *   "success": false,
 *   "error": "Position not found",
 *   "message": "Position does not exist or you do not have permission to access it",
 *   "code": "POSITION_NOT_FOUND",
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    console.log('[PriceArbitrageAPI] Authenticating user for get position request');
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
    const positionId = params.id;

    console.log('[PriceArbitrageAPI] User authenticated:', userId);
    console.log('[PriceArbitrageAPI] Fetching position:', positionId);

    // 2. Validate position ID
    if (!positionId || positionId.trim().length === 0) {
      console.error('[PriceArbitrageAPI] Invalid position ID:', positionId);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid position ID',
          message: 'Position ID is required',
          code: 'INVALID_POSITION_ID',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Query database for position
    console.log('[PriceArbitrageAPI] Querying position from database...');
    const position = await prisma.priceArbitragePosition.findUnique({
      where: {
        id: positionId,
      },
    });

    // 4. Check if position exists
    if (!position) {
      console.log('[PriceArbitrageAPI] Position not found:', positionId);
      return NextResponse.json(
        {
          success: false,
          error: 'Position not found',
          message: 'The requested position does not exist',
          code: 'POSITION_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 5. Verify user owns the position
    if (position.userId !== userId) {
      console.log('[PriceArbitrageAPI] User does not own position:', {
        userId,
        positionUserId: position.userId,
        positionId,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You do not have permission to access this position',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log('[PriceArbitrageAPI] Position found and authorized');

    // 6. Calculate holding time if position was opened
    let holdingTimeSeconds: number | undefined;
    if (position.openedAt) {
      const endTime = position.closedAt || new Date();
      holdingTimeSeconds = Math.floor((endTime.getTime() - position.openedAt.getTime()) / 1000);
    }

    // 7. Transform to DTO
    const positionDTO: PriceArbitragePositionDTO = {
      id: position.id,
      userId: position.userId,
      symbol: position.symbol,
      primaryExchange: position.primaryExchange,
      hedgeExchange: position.hedgeExchange,
      primaryLeverage: position.primaryLeverage,
      primaryMargin: position.primaryMargin,
      hedgeLeverage: position.hedgeLeverage,
      hedgeMargin: position.hedgeMargin,
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

    // 8. Return position details
    return NextResponse.json(
      {
        success: true,
        data: positionDTO,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[PriceArbitrageAPI] Error getting position:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get position',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
