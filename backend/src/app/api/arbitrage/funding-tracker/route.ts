/**
 * POST /api/arbitrage/funding-tracker
 * Manually trigger funding data update for active positions
 *
 * This endpoint allows manual updates of funding payment data.
 * Normally the funding tracker runs automatically every 5 minutes,
 * but this endpoint can be used for immediate updates or testing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingTrackerService } from '@/services/funding-tracker.service';

/**
 * POST handler - Trigger funding update
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { positionId } = body;

    // console.log('[API] Funding tracker update requested by user', user.userId, 'for position:', positionId || 'ALL');

    if (positionId) {
      // Update specific position
      const result = await fundingTrackerService.updatePosition(positionId);

      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Position not found or no funding data available' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: `Funding data updated successfully for position ${positionId}`,
      });
    } else {
      // Update all active positions
      await fundingTrackerService.updateAllPositions();

      return NextResponse.json({
        success: true,
        message: 'Funding data updated successfully for all active positions',
      });
    }
  } catch (error: any) {
    console.error('[API] Error in funding tracker:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update funding data',
      },
      { status: 500 }
    );
  }
}
