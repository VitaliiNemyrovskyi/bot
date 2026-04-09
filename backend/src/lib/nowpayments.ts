import crypto from 'crypto';

/**
 * NOWPayments REST + IPN integration.
 *
 * Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
 *
 * Two responsibilities:
 *  1. createInvoice — POST /v1/invoice to start a hosted-checkout session.
 *  2. verifyIpnSignature — HMAC-SHA512 verification of IPN webhook payloads.
 *
 * No env vars are read until a method is actually called, so unit tests can
 * inject env at runtime without polluting global state.
 */

const NOWPAYMENTS_API_BASE = 'https://api.nowpayments.io/v1';

export interface NowPaymentsInvoiceParams {
  priceAmount: number;
  priceCurrency: string; // e.g. 'usd'
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}

export interface NowPaymentsInvoiceResponse {
  id: string;
  invoice_url: string;
  order_id: string;
  price_amount: string;
  price_currency: string;
  created_at: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Create a NOWPayments hosted-checkout invoice.
 * Throws if NOWPAYMENTS_API_KEY is not set or the API returns a non-2xx.
 */
export async function createInvoice(
  params: NowPaymentsInvoiceParams
): Promise<NowPaymentsInvoiceResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');

  const body = {
    price_amount: params.priceAmount,
    price_currency: params.priceCurrency,
    order_id: params.orderId,
    order_description: params.orderDescription,
    ipn_callback_url: params.ipnCallbackUrl,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl
  };

  const response = await fetch(`${NOWPAYMENTS_API_BASE}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments createInvoice failed (${response.status}): ${text}`);
  }

  return (await response.json()) as NowPaymentsInvoiceResponse;
}

/**
 * Verify the HMAC-SHA512 signature on an incoming IPN webhook.
 *
 * NOWPayments computes the signature over the JSON body with keys sorted
 * alphabetically (recursively for nested objects). We must reproduce that
 * exact serialization to verify.
 *
 * @param parsedBody  the parsed JSON payload (object)
 * @param signature   the raw value of the `x-nowpayments-sig` header
 * @returns           true when the signature matches, false otherwise
 */
export function verifyIpnSignature(
  parsedBody: Record<string, unknown>,
  signature: string | null | undefined
): boolean {
  if (!signature) return false;
  const ipnSecret = requireEnv('NOWPAYMENTS_IPN_SECRET');

  const sortedSerialized = stableStringify(parsedBody);
  const expected = crypto
    .createHmac('sha512', ipnSecret)
    .update(sortedSerialized)
    .digest('hex');

  // Use timingSafeEqual to avoid leaking information via response time.
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Deterministic JSON stringify with alphabetically sorted keys (recursive).
 * Matches the serialization NOWPayments uses for IPN signing.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((v) => stableStringify(v)).join(',') + ']';
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return (
    '{' +
    keys
      .map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k]))
      .join(',') +
    '}'
  );
}
