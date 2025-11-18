/**
 * API Route: /api/funding-arb/opportunities
 * Get funding arbitrage opportunities
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFundingArbMonitor } from '@/services/funding-arb-monitor.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const readyOnly = searchParams.get('ready') === 'true';

    const monitor = getFundingArbMonitor();

    let opportunities;
    if (readyOnly) {
      opportunities = await monitor.getReadyOpportunities();
    } else {
      opportunities = await monitor.findOpportunities();
    }

    const stats = await monitor.getStats();

    return NextResponse.json({
      success: true,
      opportunities,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
