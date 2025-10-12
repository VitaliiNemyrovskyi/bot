import { NextRequest, NextResponse } from 'next/server';
import { getAllMarketCaps, getMarketCaps } from '@/services/coingecko.service';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/market-data/market-caps
 *
 * Returns market capitalization data for cryptocurrency symbols
 * Data is sourced from CoinGecko API and cached for 5 minutes
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - symbols: Comma-separated list of symbols (e.g., "BTCUSDT,ETHUSDT") - optional
 *   If not provided, returns all available market caps
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "BTCUSDT": 1000000,  // Market cap in millions USD
 *     "ETHUSDT": 400000,
 *     ...
 *   },
 *   "timestamp": "2025-10-12T09:00:00.000Z"
 * }
 *
 * Response (Error - 401/500):
 * {
 *   "success": false,
 *   "error": "Error message",
 *   "code": "ERROR_CODE",
 *   "timestamp": "2025-10-12T09:00:00.000Z"
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

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    console.log(`[MarketCaps] Request from user: ${authResult.user.userId}`);

    // 3. Fetch market caps
    let marketCaps: Map<string, number>;

    if (symbolsParam) {
      // Fetch specific symbols
      const symbols = symbolsParam.split(',').map(s => s.trim());
      console.log(`[MarketCaps] Fetching for ${symbols.length} symbols`);
      marketCaps = await getMarketCaps(symbols);
    } else {
      // Fetch all market caps
      console.log(`[MarketCaps] Fetching all market caps`);
      marketCaps = await getAllMarketCaps();
    }

    // 4. Convert Map to object for JSON response
    const marketCapsObject: Record<string, number> = {};
    marketCaps.forEach((value, key) => {
      marketCapsObject[key] = value;
    });

    console.log(`[MarketCaps] Returning ${marketCaps.size} market caps`);

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        data: marketCapsObject,
        count: marketCaps.size,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[MarketCaps] Error fetching market caps:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market capitalization data',
        message: error.message || 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
