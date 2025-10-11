import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { Exchange, Environment } from '@prisma/client';
import { z } from 'zod';
import {
  SaveCredentialsRequest,
  CredentialErrorCode,
} from '@/types/exchange-credentials';

/**
 * GET /api/exchange-credentials
 *
 * Lists all exchange credentials for authenticated user
 *
 * Authentication: Required (Bearer token)
 *
 * Query Parameters:
 * - exchange?: string (optional) - Filter by specific exchange
 * - environment?: string (optional) - Filter by environment (TESTNET/MAINNET)
 * - grouped?: boolean (optional) - Return credentials grouped by exchange
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "credential_id",
 *       "userId": "user_id",
 *       "exchange": "BYBIT",
 *       "environment": "TESTNET",
 *       "apiKeyMasked": "...XXXX",
 *       "label": "My Bybit Testnet",
 *       "isActive": true,
 *       "createdAt": "2024-01-01T00:00:00Z",
 *       "updatedAt": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 *
 * Error responses:
 * - 401: Unauthorized
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
          code: CredentialErrorCode.AUTH_REQUIRED,
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const exchangeParam = searchParams.get('exchange');
    const environmentParam = searchParams.get('environment');
    const grouped = searchParams.get('grouped') === 'true';

    // Validate exchange if provided
    let exchange: Exchange | undefined;
    if (exchangeParam) {
      if (!Object.values(Exchange).includes(exchangeParam as Exchange)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid exchange parameter',
            code: CredentialErrorCode.INVALID_EXCHANGE,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      exchange = exchangeParam as Exchange;
    }

    // Validate environment if provided
    let environment: Environment | undefined;
    if (environmentParam) {
      if (!Object.values(Environment).includes(environmentParam as Environment)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid environment parameter',
            code: CredentialErrorCode.INVALID_ENVIRONMENT,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      environment = environmentParam as Environment;
    }

    // Get credentials
    let credentials;
    if (grouped) {
      credentials = await ExchangeCredentialsService.getCredentialsGrouped(userId);
    } else {
      credentials = await ExchangeCredentialsService.getCredentials(
        userId,
        exchange,
        environment
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          credentials,
          totalCount: Array.isArray(credentials) ? credentials.length : 0
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching exchange credentials:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch credentials',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exchange-credentials
 *
 * Creates or updates exchange credentials for authenticated user
 *
 * Authentication: Required (Bearer token)
 *
 * Request body:
 * {
 *   "exchange": "BYBIT" | "BINANCE" | "OKX" | "KRAKEN" | "COINBASE",
 *   "environment": "TESTNET" | "MAINNET",
 *   "apiKey": "string",
 *   "apiSecret": "string",
 *   "label": "string" (optional),
 *   "isActive": boolean (optional, defaults to true)
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Credentials saved successfully",
 *   "data": {
 *     "id": "credential_id",
 *     "userId": "user_id",
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
 * Error responses:
 * - 400: Validation error or invalid credentials
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const bodySchema = z.object({
      exchange: z.nativeEnum(Exchange, {
        errorMap: () => ({ message: 'Invalid exchange value' }),
      }),
      environment: z.nativeEnum(Environment, {
        errorMap: () => ({ message: 'Invalid environment value' }),
      }),
      apiKey: z.string().min(1, 'API key is required'),
      apiSecret: z.string().min(1, 'API secret is required'),
      authToken: z.string().optional(), // Browser session token for MEXC
      label: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    let body: SaveCredentialsRequest;
    try {
      const rawBody = await request.json();
      body = bodySchema.parse(rawBody);
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors || error.message,
          code: CredentialErrorCode.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Save credentials (includes validation)
    try {
      const result = await ExchangeCredentialsService.saveCredentials(userId, {
        exchange: body.exchange,
        environment: body.environment,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        authToken: body.authToken, // Browser session token for MEXC
        label: body.label,
        isActive: body.isActive ?? true, // Default to true for new credentials
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Credentials saved successfully',
          data: result,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (validationError: any) {
      // Handle credential validation errors
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to validate API credentials',
          details: validationError.message,
          code: CredentialErrorCode.VALIDATION_FAILED,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error saving exchange credentials:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save credentials',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
