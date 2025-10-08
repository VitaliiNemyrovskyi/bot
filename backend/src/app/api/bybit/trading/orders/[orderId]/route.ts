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
 * DELETE /api/bybit/trading/orders/:orderId
 *
 * Cancel an existing order on Bybit
 *
 * Authentication: Required (Bearer token)
 *
 * Path Parameters:
 * - orderId: string - The order ID to cancel
 *
 * Query Parameters:
 * - credentialId: string (required) - Exchange credential ID
 * - category: 'linear' | 'spot' (required) - Trading category
 * - symbol: string (required) - Trading pair symbol
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "orderId": "string",
 *     "symbol": "string"
 *   },
 *   "message": "Order cancelled successfully",
 *   "timestamp": "ISO-8601 timestamp"
 * }
 *
 * Error Responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 400: Bad Request (validation errors, order not found)
 * - 403: Forbidden (credential not found or access denied)
 * - 404: Not Found (order not found)
 * - 500: Internal Server Error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
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

    // 2. Extract and validate path parameter
    const { orderId } = params;

    if (!orderId) {
      const { response, status } = createErrorResponse(
        'orderId path parameter is required',
        'MISSING_ORDER_ID',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // 3. Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const credentialId = searchParams.get('credentialId');
    const category = searchParams.get('category') as 'linear' | 'spot';
    const symbol = searchParams.get('symbol');

    // Validate required query parameters
    const errors: string[] = [];

    if (!credentialId) {
      errors.push('credentialId query parameter is required');
    }

    if (!category || !['linear', 'spot'].includes(category)) {
      errors.push('category query parameter is required and must be "linear" or "spot"');
    }

    if (!symbol) {
      errors.push('symbol query parameter is required');
    }

    if (errors.length > 0) {
      const { response, status } = createErrorResponse(
        `Validation failed: ${errors.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    // 4. Get and verify credential ownership
    const credentialResult = await getCredentialForUser(credentialId!, userId);

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

    // 6. Cancel the order
    try {
      const cancelResult = await bybitClient.cancelOrder(
        category as 'linear' | 'spot' | 'option',
        symbol!,
        orderId
      );

      // 7. Log successful operation
      await logTradingOperation({
        userId,
        operation: 'CANCEL_ORDER',
        symbol: symbol!,
        status: 'success',
        metadata: {
          orderId,
          category,
          requestId
        }
      });

      // 8. Return success response
      const { response, status } = createSuccessResponse(
        {
          orderId,
          symbol: symbol!,
          category
        },
        'Order cancelled successfully'
      );

      return NextResponse.json({ ...response, requestId }, { status });

    } catch (error: any) {
      // 9. Log failed operation
      await logTradingOperation({
        userId,
        operation: 'CANCEL_ORDER',
        symbol: symbol!,
        status: 'error',
        errorMessage: error.message,
        metadata: {
          orderId,
          category,
          requestId
        }
      });

      // 10. Handle order not found error
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        const { response, status } = createErrorResponse(
          `Order ${orderId} not found or already cancelled`,
          'ORDER_NOT_FOUND',
          404
        );
        return NextResponse.json({ ...response, requestId }, { status });
      }

      // 11. Handle Bybit-specific errors
      const { response, status } = handleBybitError(error);
      return NextResponse.json({ ...response, requestId }, { status });
    }

  } catch (error: any) {
    console.error('[Trading API] Unexpected error in DELETE /orders/:orderId:', error);

    const { response, status } = createErrorResponse(
      'An unexpected error occurred while cancelling the order',
      'INTERNAL_ERROR',
      500
    );
    return NextResponse.json({ ...response, requestId }, { status });
  }
}
