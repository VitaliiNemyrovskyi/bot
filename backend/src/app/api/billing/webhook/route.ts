import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyIpnSignature } from '@/lib/nowpayments';

/**
 * POST /api/billing/webhook
 *
 * NOWPayments IPN webhook receiver. Verifies the HMAC signature, deduplicates
 * events by `payment_id`, and on a `finished` status flips the user to
 * `subscriptionActive=true` with an expiry computed from the plan's duration.
 *
 * Always returns 200 to acknowledge receipt — NOWPayments retries on non-2xx
 * responses, which would create duplicate processing pressure. Real failures
 * are logged for ops to investigate.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      console.error('[billing/webhook] invalid JSON');
      return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 200 });
    }

    const signature = request.headers.get('x-nowpayments-sig');
    if (!verifyIpnSignature(payload, signature)) {
      console.warn('[billing/webhook] signature verification failed', {
        paymentId: payload?.payment_id
      });
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 200 }
      );
    }

    const paymentId = String(payload.payment_id ?? '');
    const status = String(payload.payment_status ?? '');
    const orderId = String(payload.order_id ?? '');

    if (!paymentId || !orderId) {
      console.error('[billing/webhook] missing payment_id or order_id', payload);
      return NextResponse.json({ success: false }, { status: 200 });
    }

    // Idempotency: skip if we've already recorded this payment_id.
    const existing = await prisma.paymentEvent.findUnique({
      where: { paymentId }
    });
    if (existing) {
      console.log('[billing/webhook] duplicate event ignored', { paymentId });
      return NextResponse.json({ success: true, duplicate: true });
    }

    // order_id format: `${userId}:${planId}:${timestamp}`
    const [userId, planId] = orderId.split(':');
    if (!userId || !planId) {
      console.error('[billing/webhook] malformed order_id', { orderId });
      return NextResponse.json({ success: false }, { status: 200 });
    }

    const plan = await prisma.subscription.findUnique({ where: { id: planId } });
    if (!plan) {
      console.error('[billing/webhook] unknown plan', { planId });
      return NextResponse.json({ success: false }, { status: 200 });
    }

    await prisma.paymentEvent.create({
      data: {
        paymentId,
        userId,
        planId,
        status,
        amount: typeof payload.pay_amount === 'number' ? payload.pay_amount : null,
        currency: typeof payload.pay_currency === 'string' ? payload.pay_currency : null,
        rawPayload: payload as object
      }
    });

    if (status === 'finished') {
      const expiresAt = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionActive: true,
          subscriptionExpiry: expiresAt,
          subscriptionId: plan.id,
          role: plan.role
        }
      });
      console.log('[billing/webhook] subscription activated', { userId, planId, expiresAt });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[billing/webhook] error:', error);
    // Still return 200 — see header comment.
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
