import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { BybitService } from '@/lib/bybit';
import { MEXCService } from '@/lib/mexc';
import { BingXService } from '@/lib/bingx';

/**
 * GET /api/health/connectors
 *
 * Health check endpoint for exchange connectors
 * Tests connector initialization and time synchronization
 *
 * Authentication: Required (Bearer token)
 *
 * Response:
 * {
 *   "success": true,
 *   "connectors": {
 *     "BYBIT": {
 *       "status": "healthy" | "warning" | "error",
 *       "initialized": boolean,
 *       "timeSync": { "offset": number, "lastSync": number, "syncAge": number },
 *       "message": string?
 *     },
 *     "MEXC": { ... },
 *     "BINGX": { ... }
 *   },
 *   "timestamp": "2025-10-11T00:00:00.000Z"
 * }
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
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    const connectorHealth: Record<string, any> = {};

    // Check Bybit connector
    try {
      const bybitCreds = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'BYBIT' as any
      );

      if (bybitCreds) {
        const bybitService = new BybitService({
          apiKey: bybitCreds.apiKey,
          apiSecret: bybitCreds.apiSecret,
          enableRateLimit: true
        });

        try {
          // Test time synchronization
          await bybitService.syncTime();
          const syncStatus = bybitService.getTimeSyncStatus();

          // Test account info (verifies credentials and connection)
          await bybitService.getAccountInfo();

          // Determine health status
          let status = 'healthy';
          let message = 'Connector initialized successfully';

          if (Math.abs(syncStatus.offset) > 3000) {
            status = 'warning';
            message = `Time offset is large (${syncStatus.offset}ms). Monitor for API failures.`;
          }

          connectorHealth['BYBIT'] = {
            status,
            initialized: true,
            timeSync: {
              offset: syncStatus.offset,
              lastSync: syncStatus.lastSyncTime,
              syncAge: syncStatus.syncAge
            },
            message
          };
        } catch (error: any) {
          connectorHealth['BYBIT'] = {
            status: 'error',
            initialized: false,
            error: error.message,
            message: `Failed to initialize: ${error.message}`
          };
        }
      } else {
        connectorHealth['BYBIT'] = {
          status: 'warning',
          initialized: false,
          message: 'No credentials configured'
        };
      }
    } catch (error: any) {
      connectorHealth['BYBIT'] = {
        status: 'error',
        initialized: false,
        error: error.message
      };
    }

    // Check MEXC connector
    try {
      const mexcCreds = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'MEXC' as any
      );

      if (mexcCreds) {
        const mexcService = new MEXCService({
          apiKey: mexcCreds.apiKey,
          apiSecret: mexcCreds.apiSecret,
          authToken: mexcCreds.authToken,
          enableRateLimit: true
        });

        try {
          // Test account info (verifies credentials and connection)
          await mexcService.getAccountInfo();

          connectorHealth['MEXC'] = {
            status: 'healthy',
            initialized: true,
            message: 'Connector initialized successfully'
          };
        } catch (error: any) {
          connectorHealth['MEXC'] = {
            status: 'error',
            initialized: false,
            error: error.message,
            message: `Failed to initialize: ${error.message}`
          };
        }
      } else {
        connectorHealth['MEXC'] = {
          status: 'warning',
          initialized: false,
          message: 'No credentials configured'
        };
      }
    } catch (error: any) {
      connectorHealth['MEXC'] = {
        status: 'error',
        initialized: false,
        error: error.message
      };
    }

    // Check BingX connector
    try {
      const bingxCreds = await ExchangeCredentialsService.getActiveCredentials(
        userId,
        'BINGX' as any
      );

      if (bingxCreds) {
        const bingxService = new BingXService({
          apiKey: bingxCreds.apiKey,
          apiSecret: bingxCreds.apiSecret,
          enableRateLimit: true
        });

        try {
          // Test account info (verifies credentials and connection)
          await bingxService.getAccountInfo();

          connectorHealth['BINGX'] = {
            status: 'healthy',
            initialized: true,
            message: 'Connector initialized successfully'
          };
        } catch (error: any) {
          connectorHealth['BINGX'] = {
            status: 'error',
            initialized: false,
            error: error.message,
            message: `Failed to initialize: ${error.message}`
          };
        }
      } else {
        connectorHealth['BINGX'] = {
          status: 'warning',
          initialized: false,
          message: 'No credentials configured'
        };
      }
    } catch (error: any) {
      connectorHealth['BINGX'] = {
        status: 'error',
        initialized: false,
        error: error.message
      };
    }

    // Determine overall health
    const hasErrors = Object.values(connectorHealth).some((c: any) => c.status === 'error');
    const hasWarnings = Object.values(connectorHealth).some((c: any) => c.status === 'warning');

    return NextResponse.json(
      {
        success: true,
        overall: hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy',
        connectors: connectorHealth,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[Health] Error checking connector health:', error.message);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check connector health',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
