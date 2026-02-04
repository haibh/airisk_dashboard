/**
 * Webhook Signature Generator
 * HMAC-SHA256 signing and verification for webhook payloads
 */

import crypto from 'crypto';

/**
 * Sign payload with HMAC-SHA256
 * @param payload - JSON string payload
 * @param secret - Webhook secret
 * @returns HMAC-SHA256 hex signature
 */
export function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify signature using timing-safe comparison
 * @param payload - JSON string payload
 * @param signature - Signature to verify
 * @param secret - Webhook secret
 * @returns True if signature is valid
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signPayload(payload, secret);

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    // If lengths don't match, timingSafeEqual throws
    return false;
  }
}
