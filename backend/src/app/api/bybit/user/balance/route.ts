import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { BybitService } from '@/lib/bybit';
import { BybitBalanceResponse } from '@/types/bybit';

// In-memory storage for user Bybit API keys (should be database in production)
const userBybitKeys = new Map<string, { apiKey: string; apiSecret: string; testnet: boolean }>();

// Initialize mock data for development
function initMockBybitKeys() {
  if (userBybitKeys.size === 0) {
    userBybitKeys.set('admin_1', {
      apiKey: process.env.BYBIT_API_KEY || '',
      apiSecret: process.env.BYBIT_API_SECRET || '',
      testnet: process.env.NODE_ENV !== 'production'
    });
    userBybitKeys.set('user_1', {
      apiKey: process.env.BYBIT_API_KEY || '',
      apiSecret: process.env.BYBIT_API_SECRET || '',
      testnet: process.env.NODE_ENV !== 'production'
    });
  }
}

/**
 * GET /api/bybit/user/balance
 *
 * Fetches authenticated user's Bybit wallet balance
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - accountType: 'UNIFIED' | 'CONTRACT' | 'SPOT' (optional, default: 'UNIFIED')
 * - coin: string (optional, filter by specific coin)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "accountType": "UNIFIED",
 *     "totalEquity": "10000.00",
 *     "totalWalletBalance": "9500.00",
 *     "totalAvailableBalance": "8000.00",
 *     "totalPerpUPL": "500.00",
 *     "coins": [
 *       {
 *         "coin": "BTC",
 *         "equity": "0.5",
 *         "usdValue": "25000.00",
 *         "walletBalance": "0.5",
 *         "availableToWithdraw": "0.4",
 *         "unrealisedPnl": "100.00",
 *         "cumRealisedPnl": "500.00"
 *       }
 *     ]
 *   }
 * }
 *
 * Error responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 403: Forbidden (no Bybit API keys configured)
 * - 400: Bad request (invalid parameters)
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
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString()
        } as BybitBalanceResponse,
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const accountType = (searchParams.get('accountType') as 'UNIFIED' | 'CONTRACT' | 'SPOT') || 'UNIFIED';
    const coin = searchParams.get('coin') || undefined;

    // Validate accountType
    const validAccountTypes = ['UNIFIED', 'CONTRACT', 'SPOT'];
    if (!validAccountTypes.includes(accountType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid accountType. Must be one of: ${validAccountTypes.join(', ')}`,
          code: 'INVALID_ACCOUNT_TYPE',
          timestamp: new Date().toISOString()
        } as BybitBalanceResponse,
        { status: 400 }
      );
    }

    // Initialize mock data
    initMockBybitKeys();

    // Get user's Bybit API credentials
    const userKeys = userBybitKeys.get(userId);

    if (!userKeys || !userKeys.apiKey || !userKeys.apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bybit API keys not configured for this user',
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString()
        } as BybitBalanceResponse,
        { status: 403 }
      );
    }

    // Initialize Bybit service with user's credentials
    const bybitService = new BybitService({
      apiKey: userKeys.apiKey,
      apiSecret: userKeys.apiSecret,
      testnet: userKeys.testnet,
      enableRateLimit: true
    });

    // Fetch wallet balance
    const balanceData = await bybitService.getWalletBalance(accountType, coin);

    // Extract and format the balance information
    const balanceList = balanceData.list?.[0];

    if (!balanceList) {
      return NextResponse.json(
        {
          success: false,
          error: 'No balance data available',
          code: 'NO_BALANCE_DATA',
          timestamp: new Date().toISOString()
        } as BybitBalanceResponse,
        { status: 404 }
      );
    }

    // Format coin balances
    const coins = (balanceList.coin || []).map((coinData: any) => ({
      coin: coinData.coin,
      equity: coinData.equity,
      usdValue: coinData.usdValue,
      walletBalance: coinData.walletBalance,
      availableToWithdraw: coinData.availableToWithdraw,
      unrealisedPnl: coinData.unrealisedPnl,
      cumRealisedPnl: coinData.cumRealisedPnl
    }));

    // Format response
    const response: BybitBalanceResponse = {
      success: true,
      data: {
        accountType: balanceList.accountType,
        totalEquity: balanceList.totalEquity,
        totalWalletBalance: balanceList.totalWalletBalance,
        totalAvailableBalance: balanceList.totalAvailableBalance,
        totalPerpUPL: balanceList.totalPerpUPL,
        coins
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching Bybit balance:', error);

    // Handle Bybit API specific errors
    if (error.message?.includes('Bybit API Error')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'BYBIT_API_ERROR',
          timestamp: new Date().toISOString()
        } as BybitBalanceResponse,
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Bybit wallet balance',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      } as BybitBalanceResponse,
      { status: 500 }
    );
  }
}
