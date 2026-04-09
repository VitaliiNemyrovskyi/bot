import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/billing/plans
 *
 * Returns the catalog of active subscription plans. Public — used by the
 * billing page to render plan cards before the user has authenticated.
 */
export async function GET() {
  try {
    const plans = await prisma.subscription.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    return NextResponse.json({
      success: true,
      data: plans.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        duration: p.duration,
        features: p.features,
        role: p.role
      }))
    });
  } catch (error) {
    console.error('[billing/plans] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load plans' },
      { status: 500 }
    );
  }
}
