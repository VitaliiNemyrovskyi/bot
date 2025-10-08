import { NextRequest, NextResponse } from 'next/server';
import { BybitDiagnostics } from '@/lib/bybit-diagnostics';
import { AuthService } from '@/lib/auth';
import { BybitKeysService } from '@/lib/bybit-keys-service';

/**
 * GET /api/bybit/diagnostics
 *
 * Runs comprehensive diagnostics on Bybit API connection for the authenticated user.
 * This endpoint helps identify issues with API credentials, permissions, connectivity,
 * and wallet balance access.
 *
 * Authentication: Required (Bearer token)
 *
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "results": [
 *     {
 *       "test": "Test name",
 *       "success": true/false,
 *       "message": "Result message",
 *       "details": { ... },
 *       "timestamp": "2025-10-01T13:00:00.000Z"
 *     }
 *   ],
 *   "summary": {
 *     "total": 6,
 *     "passed": 5,
 *     "failed": 1,
 *     "healthStatus": "healthy" | "degraded" | "unhealthy"
 *   },
 *   "timestamp": "2025-10-01T13:00:00.000Z"
 * }
 *
 * Error responses:
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

    console.log(`[Diagnostics] Running diagnostics for user: ${userId}`);

    // 2. Get API keys from database
    const keys = await BybitKeysService.getApiKeys(userId);

    if (!keys) {
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

    // 3. Run diagnostics
    console.log(`[Diagnostics] Running full diagnostics - testnet: ${keys.testnet}`);
    const results = await BybitDiagnostics.runFullDiagnostics(
      keys.apiKey,
      keys.apiSecret,
      keys.testnet
    );

    // 4. Calculate summary
    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    let healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (failed === 0) {
      healthStatus = 'healthy';
    } else if (failed <= 2) {
      healthStatus = 'degraded';
    } else {
      healthStatus = 'unhealthy';
    }

    console.log(`[Diagnostics] Completed - passed: ${passed}, failed: ${failed}, health: ${healthStatus}`);

    // 5. Return results
    return NextResponse.json(
      {
        success: true,
        results,
        summary: {
          total: results.length,
          passed,
          failed,
          healthStatus,
        },
        testnet: keys.testnet,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Diagnostics] Error running diagnostics:', {
      error: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run diagnostics',
        message: error.message || 'An unexpected error occurred',
        code: 'DIAGNOSTICS_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
