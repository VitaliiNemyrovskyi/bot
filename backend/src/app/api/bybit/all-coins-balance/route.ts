import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bybit/all-coins-balance
 *
 * Retrieves all coins balance from Bybit using stored API keys.
 * This endpoint provides comprehensive balance information for all coins in a specific account type,
 * including transferBalance, walletBalance, and bonus fields.
 *
 * This endpoint is particularly useful for querying the FUND (Funding wallet) account
 * where users may have balances that are not shown in other account types.
 *
 * Query Parameters:
 * - accountType (optional): UNIFIED, SPOT, CONTRACT, FUND, OPTION, etc.
 *   Default: FUND (Funding wallet)
 * - coin (optional): Specific coin to query (e.g., BTC, ETH, USDT)
 *   If not specified, returns balances for all coins
 *
 * Authentication: Required (Bearer token)
 *
 * This endpoint loads the user's saved Bybit API credentials from the database
 * and uses them to fetch all coins balance information.
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "memberId": "123456",
 *     "accountType": "FUND",
 *     "balance": [
 *       {
 *         "coin": "USDT",
 *         "transferBalance": "124405.65",
 *         "walletBalance": "124405.65",
 *         "bonus": "0"
 *       },
 *       {
 *         "coin": "BTC",
 *         "transferBalance": "0.5",
 *         "walletBalance": "0.5",
 *         "bonus": "0"
 *       }
 *     ]
 *   },
 *   "accountType": "FUND",
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
    const accountType = searchParams.get('accountType')?.toUpperCase() || 'FUND';
    const coin = searchParams.get('coin')?.toUpperCase() || undefined;

    // 3. Validate accountType if provided
    const validAccountTypes = ['SPOT', 'CONTRACT', 'UNIFIED', 'INVESTMENT', 'OPTION', 'FUND'];
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

    // 4. Create BybitService from database-stored keys
    const bybitService = await BybitService.createFromDatabase(userId);

    if (!bybitService) {
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: 'Please configure your Bybit API credentials first. Go to Settings to add your API keys.',
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 5. Fetch all coins balance from Bybit
    const allCoinsBalance = await bybitService.getAllCoinsBalance(accountType, coin);

    // 6. Return successful response
    return NextResponse.json(
      {
        success: true,
        data: allCoinsBalance,
        accountType,
        ...(coin && { coin }),
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching all coins balance:', error);

    // Handle specific Bybit API errors
    const errorMessage = error.message || 'An unexpected error occurred';
    const isApiError = errorMessage.includes('Bybit API Error');

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch all coins balance',
        message: errorMessage,
        code: isApiError ? 'BYBIT_API_ERROR' : 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
