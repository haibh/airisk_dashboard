import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure invite token
 * URL-safe base64 encoding of 32 random bytes
 */
export function generateInviteToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Get expiry date for invitation (7 days from now)
 */
export function getInviteExpiry(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}
