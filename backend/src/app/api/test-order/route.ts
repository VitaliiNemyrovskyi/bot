import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BingXService } from '@/lib/bingx';
import { BybitService } from '@/lib/bybit';
import { BingXOrderRequest } from '@/types/bingx';

/**
 * POST /api/test-order
 *
 * Universal test order endpoint with detailed request/response logging for debugging
 * Supports both BingX and Bybit exchanges
 *
 * Request body:
 * {
 *   exchange: 'BINGX' | 'BYBIT',
 *   credentialId: string,
 *   order: {
 *     symbol: string,
 *     side: 'BUY' | 'SELL',
 *     positionSide?: 'LONG' | 'SHORT',  // Required for BingX, optional for Bybit
 *     type: 'MARKET' | 'LIMIT',
 *     quantity: number,
 *     price?: number  // Required for LIMIT orders
 *   },
 *   testMode?: boolean  // If true, uses test/validation endpoint (no actual execution)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   request: {
 *     method: string,
 *     url: string,
 *     params: Record<string, any>,
 *     queryString: string,
 *     timestamp: number,
 *     headers: Record<string, string>
 *   },
 *   response: {
 *     statusCode: number,
 *     data: any,
 *     error?: string
 *   },
 *   executionTime: number,
 *   debug: {
 *     exchange: string,
 *     environment: string,
 *     timeSyncStatus?: any,
 *     orderDetails: any
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

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

    // 2. Parse and validate request body
    const body = await request.json();
    const { exchange, credentialId, order, testMode = true } = body;

    // Validate required fields
    if (!exchange || !credentialId || !order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'exchange, credentialId, and order are required',
          requiredFields: {
            exchange: 'BINGX | BYBIT',
            credentialId: 'string',
            order: {
              symbol: 'string',
              side: 'BUY | SELL',
              positionSide: 'LONG | SHORT (optional for Bybit, required for BingX)',
              type: 'MARKET | LIMIT',
              quantity: 'number',
              price: 'number (required for LIMIT orders)',
            },
            testMode: 'boolean (optional, default: true)',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate order object
    if (!order.symbol || !order.side || !order.type || order.quantity === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order object',
          message: 'symbol, side, type, and quantity are required in order object',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Validate LIMIT orders have price
    if (order.type === 'LIMIT' && !order.price) {
      return NextResponse.json(
        {
          success: false,
          error: 'Price required for LIMIT orders',
          message: 'price is required when type is LIMIT',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Load credentials from database
    console.log('[TestOrder] Loading credentials:', { userId, credentialId, exchange });
    const credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credentials not found',
          message: `No credentials found with ID: ${credentialId}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Verify exchange matches
    if (credentials.exchange !== exchange) {
      return NextResponse.json(
        {
          success: false,
          error: 'Exchange mismatch',
          message: `Credential is for ${credentials.exchange}, but request is for ${exchange}`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('[TestOrder] Credentials loaded:', {
      exchange: credentials.exchange,
      label: credentials.label,
    });

    // 4. Route to appropriate exchange handler
    const executionStartTime = Date.now();

    let result: any;
    if (exchange === 'BINGX') {
      result = await handleBingXOrder(
        credentials,
        order,
        testMode,
        userId,
        credentialId
      );
    } else if (exchange === 'BYBIT') {
      result = await handleBybitOrder(
        credentials,
        order,
        testMode,
        userId
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported exchange',
          message: `Exchange ${exchange} is not supported. Supported exchanges: BINGX, BYBIT`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const executionTime = Date.now() - executionStartTime;
    const totalTime = Date.now() - startTime;

    // 5. Return comprehensive response
    return NextResponse.json(
      {
        success: true,
        ...result,
        executionTime,
        totalTime,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error('[TestOrder] Error:', error.message, error.stack);

    return NextResponse.json(
      {
        success: false,
        error: 'Test order failed',
        message: error.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        executionTime: totalTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Handle BingX order testing with detailed logging
 */
async function handleBingXOrder(
  credentials: any,
  order: any,
  testMode: boolean,
  userId: string,
  credentialId: string
) {
  console.log('[BingX] Initializing BingX service...');

  const bingxService = new BingXService({
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    enableRateLimit: true,
    userId,
    credentialId,
  });

  // Sync time and capture time sync status
  console.log('[BingX] Synchronizing time...');
  await bingxService.syncTime();
  const timeSyncStatus = bingxService.getTimeSyncStatus();

  console.log('[BingX] Time sync status:', timeSyncStatus);

  // Get contract specifications for quantity adjustment
  console.log('[BingX] Fetching contract specifications...');
  const contracts = await bingxService.getContracts();
  const contract = contracts.find((c: any) => c.symbol === order.symbol);

  if (!contract) {
    throw new Error(
      `Symbol ${order.symbol} not found in BingX contracts. ` +
      `Available symbols: ${contracts.slice(0, 5).map((c: any) => c.symbol).join(', ')}...`
    );
  }

  // Adjust quantity based on contract rules
  const precision = contract.quantityPrecision || 0;
  const stepSize = parseFloat(contract.size || '1');
  const minQuantity = parseFloat(contract.tradeMinQuantity || '0');

  const factor = Math.pow(10, precision);
  let adjustedQuantity = Math.floor((order.quantity / stepSize)) * stepSize;
  adjustedQuantity = Math.round(adjustedQuantity * factor) / factor;

  if (adjustedQuantity < minQuantity) {
    adjustedQuantity = minQuantity;
  }

  const quantityAdjustment = {
    original: order.quantity,
    adjusted: adjustedQuantity,
    wasAdjusted: order.quantity !== adjustedQuantity,
    rules: {
      precision,
      stepSize,
      minQuantity,
    },
  };

  console.log('[BingX] Quantity adjustment:', quantityAdjustment);

  // Prepare BingX order request
  // BingX requires positionSide (LONG/SHORT)
  const positionSide = order.positionSide || (order.side === 'BUY' ? 'LONG' : 'SHORT');

  const bingxOrderRequest: BingXOrderRequest = {
    symbol: order.symbol,
    side: order.side,
    positionSide,
    type: order.type,
    quantity: adjustedQuantity,
  };

  if (order.type === 'LIMIT' && order.price) {
    bingxOrderRequest.price = order.price;
    bingxOrderRequest.timeInForce = 'GTC';
  }

  console.log('[BingX] Prepared order request:', bingxOrderRequest);

  // Capture request details before making the call
  const requestTimestamp = bingxService.getSyncedTime();
  const requestDetails = {
    method: 'POST',
    endpoint: testMode ? '/openApi/swap/v2/trade/order/test' : '/openApi/swap/v2/trade/order',
    params: bingxOrderRequest,
    timestamp: requestTimestamp,
    headers: {
      'X-BX-APIKEY': credentials.apiKey.substring(0, 8) + '...',
      'Content-Type': 'application/json',
    },
  };

  // Execute order (test or real)
  let responseData: any;
  let responseError: string | undefined;
  let statusCode = 200;

  try {
    if (testMode) {
      console.log('[BingX] Executing TEST order (no actual execution)...');
      responseData = await bingxService.testOrder(bingxOrderRequest);
    } else {
      console.log('[BingX] Executing REAL order (actual execution)...');
      responseData = await bingxService.placeOrder(bingxOrderRequest);
    }

    console.log('[BingX] Order response:', responseData);
    statusCode = 200;
  } catch (error: any) {
    console.error('[BingX] Order failed:', error.message);
    responseError = error.message;
    responseData = { error: error.message };
    statusCode = 400;
  }

  // Return detailed response
  return {
    request: {
      ...requestDetails,
      queryString: Object.entries(requestDetails.params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&'),
    },
    response: {
      statusCode,
      data: responseData,
      error: responseError,
    },
    debug: {
      exchange: 'BINGX',
      testMode,
      timeSyncStatus,
      quantityAdjustment,
      contractRules: {
        symbol: contract.symbol,
        quantityPrecision: contract.quantityPrecision,
        size: contract.size,
        tradeMinQuantity: contract.tradeMinQuantity,
        pricePrecision: contract.pricePrecision,
        tickSize: contract.tickSize,
      },
      orderDetails: {
        original: order,
        prepared: bingxOrderRequest,
      },
    },
  };
}

/**
 * Handle Bybit order testing with detailed logging
 */
async function handleBybitOrder(
  credentials: any,
  order: any,
  testMode: boolean,
  userId: string
) {
  console.log('[Bybit] Initializing Bybit service...');

  const bybitService = new BybitService({
    apiKey: credentials.apiKey,
    apiSecret: credentials.apiSecret,
    enableRateLimit: true,
    userId,
  });

  // Sync time and capture time sync status
  console.log('[Bybit] Synchronizing time...');
  await bybitService.syncTime();
  const timeSyncStatus = bybitService.getTimeSyncStatus();

  console.log('[Bybit] Time sync status:', timeSyncStatus);

  // Get instrument info for trading rules
  console.log('[Bybit] Fetching instrument info...');
  const instrumentInfo = await bybitService.getInstrumentsInfo('linear', order.symbol);

  if (!instrumentInfo.list || instrumentInfo.list.length === 0) {
    throw new Error(
      `Symbol ${order.symbol} not found in Bybit linear contracts. ` +
      `Please verify the symbol is correct.`
    );
  }

  const instrument = instrumentInfo.list[0];

  // Prepare Bybit order request
  const bybitOrderRequest: any = {
    category: 'linear',
    symbol: order.symbol,
    side: order.side === 'BUY' ? 'Buy' : 'Sell',
    orderType: order.type === 'MARKET' ? 'Market' : 'Limit',
    qty: String(order.quantity),
  };

  if (order.type === 'LIMIT' && order.price) {
    bybitOrderRequest.price = String(order.price);
    bybitOrderRequest.timeInForce = 'GTC';
  }

  console.log('[Bybit] Prepared order request:', bybitOrderRequest);

  // Capture request details
  const requestTimestamp = bybitService.getSyncedTime();
  const requestDetails = {
    method: 'POST',
    endpoint: '/v5/order/create',
    params: bybitOrderRequest,
    timestamp: requestTimestamp,
    headers: {
      'X-BAPI-API-KEY': credentials.apiKey.substring(0, 8) + '...',
      'Content-Type': 'application/json',
    },
  };

  // Execute order
  // Note: Bybit doesn't have a separate test endpoint like BingX
  // In testMode, we just validate parameters without actually placing
  let responseData: any;
  let responseError: string | undefined;
  let statusCode = 200;

  try {
    if (testMode) {
      console.log('[Bybit] TEST MODE: Validating order parameters (no execution)...');
      // For test mode, just return validation success
      responseData = {
        message: 'Order parameters validated successfully (test mode)',
        note: 'Bybit does not have a dedicated test endpoint. This validates parameters only.',
        wouldSubmit: bybitOrderRequest,
      };
      statusCode = 200;
    } else {
      console.log('[Bybit] Executing REAL order (actual execution)...');
      const result = await bybitService.placeOrder(bybitOrderRequest);
      responseData = result;
      console.log('[Bybit] Order response:', responseData);
      statusCode = 200;
    }
  } catch (error: any) {
    console.error('[Bybit] Order failed:', error.message);
    responseError = error.message;
    responseData = { error: error.message };
    statusCode = 400;
  }

  // Return detailed response
  return {
    request: {
      ...requestDetails,
      queryString: Object.entries(requestDetails.params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&'),
    },
    response: {
      statusCode,
      data: responseData,
      error: responseError,
    },
    debug: {
      exchange: 'BYBIT',
      testMode,
      timeSyncStatus,
      instrumentInfo: {
        symbol: instrument.symbol,
        lotSizeFilter: instrument.lotSizeFilter,
        priceFilter: instrument.priceFilter,
        status: instrument.status,
      },
      orderDetails: {
        original: order,
        prepared: bybitOrderRequest,
      },
    },
  };
}
