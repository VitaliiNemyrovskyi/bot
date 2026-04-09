import crypto from 'crypto';
import {
  stableStringify,
  verifyIpnSignature,
  createInvoice,
  createPayment,
  getPaymentStatus,
  getApiBase
} from '../nowpayments';

// --- helpers ---

function mockFetch(response: Partial<Response> & { ok: boolean }) {
  const fn = jest.fn().mockResolvedValue({
    json: async () => ({}),
    text: async () => '',
    ...response
  });
  // @ts-expect-error overriding global for test
  global.fetch = fn;
  return fn;
}

function sign(body: object, secret: string): string {
  return crypto
    .createHmac('sha512', secret)
    .update(stableStringify(body))
    .digest('hex');
}

// --- getApiBase ---

describe('getApiBase', () => {
  const origSandbox = process.env.NOWPAYMENTS_SANDBOX;
  afterEach(() => {
    if (origSandbox !== undefined) {
      process.env.NOWPAYMENTS_SANDBOX = origSandbox;
    } else {
      delete process.env.NOWPAYMENTS_SANDBOX;
    }
  });

  it('returns sandbox URL when NOWPAYMENTS_SANDBOX=true', () => {
    process.env.NOWPAYMENTS_SANDBOX = 'true';
    expect(getApiBase()).toBe('https://api-sandbox.nowpayments.io/v1');
  });

  it('returns production URL when NOWPAYMENTS_SANDBOX is not true', () => {
    process.env.NOWPAYMENTS_SANDBOX = 'false';
    expect(getApiBase()).toBe('https://api.nowpayments.io/v1');
  });
});

// --- stableStringify ---

describe('stableStringify', () => {
  it('sorts top-level keys alphabetically', () => {
    expect(stableStringify({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it('sorts nested object keys recursively', () => {
    expect(stableStringify({ b: { d: 4, c: 3 }, a: 1 })).toBe(
      '{"a":1,"b":{"c":3,"d":4}}'
    );
  });

  it('serializes arrays without sorting their elements', () => {
    expect(stableStringify({ arr: [3, 1, 2] })).toBe('{"arr":[3,1,2]}');
  });

  it('handles primitives and null', () => {
    expect(stableStringify(null)).toBe('null');
    expect(stableStringify(42)).toBe('42');
    expect(stableStringify('hi')).toBe('"hi"');
  });
});

// --- verifyIpnSignature ---

describe('verifyIpnSignature', () => {
  const secret = 'test-secret-12345';
  const payload = {
    payment_id: 'pay_abc',
    payment_status: 'finished',
    pay_amount: 100,
    order_id: 'user_1:plan_1:1700000000000'
  };

  beforeEach(() => {
    process.env.NOWPAYMENTS_IPN_SECRET = secret;
  });
  afterEach(() => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
  });

  it('returns true for a valid signature', () => {
    expect(verifyIpnSignature(payload, sign(payload, secret))).toBe(true);
  });

  it('returns false when the signature is tampered', () => {
    const sig = sign(payload, secret);
    const tampered = sig.slice(0, -2) + (sig.slice(-2) === 'aa' ? 'bb' : 'aa');
    expect(verifyIpnSignature(payload, tampered)).toBe(false);
  });

  it('returns false when the body is tampered', () => {
    const sig = sign(payload, secret);
    expect(verifyIpnSignature({ ...payload, pay_amount: 9999 }, sig)).toBe(false);
  });

  it('returns false when the signature header is missing', () => {
    expect(verifyIpnSignature(payload, null)).toBe(false);
    expect(verifyIpnSignature(payload, undefined)).toBe(false);
    expect(verifyIpnSignature(payload, '')).toBe(false);
  });

  it('throws when NOWPAYMENTS_IPN_SECRET is not configured', () => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    expect(() => verifyIpnSignature(payload, sign(payload, 'whatever'))).toThrow(
      /NOWPAYMENTS_IPN_SECRET/
    );
  });
});

// --- createInvoice ---

describe('createInvoice', () => {
  const invoiceParams = {
    priceAmount: 29,
    priceCurrency: 'usd',
    orderId: 'u1:plan1:1700000000000',
    orderDescription: 'Premium Monthly',
    ipnCallbackUrl: 'https://app.example.com/api/billing/webhook',
    successUrl: 'https://app.example.com/billing?status=success',
    cancelUrl: 'https://app.example.com/billing?status=cancelled'
  };

  beforeEach(() => {
    process.env.NOWPAYMENTS_API_KEY = 'test-api-key';
  });
  afterEach(() => {
    delete process.env.NOWPAYMENTS_API_KEY;
    jest.restoreAllMocks();
  });

  it('throws when NOWPAYMENTS_API_KEY is missing', async () => {
    delete process.env.NOWPAYMENTS_API_KEY;
    await expect(createInvoice(invoiceParams)).rejects.toThrow(/NOWPAYMENTS_API_KEY/);
  });

  it('sends correct request and returns parsed response', async () => {
    const fakeResponse = {
      id: 'inv_1',
      invoice_url: 'https://nowpayments.io/payment?iid=inv_1',
      order_id: 'u1:plan1:1700000000000',
      price_amount: '29',
      price_currency: 'usd',
      created_at: '2026-01-01'
    };
    const fetchMock = mockFetch({ ok: true, json: async () => fakeResponse });

    const result = await createInvoice(invoiceParams);

    expect(result).toEqual(fakeResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/invoice');
    expect(init.method).toBe('POST');
    expect(init.headers['x-api-key']).toBe('test-api-key');
    const body = JSON.parse(init.body);
    expect(body.price_amount).toBe(29);
    expect(body.price_currency).toBe('usd');
    expect(body.order_id).toBe('u1:plan1:1700000000000');
    expect(body.success_url).toBe('https://app.example.com/billing?status=success');
  });

  it('throws on non-2xx response', async () => {
    mockFetch({ ok: false, status: 400, text: async () => 'Bad request' } as Response & { ok: false });
    await expect(createInvoice(invoiceParams)).rejects.toThrow(/createInvoice failed.*400/);
  });
});

// --- createPayment ---

describe('createPayment', () => {
  beforeEach(() => {
    process.env.NOWPAYMENTS_API_KEY = 'test-api-key';
    process.env.NOWPAYMENTS_SANDBOX = 'true';
  });
  afterEach(() => {
    delete process.env.NOWPAYMENTS_API_KEY;
    delete process.env.NOWPAYMENTS_SANDBOX;
    jest.restoreAllMocks();
  });

  it('throws when NOWPAYMENTS_API_KEY is missing', async () => {
    delete process.env.NOWPAYMENTS_API_KEY;
    await expect(
      createPayment({ priceAmount: 100, priceCurrency: 'usd', payCurrency: 'btc' })
    ).rejects.toThrow(/NOWPAYMENTS_API_KEY/);
  });

  it('sends required fields and returns parsed response', async () => {
    const fakePayment = {
      payment_id: 'pay_123',
      payment_status: 'waiting',
      pay_address: '3EZ2uTdVDAMFXTfc6uLDDKR6o8qKBZXVkj',
      price_amount: 100,
      price_currency: 'usd',
      pay_amount: 0.0042,
      pay_currency: 'btc',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      purchase_id: 'pur_456'
    };
    const fetchMock = mockFetch({ ok: true, json: async () => fakePayment });

    const result = await createPayment({
      priceAmount: 100,
      priceCurrency: 'usd',
      payCurrency: 'btc'
    });

    expect(result).toEqual(fakePayment);
    expect(result.payment_id).toBe('pay_123');
    expect(result.payment_status).toBe('waiting');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api-sandbox.nowpayments.io/v1/payment');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body);
    expect(body.price_amount).toBe(100);
    expect(body.price_currency).toBe('usd');
    expect(body.pay_currency).toBe('btc');
  });

  it('includes sandbox case parameter when provided', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ payment_id: 'p1', payment_status: 'waiting' })
    });

    await createPayment({
      priceAmount: 50,
      priceCurrency: 'usd',
      payCurrency: 'btc',
      case: 'success'
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.case).toBe('success');
  });

  it('includes all optional fields when provided', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ payment_id: 'p1', payment_status: 'waiting' })
    });

    await createPayment({
      priceAmount: 50,
      priceCurrency: 'usd',
      payCurrency: 'btc',
      payAmount: 0.002,
      ipnCallbackUrl: 'https://example.com/webhook',
      orderId: 'ORD-1',
      orderDescription: 'Test order',
      purchaseId: 'pur_prev',
      case: 'failed'
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.pay_amount).toBe(0.002);
    expect(body.ipn_callback_url).toBe('https://example.com/webhook');
    expect(body.order_id).toBe('ORD-1');
    expect(body.order_description).toBe('Test order');
    expect(body.purchase_id).toBe('pur_prev');
    expect(body.case).toBe('failed');
  });

  it('omits optional fields when not provided', async () => {
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({ payment_id: 'p1', payment_status: 'waiting' })
    });

    await createPayment({
      priceAmount: 50,
      priceCurrency: 'usd',
      payCurrency: 'btc'
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      price_amount: 50,
      price_currency: 'usd',
      pay_currency: 'btc'
    });
    expect(body.case).toBeUndefined();
    expect(body.order_id).toBeUndefined();
  });

  it.each(['success', 'failed', 'partially_paid', 'common'] as const)(
    'accepts sandbox case "%s"',
    async (sandboxCase) => {
      const fetchMock = mockFetch({
        ok: true,
        json: async () => ({ payment_id: 'p1', payment_status: 'waiting' })
      });

      await createPayment({
        priceAmount: 10,
        priceCurrency: 'usd',
        payCurrency: 'btc',
        case: sandboxCase
      });

      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.case).toBe(sandboxCase);
    }
  );

  it('throws on non-2xx response', async () => {
    mockFetch({ ok: false, status: 422, text: async () => 'Invalid currency' } as Response & { ok: false });
    await expect(
      createPayment({ priceAmount: 100, priceCurrency: 'usd', payCurrency: 'btc' })
    ).rejects.toThrow(/createPayment failed.*422/);
  });
});

// --- getPaymentStatus ---

describe('getPaymentStatus', () => {
  beforeEach(() => {
    process.env.NOWPAYMENTS_API_KEY = 'test-api-key';
    process.env.NOWPAYMENTS_SANDBOX = 'true';
  });
  afterEach(() => {
    delete process.env.NOWPAYMENTS_API_KEY;
    delete process.env.NOWPAYMENTS_SANDBOX;
    jest.restoreAllMocks();
  });

  it('throws when NOWPAYMENTS_API_KEY is missing', async () => {
    delete process.env.NOWPAYMENTS_API_KEY;
    await expect(getPaymentStatus('pay_123')).rejects.toThrow(/NOWPAYMENTS_API_KEY/);
  });

  it('sends GET request with correct payment ID and API key', async () => {
    const fakePayment = {
      payment_id: 'pay_123',
      payment_status: 'finished',
      pay_address: '3EZ2uTd...',
      price_amount: 100,
      price_currency: 'usd',
      pay_amount: 0.0042,
      actually_paid: 0.0042,
      pay_currency: 'btc',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:01:00.000Z'
    };
    const fetchMock = mockFetch({ ok: true, json: async () => fakePayment });

    const result = await getPaymentStatus('pay_123');

    expect(result).toEqual(fakePayment);
    expect(result.payment_status).toBe('finished');
    expect(result.actually_paid).toBe(0.0042);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api-sandbox.nowpayments.io/v1/payment/pay_123');
    expect(init.headers['x-api-key']).toBe('test-api-key');
    expect(init.method).toBeUndefined(); // GET is default
  });

  it('throws on 404 (payment not found)', async () => {
    mockFetch({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ message: 'Payment not found' })
    } as Response & { ok: false });

    await expect(getPaymentStatus('nonexistent')).rejects.toThrow(
      /getPaymentStatus failed.*404/
    );
  });

  it.each([
    'waiting', 'confirming', 'confirmed', 'sending',
    'partially_paid', 'finished', 'failed', 'refunded', 'expired'
  ])('correctly returns payment with status "%s"', async (status) => {
    mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_x',
        payment_status: status,
        pay_address: 'addr',
        price_amount: 10,
        price_currency: 'usd',
        pay_amount: 0.001,
        pay_currency: 'btc',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
      })
    });

    const result = await getPaymentStatus('pay_x');
    expect(result.payment_status).toBe(status);
  });
});

// --- sandbox payment flow (end-to-end mock) ---

describe('sandbox payment flow (mocked)', () => {
  beforeEach(() => {
    process.env.NOWPAYMENTS_API_KEY = 'test-api-key';
    process.env.NOWPAYMENTS_SANDBOX = 'true';
    process.env.NOWPAYMENTS_IPN_SECRET = 'ipn-secret';
  });
  afterEach(() => {
    delete process.env.NOWPAYMENTS_API_KEY;
    delete process.env.NOWPAYMENTS_SANDBOX;
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    jest.restoreAllMocks();
  });

  it('create payment -> check status -> verify IPN', async () => {
    // Step 1: Create payment with sandbox case=success
    const createdPayment = {
      payment_id: 'pay_flow_1',
      payment_status: 'waiting',
      pay_address: '3EZ2uTdVDAMFXTfc6uLDDKR6o8qKBZXVkj',
      price_amount: 50,
      price_currency: 'usd',
      pay_amount: 0.002,
      pay_currency: 'btc',
      order_id: 'user1:plan1:1700000000000',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      purchase_id: 'pur_1'
    };
    mockFetch({ ok: true, json: async () => createdPayment });

    const payment = await createPayment({
      priceAmount: 50,
      priceCurrency: 'usd',
      payCurrency: 'btc',
      orderId: 'user1:plan1:1700000000000',
      case: 'success'
    });
    expect(payment.payment_id).toBe('pay_flow_1');
    expect(payment.payment_status).toBe('waiting');

    // Step 2: Poll payment status — now finished
    const finishedPayment = {
      ...createdPayment,
      payment_status: 'finished',
      actually_paid: 0.002,
      updated_at: '2026-01-01T00:01:00Z'
    };
    mockFetch({ ok: true, json: async () => finishedPayment });

    const status = await getPaymentStatus(payment.payment_id);
    expect(status.payment_status).toBe('finished');
    expect(status.actually_paid).toBe(0.002);

    // Step 3: Verify IPN webhook signature for this payment
    const ipnPayload = {
      payment_id: 'pay_flow_1',
      payment_status: 'finished',
      pay_amount: 0.002,
      actually_paid: 0.002,
      pay_currency: 'btc',
      order_id: 'user1:plan1:1700000000000',
      price_amount: 50,
      price_currency: 'usd'
    };
    const ipnSignature = sign(ipnPayload, 'ipn-secret');
    expect(verifyIpnSignature(ipnPayload, ipnSignature)).toBe(true);

    // Tampered payload should fail
    const tampered = { ...ipnPayload, actually_paid: 999 };
    expect(verifyIpnSignature(tampered, ipnSignature)).toBe(false);
  });

  it('create payment -> failed case -> verify failed status', async () => {
    mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_fail',
        payment_status: 'waiting',
        pay_address: 'addr',
        price_amount: 50,
        price_currency: 'usd',
        pay_amount: 0.002,
        pay_currency: 'btc',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
      })
    });

    const payment = await createPayment({
      priceAmount: 50,
      priceCurrency: 'usd',
      payCurrency: 'btc',
      case: 'failed'
    });
    expect(payment.payment_status).toBe('waiting');

    // Simulate polling — now failed
    mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_fail',
        payment_status: 'failed',
        pay_address: 'addr',
        price_amount: 50,
        price_currency: 'usd',
        pay_amount: 0.002,
        actually_paid: 0,
        pay_currency: 'btc',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:01:00Z'
      })
    });

    const status = await getPaymentStatus(payment.payment_id);
    expect(status.payment_status).toBe('failed');
  });

  it('create payment -> partially_paid case', async () => {
    mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_partial',
        payment_status: 'waiting',
        pay_address: 'addr',
        price_amount: 100,
        price_currency: 'usd',
        pay_amount: 0.004,
        pay_currency: 'btc',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
      })
    });

    await createPayment({
      priceAmount: 100,
      priceCurrency: 'usd',
      payCurrency: 'btc',
      case: 'partially_paid'
    });

    // Simulate polling — now partially_paid
    mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_partial',
        payment_status: 'partially_paid',
        pay_address: 'addr',
        price_amount: 100,
        price_currency: 'usd',
        pay_amount: 0.004,
        actually_paid: 0.002,
        pay_currency: 'btc',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:01:00Z'
      })
    });

    const status = await getPaymentStatus('pay_partial');
    expect(status.payment_status).toBe('partially_paid');
    expect(status.actually_paid).toBe(0.002);
    expect(status.actually_paid).toBeLessThan(status.pay_amount);
  });

  it('multiple payments for one order via purchase_id', async () => {
    // First payment
    mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_1',
        payment_status: 'waiting',
        pay_address: 'addr1',
        price_amount: 100,
        price_currency: 'usd',
        pay_amount: 0.004,
        pay_currency: 'btc',
        purchase_id: 'pur_shared',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
      })
    });

    const first = await createPayment({
      priceAmount: 100,
      priceCurrency: 'usd',
      payCurrency: 'btc',
      case: 'success'
    });
    expect(first.purchase_id).toBe('pur_shared');

    // Second payment using same purchase_id, different currency
    const fetchMock = mockFetch({
      ok: true,
      json: async () => ({
        payment_id: 'pay_2',
        payment_status: 'waiting',
        pay_address: 'addr2',
        price_amount: 100,
        price_currency: 'usd',
        pay_amount: 0.05,
        pay_currency: 'eth',
        purchase_id: 'pur_shared',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
      })
    });

    const second = await createPayment({
      priceAmount: 100,
      priceCurrency: 'usd',
      payCurrency: 'eth',
      purchaseId: first.purchase_id!,
      case: 'success'
    });

    expect(second.purchase_id).toBe('pur_shared');
    expect(second.pay_currency).toBe('eth');

    // Verify purchase_id was sent in request body
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.purchase_id).toBe('pur_shared');
  });
});
