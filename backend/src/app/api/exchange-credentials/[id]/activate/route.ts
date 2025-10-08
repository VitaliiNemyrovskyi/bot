import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { CredentialErrorCode } from '@/types/exchange-credentials';

/**
 * PUT /api/exchange-credentials/:id/activate
 *
 * Sets specific credential as active for its exchange
 * Deactivates all other credentials for the same exchange
 *
 * Authentication: Required (Bearer token)
 *
 * Path Parameters:
 * - id: Credential ID to activate
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Credential activated successfully",
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
 * - 401: Unauthorized
 * - 404: Credential not found
 * - 500: Internal server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const credentialId = params.id;

    if (!credentialId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Credential ID is required',
          code: CredentialErrorCode.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    try {
      // Set credential as active
      const result = await ExchangeCredentialsService.setActiveCredentials(
        userId,
        credentialId
      );

      return NextResponse.json(
        {
          success: true,
          message: 'Credential activated successfully',
          data: result,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error: any) {
      // Handle specific error cases
      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Credential not found',
            code: CredentialErrorCode.NOT_FOUND,
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        );
      }

      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: 'You do not have permission to activate this credential',
            code: CredentialErrorCode.AUTH_REQUIRED,
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Error activating credential:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to activate credential',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
