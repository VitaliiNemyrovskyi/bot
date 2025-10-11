import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';
import { SubscriptionService } from '@/lib/subscription';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const plans = await SubscriptionService.getAvailablePlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, { user }: any) => {
  try {
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await SubscriptionService.subscribeToPlan(user.id, planId);
    
    return NextResponse.json({
      message: 'Subscription updated successfully',
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        subscriptionActive: updatedUser.subscriptionActive,
        subscriptionExpiry: updatedUser.subscriptionExpiry,
      },
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
});