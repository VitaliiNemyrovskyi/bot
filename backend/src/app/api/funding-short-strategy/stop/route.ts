import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingShortStrategyService } from '@/services/funding-short-strategy.service';

/**
 * POST /api/funding-short-strategy/stop
 * Stop the funding SHORT strategy
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (authResult.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can stop the strategy' },
        { status: 403 }
      );
    }

    // Stop the strategy
    await fundingShortStrategyService.stop();

    return NextResponse.json({
      success: true,
      message: 'Strategy stopped successfully'
    });

  } catch (error: any) {
    console.error('Error stopping strategy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to stop strategy' },
      { status: 500 }
    );
  }
}
