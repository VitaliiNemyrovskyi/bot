import { NextRequest, NextResponse } from 'next/server';
import { signalMonitor } from '@/services/signal-monitor.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/arbitrage/signal/status
 *
 * Get status of active signals for current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get active signals for user
    const signals = signalMonitor.getActiveSignals(session.user.id);

    return NextResponse.json({
      success: true,
      signals,
    });
  } catch (error: any) {
    console.error('[SignalStatus] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get signal status' },
      { status: 500 }
    );
  }
}
