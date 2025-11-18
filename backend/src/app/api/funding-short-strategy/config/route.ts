import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingShortStrategyService } from '@/services/funding-short-strategy.service';

/**
 * GET /api/funding-short-strategy/config
 * Get current strategy configuration
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const config = fundingShortStrategyService.getConfig();

    return NextResponse.json({
      success: true,
      config
    });

  } catch (error: any) {
    console.error('Error getting config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get config' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/funding-short-strategy/config
 * Update strategy configuration
 */
export async function PUT(request: NextRequest) {
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
        { error: 'Only admins can update configuration' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Update configuration
    fundingShortStrategyService.updateConfig(body);

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
      config: fundingShortStrategyService.getConfig()
    });

  } catch (error: any) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update config' },
      { status: 500 }
    );
  }
}
