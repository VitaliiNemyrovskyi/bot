import { NextRequest, NextResponse } from 'next/server';
import { signalMonitor } from '@/services/signal-monitor.service';
import { AuthService } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/arbitrage/signal/stop
 *
 * Stop signal monitoring
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await AuthService.authenticateRequest(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { signalId } = body;

    if (!signalId) {
      return NextResponse.json(
        { error: 'signalId is required' },
        { status: 400 }
      );
    }

    // Verify signal belongs to user
    const signal = signalMonitor.getSignalStatus(signalId);
    if (!signal) {
      return NextResponse.json(
        { error: 'Signal not found' },
        { status: 404 }
      );
    }

    if (signal.userId !== auth.user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Stop signal
    await signalMonitor.stopSignal(signalId, 'cancelled');

    console.log('[SignalStop] Stopped signal:', signalId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[SignalStop] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop signal' },
      { status: 500 }
    );
  }
}
