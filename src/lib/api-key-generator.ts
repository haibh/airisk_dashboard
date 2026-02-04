/**
 * API Key Generation Utilities
 * Generates secure API keys with prefix and hash
 */

import crypto from 'crypto';

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate random base62 string
 */
function generateBase62(length: number): string {
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[bytes[i] % BASE62_CHARS.length];
  }
  return result;
}

/**
 * Hash API key using SHA-256
 */
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Generate API key with prefix, hash
 * @param type - Key type: 'live' or 'test'
 * @returns Object with fullKey (show once), prefix (for display), hash (store in DB)
 */
export function generateAPIKey(type: 'live' | 'test'): {
  fullKey: string;
  prefix: string;
  hash: string;
} {
  const prefixStr = type === 'live' ? 'airm_live_' : 'airm_test_';
  const randomPart = generateBase62(32);
  const fullKey = prefixStr + randomPart;

  // First 12 chars for prefix display
  const prefix = fullKey.substring(0, 12);

  // SHA-256 hash for storage
  const hash = hashKey(fullKey);

  return { fullKey, prefix, hash };
}
