import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bingx/tickers
 *
 * Fetches ticker data for all perpetual futures trading pairs from BingX.
 * Uses the active BingX credentials for the authenticated user.
 *
 * Query Parameters:
 * - symbol (optional): Specific trading pair (e.g., BTC-USDT)
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "BTC-USDT",
 *       "lastPrice": "50000.00",
 *       "priceChange": "500.00",
 *       "priceChangePercent": "1.01",
 *       ...
 *     }
 *   ],
 *   "testnet": boolean,
 *   "timestamp": "2025-10-06T13:00:00.000Z"
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
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

    // 2. Get query parameters
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || undefined;
    const credentialId = searchParams.get('credentialId') || undefined;

    // 3. Load BingX credentials (by ID if provided, otherwise active)
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    let credentials;
    if (credentialId) {
      console.log(`[BingX Tickers] Loading specific credential: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

      if (!credentials || credentials.exchange !== 'BINGX') {
        console.warn(`[BingX Tickers] Invalid or unauthorized BingX credential: ${credentialId}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credential',
            message: 'The specified credential is invalid or does not belong to you.',
            code: 'INVALID_CREDENTIAL',
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    } else {
      console.log(`[BingX Tickers] Loading active credentials for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'BINGX' as any
      );

      if (!credentials) {
        console.warn(`[BingX Tickers] No active BingX credentials found for user: ${userId}`);
        return NextResponse.json(
          {
            success: false,
            error: 'API credentials not configured',
            message: 'Please configure and activate your BingX API credentials first.',
            code: 'NO_API_KEYS',
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    }

    console.log(`[BingX Tickers] Credentials loaded - ID: ${credentials.id}, environment: ${credentials.environment}`);

    // 4. Create BingXService
    const isTestnet = credentials.environment === 'TESTNET';
    const bingxService = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      testnet: isTestnet,
      enableRateLimit: true,
    });

    console.log(`[BingX Tickers] BingX service created - testnet: ${isTestnet}`);

    // Sync time with BingX server before making authenticated requests
    await bingxService.syncTime();

    // 5. Fetch tickers
    console.log(`[BingX Tickers] Fetching tickers - symbol: ${symbol || 'all'}`);
    const tickers = await bingxService.getTickers();

    // Filter by symbol if provided
    const filteredTickers = symbol
      ? tickers.filter(t => t.symbol === symbol)
      : tickers;

    console.log(`[BingX Tickers] Fetched ${filteredTickers.length} tickers successfully`);

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        data: filteredTickers,
        ...(symbol && { symbol }),
        testnet: isTestnet,
        count: filteredTickers.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[BingX Tickers] Error fetching tickers:', {
      error: error.message,
      stack: error.stack,
    });

    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('BingX API');
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key') ||
                        errorMessage.includes('API credentials required');

    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (isAuthError) {
      statusCode = 401;
      errorCode = 'INVALID_CREDENTIALS';
    } else if (isApiError) {
      errorCode = 'BINGX_API_ERROR';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tickers',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
