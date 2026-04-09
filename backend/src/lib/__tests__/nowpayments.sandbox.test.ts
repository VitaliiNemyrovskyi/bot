/**
 * NOWPayments Sandbox Integration Tests
 *
 * These tests hit the real sandbox API (api-sandbox.nowpayments.io).
 * They require a valid NOWPAYMENTS_API_KEY for the sandbox environment.
 *
 * Run with: NOWPAYMENTS_SANDBOX=true NOWPAYMENTS_API_KEY=<key> npx jest nowpayments.sandbox
 *
 * Skipped automatically when NOWPAYMENTS_API_KEY is not set.
 */
import {
  getApiStatus,
  getCurrencies,
  getEstimatedPrice,
  getMinimumAmount,
  createPayment,
  getPaymentStatus,
  createInvoice,
  createPaymentByInvoice
} from '../nowpayments';

const SANDBOX_KEY = process.env.NOWPAYMENTS_API_KEY;
const runSandbox = SANDBOX_KEY && process.env.NOWPAYMENTS_SANDBOX === 'true';

const describeOrSkip = runSandbox ? describe : describe.skip;

describeOrSkip('NOWPayments Sandbox Integration', () => {
  jest.setTimeout(30000);

  it('GET /v1/status returns OK', async () => {
    const result = await getApiStatus();
    expect(result.message).toBe('OK');
  });

  it('GET /v1/currencies returns a non-empty list', async () => {
    const result = await getCurrencies();
    expect(Array.isArray(result.currencies)).toBe(true);
    expect(result.currencies.length).toBeGreaterThan(0);
    expect(result.currencies).toContain('btc');
  });

  it('GET /v1/estimate returns estimated amount for USD->BTC', async () => {
    const result = await getEstimatedPrice(100, 'usd', 'btc');
    expect(result.currency_from).toBe('usd');
    expect(result.currency_to).toBe('btc');
    expect(Number(result.amount_from)).toBe(100);
    expect(Number(result.estimated_amount)).toBeGreaterThan(0);
  });

  it('GET /v1/min-amount returns minimum for ETH->BTC', async () => {
    const result = await getMinimumAmount('eth', 'btc');
    expect(result.currency_from).toBe('eth');
    expect(result.min_amount).toBeGreaterThan(0);
  });

  describe('payment flow with case=success', () => {
    let paymentId: string;

    it('POST /v1/payment creates a payment', async () => {
      const result = await createPayment({
        priceAmount: 100,
        priceCurrency: 'usd',
        payCurrency: 'btc',
        orderId: `test-${Date.now()}`,
        orderDescription: 'Sandbox integration test',
        case: 'success'
      });

      expect(result.payment_id).toBeTruthy();
      expect(result.payment_status).toBe('waiting');
      expect(result.pay_address).toBeTruthy();
      expect(Number(result.price_amount)).toBe(100);
      expect(result.price_currency).toBe('usd');
      expect(result.pay_currency).toBe('btc');
      expect(Number(result.pay_amount)).toBeGreaterThan(0);
      paymentId = result.payment_id;
    });

    it('GET /v1/payment/:id returns the payment', async () => {
      if (!paymentId) return;
      const result = await getPaymentStatus(paymentId);
      expect(String(result.payment_id)).toBe(String(paymentId));
      expect(typeof result.payment_status).toBe('string');
      expect(Number(result.price_amount)).toBe(100);
    });
  });

  describe('payment flow with case=failed', () => {
    it('POST /v1/payment with case=failed creates a payment', async () => {
      const result = await createPayment({
        priceAmount: 100,
        priceCurrency: 'usd',
        payCurrency: 'btc',
        orderId: `test-fail-${Date.now()}`,
        case: 'failed'
      });

      expect(result.payment_id).toBeTruthy();
      expect(result.payment_status).toBe('waiting');
    });
  });

  describe('payment flow with case=partially_paid', () => {
    it('POST /v1/payment with case=partially_paid creates a payment', async () => {
      const result = await createPayment({
        priceAmount: 100,
        priceCurrency: 'usd',
        payCurrency: 'btc',
        orderId: `test-partial-${Date.now()}`,
        case: 'partially_paid'
      });

      expect(result.payment_id).toBeTruthy();
      expect(result.payment_status).toBe('waiting');
    });
  });

  describe('invoice flow', () => {
    let invoiceId: string;

    it('POST /v1/invoice creates an invoice', async () => {
      const result = await createInvoice({
        priceAmount: 15,
        priceCurrency: 'usd',
        orderId: `test-inv-${Date.now()}`,
        orderDescription: 'Sandbox invoice test',
        ipnCallbackUrl: 'https://example.com/webhook',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel'
      });

      expect(result.id).toBeTruthy();
      expect(result.invoice_url).toBeTruthy();
      expect(result.invoice_url).toContain('nowpayments.io');
      invoiceId = result.id;
    });

    it('POST /v1/invoice-payment creates payment from invoice', async () => {
      if (!invoiceId) return;
      const result = await createPaymentByInvoice({
        iid: invoiceId,
        payCurrency: 'btc',
        case: 'success'
      });

      expect(result.payment_id).toBeTruthy();
      expect(result.payment_status).toBe('waiting');
      expect(result.pay_currency).toBe('btc');
    });
  });
});
