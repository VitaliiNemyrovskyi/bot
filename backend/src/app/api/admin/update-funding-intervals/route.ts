import { NextRequest, NextResponse } from 'next/server';
import { triggerManualUpdate } from '@/services/funding-interval-scheduler.service';

export const runtime = 'nodejs';

/**
 * POST /api/admin/update-funding-intervals
 *
 * Manually trigger funding interval update for all exchanges.
 * Useful for testing or immediate updates.
 *
 * NO AUTH REQUIRED (but should add in production)
 */
export async function POST(_request: NextRequest) {
  try {
    console.log('[Admin] Manual funding interval update triggered');

    const result = await triggerManualUpdate();

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin] Manual update error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to trigger manual update',
        details: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/update-funding-intervals
 *
 * Get scheduler status
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    scheduler: 'active',
    interval: '1 hour',
    nextRun: new Date(Math.ceil(Date.now() / (60 * 60 * 1000)) * 60 * 60 * 1000).toISOString(),
    message: 'Use POST to manually trigger update',
  });
}
