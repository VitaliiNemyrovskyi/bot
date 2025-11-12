import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bybit/balance
 *
 * Simplified endpoint to retrieve Bybit wallet balance.
 * This is an alias for /api/bybit/wallet-balance with sensible defaults.
 *
 * Query Parameters:
 * - accountType (optional): UNIFIED, CONTRACT, SPOT - Default: UNIFIED
 * - coin (optional): Specific coin (e.g., USDT, BTC)
 * - environment (optional): TESTNET or MAINNET - Default: TESTNET
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": { ... wallet balance data ... },
 *   "accountType": "UNIFIED",
 *   "testnet": boolean,
 *   "timestamp": "2025-10-01T13:00:00.000Z"
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
    const accountType = (searchParams.get('accountType') || 'UNIFIED').toUpperCase();
    const coin = searchParams.get('coin') || undefined;

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

    // 4. Load credentials
    console.log(`[Balance] Loading credentials for user: ${userId}`);
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      'BYBIT' as any
    );

    if (!credentials) {
      console.warn(`[Balance] No API keys found for user: ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: `Please configure your Bybit API credentials first.`,
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log(`[Balance] Credentials loaded`);

    // 5. Create BybitService
    const bybitService = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId,
    });

    console.log(`[Balance] Bybit service created`);

    // 6. Fetch wallet balance
    console.log(`[Balance] Fetching balance - accountType: ${accountType}, coin: ${coin || 'all'}`);
    const walletBalance = await bybitService.getWalletBalance(
      accountType as 'UNIFIED' | 'CONTRACT',
      coin
    );

    console.log(`[Balance] Balance fetched successfully`);

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: walletBalance,
        accountType,
        ...(coin && { coin }),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Balance] Error fetching balance:', {
      error: error.message,
      stack: error.stack,
    });

    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('Bybit API Error');
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key') ||
                        errorMessage.includes('API credentials required');

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
        error: 'Failed to fetch balance',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
