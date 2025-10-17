import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bingx/wallet-balance
 *
 * Fetches wallet balance from BingX account.
 *
 * Query Parameters:
 * - credentialId (optional): Specific credential ID to use
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "asset": "USDT",
 *     "balance": {
 *       "asset": "USDT",
 *       "balance": "10000.00",
 *       "equity": "10000.00",
 *       "unrealizedProfit": "0.00",
 *       "realisedProfit": "0.00",
 *       "availableMargin": "10000.00",
 *       "usedMargin": "0.00",
 *       "freezedMargin": "0.00"
 *     }
 *   },
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
    const credentialId = searchParams.get('credentialId');

    // 3. Load BingX credentials (by ID if provided, otherwise active)
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    let credentials;
    if (credentialId) {
      console.log(`[BingX Balance] Loading specific credential: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

      if (!credentials || credentials.exchange !== 'BINGX') {
        console.warn(`[BingX Balance] Invalid or unauthorized BingX credential: ${credentialId}`);
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
      console.log(`[BingX Balance] Loading active credentials for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'BINGX' as any
      );

      if (!credentials) {
        console.warn(`[BingX Balance] No active BingX credentials found for user: ${userId}`);
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

    console.log(`[BingX Balance] Credentials loaded - ID: ${credentials.id}`);

    // 4. Create BingXService with persistent cache support (mainnet only)
    const bingxService = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId: userId,           // Enable persistent time sync caching
      credentialId: credentialId || credentials.id, // Enable persistent time sync caching
    });

    console.log(`[BingX Balance] BingX service created - cache enabled: true`);

    // Sync time with BingX server (uses cache if available, ~0ms vs 200-600ms)
    await bingxService.syncTime();

    // 5. Fetch wallet balance
    console.log(`[BingX Balance] Fetching wallet balance...`);
    const balance = await bingxService.getWalletBalance();

    console.log(`[BingX Balance] Balance fetched successfully`);

    // 6. Return response
    return NextResponse.json(
      {
        success: true,
        data: balance,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[BingX Balance] Error fetching balance:', {
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
        error: 'Failed to fetch wallet balance',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
