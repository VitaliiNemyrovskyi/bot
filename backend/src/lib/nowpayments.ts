import crypto from 'crypto';

/**
 * NOWPayments REST + IPN integration.
 *
 * Docs: https://documenter.getpostman.com/view/7907941/T1LSCRHC
 *
 * Responsibilities:
 *  1. createInvoice — POST /v1/invoice to start a hosted-checkout session.
 *  2. createPayment — POST /v1/payment with sandbox `case` parameter.
 *  3. createPaymentByInvoice — POST /v1/invoice-payment.
 *  4. getPaymentStatus — GET /v1/payment/:id.
 *  5. getEstimatedPrice — GET /v1/estimate.
 *  6. getMinimumAmount — GET /v1/min-amount.
 *  7. getCurrencies — GET /v1/currencies.
 *  8. getApiStatus — GET /v1/status (health check).
 *  9. verifyIpnSignature — HMAC-SHA512 verification of IPN webhook payloads.
 *
 * No env vars are read until a method is actually called, so unit tests can
 * inject env at runtime without polluting global state.
 */

export function getApiBase(): string {
  return process.env.NOWPAYMENTS_SANDBOX === 'true'
    ? 'https://api-sandbox.nowpayments.io/v1'
    : 'https://api.nowpayments.io/v1';
}

// --- Interfaces ---

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

/** Sandbox test cases for simulating different payment outcomes. */
export type SandboxCase = 'success' | 'common' | 'failed' | 'partially_paid';

export interface NowPaymentsCreatePaymentParams {
  priceAmount: number;
  priceCurrency: string;
  payCurrency: string;
  payAmount?: number;
  ipnCallbackUrl?: string;
  orderId?: string;
  orderDescription?: string;
  purchaseId?: string;
  payoutAddress?: string;
  payoutCurrency?: string;
  payoutExtraId?: string;
  /** Sandbox-only: controls simulated payment outcome. */
  case?: SandboxCase;
}

export interface NowPaymentsPaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid?: number;
  pay_currency: string;
  order_id?: string;
  order_description?: string;
  ipn_callback_url?: string;
  purchase_id?: string;
  created_at: string;
  updated_at: string;
  outcome_currency?: string;
  outcome_amount?: number;
  amount_received?: number | null;
  payin_extra_id?: string | null;
  network?: string;
  network_precision?: number;
  expiration_estimate_date?: string;
}

export interface NowPaymentsCreatePaymentByInvoiceParams {
  iid: string;
  payCurrency: string;
  purchaseId?: string;
  orderDescription?: string;
  customerEmail?: string;
  payoutAddress?: string;
  payoutExtraId?: string;
  payoutCurrency?: string;
  /** Sandbox-only: controls simulated payment outcome. */
  case?: SandboxCase;
}

export interface NowPaymentsEstimateResponse {
  currency_from: string;
  amount_from: number;
  currency_to: string;
  estimated_amount: number;
}

export interface NowPaymentsMinAmountResponse {
  currency_from: string;
  currency_to?: string;
  min_amount: number;
}

export interface NowPaymentsCurrenciesResponse {
  currencies: string[];
}

export interface NowPaymentsStatusResponse {
  message: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// --- API methods ---

/**
 * GET /v1/status — Health check, no auth required.
 */
export async function getApiStatus(): Promise<NowPaymentsStatusResponse> {
  const response = await fetch(`${getApiBase()}/status`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments getApiStatus failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsStatusResponse;
}

/**
 * GET /v1/currencies — List available cryptocurrencies.
 */
export async function getCurrencies(): Promise<NowPaymentsCurrenciesResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');
  const response = await fetch(`${getApiBase()}/currencies`, {
    headers: { 'x-api-key': apiKey }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments getCurrencies failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsCurrenciesResponse;
}

/**
 * GET /v1/estimate — Estimated price for a fiat-to-crypto conversion.
 */
export async function getEstimatedPrice(
  amount: number,
  currencyFrom: string,
  currencyTo: string
): Promise<NowPaymentsEstimateResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');
  const params = new URLSearchParams({
    amount: String(amount),
    currency_from: currencyFrom,
    currency_to: currencyTo
  });
  const response = await fetch(`${getApiBase()}/estimate?${params}`, {
    headers: { 'x-api-key': apiKey }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments getEstimatedPrice failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsEstimateResponse;
}

/**
 * GET /v1/min-amount — Minimum payment amount for a currency pair.
 */
export async function getMinimumAmount(
  currencyFrom: string,
  currencyTo?: string
): Promise<NowPaymentsMinAmountResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');
  const params = new URLSearchParams({ currency_from: currencyFrom });
  if (currencyTo) params.set('currency_to', currencyTo);
  const response = await fetch(`${getApiBase()}/min-amount?${params}`, {
    headers: { 'x-api-key': apiKey }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments getMinimumAmount failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsMinAmountResponse;
}

/**
 * POST /v1/payment — Create a payment.
 * In sandbox mode, use the `case` parameter to simulate different outcomes.
 */
export async function createPayment(
  params: NowPaymentsCreatePaymentParams
): Promise<NowPaymentsPaymentResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');

  const body = {
    price_amount: params.priceAmount,
    price_currency: params.priceCurrency,
    pay_currency: params.payCurrency,
    ...(params.payAmount !== undefined && { pay_amount: params.payAmount }),
    ...(params.ipnCallbackUrl && { ipn_callback_url: params.ipnCallbackUrl }),
    ...(params.orderId && { order_id: params.orderId }),
    ...(params.orderDescription && { order_description: params.orderDescription }),
    ...(params.purchaseId && { purchase_id: params.purchaseId }),
    ...(params.payoutAddress && { payout_address: params.payoutAddress }),
    ...(params.payoutCurrency && { payout_currency: params.payoutCurrency }),
    ...(params.payoutExtraId && { payout_extra_id: params.payoutExtraId }),
    ...(params.case && { case: params.case })
  };

  const response = await fetch(`${getApiBase()}/payment`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments createPayment failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsPaymentResponse;
}

/**
 * POST /v1/invoice-payment — Create a payment from an existing invoice.
 */
export async function createPaymentByInvoice(
  params: NowPaymentsCreatePaymentByInvoiceParams
): Promise<NowPaymentsPaymentResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');

  const body = {
    iid: params.iid,
    pay_currency: params.payCurrency,
    ...(params.purchaseId && { purchase_id: params.purchaseId }),
    ...(params.orderDescription && { order_description: params.orderDescription }),
    ...(params.customerEmail && { customer_email: params.customerEmail }),
    ...(params.payoutAddress && { payout_address: params.payoutAddress }),
    ...(params.payoutExtraId && { payout_extra_id: params.payoutExtraId }),
    ...(params.payoutCurrency && { payout_currency: params.payoutCurrency }),
    ...(params.case && { case: params.case })
  };

  const response = await fetch(`${getApiBase()}/invoice-payment`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments createPaymentByInvoice failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsPaymentResponse;
}

/**
 * GET /v1/payment/:id — Get the current status of a payment.
 */
export async function getPaymentStatus(
  paymentId: string
): Promise<NowPaymentsPaymentResponse> {
  const apiKey = requireEnv('NOWPAYMENTS_API_KEY');
  const response = await fetch(`${getApiBase()}/payment/${paymentId}`, {
    headers: { 'x-api-key': apiKey }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NOWPayments getPaymentStatus failed (${response.status}): ${text}`);
  }
  return (await response.json()) as NowPaymentsPaymentResponse;
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

  const response = await fetch(`${getApiBase()}/invoice`, {
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
