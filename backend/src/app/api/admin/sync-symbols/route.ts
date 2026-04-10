import { NextRequest, NextResponse } from 'next/server';
import { syncAllExchanges } from '@/services/trading-symbols.service';
import { AuthService } from '@/lib/auth';

/**
 * Manual Symbol Sync Endpoint
 *
 * Triggers a manual sync of all trading symbols from supported exchanges.
 * Requires ADMIN role.
 */
export async function POST(_request: NextRequest) {
  try {
    // Require ADMIN authentication
    const authResult = await AuthService.authenticateRequest(_request);
    if (!authResult.success || !authResult.user || authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    console.log('Manual symbol sync triggered...');

    await syncAllExchanges();

    return NextResponse.json({
      success: true,
      message: 'Symbol sync completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Symbol sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger symbol sync',
    endpoint: '/api/admin/sync-symbols',
    method: 'POST'
  });
}
