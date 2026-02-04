/**
 * API Key Authentication Handler
 * Validates incoming API keys and returns org context
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { KeyPermission } from '@prisma/client';

interface AuthResult {
  orgId: string;
  permissions: KeyPermission;
  keyId: string;
}

/**
 * Hash API key using SHA-256
 */
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Authenticate API key from Bearer token
 * @param bearerToken - Full API key from Authorization header
 * @returns Auth context or null if invalid
 */
export async function authenticateAPIKey(
  bearerToken: string
): Promise<AuthResult | null> {
  // Hash the incoming token
  const keyHash = hashKey(bearerToken);

  // Lookup by hash
  const apiKey = await prisma.aPIKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      organizationId: true,
      permissions: true,
      revokedAt: true,
      expiresAt: true,
    },
  });

  if (!apiKey) {
    return null;
  }

  // Check if revoked
  if (apiKey.revokedAt) {
    return null;
  }

  // Check if expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update last used timestamp (fire and forget)
  prisma.aPIKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {
      /* Ignore errors on lastUsedAt update */
    });

  return {
    orgId: apiKey.organizationId,
    permissions: apiKey.permissions,
    keyId: apiKey.id,
  };
}
