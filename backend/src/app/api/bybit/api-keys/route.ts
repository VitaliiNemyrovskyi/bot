import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { BybitKeysService } from '@/lib/bybit-keys-service';
import { z } from 'zod';

/**
 * POST /api/bybit/api-keys
 *
 * Saves or updates user's Bybit API keys
 *
 * Authentication: Required (Bearer token)
 *
 * Request body:
 * {
 *   "apiKey": "string",
 *   "apiSecret": "string",
 *   "testnet": boolean
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "API keys saved successfully",
 *   "data": {
 *     "id": "key_id",
 *     "userId": "user_id",
 *     "testnet": boolean,
 *     "createdAt": "2024-01-01T00:00:00Z",
 *     "updatedAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 *
 * Error responses:
 * - 400: Invalid request body or API keys validation failed
 * - 401: Unauthorized (missing or invalid token)
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
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Parse and validate request body
    const bodySchema = z.object({
      apiKey: z.string().min(1, 'API key is required'),
      apiSecret: z.string().min(1, 'API secret is required'),
      testnet: z.boolean().default(true),
    });

    let body;
    try {
      const rawBody = await request.json();
      body = bodySchema.parse(rawBody);
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
          details: error.errors || error.message,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Save API keys (includes validation)
    const result = await BybitKeysService.saveApiKeys(userId, {
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      testnet: body.testnet,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'API keys saved successfully',
        data: result,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving Bybit API keys:', error);

    // Handle validation errors
    if (error.message.includes('Invalid API keys') || error.message.includes('validate')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to validate API keys with Bybit',
          details: error.message,
          code: 'VALIDATION_FAILED',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save API keys',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bybit/api-keys
 *
 * Gets user's Bybit API key information (without exposing secrets)
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "hasKeys": true,
 *     "testnet": boolean,
 *     "apiKeyPreview": "...XXXX",
 *     "createdAt": "2024-01-01T00:00:00Z",
 *     "updatedAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 *
 * Response (No keys - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "hasKeys": false
 *   }
 * }
 *
 * Error responses:
 * - 401: Unauthorized (missing or invalid token)
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
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Get API key info
    const apiKeyInfo = await BybitKeysService.getApiKeyInfo(userId);

    return NextResponse.json(
      {
        success: true,
        data: apiKeyInfo,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching Bybit API keys:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch API keys',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bybit/api-keys
 *
 * Deletes user's Bybit API keys
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "API keys deleted successfully"
 * }
 *
 * Response (Not found - 404):
 * {
 *   "success": false,
 *   "error": "No API keys found"
 * }
 *
 * Error responses:
 * - 401: Unauthorized (missing or invalid token)
 * - 404: No API keys found
 * - 500: Internal server error
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;

    // Delete API keys
    const deleted = await BybitKeysService.deleteApiKeys(userId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'No API keys found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'API keys deleted successfully',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting Bybit API keys:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete API keys',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
