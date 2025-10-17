import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { AuthService } from '@/lib/auth';

/**
 * POST /api/bingx/test-order
 *
 * Tests order placement using BingX test endpoint (no actual execution)
 *
 * Request body:
 * {
 *   "symbol": "API3-USDT",
 *   "side": "BUY" | "SELL",
 *   "positionSide": "LONG" | "SHORT",
 *   "type": "MARKET" | "LIMIT",
 *   "quantity": number,
 *   "credentialId": "credential_id"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Parse request body
    const body = await request.json();
    const { symbol, side, positionSide, type, quantity, credentialId } = body;

    if (!symbol || !side || !positionSide || !type || quantity === undefined || !credentialId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'symbol, side, positionSide, type, quantity, and credentialId are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Load credentials
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
    const credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Credentials not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // 4. Create BingX service (mainnet only)
    const bingxService = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId,
      credentialId,
    });

    // 5. Sync time
    await bingxService.syncTime();

    // 6. Get contract specifications
    console.log('[TestOrder] Fetching contract specifications...');
    const contracts = await bingxService.getContracts();
    const contract = contracts.find((c: any) => c.symbol === symbol);

    if (!contract) {
      return NextResponse.json(
        {
          success: false,
          error: 'Contract not found',
          message: `Symbol ${symbol} not found in BingX contracts`,
          availableSymbols: contracts.slice(0, 10).map((c: any) => c.symbol),
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 7. Adjust quantity based on contract rules
    const precision = contract.quantityPrecision || 0;
    const stepSize = parseFloat(contract.size || '1');
    const minQuantity = parseFloat(contract.tradeMinQuantity || '0');

    const factor = Math.pow(10, precision);
    let adjustedQuantity = Math.floor((quantity / stepSize)) * stepSize;
    adjustedQuantity = Math.round(adjustedQuantity * factor) / factor;

    if (adjustedQuantity < minQuantity) {
      adjustedQuantity = minQuantity;
    }

    const quantityAdjustment = {
      original: quantity,
      adjusted: adjustedQuantity,
      wasAdjusted: quantity !== adjustedQuantity,
      rules: {
        precision,
        stepSize,
        minQuantity,
      },
    };

    console.log('[TestOrder] Quantity adjustment:', quantityAdjustment);

    // 8. Test order with adjusted quantity
    console.log('[TestOrder] Testing order with parameters:', {
      symbol,
      side,
      positionSide,
      type,
      quantity: adjustedQuantity,
    });

    try {
      const testResult = await bingxService.testOrder({
        symbol,
        side,
        positionSide,
        type,
        quantity: adjustedQuantity,
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            testResult,
            quantityAdjustment,
            contractRules: {
              symbol: contract.symbol,
              quantityPrecision: contract.quantityPrecision,
              size: contract.size,
              tradeMinQuantity: contract.tradeMinQuantity,
              pricePrecision: contract.pricePrecision,
              tickSize: contract.tickSize,
            },
          },
          message: 'Order parameters validated successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (testError: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Order validation failed',
          message: testError.message,
          details: {
            sentParameters: {
              symbol,
              side,
              positionSide,
              type,
              quantity: adjustedQuantity,
            },
            quantityAdjustment,
            contractRules: {
              quantityPrecision: contract.quantityPrecision,
              size: contract.size,
              tradeMinQuantity: contract.tradeMinQuantity,
            },
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[TestOrder] Error:', error.message, error.stack);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test order',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bingx/test-order
 *
 * Get contract specifications for a symbol
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // 2. Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const credentialId = searchParams.get('credentialId');

    if (!credentialId) {
      return NextResponse.json(
        { success: false, error: 'credentialId required', timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    // 3. Load credentials
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');
    const credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

    if (!credentials) {
      return NextResponse.json(
        { success: false, error: 'Credentials not found', timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    // 4. Create BingX service (mainnet only)
    const bingxService = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
    });

    // 5. Get contracts
    const contracts = await bingxService.getContracts();

    if (symbol) {
      // Return specific contract
      const contract = contracts.find((c: any) => c.symbol === symbol);
      if (!contract) {
        return NextResponse.json(
          {
            success: false,
            error: 'Contract not found',
            message: `Symbol ${symbol} not found`,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: contract,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Return all contracts
    return NextResponse.json(
      {
        success: true,
        data: contracts,
        count: contracts.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[TestOrder GET] Error:', error.message);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch contracts',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
