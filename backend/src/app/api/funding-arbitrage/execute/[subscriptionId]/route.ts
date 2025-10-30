import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import { fundingArbitrageService } from '@/services/funding-arbitrage.service';
import prisma from '@/lib/prisma';

/**
 * POST /api/funding-arbitrage/execute/[subscriptionId]
 *
 * Manually execute a subscription immediately (skip countdown)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    // 1. Authenticate user
    const authResult = await AuthService.authenticateRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const userId = authResult.user.userId;
    const { subscriptionId } = await params;

    // 2. Verify subscription exists and belongs to user (check database)
    const dbSubscription = await prisma.fundingArbitrageSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!dbSubscription) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subscription not found',
          message: `Subscription ${subscriptionId} not found`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    if (dbSubscription.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'You do not have permission to execute this subscription',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // 3. Execute subscription (will load from DB and recreate connectors if needed)
    await fundingArbitrageService.executeSubscriptionNow(subscriptionId);

    console.log(`[FundingArbitrageAPI] Manual execution started for ${subscriptionId}`);

    // 4. Return response
    return NextResponse.json(
      {
        success: true,
        message: 'Subscription execution started successfully',
        data: {
          subscriptionId,
          symbol: dbSubscription.symbol,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('[FundingArbitrageAPI] Error executing subscription:', {
      error: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute subscription',
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
