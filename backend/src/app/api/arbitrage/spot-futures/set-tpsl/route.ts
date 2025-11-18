import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BybitConnector } from '@/connectors/bybit.connector';
import { BingXConnector } from '@/connectors/bingx.connector';
import { MEXCConnector } from '@/connectors/mexc.connector';
import { GateIOConnector } from '@/connectors/gateio.connector';
import { BaseExchangeConnector } from '@/connectors/base-exchange.connector';

/**
 * POST /api/arbitrage/spot-futures/set-tpsl
 *
 * Set or update Take-Profit and Stop-Loss orders for an active Spot-Futures arbitrage position.
 * This endpoint:
 * 1. Verifies the position exists and belongs to the authenticated user
 * 2. Initializes connectors for both PRIMARY and HEDGE exchanges
 * 3. Calls setTradingStop() on both connectors to place TP/SL orders
 * 4. Returns success/failure status for each exchange
 *
 * Authentication: Required (Bearer token)
 * Authorization: User must own the position
 *
 * Request Body:
 * {
 *   "positionId": "arb_1_1234567890"  // Position ID from GraduatedEntryPosition table
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "primary": {
 *       "success": true,
 *       "takeProfitOrderId": "123456",
 *       "stopLossOrderId": "123457",
 *       "message": "Trading stop set successfully"
 *     },
 *     "hedge": {
 *       "success": true,
 *       "takeProfitOrderId": "789012",
 *       "stopLossOrderId": "789013",
 *       "message": "Trading stop set successfully"
 *     }
 *   },
 *   "timestamp": "2025-10-27T00:00:00.000Z"
 * }
 *
 * Response (Error - 400/404/500):
 * {
 *   "success": false,
 *   "error": "Error type",
 *   "message": "Detailed error message",
 *   "code": "ERROR_CODE",
 *   "timestamp": "2025-10-27T00:00:00.000Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    console.log('[SpotFutures-TPSL] Authenticating user for set TP/SL request');
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      console.log('[SpotFutures-TPSL] Authentication failed:', authResult.error);
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
    console.log('[SpotFutures-TPSL] User authenticated:', userId);

    // 2. Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error: any) {
      console.error('[SpotFutures-TPSL] Failed to parse request body:', error.message);
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

    const { positionId } = body;

    // 3. Validate positionId
    if (!positionId || typeof positionId !== 'string') {
      console.error('[SpotFutures-TPSL] Missing or invalid positionId:', positionId);
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field',
          message: 'positionId is required and must be a string',
          code: 'MISSING_POSITION_ID',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('[SpotFutures-TPSL] Setting TP/SL for position:', positionId);

    // 4. Fetch position from database
    const position = await prisma.graduatedEntryPosition.findUnique({
      where: { positionId },
    });

    if (!position) {
      console.error('[SpotFutures-TPSL] Position not found:', positionId);
      return NextResponse.json(
        {
          success: false,
          error: 'Position not found',
          message: `No position found with ID: ${positionId}`,
          code: 'POSITION_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 5. Verify ownership
    if (position.userId !== userId) {
      console.error('[SpotFutures-TPSL] Unauthorized access attempt:', {
        positionUserId: position.userId,
        requestUserId: userId,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to modify this position',
          code: 'UNAUTHORIZED_ACCESS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 6. Check position status
    if (position.status !== 'ACTIVE') {
      console.error('[SpotFutures-TPSL] Position not active:', {
        positionId,
        status: position.status,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Position not active',
          message: `Position must be ACTIVE to set TP/SL (current status: ${position.status})`,
          code: 'POSITION_NOT_ACTIVE',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('[SpotFutures-TPSL] Position validated:', {
      positionId: position.positionId,
      symbol: position.symbol,
      primaryExchange: position.primaryExchange,
      hedgeExchange: position.hedgeExchange,
      status: position.status,
    });

    // 7. Initialize exchange connectors
    const primaryCreds = await ExchangeCredentialsService.getCredentialById(
      userId,
      position.primaryCredentialId
    );
    const hedgeCreds = await ExchangeCredentialsService.getCredentialById(
      userId,
      position.hedgeCredentialId
    );

    if (!primaryCreds || !hedgeCreds) {
      console.error('[SpotFutures-TPSL] Failed to fetch credentials');
      return NextResponse.json(
        {
          success: false,
          error: 'Credentials not found',
          message: 'Failed to fetch exchange credentials for this position',
          code: 'CREDENTIALS_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Helper function to create connector
    const createConnector = async (
      exchangeName: string,
      credentials: any
    ): Promise<BaseExchangeConnector> => {
      const exchange = exchangeName.toUpperCase();

      let connector: BaseExchangeConnector;

      if (exchange.includes('BYBIT')) {
        connector = new BybitConnector(
          credentials.apiKey,
          credentials.apiSecret,
          credentials.testnet
        );
      } else if (exchange.includes('BINGX')) {
        connector = new BingXConnector(
          credentials.apiKey,
          credentials.apiSecret,
          credentials.testnet
        );
      } else if (exchange.includes('MEXC')) {
        connector = new MEXCConnector(
          credentials.apiKey,
          credentials.apiSecret,
          credentials.authToken
        );
      } else if (exchange.includes('GATEIO') || exchange.includes('GATE.IO') || exchange.includes('GATE')) {
        connector = new GateIOConnector(
          credentials.apiKey,
          credentials.apiSecret
        );
      } else {
        throw new Error(`Unsupported exchange: ${exchangeName}`);
      }

      await connector.initialize();
      return connector;
    };

    const primaryConnector = await createConnector(position.primaryExchange, primaryCreds);
    const hedgeConnector = await createConnector(position.hedgeExchange, hedgeCreds);

    // Set expected position sizes for GateIO connectors (for fallback when API fails)
    console.log('[SpotFutures-TPSL] PRIMARY exchangeName:', primaryConnector.exchangeName);
    console.log('[SpotFutures-TPSL] HEDGE exchangeName:', hedgeConnector.exchangeName);

    // Check if expectedPositionSize exists
    console.log('[SpotFutures-TPSL] PRIMARY has expectedPositionSize?', 'expectedPositionSize' in primaryConnector);
    console.log('[SpotFutures-TPSL] HEDGE has expectedPositionSize?', 'expectedPositionSize' in hedgeConnector);

    if (primaryConnector.exchangeName === 'GATEIO') {
      (primaryConnector as any).expectedPositionSize = position.primaryQuantity;
      console.log('[SpotFutures-TPSL] Set PRIMARY expectedPositionSize:', position.primaryQuantity);
    }
    if (hedgeConnector.exchangeName === 'GATEIO') {
      (hedgeConnector as any).expectedPositionSize = position.hedgeQuantity;
      console.log('[SpotFutures-TPSL] Set HEDGE expectedPositionSize:', position.hedgeQuantity);
    }

    console.log('[SpotFutures-TPSL] Connectors initialized');

    // 8. Calculate TP/SL levels (reuse logic from graduated-entry-arbitrage.service.ts)
    // For now, we'll retrieve existing TP/SL from position metadata or calculate fresh
    // This is a simplified version - in production you'd call the same calculation logic

    const primaryEntryPrice = position.primaryEntryPrice || 0;
    const hedgeEntryPrice = position.hedgeEntryPrice || 0;

    if (primaryEntryPrice === 0 || hedgeEntryPrice === 0) {
      console.error('[SpotFutures-TPSL] Missing entry prices:', {
        primaryEntryPrice: position.primaryEntryPrice,
        hedgeEntryPrice: position.hedgeEntryPrice,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Missing entry prices',
          message: 'Position entry prices not available yet',
          code: 'MISSING_ENTRY_PRICES',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Simple TP/SL calculation: ±1% from entry
    // TODO: Use actual liquidation calculator like in graduated-entry service
    const primaryTakeProfit = position.primarySide === 'short'
      ? primaryEntryPrice * 0.99  // TP for SHORT: price goes down
      : primaryEntryPrice * 1.01; // TP for LONG: price goes up

    const primaryStopLoss = position.primarySide === 'short'
      ? primaryEntryPrice * 1.01  // SL for SHORT: price goes up
      : primaryEntryPrice * 0.99; // SL for LONG: price goes down

    const hedgeTakeProfit = position.hedgeSide === 'short'
      ? hedgeEntryPrice * 0.99
      : hedgeEntryPrice * 1.01;

    const hedgeStopLoss = position.hedgeSide === 'short'
      ? hedgeEntryPrice * 1.01
      : hedgeEntryPrice * 0.99;

    console.log('[SpotFutures-TPSL] Calculated TP/SL levels:', {
      primary: {
        side: position.primarySide,
        entryPrice: primaryEntryPrice,
        takeProfit: primaryTakeProfit,
        stopLoss: primaryStopLoss,
      },
      hedge: {
        side: position.hedgeSide,
        entryPrice: hedgeEntryPrice,
        takeProfit: hedgeTakeProfit,
        stopLoss: hedgeStopLoss,
      },
    });

    // 9. Set TP/SL on both exchanges
    const results: any = {
      primary: { success: false, error: null },
      hedge: { success: false, error: null },
    };

    // Set TP/SL on PRIMARY exchange
    console.log('[SpotFutures-TPSL] Setting TP/SL on PRIMARY exchange...');
    if (typeof primaryConnector.setTradingStop === 'function') {
      try {
        const result = await primaryConnector.setTradingStop({
          symbol: position.symbol,
          side: position.primarySide as any,
          takeProfit: primaryTakeProfit,
          stopLoss: primaryStopLoss,
        });
        results.primary = result;
        console.log('[SpotFutures-TPSL] PRIMARY TP/SL set successfully:', result);
      } catch (error: any) {
        results.primary.error = error.message;
        console.error('[SpotFutures-TPSL] Failed to set PRIMARY TP/SL:', error.message);
      }
    } else {
      results.primary.error = `${position.primaryExchange} does not support setTradingStop`;
      console.warn('[SpotFutures-TPSL]', results.primary.error);
    }

    // Set TP/SL on HEDGE exchange
    console.log('[SpotFutures-TPSL] Setting TP/SL on HEDGE exchange...');
    if (typeof hedgeConnector.setTradingStop === 'function') {
      try {
        const result = await hedgeConnector.setTradingStop({
          symbol: position.symbol,
          side: position.hedgeSide as any,
          takeProfit: hedgeTakeProfit,
          stopLoss: hedgeStopLoss,
        });
        results.hedge = result;
        console.log('[SpotFutures-TPSL] HEDGE TP/SL set successfully:', result);
      } catch (error: any) {
        results.hedge.error = error.message;
        console.error('[SpotFutures-TPSL] Failed to set HEDGE TP/SL:', error.message);
      }
    } else {
      results.hedge.error = `${position.hedgeExchange} does not support setTradingStop`;
      console.warn('[SpotFutures-TPSL]', results.hedge.error);
    }

    // 10. Return results
    const overallSuccess = results.primary.success || results.hedge.success;

    console.log('[SpotFutures-TPSL] TP/SL synchronization complete:', {
      overallSuccess,
      primarySuccess: results.primary.success,
      hedgeSuccess: results.hedge.success,
    });

    return NextResponse.json(
      {
        success: overallSuccess,
        data: results,
        message: overallSuccess
          ? 'TP/SL synchronized successfully on at least one exchange'
          : 'Failed to set TP/SL on both exchanges',
        timestamp: new Date().toISOString(),
      },
      { status: overallSuccess ? 200 : 500 }
    );
  } catch (error: any) {
    console.error('[SpotFutures-TPSL] Unexpected error:', {
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
