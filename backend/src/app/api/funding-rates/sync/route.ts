import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { ExchangeCredentialsService } from '@/lib/exchange-credentials-service';
import { syncBybitFundingRates } from '@/services/funding-rate.service';

/**
 * POST /api/funding-rates/sync
 *
 * Manually trigger funding rate synchronization from exchange
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
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

    // 2. Load credentials
    const credentials = await ExchangeCredentialsService.getActiveCredentials(
      userId,
      'BYBIT' as any
    );

    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          error: 'API credentials not configured',
          message: `Please configure your Bybit API credentials first.`,
          timestamp: new Date().toISOString()
        },
        { status: 403 }
      );
    }

    // 3. Sync funding rates
    console.log(`[FundingSync] Starting sync for user: ${userId}`);

    const syncedCount = await syncBybitFundingRates(
      credentials.apiKey,
      credentials.apiSecret,
      false
    );

    console.log(`[FundingSync] Synced ${syncedCount} funding rates successfully`);

    // 5. Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Funding rates synchronized successfully',
        syncedCount,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FundingSync] Error syncing funding rates:', {
      error: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to sync funding rates',
        message: error.message || 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger funding rate sync',
    endpoint: '/api/funding-rates/sync',
    method: 'POST'
  });
}
