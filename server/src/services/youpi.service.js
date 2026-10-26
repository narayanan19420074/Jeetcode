import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Thin client for a self-hosted YouPI PG instance (github.com/youpi-pg/YouPI-PG).
// Docs: docs/MERCHANT_INTEGRATION.md -> "Direct REST API Integration".

function assertConfigured() {
  if (!env.YOUPI_API_URL || !env.YOUPI_MERCHANT_ID || !env.YOUPI_WEBHOOK_SECRET) {
    throw ApiError.internal('Payments are not configured — set YOUPI_API_URL, YOUPI_MERCHANT_ID and YOUPI_WEBHOOK_SECRET.');
  }
}

// POST {YOUPI_API_URL}/api/v1/payments -> { paymentId, checkoutUrl, ... }
export async function createYoupiPayment({ orderId, amountPaise, returnUrl }) {
  assertConfigured();
  const base = env.YOUPI_API_URL.replace(/\/+$/, '');
  let res;
  try {
    res = await fetch(`${base}/api/v1/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Merchant-Id': env.YOUPI_MERCHANT_ID },
      body: JSON.stringify({
        orderId,
        amount: (amountPaise / 100).toFixed(2),
        currency: 'INR',
        returnUrl,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw ApiError.internal('Payment gateway is unreachable right now. Try again in a minute.');
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.checkoutUrl) {
    console.error('YouPI createPayment failed', res.status, body);
    // 409 = gateway queue/slot busy or order mismatch; show a gentle message.
    throw ApiError.internal(body?.message || body?.error || 'Could not start the payment. Try again shortly.');
  }
  return { paymentId: body.paymentId || null, checkoutUrl: body.checkoutUrl };
}

// Header: X-Gateway-Signature: sha256=<hex of HMAC-SHA256(secret, rawBody)>
export function verifyYoupiSignature(rawBody, signatureHeader) {
  assertConfigured();
  const expected = 'sha256=' + crypto.createHmac('sha256', env.YOUPI_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const got = String(signatureHeader || '');
  if (got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}
