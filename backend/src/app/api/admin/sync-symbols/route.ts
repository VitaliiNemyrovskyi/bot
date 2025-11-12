import { NextRequest, NextResponse } from 'next/server';
import { syncAllExchanges } from '@/services/trading-symbols.service';

/**
 * Manual Symbol Sync Endpoint
 *
 * Triggers a manual sync of all trading symbols from supported exchanges.
 * This endpoint should be protected in production.
 */
export async function POST(_request: NextRequest) {
  try {
    console.log('🔄 Manual symbol sync triggered...');

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
