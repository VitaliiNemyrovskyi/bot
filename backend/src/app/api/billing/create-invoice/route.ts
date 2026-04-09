import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createInvoice, createPaymentByInvoice } from '@/lib/nowpayments';

/**
 * POST /api/billing/create-invoice
 *
 * Body: { planId: string }
 * Response: { invoiceUrl: string }
 *
 * Creates a NOWPayments hosted-checkout invoice for the chosen plan and
 * returns the URL the frontend should redirect the user to. The order_id is
 * encoded as `${userId}:${planId}:${timestamp}` so the IPN webhook can
 * resolve which user/plan to activate without holding extra state.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await AuthService.authenticateRequest(request);
    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const planId: string | undefined = body?.planId;
    if (!planId || typeof planId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'planId is required' },
        { status: 400 }
      );
    }

    const plan = await prisma.subscription.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json(
        { success: false, error: 'Plan not found' },
        { status: 404 }
      );
    }

    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
    const backendUrl = process.env.PUBLIC_BACKEND_URL?.replace(/\/+$/, '');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL is not configured');
    }
    if (!backendUrl) {
      throw new Error('PUBLIC_BACKEND_URL is not configured');
    }

    const orderId = `${auth.user.userId}:${plan.id}:${Date.now()}`;
    const isSandbox = process.env.NOWPAYMENTS_SANDBOX === 'true';

    const invoice = await createInvoice({
      priceAmount: plan.price,
      priceCurrency: 'usd',
      orderId,
      orderDescription: plan.name,
      ipnCallbackUrl: `${backendUrl}/api/billing/webhook`,
      successUrl: `${frontendUrl}/billing?status=success`,
      cancelUrl: `${frontendUrl}/billing?status=cancelled`
    });

    if (isSandbox) {
      // In sandbox mode, create a payment from the invoice with case='success'
      // so the sandbox auto-processes the payment without sending real funds.
      createPaymentByInvoice({
        iid: invoice.id,
        payCurrency: 'btc',
        case: 'success'
      }).catch((err) => {
        console.error('[billing/create-invoice] sandbox auto-payment failed:', err);
      });
    }

    return NextResponse.json({
      success: true,
      data: { invoiceUrl: invoice.invoice_url, invoiceId: invoice.id }
    });
  } catch (error) {
    console.error('[billing/create-invoice] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
