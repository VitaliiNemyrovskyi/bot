import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { OpportunityDetectionService } from '@/services/triangular-arbitrage-opportunity.service';

/**
 * POST /api/triangular-arbitrage/scan/stop
 * Stop scanning for triangular arbitrage opportunities
 *
 * Body params:
 * - exchange (optional): Stop specific exchange scanner. If not provided, stops all scanners.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = authResult.user.userId;

    const body = await request.json().catch(() => ({}));
    const { exchange } = body;

    if (exchange) {
      console.log(`[TriArb] Stopping scanner for user ${userId} on exchange ${exchange}`);
    } else {
      console.log(`[TriArb] Stopping ALL scanners for user ${userId}`);
    }

    // Stop scanner(s)
    await OpportunityDetectionService.cleanup(userId, exchange);

    return NextResponse.json({
      success: true,
      status: 'stopped',
      message: exchange
        ? `Scanner stopped for ${exchange}`
        : 'All scanners stopped successfully',
      exchange: exchange || 'all',
    });
  } catch (error: any) {
    console.error('[TriArb] Error stopping scanner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop scanner' },
      { status: 500 }
    );
  }
}
