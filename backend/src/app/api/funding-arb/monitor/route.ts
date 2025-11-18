/**
 * API Route: /api/funding-arb/monitor
 * Control the funding arbitrage monitor
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFundingArbMonitor, stopFundingArbMonitor } from '@/services/funding-arb-monitor.service';

// GET /api/funding-arb/monitor - Get monitor status
export async function GET(_request: NextRequest) {
  try {
    const monitor = getFundingArbMonitor();
    const lastOpportunities = monitor.getLastOpportunities();
    const stats = await monitor.getStats();

    return NextResponse.json({
      success: true,
      isRunning: lastOpportunities.length >= 0, // If we have data, it's running
      lastScan: lastOpportunities.length > 0 ? new Date().toISOString() : null,
      opportunitiesCount: lastOpportunities.length,
      stats,
    });

  } catch (error: any) {
    console.error('Error getting monitor status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/funding-arb/monitor - Start/stop monitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config } = body;

    if (action === 'start') {
      const monitor = getFundingArbMonitor(config);
      await monitor.start();

      return NextResponse.json({
        success: true,
        message: 'Monitor started',
        config: monitor['config'], // Access private config
      });

    } else if (action === 'stop') {
      stopFundingArbMonitor();

      return NextResponse.json({
        success: true,
        message: 'Monitor stopped',
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error controlling monitor:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
