import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateRequest,
  getCredentialForUser,
  createBybitClientForCredential,
  validatePositionCloseRequest,
  logTradingOperation,
  createErrorResponse,
  createSuccessResponse,
  handleBybitError,
  generateRequestId
} from '@/lib/trading-helpers';

/**
 * POST /api/bybit/trading/positions/close
 *
 * Close a single position (fully or partially) on Bybit
 *
 * Authentication: Required (Bearer token)
 *
 * Request Body:
 * {
 *   "credentialId": "string",        // Exchange credential ID
 *   "category": "linear" | "spot",   // Trading category
 *   "symbol": "string",              // e.g., "BTCUSDT"
 *   "side": "Buy" | "Sell",         // Position side to close
 *   "qty": "string"                  // Optional: partial close quantity
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "orderId": "string",
 *     "symbol": "string",
 *     "side": "Buy" | "Sell",
 *     "qty": "string",
 *     "category": "linear" | "spot"
 *   },
 *   "message": "Position closed successfully",
 *   "timestamp": "ISO-8601 timestamp"
 * }
 *
 * Error Responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 400: Bad Request (validation errors, no position found)
 * - 403: Forbidden (credential not found or access denied)
 * - 404: Not Found (position not found)
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

    // 3. Validate position close request
    const validation = validatePositionCloseRequest(requestBody);
    if (!validation.valid || !validation.request) {
      const { response, status } = createErrorResponse(
        `Validation failed: ${validation.errors?.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const closeRequest = validation.request;

    // 4. Get and verify credential ownership
    const credentialResult = await getCredentialForUser(
      closeRequest.credentialId,
      userId
    );

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

    // 6. Close the position
    try {
      // If qty is provided, we need to manually create a close order
      // Otherwise, use the built-in closePosition method
      let closeResult;

      if (closeRequest.qty) {
        // Partial close: create a reduce-only order
        const oppositeSide: 'Buy' | 'Sell' =
          closeRequest.side === 'Buy' ? 'Sell' : 'Buy';

        closeResult = await bybitClient.placeOrder({
          category: closeRequest.category as 'linear' | 'spot' | 'option',
          symbol: closeRequest.symbol,
          side: oppositeSide,
          orderType: 'Market',
          qty: closeRequest.qty,
          reduceOnly: true
        });
      } else {
        // Full close: use closePosition method
        closeResult = await bybitClient.closePosition(
          closeRequest.category as 'linear' | 'spot' | 'option',
          closeRequest.symbol,
          closeRequest.side
        );
      }

      // 7. Log successful operation
      await logTradingOperation({
        userId,
        operation: 'CLOSE_POSITION',
        symbol: closeRequest.symbol,
        side: closeRequest.side,
        qty: closeRequest.qty,
        status: 'success',
        metadata: {
          orderId: closeResult.orderId,
          category: closeRequest.category,
          partial: !!closeRequest.qty,
          requestId
        }
      });

      // 8. Return success response
      const { response, status } = createSuccessResponse(
        {
          orderId: closeResult.orderId,
          symbol: closeRequest.symbol,
          side: closeRequest.side,
          qty: closeRequest.qty || 'full',
          category: closeRequest.category
        },
        closeRequest.qty
          ? `Position partially closed (${closeRequest.qty})`
          : 'Position fully closed'
      );

      return NextResponse.json({ ...response, requestId }, { status });

    } catch (error: any) {
      // 9. Log failed operation
      await logTradingOperation({
        userId,
        operation: 'CLOSE_POSITION',
        symbol: closeRequest.symbol,
        side: closeRequest.side,
        qty: closeRequest.qty,
        status: 'error',
        errorMessage: error.message,
        metadata: {
          category: closeRequest.category,
          requestId
        }
      });

      // 10. Handle position not found error
      if (error.message?.includes('No position found') ||
          error.message?.includes('position') && error.message?.includes('not found')) {
        const { response, status } = createErrorResponse(
          `No open position found for ${closeRequest.symbol} on ${closeRequest.side} side`,
          'POSITION_NOT_FOUND',
          404
        );
        return NextResponse.json({ ...response, requestId }, { status });
      }

      // 11. Handle Bybit-specific errors
      const { response, status } = handleBybitError(error);
      return NextResponse.json({ ...response, requestId }, { status });
    }

  } catch (error: any) {
    console.error('[Trading API] Unexpected error in POST /positions/close:', error);

    const { response, status } = createErrorResponse(
      'An unexpected error occurred while closing the position',
      'INTERNAL_ERROR',
      500
    );
    return NextResponse.json({ ...response, requestId }, { status });
  }
}
