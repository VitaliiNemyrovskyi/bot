/**
 * DEBUG endpoint to test TP/SL setting
 */

import { NextRequest, NextResponse } from 'next/server';
import { graduatedEntryArbitrageService } from '@/services/graduated-entry-arbitrage.service';

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    logs.push('Starting debug TP/SL test...');

    const body = await request.json();
    const { positionId, userId = 'test-user' } = body;

    logs.push(`Position ID: ${positionId}`);
    logs.push(`User ID: ${userId}`);

    // Try the SAME flow as syncTpSlForPosition
    try {
      await graduatedEntryArbitrageService.syncTpSlForPosition(positionId, userId);
      logs.push('✅ syncTpSlForPosition succeeded!');
    } catch (error: any) {
      logs.push(`❌ syncTpSlForPosition failed: ${error.message}`);
      logs.push(`Stack trace:\n${error.stack}`);
    }

    return NextResponse.json({
      success: true,
      logs,
    });

  } catch (error: any) {
    logs.push(`ERROR: ${error.message}`);
    return NextResponse.json({
      success: false,
      logs,
      error: error.message,
    }, { status: 500 });
  }
}
