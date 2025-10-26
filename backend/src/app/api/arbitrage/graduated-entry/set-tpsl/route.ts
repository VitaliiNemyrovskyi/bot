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
  console.log(`[API] ========================================`);
  console.log(`[API] SET TP/SL API CALLED`);
  console.log(`[API] Request URL: ${request.url}`);
  console.log(`[API] ========================================`);

  try {
    // Authenticate user
    const { success, user } = await AuthService.authenticateRequest(request);
    if (!success || !user) {
      console.error(`[API] ✗ Unauthorized request to set TP/SL`);
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log(`[API] User authenticated: ${user.userId}`);

    // Parse request body
    const body = await request.json();
    console.log(`[API] Request body:`, body);
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
    try {
      await graduatedEntryArbitrageService.syncTpSlForPosition(positionId, user.userId);

      console.log(`[API] TP/SL synchronized successfully for position ${positionId}`);

      return NextResponse.json({
        success: true,
        message: 'Synchronized TP/SL set successfully',
        data: {
          positionId,
        },
      });
    } catch (syncError: any) {
      console.error(`[API] syncTpSlForPosition error:`, syncError);
      return NextResponse.json({
        success: false,
        error: syncError.message,
        stack: syncError.stack,
        details: 'Error in syncTpSlForPosition - see stack trace above',
      }, { status: 500 });
    }
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
