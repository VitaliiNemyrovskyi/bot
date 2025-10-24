/**
 * POST /api/arbitrage/graduated-entry/set-tpsl
 * Manually set synchronized TP/SL for an existing position
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { graduatedEntryArbitrageService } from '@/services/graduated-entry-arbitrage.service';

/**
 * POST handler - Set synchronized TP/SL for a position
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

    // Parse request body
    const body = await request.json();
    const { positionId } = body;

    // Validate required fields
    if (!positionId) {
      return NextResponse.json(
        { success: false, error: 'positionId is required' },
        { status: 400 }
      );
    }

    console.log(`[API] Setting synchronized TP/SL for position ${positionId} (user: ${user.userId})`);

    // Call service to sync TP/SL
    await graduatedEntryArbitrageService.syncTpSlForPosition(positionId, user.userId);

    console.log(`[API] TP/SL synchronized successfully for position ${positionId}`);

    return NextResponse.json({
      success: true,
      message: 'Synchronized TP/SL set successfully',
      data: {
        positionId,
      },
    });
  } catch (error: any) {
    console.error('[API] Error setting synchronized TP/SL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to set synchronized TP/SL',
      },
      { status: 500 }
    );
  }
}
