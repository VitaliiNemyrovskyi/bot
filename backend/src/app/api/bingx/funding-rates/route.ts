import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bingx/funding-rates
 *
 * Fetches funding rates for all trading pairs from BingX.
 * This endpoint fetches tickers first, then gets funding rate for each symbol.
 *
 * Query Parameters:
 * - environment (optional): TESTNET or MAINNET - Default: uses active credentials
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "BTC-USDT",
 *       "fundingRate": "0.0001",
 *       "fundingTime": 1234567890000
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
    const credentialId = searchParams.get('credentialId') || undefined;

    // 3. Load BingX credentials (by ID if provided, otherwise active)
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    let credentials;
    if (credentialId) {
      console.log(`[BingX Funding Rates] Loading specific credential: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

      if (!credentials || credentials.exchange !== 'BINGX') {
        console.warn(`[BingX Funding Rates] Invalid or unauthorized BingX credential: ${credentialId}`);
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
      console.log(`[BingX Funding Rates] Loading active credentials for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'BINGX' as any
      );

      if (!credentials) {
        console.warn(`[BingX Funding Rates] No active BingX credentials found for user: ${userId}`);
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

    console.log(`[BingX Funding Rates] Credentials loaded - ID: ${credentials.id}, environment: ${credentials.environment}`);

    // 3. Create BingXService
    const isTestnet = credentials.environment === 'TESTNET';
    const bingxService = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      testnet: isTestnet,
      enableRateLimit: true,
    });

    console.log(`[BingX Funding Rates] Fetching all funding rates in a single request...`);

    // Sync time with BingX server (required for authenticated endpoints)
    await bingxService.syncTime();

    // 4. Get all funding rates at once (no symbol parameter returns all)
    const allFundingRates = await bingxService.getAllFundingRates();
    console.log(`[BingX Funding Rates] Successfully fetched ${allFundingRates.length} funding rates`);

    // 5. Format the response
    const fundingRates = allFundingRates.map(rate => ({
      symbol: rate.symbol,
      fundingRate: rate.fundingRate,
      fundingTime: rate.fundingTime
    }));

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        data: fundingRates,
        testnet: isTestnet,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[BingX Funding Rates] Error:', {
      error: error.message,
      stack: error.stack,
    });

    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('BingX API');
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key');

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
        error: 'Failed to fetch funding rates',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
