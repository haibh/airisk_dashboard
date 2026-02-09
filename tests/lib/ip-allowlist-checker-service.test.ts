import { describe, it, expect, beforeEach, vi } from 'vitest';

// IMPORTANT: Unmock the service under test BEFORE importing
vi.unmock('@/lib/ip-allowlist-checker-service');

import { prisma } from '@/lib/db';
import {
  isIPAllowed,
  isValidCIDR,
  invalidateAllowlistCache,
} from '@/lib/ip-allowlist-checker-service';

describe('ip-allowlist-checker-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isIPAllowed', () => {
    describe('allowlist not enabled', () => {
      it('should return true when allowlist not enabled', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: false,
        } as any);

        const allowed = await isIPAllowed('org-1', '192.168.1.100');

        expect(allowed).toBe(true);
      });

      it('should return true for any IP when allowlist not enabled', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: false,
        } as any);

        const allowed = await isIPAllowed('org-1', '10.0.0.1');

        expect(allowed).toBe(true);
      });

      it('should return true when org not found', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue(null);

        const allowed = await isIPAllowed('nonexistent-org', '192.168.1.100');

        expect(allowed).toBe(true);
      });
    });

    describe('localhost exceptions', () => {
      it('should return true for 127.0.0.1 (IPv4 localhost)', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);

        const allowed = await isIPAllowed('org-1', '127.0.0.1');

        expect(allowed).toBe(true);
      });

      it('should return true for ::1 (IPv6 localhost)', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);

        const allowed = await isIPAllowed('org-1', '::1');

        expect(allowed).toBe(true);
      });

      it('should return true for localhost string', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);

        const allowed = await isIPAllowed('org-1', 'localhost');

        expect(allowed).toBe(true);
      });

      it('should not query allowlist for localhost IPs', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);

        await isIPAllowed('org-1', '127.0.0.1');

        // Should not call iPAllowlistEntry.findMany for localhost
        expect(prisma.iPAllowlistEntry.findMany).not.toHaveBeenCalled();
      });
    });

    describe('no allowlist entries', () => {
      it('should return false when no entries exist', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);

        const allowed = await isIPAllowed('org-1', '192.168.1.100');

        expect(allowed).toBe(false);
      });

      it('should return false for any IP when allowlist is empty', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);

        const allowed = await isIPAllowed('org-1', '10.0.0.1');

        expect(allowed).toBe(false);
      });
    });

    describe('CIDR matching', () => {
      it('should return true when IP matches CIDR entry', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.168.1.0/24' },
        ] as any);

        const allowed = await isIPAllowed('org-1', '192.168.1.100');

        expect(allowed).toBe(true);
      });

      it('should return false when IP does not match any entry', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.168.1.0/24' },
        ] as any);

        const allowed = await isIPAllowed('org-1', '10.0.0.1');

        expect(allowed).toBe(false);
      });

      it('should match /32 (single IP)', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.168.1.100/32' },
        ] as any);

        const allowed = await isIPAllowed('org-1', '192.168.1.100');

        expect(allowed).toBe(true);
      });

      it('should not match /32 when IP differs', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.168.1.100/32' },
        ] as any);

        const allowed = await isIPAllowed('org-1', '192.168.1.101');

        expect(allowed).toBe(false);
      });

      it('should match /24 subnet', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '10.0.0.0/24' },
        ] as any);

        expect(await isIPAllowed('org-1', '10.0.0.0')).toBe(true);
        expect(await isIPAllowed('org-1', '10.0.0.1')).toBe(true);
        expect(await isIPAllowed('org-1', '10.0.0.255')).toBe(true);
      });

      it('should not match /24 outside subnet', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '10.0.0.0/24' },
        ] as any);

        const allowed = await isIPAllowed('org-1', '10.0.1.0');

        expect(allowed).toBe(false);
      });

      it('should match /16 larger range', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '172.16.0.0/16' },
        ] as any);

        expect(await isIPAllowed('org-1', '172.16.0.1')).toBe(true);
        expect(await isIPAllowed('org-1', '172.16.255.254')).toBe(true);
        expect(await isIPAllowed('org-1', '172.17.0.1')).toBe(false);
      });

      it('should match /8 very large range', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.0.0.0/8' },
        ] as any);

        expect(await isIPAllowed('org-1', '192.0.0.1')).toBe(true);
        expect(await isIPAllowed('org-1', '192.255.255.255')).toBe(true);
        expect(await isIPAllowed('org-1', '191.255.255.255')).toBe(false);
      });
    });

    describe('multiple allowlist entries', () => {
      it('should allow IP matching any entry', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.168.1.0/24' },
          { cidr: '10.0.0.0/24' },
          { cidr: '172.16.0.0/16' },
        ] as any);

        expect(await isIPAllowed('org-1', '192.168.1.50')).toBe(true);
        expect(await isIPAllowed('org-1', '10.0.0.50')).toBe(true);
        expect(await isIPAllowed('org-1', '172.16.5.50')).toBe(true);
      });

      it('should block IP matching no entries', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
          { cidr: '192.168.1.0/24' },
          { cidr: '10.0.0.0/24' },
        ] as any);

        const allowed = await isIPAllowed('org-1', '11.0.0.1');

        expect(allowed).toBe(false);
      });
    });

    describe('filtering active entries', () => {
      it('should query only active entries', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);

        await isIPAllowed('org-1', '192.168.1.100');

        expect(prisma.iPAllowlistEntry.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              organizationId: 'org-1',
              isActive: true,
            },
          })
        );
      });

      it('should select only cidr field', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);

        await isIPAllowed('org-1', '192.168.1.100');

        expect(prisma.iPAllowlistEntry.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            select: {
              cidr: true,
            },
          })
        );
      });
    });

    describe('organization scoping', () => {
      it('should filter entries by organizationId', async () => {
        vi.mocked(prisma.organization.findUnique).mockResolvedValue({
          ipAllowlistEnabled: true,
        } as any);
        vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);

        await isIPAllowed('org-456', '192.168.1.100');

        expect(prisma.iPAllowlistEntry.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              organizationId: 'org-456',
            }),
          })
        );
      });
    });
  });

  describe('isValidCIDR', () => {
    describe('valid CIDR', () => {
      it('should return true for valid /24 CIDR', () => {
        const valid = isValidCIDR('192.168.1.0/24');
        expect(valid).toBe(true);
      });

      it('should return true for valid /32 single IP', () => {
        const valid = isValidCIDR('10.0.0.1/32');
        expect(valid).toBe(true);
      });

      it('should return true for valid /16 CIDR', () => {
        const valid = isValidCIDR('172.16.0.0/16');
        expect(valid).toBe(true);
      });

      it('should return true for valid /8 CIDR', () => {
        const valid = isValidCIDR('192.0.0.0/8');
        expect(valid).toBe(true);
      });

      it('should return true for IP without mask (defaults to /32)', () => {
        const valid = isValidCIDR('192.168.1.100');
        expect(valid).toBe(true);
      });

      it('should return true for /0 (all IPs)', () => {
        const valid = isValidCIDR('0.0.0.0/0');
        expect(valid).toBe(true);
      });
    });

    describe('invalid CIDR', () => {
      it('should return false for invalid IP address', () => {
        const valid = isValidCIDR('256.1.1.1/24');
        expect(valid).toBe(false);
      });

      it('should return false for incomplete IP', () => {
        const valid = isValidCIDR('192.168.1/24');
        expect(valid).toBe(false);
      });

      it('should return false for negative mask', () => {
        const valid = isValidCIDR('192.168.1.0/-1');
        expect(valid).toBe(false);
      });

      it('should return false for mask > 32', () => {
        const valid = isValidCIDR('192.168.1.0/33');
        expect(valid).toBe(false);
      });

      it('should return false for non-numeric mask', () => {
        const valid = isValidCIDR('192.168.1.0/abc');
        expect(valid).toBe(false);
      });

      it('should return false for invalid IP in CIDR', () => {
        const valid = isValidCIDR('192.168.1.256/24');
        expect(valid).toBe(false);
      });

      it('should return false for hostname instead of IP', () => {
        const valid = isValidCIDR('example.com/24');
        expect(valid).toBe(false);
      });

      it('should return false for empty string', () => {
        const valid = isValidCIDR('');
        expect(valid).toBe(false);
      });
    });

    describe('boundary cases', () => {
      it('should return true for /0 (broadest mask)', () => {
        const valid = isValidCIDR('0.0.0.0/0');
        expect(valid).toBe(true);
      });

      it('should return true for /32 (single IP)', () => {
        const valid = isValidCIDR('255.255.255.255/32');
        expect(valid).toBe(true);
      });

      it('should return false for /33 (exceeds valid range)', () => {
        const valid = isValidCIDR('0.0.0.0/33');
        expect(valid).toBe(false);
      });
    });
  });

  describe('invalidateAllowlistCache', () => {
    it('should be callable without errors', () => {
      expect(() => invalidateAllowlistCache('org-1')).not.toThrow();
    });

    it('should accept organizationId parameter', () => {
      expect(() => invalidateAllowlistCache('org-123')).not.toThrow();
    });

    it('should handle different organization IDs', () => {
      expect(() => invalidateAllowlistCache('org-1')).not.toThrow();
      expect(() => invalidateAllowlistCache('org-2')).not.toThrow();
      expect(() => invalidateAllowlistCache('different-org-id')).not.toThrow();
    });
  });

  describe('CIDR matching edge cases', () => {
    it('should handle broadcast address matching', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '192.168.1.0/24' },
      ] as any);

      // 192.168.1.255 is the broadcast address for 192.168.1.0/24
      const allowed = await isIPAllowed('org-1', '192.168.1.255');

      expect(allowed).toBe(true);
    });

    it('should handle network address matching', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '10.0.0.0/24' },
      ] as any);

      // 10.0.0.0 is the network address itself
      const allowed = await isIPAllowed('org-1', '10.0.0.0');

      expect(allowed).toBe(true);
    });

    it('should handle class A private network', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '10.0.0.0/8' },
      ] as any);

      expect(await isIPAllowed('org-1', '10.0.0.0')).toBe(true);
      expect(await isIPAllowed('org-1', '10.255.255.255')).toBe(true);
      expect(await isIPAllowed('org-1', '11.0.0.0')).toBe(false);
    });

    it('should handle class B private network', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '172.16.0.0/12' },
      ] as any);

      expect(await isIPAllowed('org-1', '172.16.0.0')).toBe(true);
      expect(await isIPAllowed('org-1', '172.31.255.255')).toBe(true);
      expect(await isIPAllowed('org-1', '172.15.255.255')).toBe(false);
      expect(await isIPAllowed('org-1', '172.32.0.0')).toBe(false);
    });

    it('should handle class C private network', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '192.168.0.0/16' },
      ] as any);

      expect(await isIPAllowed('org-1', '192.168.0.0')).toBe(true);
      expect(await isIPAllowed('org-1', '192.168.255.255')).toBe(true);
      expect(await isIPAllowed('org-1', '192.167.255.255')).toBe(false);
      expect(await isIPAllowed('org-1', '192.169.0.0')).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle mixed IPv4 and IPv6 in same org (IPv6 not fully supported)', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '192.168.1.0/24' },
      ] as any);

      // IPv4 should work
      expect(await isIPAllowed('org-1', '192.168.1.100')).toBe(true);

      // IPv6 returns false (not an IPv4 address)
      expect(await isIPAllowed('org-1', '::1')).toBe(true); // but localhost always allowed
    });

    it('should handle rapid successive checks', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        ipAllowlistEnabled: true,
      } as any);
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([
        { cidr: '192.168.1.0/24' },
      ] as any);

      const results = await Promise.all([
        isIPAllowed('org-1', '192.168.1.1'),
        isIPAllowed('org-1', '192.168.1.2'),
        isIPAllowed('org-1', '192.168.1.3'),
      ]);

      expect(results).toEqual([true, true, true]);
    });
  });
});
