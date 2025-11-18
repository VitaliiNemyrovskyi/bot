import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingShortStrategyService } from '@/services/funding-short-strategy.service';

/**
 * POST /api/funding-short-strategy/start
 * Start the funding SHORT strategy
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
        { error: 'Only admins can start the strategy' },
        { status: 403 }
      );
    }

    // Parse request body for configuration updates
    const body = await request.json().catch(() => ({}));

    // Update configuration if provided
    if (body.config) {
      fundingShortStrategyService.updateConfig(body.config);
    }

    // Start the strategy
    await fundingShortStrategyService.start();

    return NextResponse.json({
      success: true,
      message: 'Strategy started successfully',
      config: fundingShortStrategyService.getConfig()
    });

  } catch (error: any) {
    console.error('Error starting strategy:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start strategy' },
      { status: 500 }
    );
  }
}
