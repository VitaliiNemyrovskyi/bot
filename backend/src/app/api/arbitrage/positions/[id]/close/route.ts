import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { priceArbitrageService } from '@/services/price-arbitrage.service';
import prisma from '@/lib/prisma';

/**
 * POST /api/arbitrage/positions/[id]/close
 *
 * Manually close an active price arbitrage position.
 * This will:
 * 1. Verify the position is ACTIVE and belongs to the user
 * 2. Close the PRIMARY SHORT position (market buy order)
 * 3. Close the HEDGE LONG position (market sell order)
 * 4. Calculate final P&L including fees
 * 5. Update position status to COMPLETED
 * 6. Stop price monitoring
 *
 * Authentication: Required (Bearer token)
 * Authorization: User must own the position
 *
 * Path Parameters:
 * - id: Position ID (cuid)
 *
 * Request Body (Optional):
 * {
 *   "reason": "manual_close"  // Optional: Reason for closing (e.g., "manual_close", "user_request")
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "success": true,
 *     "primaryClosePrice": 49950,
 *     "primaryPnl": 10,
 *     "primaryFees": 1,
 *     "hedgeClosePrice": 49950,
 *     "hedgePnl": 10,
 *     "hedgeFees": 1,
 *     "totalPnl": 18,
 *     "exitSpread": 0,
 *     "exitSpreadPercent": 0,
 *     "stage": "both_closed"
 *   },
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 *
 * Response (Error - 400):
 * {
 *   "success": false,
 *   "error": "Position not active",
 *   "message": "Position must be in ACTIVE status to close (current status: COMPLETED)",
 *   "code": "POSITION_NOT_ACTIVE",
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    console.log('[PriceArbitrageAPI] Authenticating user for close position request');
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
    console.log('[PriceArbitrageAPI] Closing position:', positionId);

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

    // 3. Parse optional request body
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
      console.log('[PriceArbitrageAPI] Close reason:', reason || 'manual_close');
    } catch (error) {
      // Body is optional, ignore parse errors
      console.log('[PriceArbitrageAPI] No request body provided, using default reason');
    }

    // 4. Query database for position
    console.log('[PriceArbitrageAPI] Querying position from database...');
    const position = await prisma.priceArbitragePosition.findUnique({
      where: {
        id: positionId,
      },
    });

    // 5. Check if position exists
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

    // 6. Verify user owns the position
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
          message: 'You do not have permission to close this position',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 7. Check if position is in ACTIVE status
    if (position.status !== 'ACTIVE') {
      console.log('[PriceArbitrageAPI] Position is not active:', {
        positionId,
        status: position.status,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Position not active',
          message: `Position must be in ACTIVE status to close (current status: ${position.status})`,
          code: 'POSITION_NOT_ACTIVE',
          currentStatus: position.status,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('[PriceArbitrageAPI] Position verified and ready to close');

    // 8. Call PriceArbitrageService to close position
    const closeReason = reason || 'manual_close';
    console.log('[PriceArbitrageAPI] Calling service to close position with reason:', closeReason);
    const result = await priceArbitrageService.closeArbitrage(positionId, closeReason);

    // 9. Return response based on result
    if (result.success) {
      console.log('[PriceArbitrageAPI] Position closed successfully:', {
        positionId,
        totalPnl: result.totalPnl,
      });
      return NextResponse.json(
        {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      console.error('[PriceArbitrageAPI] Failed to close position:', {
        positionId,
        error: result.error,
        stage: result.stage,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to close position',
          message: result.error || 'Unknown error occurred',
          code: 'CLOSE_FAILED',
          stage: result.stage,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[PriceArbitrageAPI] Unexpected error in close endpoint:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
