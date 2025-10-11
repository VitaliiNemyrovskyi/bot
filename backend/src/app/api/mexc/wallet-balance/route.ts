import { NextRequest, NextResponse } from 'next/server';
import { MEXCService } from '@/lib/mexc';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/mexc/wallet-balance
 *
 * Fetches wallet balance from MEXC account.
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
 *     "currency": "USDT",
 *     "balance": {
 *       "currency": "USDT",
 *       "positionMargin": 0,
 *       "frozenBalance": 0,
 *       "availableBalance": 0,
 *       "cashBalance": 0,
 *       "equity": 0,
 *       "unrealized": 0
 *     }
 *   },
 *   "testnet": boolean,
 *   "timestamp": "2025-10-10T00:00:00.000Z"
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
      console.log(`[MEXC Balance] Loading credential by ID: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);
    } else {
      // Fall back to environment-based loading
      console.log(`[MEXC Balance] Loading credentials for user: ${userId}, environment: ${environment}`);
      credentials = await ExchangeCredentialsService.getCredentialsByEnvironment(
        userId,
        'MEXC' as any,
        environment as any
      );
    }

    if (!credentials) {
      console.warn(`[MEXC Balance] No ${environment} API keys found for user: ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: `Please configure your MEXC ${environment} API credentials first.`,
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log(`[MEXC Balance] Credentials loaded - environment: ${credentials.environment}`);

    // 4. Create MEXCService
    const isTestnet = credentials.environment === 'TESTNET';
    const mexcService = new MEXCService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      authToken: credentials.authToken,
      testnet: isTestnet,
      enableRateLimit: true,
    });

    console.log(`[MEXC Balance] MEXC service created - testnet: ${isTestnet}`);

    // 5. Fetch wallet balance
    console.log(`[MEXC Balance] Fetching wallet balance...`);
    const balance = await mexcService.getWalletBalance();

    console.log(`[MEXC Balance] Balance fetched successfully`);

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
    console.error('[MEXC Balance] Error fetching balance:', {
      error: error.message,
      stack: error.stack,
    });

    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('MEXC API');
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key') ||
                        errorMessage.includes('API credentials required');

    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (isAuthError) {
      statusCode = 401;
      errorCode = 'INVALID_CREDENTIALS';
    } else if (isApiError) {
      errorCode = 'MEXC_API_ERROR';
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
