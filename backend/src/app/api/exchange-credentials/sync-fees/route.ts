/**
 * API endpoint to sync fee rates for exchange credentials
 * POST /api/exchange-credentials/sync-fees
 *
 * Syncs trading fee rates (maker/taker) from the exchange API
 * for all active credentials of the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ExchangeFeeSyncService } from '@/services/exchange-fee-sync.service';
import { AuthService } from '@/lib/auth';

/**
 * Sync fee rates for user's credentials
 *
 * Request body (optional):
 * {
 *   credentialId?: string  // Sync specific credential, or all if omitted
 * }
 *
 * Response:
 * {
 *   success: true,
 *   synced: number,  // Number of credentials synced
 *   results: Array<{ credentialId: string; exchange: string; feeRates: FeeRateData }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    const body = await request.json().catch(() => ({}));
    const { credentialId } = body;

    console.log('[API] Syncing fee rates for user:', user.id);

    if (credentialId) {
      // Sync specific credential
      console.log('[API] Syncing single credential:', credentialId);

      const feeRates = await ExchangeFeeSyncService.syncFeeRates(credentialId);

      if (!feeRates) {
        return NextResponse.json(
          { error: 'Failed to sync fee rates' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        synced: 1,
        results: [{
          credentialId,
          feeRates,
        }],
      });
    } else {
      // Sync all user's credentials
      console.log('[API] Syncing all credentials for user:', user.id);

      await ExchangeFeeSyncService.syncAllUserFeeRates(user.id);

      return NextResponse.json({
        success: true,
        message: 'Fee rates synced for all credentials',
      });
    }
  } catch (error: any) {
    console.error('[API] Error syncing fee rates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync fee rates' },
      { status: 500 }
    );
  }
}

/**
 * Get fee rates for a credential (from cache or fetch)
 * GET /api/exchange-credentials/sync-fees?credentialId=xxx&forceRefresh=true
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const credentialId = searchParams.get('credentialId');
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    if (!credentialId) {
      return NextResponse.json(
        { error: 'credentialId is required' },
        { status: 400 }
      );
    }

    console.log('[API] Getting fee rates for credential:', credentialId, { forceRefresh });

    const feeRates = await ExchangeFeeSyncService.getFeeRates(credentialId, forceRefresh);

    if (!feeRates) {
      return NextResponse.json(
        { error: 'Fee rates not available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      credentialId,
      feeRates,
    });
  } catch (error: any) {
    console.error('[API] Error getting fee rates:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get fee rates' },
      { status: 500 }
    );
  }
}
