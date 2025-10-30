import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { CredentialErrorCode } from '@/types/exchange-credentials';

/**
 * GET /api/exchange-credentials/:id
 *
 * Gets a single credential by ID with decrypted API keys
 * Used for displaying/editing credentials
 *
 * Authentication: Required (Bearer token)
 *
 * Path Parameters:
 * - id: Credential ID to retrieve
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cred_id",
 *     "exchange": "BYBIT",
 *     "environment": "MAINNET",
 *     "apiKey": "decrypted_api_key",
 *     "apiSecret": "decrypted_api_secret",
 *     "label": "My API Key",
 *     "createdAt": "2025-01-01T00:00:00.000Z",
 *     "updatedAt": "2025-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Error responses:
 * - 401: Unauthorized
 * - 404: Credential not found
 * - 500: Internal server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: credentialId } = await params;

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
      // Get credential with decrypted keys
      const credential = await ExchangeCredentialsService.getCredentialById(
        userId,
        credentialId
      );

      if (!credential) {
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

      return NextResponse.json(
        {
          success: true,
          data: credential,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: 'You do not have permission to access this credential',
            code: CredentialErrorCode.AUTH_REQUIRED,
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error('Error getting credential:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve credential',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/exchange-credentials/:id
 *
 * Updates credential information (label, apiKey, apiSecret, authToken)
 *
 * Authentication: Required (Bearer token)
 *
 * Path Parameters:
 * - id: Credential ID to update
 *
 * Request Body:
 * {
 *   "label"?: string,
 *   "apiKey"?: string,
 *   "apiSecret"?: string,
 *   "authToken"?: string,  // For MEXC browser session authentication
 *   "isActive"?: boolean  // Set active status (true/false)
 * }
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cred_id",
 *     "exchange": "BYBIT",
 *     "environment": "MAINNET",
 *     "apiKeyPreview": "...1234",
 *     "label": "Updated Label",
 *     "isActive": true,
 *     "createdAt": "2025-01-01T00:00:00.000Z",
 *     "updatedAt": "2025-01-01T00:00:00.000Z"
 *   }
 * }
 *
 * Error responses:
 * - 400: Invalid request body
 * - 401: Unauthorized
 * - 404: Credential not found
 * - 500: Internal server error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: credentialId } = await params;

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

    // Parse request body
    const body = await request.json();
    const { label, apiKey, apiSecret, authToken, isActive } = body;

    // Validate that at least one field is provided
    if (label === undefined && apiKey === undefined && apiSecret === undefined && authToken === undefined && isActive === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one field (label, apiKey, apiSecret, authToken, isActive) must be provided',
          code: CredentialErrorCode.VALIDATION_ERROR,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    try {
      // Update credential
      const updated = await ExchangeCredentialsService.updateCredential(
        userId,
        credentialId,
        { label, apiKey, apiSecret, authToken, isActive }
      );

      return NextResponse.json(
        {
          success: true,
          data: updated,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: 'You do not have permission to update this credential',
            code: CredentialErrorCode.AUTH_REQUIRED,
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      if (errorMessage.includes('not found')) {
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

      if (errorMessage.includes('Invalid API credentials')) {
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            code: CredentialErrorCode.VALIDATION_FAILED,
            timestamp: new Date().toISOString(),
          },
          { status: 422 }
        );
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error('Error updating credential:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update credential',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/exchange-credentials/:id
 *
 * Deletes specific credential set
 * If deleting active credential, automatically activates another one if available
 *
 * Authentication: Required (Bearer token)
 *
 * Path Parameters:
 * - id: Credential ID to delete
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "Credential deleted successfully"
 * }
 *
 * Error responses:
 * - 401: Unauthorized
 * - 404: Credential not found
 * - 500: Internal server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id: credentialId } = await params;

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
      // Delete credential
      const deleted = await ExchangeCredentialsService.deleteCredentials(
        userId,
        credentialId
      );

      if (!deleted) {
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

      return NextResponse.json(
        {
          success: true,
          message: 'Credential deleted successfully',
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: 'You do not have permission to delete this credential',
            code: CredentialErrorCode.AUTH_REQUIRED,
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
      }

      throw error;
    }
  } catch (error: unknown) {
    console.error('Error deleting credential:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete credential',
        code: CredentialErrorCode.INTERNAL_ERROR,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
