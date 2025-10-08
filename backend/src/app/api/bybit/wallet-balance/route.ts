import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bybit/wallet-balance
 *
 * Retrieves wallet balance information from Bybit using stored API keys.
 *
 * Query Parameters:
 * - accountType (optional): UNIFIED, CONTRACT, SPOT, INVESTMENT, OPTION, or FUND
 *   Default: UNIFIED
 * - coin (optional): Specific coin to query (e.g., USDT, BTC)
 *   If not specified, returns balances for all coins
 *
 * Authentication: Required (Bearer token)
 *
 * This endpoint loads the user's saved Bybit API credentials from the database
 * and uses them to fetch wallet balance information.
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "list": [
 *       {
 *         "accountType": "UNIFIED",
 *         "totalEquity": "1234.56",
 *         "totalWalletBalance": "1234.56",
 *         "totalAvailableBalance": "1234.56",
 *         "coin": [
 *           {
 *             "coin": "USDT",
 *             "equity": "1000.00",
 *             "walletBalance": "1000.00",
 *             "availableToWithdraw": "1000.00",
 *             "locked": "0.00",
 *             "usdValue": "1000.00"
 *           }
 *         ]
 *       }
 *     ]
 *   },
 *   "accountType": "UNIFIED",
 *   "coin": "USDT",
 *   "testnet": boolean,
 *   "timestamp": "2025-10-01T13:00:00.000Z"
 * }
 *
 * Error responses:
 * - 400: Bad Request (invalid accountType)
 * - 401: Unauthorized (missing or invalid token)
 * - 403: No API keys configured
 * - 500: Internal server error
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
    const accountType = (searchParams.get('accountType') || 'UNIFIED').toUpperCase();
    const coin = searchParams.get('coin') || undefined;
    const environment = searchParams.get('environment')?.toUpperCase() || 'TESTNET';
    const credentialId = searchParams.get('credentialId');

    // 3. Validate accountType
    const validAccountTypes = ['UNIFIED', 'CONTRACT', 'SPOT', 'INVESTMENT', 'OPTION', 'FUND'];
    if (!validAccountTypes.includes(accountType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid account type',
          message: `Account type must be one of: ${validAccountTypes.join(', ')}`,
          code: 'INVALID_ACCOUNT_TYPE',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 4. Load credentials from new exchange_credentials table
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    let credentials;
    if (credentialId) {
      // Load specific credential by ID
      console.log(`[WalletBalance] Loading credential by ID: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);
    } else {
      // Fall back to environment-based loading
      console.log(`[WalletBalance] Loading credentials for user: ${userId}, environment: ${environment}`);
      credentials = await ExchangeCredentialsService.getCredentialsByEnvironment(
        userId,
        'BYBIT' as any,
        environment as any
      );
    }

    if (!credentials) {
      console.warn(`[WalletBalance] No ${environment} API keys found for user: ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: `Please configure your Bybit ${environment} API credentials first. Go to Settings → Exchange Credentials.`,
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log(`[WalletBalance] Credentials loaded - environment: ${credentials.environment}`);

    // 5. Create BybitService with loaded credentials
    const isTestnet = credentials.environment === 'TESTNET';
    const bybitService = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      testnet: isTestnet,
      enableRateLimit: true,
      userId,
    });

    console.log(`[WalletBalance] Bybit service created - testnet: ${isTestnet}`);

    // 6. Fetch wallet balance from Bybit
    console.log(`[WalletBalance] Fetching balance - accountType: ${accountType}, coin: ${coin || 'all'}`);
    const walletBalance = await bybitService.getWalletBalance(
      accountType as 'UNIFIED' | 'CONTRACT',
      coin
    );

    console.log(`[WalletBalance] Balance fetched successfully`);

    // 7. Return successful response
    return NextResponse.json(
      {
        success: true,
        data: walletBalance,
        accountType,
        ...(coin && { coin }),
        testnet: isTestnet,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[WalletBalance] Error fetching wallet balance:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });

    // Handle specific Bybit API errors
    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('Bybit API Error');
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key') ||
                        errorMessage.includes('API credentials required');

    // Determine appropriate status code
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';

    if (isAuthError) {
      statusCode = 401;
      errorCode = 'INVALID_CREDENTIALS';
    } else if (isApiError) {
      errorCode = 'BYBIT_API_ERROR';
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
