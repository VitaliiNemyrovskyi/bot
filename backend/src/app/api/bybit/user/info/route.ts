import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { BybitService } from '@/lib/bybit';
import { BybitUserInfoResponse } from '@/types/bybit';

/**
 * GET /api/bybit/user/info
 *
 * Fetches authenticated user's Bybit account information
 *
 * Authentication: Required (Bearer token)
 *
 * Optional Headers:
 * - X-Bybit-API-Key: Bybit API key (for testing without saving to database)
 * - X-Bybit-API-Secret: Bybit API secret (for testing without saving to database)
 * - X-Bybit-Testnet: true/false (for testing without saving to database)
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "userId": "user_id",
 *     "uuid": "unique_id",
 *     "username": "user@example.com",
 *     "memberType": 1,
 *     "status": 1,
 *     "vipLevel": "VIP 0",
 *     "createdAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 *
 * Error responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 403: Forbidden (no Bybit API keys configured)
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
        } as BybitUserInfoResponse,
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Check for API keys in headers (for testing)
    const headerApiKey = request.headers.get('x-bybit-api-key');
    const headerApiSecret = request.headers.get('x-bybit-api-secret');

    let bybitService: BybitService | null = null;

    // If keys provided in headers, use them
    if (headerApiKey && headerApiSecret) {
      bybitService = new BybitService({
        apiKey: headerApiKey,
        apiSecret: headerApiSecret,
        enableRateLimit: true
      });
    } else {
      // Otherwise, load from database
      bybitService = await BybitService.createFromDatabase(userId);
    }

    if (!bybitService) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bybit API keys not configured for this user. Please configure your API keys first.',
          code: 'NO_API_KEYS',
          timestamp: new Date().toISOString()
        } as BybitUserInfoResponse,
        { status: 403 }
      );
    }

    // Fetch API key info (includes user information)
    const apiKeyInfo = await bybitService.getApiKeyInfo();

    // Format response
    const response: BybitUserInfoResponse = {
      success: true,
      data: {
        userId: apiKeyInfo.userID?.toString() || userId,
        uuid: apiKeyInfo.id || '',
        username: authResult.user.email,
        memberType: apiKeyInfo.type || 1,
        status: apiKeyInfo.readOnly === 0 ? 1 : 0,
        vipLevel: apiKeyInfo.vipLevel || 'No VIP',
        createdAt: apiKeyInfo.createdAt || new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching Bybit user info:', error);

    // Handle Bybit API specific errors
    if (error.message?.includes('Bybit API Error')) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: 'BYBIT_API_ERROR',
          timestamp: new Date().toISOString()
        } as BybitUserInfoResponse,
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Bybit user information',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      } as BybitUserInfoResponse,
      { status: 500 }
    );
  }
}
