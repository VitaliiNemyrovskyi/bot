import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateRequest,
  getCredentialForUser,
  createBybitClientForCredential,
  logTradingOperation,
  formatPositionResponse,
  calculateTotalUnrealizedPnl,
  createErrorResponse,
  createSuccessResponse,
  handleBybitError,
  generateRequestId
} from '@/lib/trading-helpers';

/**
 * GET /api/bybit/trading/positions
 *
 * Get open positions for authenticated user
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - credentialId: string (required) - Exchange credential ID
 * - category: 'linear' | 'spot' (optional, default: 'linear')
 * - symbol: string (optional) - Filter by specific trading pair
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "positions": [
 *       {
 *         "symbol": "BTCUSDT",
 *         "side": "Buy",
 *         "size": "0.1",
 *         "positionValue": "5000.00",
 *         "entryPrice": "50000.00",
 *         "markPrice": "51000.00",
 *         "liqPrice": "45000.00",
 *         "unrealisedPnl": "100.00",
 *         "cumRealisedPnl": "500.00",
 *         "takeProfit": "55000.00",
 *         "stopLoss": "48000.00",
 *         "createdTime": "timestamp",
 *         "updatedTime": "timestamp"
 *       }
 *     ],
 *     "totalUnrealizedPnl": "100.00",
 *     "category": "linear"
 *   },
 *   "timestamp": "ISO-8601 timestamp"
 * }
 *
 * Error Responses:
 * - 401: Unauthorized
 * - 400: Bad Request
 * - 403: Forbidden
 * - 500: Internal Server Error
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // 1. Authenticate user
    const authResult = await authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      const { response, status } = createErrorResponse(
        authResult.error || 'Unauthorized',
        'AUTH_REQUIRED',
        401
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const userId = authResult.user.userId;

    // 2. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const credentialId = searchParams.get('credentialId');
    const category = (searchParams.get('category') as 'linear' | 'spot') || 'linear';
    const symbol = searchParams.get('symbol') || undefined;

    // Validate required parameters
    if (!credentialId) {
      const { response, status } = createErrorResponse(
        'credentialId query parameter is required',
        'MISSING_CREDENTIAL_ID',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // Validate category
    if (!['linear', 'spot'].includes(category)) {
      const { response, status } = createErrorResponse(
        'category must be either "linear" or "spot"',
        'INVALID_CATEGORY',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // 3. Get and verify credential ownership
    const credentialResult = await getCredentialForUser(credentialId, userId);

    if (!credentialResult.success || !credentialResult.credential) {
      const { response, status } = createErrorResponse(
        credentialResult.error || 'Credential not found',
        'CREDENTIAL_NOT_FOUND',
        403
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // 4. Create Bybit client
    const clientResult = await createBybitClientForCredential(
      credentialResult.credential
    );

    if (!clientResult.success || !clientResult.client) {
      const { response, status } = createErrorResponse(
        clientResult.error || 'Failed to initialize trading client',
        'CLIENT_INIT_ERROR',
        500
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const bybitClient = clientResult.client;

    // 5. Fetch positions
    try {
      const positions = await bybitClient.getPositions(
        category as 'linear' | 'spot' | 'option',
        symbol
      );

      // 6. Filter out positions with zero size (closed positions)
      const activePositions = positions.filter(
        pos => parseFloat(pos.size) > 0
      );

      // 7. Format positions for response
      const formattedPositions = activePositions.map(formatPositionResponse);

      // 8. Calculate total unrealized PnL
      const totalUnrealizedPnl = calculateTotalUnrealizedPnl(activePositions);

      // 9. Log operation
      await logTradingOperation({
        userId,
        operation: 'GET_POSITIONS',
        symbol,
        status: 'success',
        metadata: {
          category,
          positionsCount: formattedPositions.length,
          totalUnrealizedPnl,
          requestId
        }
      });

      // 10. Return success response
      const { response, status } = createSuccessResponse({
        positions: formattedPositions,
        totalUnrealizedPnl,
        category
      });

      return NextResponse.json({ ...response, requestId }, { status });

    } catch (error: any) {
      // 11. Log failed operation
      await logTradingOperation({
        userId,
        operation: 'GET_POSITIONS',
        symbol,
        status: 'error',
        errorMessage: error.message,
        metadata: {
          category,
          requestId
        }
      });

      // 12. Handle Bybit-specific errors
      const { response, status } = handleBybitError(error);
      return NextResponse.json({ ...response, requestId }, { status });
    }

  } catch (error: any) {
    console.error('[Trading API] Unexpected error in GET /positions:', error);

    const { response, status } = createErrorResponse(
      'An unexpected error occurred while fetching positions',
      'INTERNAL_ERROR',
      500
    );
    return NextResponse.json({ ...response, requestId }, { status });
  }
}
