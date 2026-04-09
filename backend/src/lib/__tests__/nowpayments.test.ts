import crypto from 'crypto';
import { stableStringify, verifyIpnSignature, createInvoice } from '../nowpayments';

describe('nowpayments / stableStringify', () => {
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

describe('nowpayments / verifyIpnSignature', () => {
  const secret = 'test-secret-12345';
  const payload = {
    payment_id: 'pay_abc',
    payment_status: 'finished',
    pay_amount: 100,
    order_id: 'user_1:plan_1:1700000000000'
  };

  function sign(body: object, withSecret = secret): string {
    return crypto
      .createHmac('sha512', withSecret)
      .update(stableStringify(body))
      .digest('hex');
  }

  beforeEach(() => {
    process.env.NOWPAYMENTS_IPN_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
  });

  it('returns true for a valid signature', () => {
    const sig = sign(payload);
    expect(verifyIpnSignature(payload, sig)).toBe(true);
  });

  it('returns false when the signature is tampered', () => {
    const sig = sign(payload);
    const tampered = sig.slice(0, -2) + (sig.slice(-2) === 'aa' ? 'bb' : 'aa');
    expect(verifyIpnSignature(payload, tampered)).toBe(false);
  });

  it('returns false when the body is tampered', () => {
    const sig = sign(payload);
    const modified = { ...payload, pay_amount: 9999 };
    expect(verifyIpnSignature(modified, sig)).toBe(false);
  });

  it('returns false when the signature header is missing', () => {
    expect(verifyIpnSignature(payload, null)).toBe(false);
    expect(verifyIpnSignature(payload, undefined)).toBe(false);
    expect(verifyIpnSignature(payload, '')).toBe(false);
  });

  it('throws when NOWPAYMENTS_IPN_SECRET is not configured', () => {
    delete process.env.NOWPAYMENTS_IPN_SECRET;
    const sig = sign(payload, 'whatever');
    expect(() => verifyIpnSignature(payload, sig)).toThrow(
      /NOWPAYMENTS_IPN_SECRET/
    );
  });
});

describe('nowpayments / createInvoice', () => {
  beforeEach(() => {
    process.env.NOWPAYMENTS_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.NOWPAYMENTS_API_KEY;
    jest.restoreAllMocks();
  });

  it('throws when NOWPAYMENTS_API_KEY is missing', async () => {
    delete process.env.NOWPAYMENTS_API_KEY;
    await expect(
      createInvoice({
        priceAmount: 29,
        priceCurrency: 'usd',
        orderId: 'o1',
        orderDescription: 'd',
        ipnCallbackUrl: 'http://x',
        successUrl: 'http://x',
        cancelUrl: 'http://x'
      })
    ).rejects.toThrow(/NOWPAYMENTS_API_KEY/);
  });

  it('POSTs the expected body and returns the parsed JSON', async () => {
    const fakeResponse = {
      id: 'inv_1',
      invoice_url: 'https://nowpayments.io/payment?iid=inv_1',
      order_id: 'o1',
      price_amount: '29',
      price_currency: 'usd',
      created_at: '2026-01-01'
    };
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeResponse
    });
    // @ts-expect-error overriding global for test
    global.fetch = fetchMock;

    const result = await createInvoice({
      priceAmount: 29,
      priceCurrency: 'usd',
      orderId: 'o1',
      orderDescription: 'Premium Monthly',
      ipnCallbackUrl: 'https://app.example.com/api/billing/webhook',
      successUrl: 'https://app.example.com/billing?status=success',
      cancelUrl: 'https://app.example.com/billing?status=cancelled'
    });

    expect(result).toEqual(fakeResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.nowpayments.io/v1/invoice');
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('test-api-key');
    const sentBody = JSON.parse(init.body);
    expect(sentBody.price_amount).toBe(29);
    expect(sentBody.order_id).toBe('o1');
  });

  it('throws when NOWPayments returns a non-2xx', async () => {
    // @ts-expect-error overriding global for test
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad request'
    });

    await expect(
      createInvoice({
        priceAmount: 29,
        priceCurrency: 'usd',
        orderId: 'o1',
        orderDescription: 'Premium Monthly',
        ipnCallbackUrl: 'https://x',
        successUrl: 'https://x',
        cancelUrl: 'https://x'
      })
    ).rejects.toThrow(/createInvoice failed.*400/);
  });
});
