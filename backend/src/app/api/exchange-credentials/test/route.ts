import { NextRequest, NextResponse } from 'next/server';
import { RestClientV5 } from 'bybit-api';
import { BingXService } from '@/lib/bingx';

/**
 * POST /api/exchange-credentials/test
 * Test exchange API credentials without saving them
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exchange, environment, apiKey, apiSecret } = body;

    // Validate required fields
    if (!exchange || !environment || !apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Exchange, environment, API key, and API secret are required',
        },
        { status: 400 }
      );
    }

    // Convert environment to boolean for testnet
    const isTestnet = environment.toUpperCase() === 'TESTNET';

    // Test credentials based on exchange type
    if (exchange.toUpperCase() === 'BYBIT') {
      // Test Bybit credentials
      const client = new RestClientV5({
        key: apiKey,
        secret: apiSecret,
        testnet: isTestnet,
        enableRateLimit: true,
      });

      try {
        // Test by calling getQueryApiKey endpoint
        const response = await client.getQueryApiKey();

        if (response.retCode !== 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: response.retMsg || 'Failed to validate API keys with Bybit',
              code: 'VALIDATION_FAILED',
            },
            { status: 400 }
          );
        }

        // Extract permissions
        const result = response.result as any;
        const permissions: string[] = [];
        if (result.permissions) {
          Object.entries(result.permissions).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              permissions.push(...value.map(v => `${key}:${v}`));
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          data: {
            exchange: 'BYBIT',
            environment: isTestnet ? 'TESTNET' : 'MAINNET',
            accountType: result.unified === 1 ? 'UNIFIED' : 'CLASSIC',
            permissions,
            vipLevel: result.vipLevel,
            readOnly: result.readOnly === 1,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('Bybit API validation error:', error);

        // Handle Bybit-specific errors
        if (error.code === 401 || error.message?.includes('Invalid')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else if (exchange.toUpperCase() === 'BINANCE') {
      // Binance validation would go here
      return NextResponse.json(
        {
          success: false,
          error: 'Not implemented',
          message: 'Binance credential validation is not yet implemented',
          code: 'NOT_IMPLEMENTED',
        },
        { status: 501 }
      );
    } else if (exchange.toUpperCase() === 'OKX') {
      // OKX validation would go here
      return NextResponse.json(
        {
          success: false,
          error: 'Not implemented',
          message: 'OKX credential validation is not yet implemented',
          code: 'NOT_IMPLEMENTED',
        },
        { status: 501 }
      );
    } else if (exchange.toUpperCase() === 'BINGX') {
      // Test BingX credentials
      const bingxService = new BingXService({
        apiKey,
        apiSecret,
        testnet: isTestnet,
        enableRateLimit: true,
      });

      try {
        // CRITICAL: Sync time with BingX server before making authenticated requests
        // BingX requires accurate timestamps to prevent signature verification failures
        await bingxService.syncTime();

        // Test by calling getBalance endpoint (V3 API)
        const balance = await bingxService.getBalance();

        return NextResponse.json({
          success: true,
          message: 'API credentials are valid',
          testnet: isTestnet,
          accountPreview: {
            balance: balance.balance,
            equity: balance.equity,
            availableMargin: balance.availableMargin,
            asset: balance.asset,
            accountType: 'futures',
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        console.error('BingX API validation error:', error);

        // Handle BingX-specific errors
        if (error.message?.includes('invalid') || error.message?.includes('Invalid')) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid API credentials',
              message: 'The provided API key or secret is invalid',
              code: 'INVALID_CREDENTIALS',
            },
            { status: 400 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: 'Failed to validate credentials',
            message: error.message || 'An error occurred while testing the credentials',
            code: 'VALIDATION_ERROR',
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Unsupported exchange',
          message: `Exchange ${exchange} is not supported`,
          code: 'UNSUPPORTED_EXCHANGE',
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error testing exchange credentials:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'Failed to test credentials',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
