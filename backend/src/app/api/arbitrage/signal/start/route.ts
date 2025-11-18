import { NextRequest, NextResponse } from 'next/server';
import { signalMonitor } from '@/services/signal-monitor.service';
import { AuthService } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/arbitrage/signal/start
 *
 * Start signal monitoring for arbitrage opportunity
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

    // Validate required fields
    const {
      symbol,
      primaryExchange,
      hedgeExchange,
      strategy,
      minPriceSpreadPercent,
      minFundingSpreadPercent,
      primarySide,
      hedgeSide,
      quantity,
      leverage,
      graduatedParts,
      graduatedDelayMs,
    } = body;

    if (!symbol || !primaryExchange || !hedgeExchange || !strategy || !primarySide || !hedgeSide) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (strategy === 'combined' && !minFundingSpreadPercent) {
      return NextResponse.json(
        { error: 'minFundingSpreadPercent required for combined strategy' },
        { status: 400 }
      );
    }

    // Start signal monitoring
    const signal = await signalMonitor.startSignal({
      userId: auth.user.userId,
      symbol,
      primaryExchange,
      hedgeExchange,
      strategy,
      minPriceSpreadPercent: Number(minPriceSpreadPercent),
      minFundingSpreadPercent: minFundingSpreadPercent ? Number(minFundingSpreadPercent) : undefined,
      primarySide,
      hedgeSide,
      quantity: Number(quantity),
      leverage: Number(leverage),
      graduatedParts: Number(graduatedParts) || 3,
      graduatedDelayMs: Number(graduatedDelayMs) || 1000,
    });

    console.log('[SignalStart] Started signal:', signal.id);

    return NextResponse.json({
      success: true,
      signal,
    });
  } catch (error: any) {
    console.error('[SignalStart] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start signal' },
      { status: 500 }
    );
  }
}
