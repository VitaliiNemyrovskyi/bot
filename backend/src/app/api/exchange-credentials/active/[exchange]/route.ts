import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { Exchange } from '@prisma/client';
import { CredentialErrorCode } from '@/types/exchange-credentials';

/**
 * GET /api/exchange-credentials/active/:exchange
 *
 * Gets currently active credentials for specific exchange
 * Used by trading services to fetch correct credentials
 *
 * Authentication: Required (Bearer token)
 *
 * Path Parameters:
 * - exchange: Exchange name (BYBIT, BINANCE, OKX, KRAKEN, COINBASE)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "credential_id",
 *     "exchange": "BYBIT",
 *     "environment": "TESTNET",
 *     "apiKeyMasked": "...XXXX",
 *     "label": "My Bybit Testnet",
 *     "isActive": true,
 *     "createdAt": "2024-01-01T00:00:00Z",
 *     "updatedAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 *
 * Response (No active credential - 200):
 * {
 *   "success": true,
 *   "data": null,
 *   "message": "No active credentials found for this exchange"
 * }
 *
 * Error responses:
 * - 400: Invalid exchange parameter
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { exchange: string } }
) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          code: CredentialErrorCode.AUTH_REQUIRED,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    const exchangeParam = params.exchange?.toUpperCase();

    // Validate exchange parameter
    if (!exchangeParam || !Object.values(Exchange).includes(exchangeParam as Exchange)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid exchange parameter. Valid values: BYBIT, BINANCE, OKX, KRAKEN, COINBASE',
          code: CredentialErrorCode.INVALID_EXCHANGE,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const exchange = exchangeParam as Exchange;

    // Get active credentials (returns decrypted credentials for internal use)
    const activeCredential = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      exchange
    );

    if (!activeCredential) {
      return NextResponse.json(
        {
          success: true,
          data: null,
          message: `No active credentials found for ${exchange}`,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // For security, mask the API key in the response
    // Only internal services should use the decrypted version
    const decryptedApiKey = activeCredential.apiKey;
    const response = {
      id: activeCredential.id,
      exchange: activeCredential.exchange,
      environment: activeCredential.environment,
      apiKeyMasked: '...' + decryptedApiKey.slice(-4),
      label: activeCredential.label,
      isActive: true,
      createdAt: activeCredential.createdAt,
      updatedAt: activeCredential.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching active credentials:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch active credentials',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
