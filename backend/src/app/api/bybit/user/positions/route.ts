import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { BybitService } from '@/lib/bybit';
import { BybitPositionsResponse, GetBybitPositionsRequest } from '@/types/bybit';

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
 * GET /api/bybit/user/positions
 *
 * Fetches authenticated user's Bybit positions
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - category: 'linear' | 'spot' | 'option' (optional, default: 'linear')
 * - symbol: string (optional, filter by specific trading pair)
 * - settleCoin: string (optional, filter by settlement coin)
 * - limit: number (optional, max number of positions to return)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "category": "linear",
 *     "positions": [
 *       {
 *         "symbol": "BTCUSDT",
 *         "side": "Buy",
 *         "size": "0.1",
 *         "positionValue": "5000.00",
 *         "entryPrice": "50000.00",
 *         "markPrice": "51000.00",
 *         "unrealisedPnl": "100.00",
 *         "cumRealisedPnl": "500.00",
 *         "leverage": "10",
 *         "liqPrice": "45000.00",
 *         "takeProfit": "55000.00",
 *         "stopLoss": "48000.00",
 *         "createdTime": "1234567890000",
 *         "updatedTime": "1234567890000"
 *       }
 *     ],
 *     "totalPositions": 1
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
        } as BybitPositionsResponse,
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') as 'linear' | 'spot' | 'option') || 'linear';
    const symbol = searchParams.get('symbol') || undefined;
    const settleCoin = searchParams.get('settleCoin') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // Validate category
    const validCategories = ['linear', 'spot', 'option'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
          code: 'INVALID_CATEGORY',
          timestamp: new Date().toISOString()
        } as BybitPositionsResponse,
        { status: 400 }
      );
    }

    // Validate limit if provided
    if (limit !== undefined && (limit < 1 || limit > 200)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 200',
          code: 'INVALID_LIMIT',
          timestamp: new Date().toISOString()
        } as BybitPositionsResponse,
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
        } as BybitPositionsResponse,
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

    // Fetch positions
    const positions = await bybitService.getPositions(category, symbol);

    // Filter out positions with zero size (closed positions)
    const activePositions = positions.filter(pos => parseFloat(pos.size) > 0);

    // Apply limit if specified
    const limitedPositions = limit ? activePositions.slice(0, limit) : activePositions;

    // Format positions for response
    const formattedPositions = limitedPositions.map(pos => ({
      symbol: pos.symbol,
      side: pos.side,
      size: pos.size,
      positionValue: pos.positionValue,
      entryPrice: pos.entryPrice,
      markPrice: pos.markPrice,
      unrealisedPnl: pos.unrealisedPnl,
      cumRealisedPnl: pos.cumRealisedPnl,
      leverage: (pos as any).leverage || '1',
      liqPrice: pos.liqPrice,
      takeProfit: pos.takeProfit,
      stopLoss: pos.stopLoss,
      createdTime: pos.createdTime,
      updatedTime: pos.updatedTime
    }));

    // Format response
    const response: BybitPositionsResponse = {
      success: true,
      data: {
        category,
        positions: formattedPositions,
        totalPositions: formattedPositions.length
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching Bybit positions:', error);

    // Handle Bybit API specific errors
    if (error.message?.includes('Bybit API Error')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'BYBIT_API_ERROR',
          timestamp: new Date().toISOString()
        } as BybitPositionsResponse,
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Bybit positions',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      } as BybitPositionsResponse,
      { status: 500 }
    );
  }
}
