// Stripe over its REST API (no SDK). DogText bills through the shared Our
// Rose Stripe account: seven other sites get every checkout.session.completed
// on it, so every DogText session is tagged metadata.brand = 'dogtext' and
// never sets metadata.userId or client_reference_id (fields other sites act on).

import crypto from 'crypto';

export const DOGTEXT_BRAND = 'dogtext';

type Params = Record<string, string | number | boolean | undefined>;

function form(params: Params): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

export async function stripe<T = Record<string, unknown>>(
  method: 'GET' | 'POST',
  path: string,
  params: Params = {},
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  const body = form(params);
  const url = `https://api.stripe.com/v1${path}${method === 'GET' && body ? `?${body}` : ''}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: method === 'POST' ? body : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Stripe ${res.status}: ${json?.error?.message ?? 'error'}`);
  return json as T;
}

/**
 * Checks a webhook's Stripe-Signature header (v1 scheme): HMAC-SHA256 of
 * "<timestamp>.<raw body>" with the endpoint's secret, within 5 minutes.
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i), kv.slice(i + 1)];
    }),
  ) as Record<string, string>;
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex');
  const given = header
    .split(',')
    .filter((kv) => kv.startsWith('v1='))
    .map((kv) => kv.slice(3));
  return given.some(
    (sig) => sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)),
  );
}
