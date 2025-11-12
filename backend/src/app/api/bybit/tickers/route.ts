import { NextRequest, NextResponse } from 'next/server';
import { BybitService } from '@/lib/bybit';
import { AuthService } from '@/lib/auth';

/**
 * GET /api/bybit/tickers
 *
 * Fetches ticker data for all trading pairs or a specific symbol.
 * For linear/inverse contracts, includes funding rate information.
 * Uses the active Bybit credentials for the authenticated user.
 *
 * Query Parameters:
 * - category (required): linear, inverse, spot, or option
 * - symbol (optional): Specific trading pair (e.g., BTCUSDT)
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "symbol": "BTCUSDT",
 *       "lastPrice": "50000.00",
 *       "fundingRate": "0.0001",
 *       "nextFundingTime": "1234567890000",
 *       ...
 *     }
 *   ],
 *   "category": "linear",
 *   "testnet": boolean,
 *   "timestamp": "2025-10-03T13:00:00.000Z"
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
    const category = searchParams.get('category') || 'linear';
    const symbol = searchParams.get('symbol') || undefined;
    const credentialId = searchParams.get('credentialId') || undefined;

    // 3. Validate category
    const validCategories = ['linear', 'inverse', 'spot', 'option'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category',
          message: `Category must be one of: ${validCategories.join(', ')}`,
          code: 'INVALID_CATEGORY',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 4. Load Bybit credentials (by ID if provided, otherwise active)
    const { ExchangeCredentialsService } = await import('@/lib/exchange-credentials-service');

    let credentials;
    if (credentialId) {
      console.log(`[Tickers] Loading specific credential: ${credentialId} for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getCredentialById(userId, credentialId);

      if (!credentials || credentials.exchange !== 'BYBIT') {
        console.warn(`[Tickers] Invalid or unauthorized Bybit credential: ${credentialId}`);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credential',
            message: 'The specified credential is invalid or does not belong to you.',
            code: 'INVALID_CREDENTIAL',
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    } else {
      console.log(`[Tickers] Loading active credentials for user: ${userId}`);
      credentials = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'BYBIT' as any
      );

      if (!credentials) {
        console.warn(`[Tickers] No active Bybit credentials found for user: ${userId}`);
        return NextResponse.json(
          {
            success: false,
            error: 'API credentials not configured',
            message: 'Please configure and activate your Bybit API credentials first.',
            code: 'NO_API_KEYS',
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }
    }

    console.log(`[Tickers] Credentials loaded - ID: ${credentials.id}`);

    // 5. Create BybitService
    const bybitService = new BybitService({
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret,
      enableRateLimit: true,
      userId,
    });

    console.log(`[Tickers] Bybit service created`);

    // 6. Fetch tickers
    console.log(`[Tickers] Fetching tickers - category: ${category}, symbol: ${symbol || 'all'}`);
    const tickers = await bybitService.getTicker(
      category as 'linear' | 'spot' | 'option',
      symbol
    );

    console.log(`[Tickers] Fetched ${tickers.length} tickers successfully`);

    // 7. Return response
    return NextResponse.json(
      {
        success: true,
        data: tickers,
        category,
        ...(symbol && { symbol }),
        count: tickers.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Tickers] Error fetching tickers:', {
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
        error: 'Failed to fetch tickers',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
