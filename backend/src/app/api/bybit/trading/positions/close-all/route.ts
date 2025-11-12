import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateRequest,
  getCredentialForUser,
  createBybitClientForCredential,
  logTradingOperation,
  createErrorResponse,
  createSuccessResponse,
  handleBybitError,
  generateRequestId
} from '@/lib/trading-helpers';

/**
 * POST /api/bybit/trading/positions/close-all
 *
 * Close all open positions for a specific category on Bybit
 *
 * Authentication: Required (Bearer token)
 *
 * Request Body:
 * {
 *   "credentialId": "string",        // Exchange credential ID
 *   "category": "linear" | "spot"    // Trading category
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "closedCount": number,
 *     "orders": [
 *       {
 *         "symbol": "BTCUSDT",
 *         "orderId": "string",
 *         "side": "Buy" | "Sell",
 *         "qty": "string"
 *       }
 *     ],
 *     "category": "linear" | "spot"
 *   },
 *   "message": "All positions closed successfully",
 *   "timestamp": "ISO-8601 timestamp"
 * }
 *
 * Error Responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 400: Bad Request (validation errors, no positions found)
 * - 403: Forbidden (credential not found or access denied)
 * - 404: Not Found (no open positions)
 * - 500: Internal Server Error
 */
export async function POST(request: NextRequest) {
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

    // 2. Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      const { response, status } = createErrorResponse(
        'Invalid JSON in request body',
        'INVALID_JSON',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // 3. Validate request parameters
    const errors: string[] = [];

    if (!requestBody.credentialId || typeof requestBody.credentialId !== 'string') {
      errors.push('credentialId is required and must be a string');
    }

    if (!requestBody.category || !['linear', 'spot'].includes(requestBody.category)) {
      errors.push('category is required and must be either "linear" or "spot"');
    }

    if (errors.length > 0) {
      const { response, status } = createErrorResponse(
        `Validation failed: ${errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const { credentialId, category } = requestBody;

    // 4. Get and verify credential ownership
    const credentialResult = await getCredentialForUser(credentialId, userId);

    if (!credentialResult.success || !credentialResult.credential) {
      const { response, status } = createErrorResponse(
        credentialResult.error || 'Credential not found',
        'CREDENTIAL_NOT_FOUND',
        403
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // 5. Create Bybit client
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

    // 6. Fetch all open positions
    try {
      const allPositions = await bybitClient.getPositions(
        category as 'linear' | 'spot' | 'option'
      );

      // Filter positions with size > 0 (active positions)
      const activePositions = allPositions.filter(
        pos => parseFloat(pos.size) > 0
      );

      // 7. Check if there are positions to close
      if (activePositions.length === 0) {
        const { response, status } = createErrorResponse(
          'No open positions found to close',
          'NO_POSITIONS',
          404
        );
        return NextResponse.json({ ...response, requestId }, { status });
      }

      // 8. Close all positions
      const closeResults: Array<{
        symbol: string;
        orderId: string;
        side: 'Buy' | 'Sell';
        qty: string;
        success: boolean;
        error?: string;
      }> = [];

      const closePromises = activePositions.map(async (position) => {
        try {
          const result = await bybitClient.closePosition(
            category as 'linear' | 'spot' | 'option',
            position.symbol,
            position.side
          );

          return {
            symbol: position.symbol,
            orderId: result.orderId,
            side: position.side,
            qty: position.size,
            success: true
          };
        } catch (error: any) {
          console.error(
            `[Trading API] Failed to close position ${position.symbol}:`,
            error.message
          );

          return {
            symbol: position.symbol,
            orderId: '',
            side: position.side,
            qty: position.size,
            success: false,
            error: error.message
          };
        }
      });

      // Wait for all close operations to complete
      const results = await Promise.allSettled(closePromises);

      // Process results
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          closeResults.push(result.value);
        } else {
          console.error('[Trading API] Close position promise rejected:', result.reason);
        }
      });

      // 9. Count successful closures
      const successfulClosures = closeResults.filter(r => r.success);
      const failedClosures = closeResults.filter(r => !r.success);

      // 10. Log operation
      await logTradingOperation({
        userId,
        operation: 'CLOSE_ALL_POSITIONS',
        status: failedClosures.length === 0 ? 'success' : 'error',
        metadata: {
          category,
          totalPositions: activePositions.length,
          successfulClosures: successfulClosures.length,
          failedClosures: failedClosures.length,
          positions: closeResults,
          requestId
        }
      });

      // 11. Return response based on results
      if (failedClosures.length > 0) {
        // Partial success
        const { response } = createSuccessResponse(
          {
            closedCount: successfulClosures.length,
            failedCount: failedClosures.length,
            orders: closeResults,
            category
          },
          `Closed ${successfulClosures.length} of ${activePositions.length} positions. ${failedClosures.length} failed.`
        );

        return NextResponse.json({ ...response, requestId }, { status: 207 }); // Multi-Status
      }

      // All positions closed successfully
      const { response, status } = createSuccessResponse(
        {
          closedCount: successfulClosures.length,
          orders: successfulClosures.map(r => ({
            symbol: r.symbol,
            orderId: r.orderId,
            side: r.side,
            qty: r.qty
          })),
          category
        },
        `All ${successfulClosures.length} positions closed successfully`
      );

      return NextResponse.json({ ...response, requestId }, { status });

    } catch (error: any) {
      // 12. Log failed operation
      await logTradingOperation({
        userId,
        operation: 'CLOSE_ALL_POSITIONS',
        status: 'error',
        errorMessage: error.message,
        metadata: {
          category,
          requestId
        }
      });

      // 13. Handle Bybit-specific errors
      const { response, status } = handleBybitError(error);
      return NextResponse.json({ ...response, requestId }, { status });
    }

  } catch (error: any) {
    console.error('[Trading API] Unexpected error in POST /positions/close-all:', error);

    const { response, status } = createErrorResponse(
      'An unexpected error occurred while closing all positions',
      'INTERNAL_ERROR',
      500
    );
    return NextResponse.json({ ...response, requestId }, { status });
  }
}
