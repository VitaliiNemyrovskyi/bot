import { NextRequest, NextResponse } from 'next/server';
import { BingXService } from '@/lib/bingx';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bingx/user-info
 *
 * Retrieves comprehensive BingX user account information including:
 * - Account balances (balance, equity, available margin)
 * - Wallet balance details
 * - Active positions
 * - Open orders
 *
 * Authentication: Required (Bearer token)
 *
 * This endpoint loads the user's saved BingX API credentials from the database
 * and uses them to fetch account information.
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "timestamp": "2025-10-06T00:00:00Z",
 *   "data": {
 *     "accountInfo": {...},
 *     "walletBalance": {...},
 *     "positions": [...],
 *     "positionsCount": number,
 *     "marketReference": {...}
 *   }
 * }
 *
 * Error responses:
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

    // 2. Load active BingX credentials from database
    console.log(`[BingX UserInfo] Loading active credentials for user: ${userId}`);
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      'BINGX' as any
    );

    if (!credentials) {
      console.warn(`[BingX UserInfo] No active BingX credentials found for user: ${userId}`);
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

    console.log(`[BingX UserInfo] Credentials loaded - ID: ${credentials.id}`);

    // 4. Create BingXService with loaded credentials (mainnet only)
    const service = new BingXService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
    });

    console.log(`[BingX UserInfo] BingXService created, fetching user data...`);

    // Sync time with BingX server before making authenticated requests
    await service.syncTime();

    // 5. Fetch all user data in parallel for better performance
    const [accountInfo, walletBalance, positions, tickers] = await Promise.allSettled([
      service.getAccountInfo(),
      service.getWalletBalance(),
      service.getPositions(),
      service.getTickers()
    ]);

    // 6. Process results and handle individual failures gracefully
    const response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Account Info
    if (accountInfo.status === 'fulfilled') {
      response.data.accountInfo = accountInfo.value;
      // console.log('[BingX UserInfo] Account info fetched successfully');
    } else {
      response.data.accountInfo = { error: 'Failed to fetch account info' };
      console.error('[BingX UserInfo] Account info error:', accountInfo.reason);
    }

    // Wallet Balance
    if (walletBalance.status === 'fulfilled') {
      response.data.walletBalance = walletBalance.value;
      // console.log('[BingX UserInfo] Wallet balance fetched successfully');
    } else {
      response.data.walletBalance = { error: 'Failed to fetch wallet balance' };
      console.error('[BingX UserInfo] Wallet balance error:', walletBalance.reason);
    }

    // Positions
    if (positions.status === 'fulfilled') {
      response.data.positions = positions.value;
      response.data.positionsCount = positions.value.length;
      console.log(`[BingX UserInfo] Positions fetched - count: ${positions.value.length}`);
    } else {
      response.data.positions = [];
      response.data.positionsCount = 0;
      console.error('[BingX UserInfo] Positions error:', positions.reason);
    }

    // Market Reference Data (BTC-USDT ticker as reference)
    if (tickers.status === 'fulfilled') {
      const btcTicker = tickers.value.find(t => t.symbol === 'BTC-USDT');
      response.data.marketReference = btcTicker || tickers.value[0] || null;
      // console.log('[BingX UserInfo] Market reference data fetched successfully');
    } else {
      response.data.marketReference = null;
      console.error('[BingX UserInfo] Market reference error:', tickers.reason);
    }

    // console.log('[BingX UserInfo] User info compiled successfully');

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[BingX UserInfo] Error fetching BingX user info:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    });

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const isAuthError = errorMessage.includes('invalid api key') ||
                        errorMessage.includes('Invalid API key') ||
                        errorMessage.includes('API credentials required');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user information',
        message: errorMessage,
        code: isAuthError ? 'INVALID_CREDENTIALS' : 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
