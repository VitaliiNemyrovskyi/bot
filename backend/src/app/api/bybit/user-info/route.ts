import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { AuthService } from '@/lib/auth';
// import { BybitKeysService } from '@/lib/bybit-keys-service';

/**
 * GET /api/bybit/user-info
 *
 * Retrieves comprehensive Bybit user account information including:
 * - Account balances (total equity, wallet balance, available balance)
 * - User account details
 * - API permissions
 * - Active positions
 * - Recent order history
 *
 * Authentication: Required (Bearer token)
 *
 * This endpoint loads the user's saved Bybit API credentials from the database
 * and uses them to fetch account information.
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "timestamp": "2024-01-01T00:00:00Z",
 *   "testnet": boolean,
 *   "data": {
 *     "accountInfo": {...},
 *     "walletBalance": {...},
 *     "positions": [...],
 *     "positionsCount": number,
 *     "activeOrders": [...],
 *     "activeOrdersCount": number,
 *     "orderHistory": [...],
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
    // Authenticate user
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

    // Load credentials from new exchange_credentials table
    console.log(`[UserInfo] Loading credentials for user: ${userId}`);
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    // Get decrypted credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      'BYBIT' as any
    );

    if (!credentials) {
      console.warn(`[UserInfo] No API keys found for user: ${userId}`);
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: `Please configure your Bybit API credentials first. Go to Settings → Exchange Credentials.`,
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log(`[UserInfo] Credentials loaded`);

    // Create BybitService with loaded credentials
    const service = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId: userId,
    });

    console.log(`[UserInfo] BybitService created, fetching user data...`);

    // Fetch all user data in parallel for better performance
    const [accountInfo, walletBalance, positions, activeOrders, orderHistory, ticker] = await Promise.allSettled([
      service.getAccountInfo(),
      service.getWalletBalance('UNIFIED'),
      service.getPositions('linear'),
      service.getOrders('linear'),
      service.getOrderHistory('linear', undefined, 10),
      service.getTicker('linear', 'BTCUSDT') // Get BTC ticker as reference
    ]);

    // Process results and handle individual failures gracefully
    const response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {}
    };

    // Account Info
    if (accountInfo.status === 'fulfilled') {
      response.data.accountInfo = accountInfo.value;
      // console.log('[UserInfo] Account info fetched successfully');
    } else {
      response.data.accountInfo = { error: 'Failed to fetch account info' };
      console.error('[UserInfo] Account info error:', accountInfo.reason);
    }

    // Wallet Balance
    if (walletBalance.status === 'fulfilled') {
      response.data.walletBalance = walletBalance.value;
      // console.log('[UserInfo] Wallet balance fetched successfully');
    } else {
      response.data.walletBalance = { error: 'Failed to fetch wallet balance' };
      console.error('[UserInfo] Wallet balance error:', walletBalance.reason);
    }

    // Positions
    if (positions.status === 'fulfilled') {
      response.data.positions = positions.value;
      response.data.positionsCount = positions.value.length;
      console.log(`[UserInfo] Positions fetched - count: ${positions.value.length}`);
    } else {
      response.data.positions = [];
      response.data.positionsCount = 0;
      console.error('[UserInfo] Positions error:', positions.reason);
    }

    // Active Orders
    if (activeOrders.status === 'fulfilled') {
      response.data.activeOrders = activeOrders.value;
      response.data.activeOrdersCount = activeOrders.value.length;
      console.log(`[UserInfo] Active orders fetched - count: ${activeOrders.value.length}`);
    } else {
      response.data.activeOrders = [];
      response.data.activeOrdersCount = 0;
      console.error('[UserInfo] Active orders error:', activeOrders.reason);
    }

    // Order History
    if (orderHistory.status === 'fulfilled') {
      response.data.orderHistory = orderHistory.value;
      console.log(`[UserInfo] Order history fetched - count: ${orderHistory.value.length}`);
    } else {
      response.data.orderHistory = [];
      console.error('[UserInfo] Order history error:', orderHistory.reason);
    }

    // Market Reference Data
    if (ticker.status === 'fulfilled') {
      response.data.marketReference = ticker.value[0];
      // console.log('[UserInfo] Market reference data fetched successfully');
    } else {
      response.data.marketReference = null;
      console.error('[UserInfo] Market reference error:', ticker.reason);
    }

    // console.log('[UserInfo] User info compiled successfully');

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[UserInfo] Error fetching Bybit user info:', {
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
