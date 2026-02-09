import { prisma } from '@/lib/db';
import { isIPv4 } from 'net';

/**
 * Convert IPv4 address to numeric value for range comparison
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/**
 * Check if an IP address matches a CIDR range
 * @param ip - IP address to check (e.g., "192.168.1.100")
 * @param cidr - CIDR notation (e.g., "192.168.1.0/24" or "10.0.0.1")
 * @returns true if IP is in range
 */
function matchesCIDR(ip: string, cidr: string): boolean {
  // Validate IP
  if (!isIPv4(ip)) return false;

  // Parse CIDR
  const [baseIp, maskBits] = cidr.includes('/') ? cidr.split('/') : [cidr, '32'];

  if (!isIPv4(baseIp)) return false;

  const mask = parseInt(maskBits, 10);
  if (isNaN(mask) || mask < 0 || mask > 32) return false;

  // Convert to numbers
  const ipNum = ipToNumber(ip);
  const baseNum = ipToNumber(baseIp);

  // Create mask (e.g., /24 = 0xFFFFFF00)
  const maskValue = mask === 0 ? 0 : ~((1 << (32 - mask)) - 1);

  // Compare network portions
  return (ipNum & maskValue) === (baseNum & maskValue);
}

/**
 * Check if an IP address is allowed for an organization
 * Loads allowlist entries from database and checks against CIDR ranges
 * @param organizationId - Organization ID
 * @param ipAddress - IP address to check
 * @returns true if allowed, false if blocked
 */
export async function isIPAllowed(
  organizationId: string,
  ipAddress: string
): Promise<boolean> {
  // Get organization IP allowlist settings
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { ipAllowlistEnabled: true },
  });

  // If allowlist not enabled, allow all IPs
  if (!org || !org.ipAllowlistEnabled) {
    return true;
  }

  // Always allow localhost for safety
  if (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === 'localhost') {
    return true;
  }

  // Load active allowlist entries
  const entries = await prisma.iPAllowlistEntry.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      cidr: true,
    },
  });

  // If no entries, block all (safety: require at least one entry)
  if (entries.length === 0) {
    return false;
  }

  // Check if IP matches any CIDR entry
  for (const entry of entries) {
    if (matchesCIDR(ipAddress, entry.cidr)) {
      return true;
    }
  }

  return false;
}

/**
 * Invalidate allowlist cache for an organization
 * Placeholder for future Redis cache implementation
 */
export function invalidateAllowlistCache(organizationId: string): void {
  // TODO: Clear Redis cache when implemented
  // For now, DB queries are fast enough
}

/**
 * Validate CIDR notation format
 * @param cidr - CIDR string to validate
 * @returns true if valid
 */
export function isValidCIDR(cidr: string): boolean {
  const [ip, mask] = cidr.includes('/') ? cidr.split('/') : [cidr, '32'];

  if (!isIPv4(ip)) return false;

  const maskBits = parseInt(mask, 10);
  if (isNaN(maskBits) || maskBits < 0 || maskBits > 32) return false;

  return true;
}
