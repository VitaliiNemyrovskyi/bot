import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bingx/wallet-balance
 *
 * Fetches wallet balance from BingX account.
 *
 * Query Parameters:
 * - environment (optional): TESTNET or MAINNET - Default: TESTNET
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
    const environment = searchParams.get('environment')?.toUpperCase() || 'TESTNET';
    const credentialId = searchParams.get('credentialId');

    // 3. Load credentials
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    let credentials;
    if (credentialId) {
      // Load specific credential by ID
      console.log(`[BingX Balance] Loading credential by ID: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);
    } else {
      // Fall back to environment-based loading
      console.log(`[BingX Balance] Loading credentials for user: ${userId}, environment: ${environment}`);
      credentials = await ExchangeCredentialsService.getCredentialsByEnvironment(
        userId,
        'BINGX' as any,
        environment as any
      );
    }

    if (!credentials) {
      console.warn(`[BingX Balance] No ${environment} API keys found for user: ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: `Please configure your BingX ${environment} API credentials first.`,
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log(`[BingX Balance] Credentials loaded - environment: ${credentials.environment}`);

    // 4. Create BingXService with persistent cache support
    const isTestnet = credentials.environment === 'TESTNET';
    const bingxService = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      testnet: isTestnet,
      enableRateLimit: true,
      userId: userId,           // Enable persistent time sync caching
      credentialId: credentialId || credentials.id, // Enable persistent time sync caching
    });

    console.log(`[BingX Balance] BingX service created - testnet: ${isTestnet}, cache enabled: true`);

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
        testnet: isTestnet,
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
