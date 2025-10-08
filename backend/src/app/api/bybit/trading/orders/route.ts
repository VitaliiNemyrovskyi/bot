import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateRequest,
  getCredentialForUser,
  createBybitClientForCredential,
  validateOrderRequest,
  validateOrderHistoryParams,
  logTradingOperation,
  formatOrderResponse,
  createErrorResponse,
  createSuccessResponse,
  handleBybitError,
  generateRequestId
} from '@/lib/trading-helpers';
import { OrderRequest } from '@/lib/bybit';

/**
 * POST /api/bybit/trading/orders
 *
 * Place a new trading order on Bybit
 *
 * Authentication: Required (Bearer token)
 *
 * Request Body:
 * {
 *   "credentialId": "string",        // Exchange credential ID
 *   "category": "linear" | "spot",   // Trading category
 *   "symbol": "string",              // e.g., "BTCUSDT"
 *   "side": "Buy" | "Sell",         // Order side
 *   "orderType": "Market" | "Limit", // Order type
 *   "qty": "string",                 // Quantity
 *   "price": "string",               // Required for Limit orders
 *   "timeInForce": "GTC" | "IOC" | "FOK", // For Limit orders (optional)
 *   "takeProfit": "string",          // Optional TP
 *   "stopLoss": "string",            // Optional SL
 *   "tpTriggerBy": "string",         // TP trigger type (optional)
 *   "slTriggerBy": "string"          // SL trigger type (optional)
 * }
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "orderId": "string",
 *     "orderLinkId": "string",
 *     "symbol": "string",
 *     "side": "Buy" | "Sell",
 *     "orderType": "Market" | "Limit",
 *     "qty": "string",
 *     "price": "string",
 *     "orderStatus": "string"
 *   },
 *   "timestamp": "ISO-8601 timestamp"
 * }
 *
 * Error Responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 400: Bad Request (validation errors, invalid parameters)
 * - 403: Forbidden (credential not found or access denied)
 * - 429: Rate Limit Exceeded
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

    // 3. Validate order request
    const validation = validateOrderRequest(requestBody);
    if (!validation.valid || !validation.order) {
      const { response, status } = createErrorResponse(
        `Validation failed: ${validation.errors?.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const orderData = validation.order;

    // 4. Get and verify credential ownership
    const credentialResult = await getCredentialForUser(
      orderData.credentialId,
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

    // 6. Prepare order parameters
    const orderParams: OrderRequest = {
      category: orderData.category as 'linear' | 'spot' | 'option',
      symbol: orderData.symbol,
      side: orderData.side,
      orderType: orderData.orderType,
      qty: orderData.qty
    };

    // Add optional parameters
    if (orderData.price) orderParams.price = orderData.price;
    if (orderData.timeInForce) orderParams.timeInForce = orderData.timeInForce;
    if (orderData.takeProfit) orderParams.takeProfit = orderData.takeProfit;
    if (orderData.stopLoss) orderParams.stopLoss = orderData.stopLoss;
    if (orderData.tpTriggerBy) orderParams.tpTriggerBy = orderData.tpTriggerBy;
    if (orderData.slTriggerBy) orderParams.slTriggerBy = orderData.slTriggerBy;

    // 7. Place order
    try {
      const orderResult = await bybitClient.placeOrder(orderParams);

      // 8. Log successful operation
      await logTradingOperation({
        userId,
        operation: 'PLACE_ORDER',
        symbol: orderData.symbol,
        orderType: orderData.orderType,
        side: orderData.side,
        qty: orderData.qty,
        price: orderData.price,
        status: 'success',
        metadata: {
          orderId: orderResult.orderId,
          category: orderData.category,
          requestId
        }
      });

      // 9. Format and return success response
      const { response, status } = createSuccessResponse(
        {
          orderId: orderResult.orderId,
          orderLinkId: orderResult.orderLinkId,
          symbol: orderData.symbol,
          side: orderData.side,
          orderType: orderData.orderType,
          qty: orderData.qty,
          price: orderData.price,
          category: orderData.category
        },
        'Order placed successfully'
      );

      return NextResponse.json({ ...response, requestId }, { status });

    } catch (error: any) {
      // 10. Log failed operation
      await logTradingOperation({
        userId,
        operation: 'PLACE_ORDER',
        symbol: orderData.symbol,
        orderType: orderData.orderType,
        side: orderData.side,
        qty: orderData.qty,
        price: orderData.price,
        status: 'error',
        errorMessage: error.message,
        metadata: { requestId }
      });

      // 11. Handle Bybit-specific errors
      const { response, status } = handleBybitError(error);
      return NextResponse.json({ ...response, requestId }, { status });
    }

  } catch (error: any) {
    console.error('[Trading API] Unexpected error in POST /orders:', error);

    const { response, status } = createErrorResponse(
      'An unexpected error occurred while placing the order',
      'INTERNAL_ERROR',
      500
    );
    return NextResponse.json({ ...response, requestId }, { status });
  }
}

/**
 * GET /api/bybit/trading/orders
 *
 * Get order history for authenticated user
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - credentialId: string (required) - Exchange credential ID
 * - category: 'linear' | 'spot' (optional, default: 'linear')
 * - symbol: string (optional) - Filter by trading pair
 * - orderStatus: string (optional) - Filter by order status
 * - limit: number (optional, default: 50, max: 200)
 *
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "orders": [
 *       {
 *         "orderId": "string",
 *         "symbol": "string",
 *         "side": "Buy" | "Sell",
 *         "orderType": "Market" | "Limit",
 *         "qty": "string",
 *         "price": "string",
 *         "orderStatus": "string",
 *         "avgPrice": "string",
 *         "cumExecQty": "string",
 *         "createdTime": "string",
 *         "updatedTime": "string"
 *       }
 *     ],
 *     "total": number
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

    if (!credentialId) {
      const { response, status } = createErrorResponse(
        'credentialId query parameter is required',
        'MISSING_CREDENTIAL_ID',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const paramsValidation = validateOrderHistoryParams(searchParams);
    if (!paramsValidation.valid || !paramsValidation.params) {
      const { response, status } = createErrorResponse(
        `Validation failed: ${paramsValidation.errors?.join(', ')}`,
        'VALIDATION_ERROR',
        400
      );
      return NextResponse.json({ ...response, requestId }, { status });
    }

    const { category, symbol, orderStatus, limit } = paramsValidation.params;

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

    // 5. Fetch order history
    try {
      const orders = await bybitClient.getOrderHistory(
        category as 'linear' | 'spot' | 'option',
        symbol,
        limit
      );

      // 6. Filter by order status if provided
      let filteredOrders = orders;
      if (orderStatus) {
        filteredOrders = orders.filter(
          order => order.orderStatus === orderStatus
        );
      }

      // 7. Format orders for response
      const formattedOrders = filteredOrders.map(formatOrderResponse);

      // 8. Log operation
      await logTradingOperation({
        userId,
        operation: 'GET_ORDER_HISTORY',
        status: 'success',
        metadata: {
          category,
          symbol,
          orderStatus,
          limit,
          ordersCount: formattedOrders.length,
          requestId
        }
      });

      // 9. Return success response
      const { response, status } = createSuccessResponse({
        orders: formattedOrders,
        total: formattedOrders.length
      });

      return NextResponse.json({ ...response, requestId }, { status });

    } catch (error: any) {
      // 10. Log failed operation
      await logTradingOperation({
        userId,
        operation: 'GET_ORDER_HISTORY',
        status: 'error',
        errorMessage: error.message,
        metadata: { requestId }
      });

      // 11. Handle Bybit-specific errors
      const { response, status } = handleBybitError(error);
      return NextResponse.json({ ...response, requestId }, { status });
    }

  } catch (error: any) {
    console.error('[Trading API] Unexpected error in GET /orders:', error);

    const { response, status } = createErrorResponse(
      'An unexpected error occurred while fetching orders',
      'INTERNAL_ERROR',
      500
    );
    return NextResponse.json({ ...response, requestId }, { status });
  }
}
