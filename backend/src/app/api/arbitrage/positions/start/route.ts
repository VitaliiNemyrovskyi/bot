import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { priceArbitrageService } from '@/services/price-arbitrage.service';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { StartPriceArbitrageParams } from '@/types/price-arbitrage';

/**
 * POST /api/arbitrage/positions/start
 *
 * Start a new price arbitrage position by opening hedged positions across two exchanges.
 * The system will:
 * 1. Open a SHORT position on the exchange with higher price (PRIMARY)
 * 2. Open a LONG position on the exchange with lower price (HEDGE)
 * 3. Monitor for price convergence using WebSocket price streams
 * 4. Auto-close when target spread, stop-loss, or max holding time is reached
 *
 * Authentication: Required (Bearer token)
 *
 * Request Body:
 * {
 *   "symbol": "BTCUSDT",                    // Trading pair in normalized format
 *   "primaryExchange": "BYBIT",             // Higher price exchange (SHORT)
 *   "primaryCredentialId": "xxx",           // Exchange credential ID
 *   "primaryLeverage": 10,                  // Leverage 1-100x
 *   "primaryMargin": 100,                   // Margin in USDT
 *   "hedgeExchange": "BINGX",               // Lower price exchange (LONG)
 *   "hedgeCredentialId": "yyy",             // Exchange credential ID
 *   "hedgeLeverage": 10,                    // Leverage 1-100x
 *   "hedgeMargin": 100,                     // Margin in USDT
 *   "entryPrimaryPrice": 50000,             // Current price on primary exchange
 *   "entryHedgePrice": 49900,               // Current price on hedge exchange
 *   "targetSpread": 0.0005,                 // Optional: Auto-close when spread <= 0.05%
 *   "stopLoss": 0.01,                       // Optional: Stop-loss at 1% spread widening
 *   "maxHoldingTime": 3600                  // Optional: Max hold time in seconds
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "positionId": "xxx",
 *     "primaryOrderId": "yyy",
 *     "primaryFillPrice": 50000,
 *     "primaryQuantity": 0.2,
 *     "hedgeOrderId": "zzz",
 *     "hedgeFillPrice": 49900,
 *     "hedgeQuantity": 0.2,
 *     "stage": "both_open"
 *   },
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 *
 * Response (Error - 400/401/500):
 * {
 *   "success": false,
 *   "error": "Error type",
 *   "message": "Detailed error message",
 *   "code": "ERROR_CODE",
 *   "timestamp": "2025-10-12T00:00:00.000Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    console.log('[PriceArbitrageAPI] Authenticating user for start position request');
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

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error: any) {
      console.error('[PriceArbitrageAPI] Failed to parse request body:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          message: 'Request body must be valid JSON',
          code: 'INVALID_JSON',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('[PriceArbitrageAPI] Request body parsed:', {
      symbol: body.symbol,
      primaryExchange: body.primaryExchange,
      hedgeExchange: body.hedgeExchange,
    });

    // 3. Validate required fields
    const requiredFields = [
      'symbol',
      'primaryExchange',
      'primaryCredentialId',
      'primaryLeverage',
      'primaryMargin',
      'hedgeExchange',
      'hedgeCredentialId',
      'hedgeLeverage',
      'hedgeMargin',
      'entryPrimaryPrice',
      'entryHedgePrice',
    ];

    const missingFields = requiredFields.filter((field) => body[field] === undefined || body[field] === null);
    if (missingFields.length > 0) {
      console.error('[PriceArbitrageAPI] Missing required fields:', missingFields);
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: `The following fields are required: ${missingFields.join(', ')}`,
          code: 'MISSING_FIELDS',
          missingFields,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 4. Validate numeric values
    const numericFields = [
      'primaryLeverage',
      'primaryMargin',
      'hedgeLeverage',
      'hedgeMargin',
      'entryPrimaryPrice',
      'entryHedgePrice',
    ];

    for (const field of numericFields) {
      const value = parseFloat(body[field]);
      if (isNaN(value) || value <= 0) {
        console.error(`[PriceArbitrageAPI] Invalid ${field}:`, body[field]);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid field value',
            message: `${field} must be a positive number`,
            code: 'INVALID_VALUE',
            field,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // 5. Validate leverage range (1-100)
    if (body.primaryLeverage < 1 || body.primaryLeverage > 100) {
      console.error('[PriceArbitrageAPI] Invalid primaryLeverage:', body.primaryLeverage);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid leverage',
          message: 'primaryLeverage must be between 1 and 100',
          code: 'INVALID_LEVERAGE',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (body.hedgeLeverage < 1 || body.hedgeLeverage > 100) {
      console.error('[PriceArbitrageAPI] Invalid hedgeLeverage:', body.hedgeLeverage);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid leverage',
          message: 'hedgeLeverage must be between 1 and 100',
          code: 'INVALID_LEVERAGE',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 6. Verify credentials belong to the authenticated user
    console.log('[PriceArbitrageAPI] Verifying credential ownership...');
    const primaryCred = await ExchangeCredentialsService.getCredentialById(userId, body.primaryCredentialId);
    const hedgeCred = await ExchangeCredentialsService.getCredentialById(userId, body.hedgeCredentialId);

    if (!primaryCred) {
      console.error('[PriceArbitrageAPI] Primary credential not found or unauthorized:', body.primaryCredentialId);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credential',
          message: 'Primary exchange credential not found or does not belong to user',
          code: 'CREDENTIAL_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    if (!hedgeCred) {
      console.error('[PriceArbitrageAPI] Hedge credential not found or unauthorized:', body.hedgeCredentialId);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credential',
          message: 'Hedge exchange credential not found or does not belong to user',
          code: 'CREDENTIAL_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log('[PriceArbitrageAPI] Credentials verified successfully');

    // 7. Build params for service
    const params: StartPriceArbitrageParams = {
      userId,
      symbol: body.symbol,
      primaryExchange: body.primaryExchange,
      primaryCredentialId: body.primaryCredentialId,
      primaryLeverage: parseFloat(body.primaryLeverage),
      primaryMargin: parseFloat(body.primaryMargin),
      hedgeExchange: body.hedgeExchange,
      hedgeCredentialId: body.hedgeCredentialId,
      hedgeLeverage: parseFloat(body.hedgeLeverage),
      hedgeMargin: parseFloat(body.hedgeMargin),
      entryPrimaryPrice: parseFloat(body.entryPrimaryPrice),
      entryHedgePrice: parseFloat(body.entryHedgePrice),
      targetSpread: body.targetSpread ? parseFloat(body.targetSpread) : undefined,
      stopLoss: body.stopLoss ? parseFloat(body.stopLoss) : undefined,
      maxHoldingTime: body.maxHoldingTime ? parseInt(body.maxHoldingTime) : undefined,
    };

    console.log('[PriceArbitrageAPI] Starting arbitrage with params:', {
      symbol: params.symbol,
      primaryExchange: params.primaryExchange,
      hedgeExchange: params.hedgeExchange,
      primaryMargin: params.primaryMargin,
      hedgeMargin: params.hedgeMargin,
    });

    // 8. Call PriceArbitrageService to start arbitrage
    const result = await priceArbitrageService.startArbitrage(params);

    // 9. Return response based on result
    if (result.success) {
      console.log('[PriceArbitrageAPI] Arbitrage started successfully:', result.positionId);
      return NextResponse.json(
        {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      console.error('[PriceArbitrageAPI] Arbitrage start failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to start arbitrage',
          message: result.error || 'Unknown error occurred',
          code: 'ARBITRAGE_START_FAILED',
          stage: result.stage,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[PriceArbitrageAPI] Unexpected error in start endpoint:', {
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
