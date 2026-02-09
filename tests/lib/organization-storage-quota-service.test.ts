import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';

// Unmock the service to test actual implementation
vi.unmock('@/lib/organization-storage-quota-service');
import { getStorageUsage, checkQuota, updateUsage } from '@/lib/organization-storage-quota-service';

describe('organization-storage-quota-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorageUsage', () => {
    it('returns default 5GB quota when not configured', async () => {
      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: 1000000 },
        _count: { id: 5 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {},
      } as any);

      const usage = await getStorageUsage('org-1');

      expect(usage.maxBytes).toBe(5 * 1024 * 1024 * 1024);
      expect(usage.usedBytes).toBe(1000000);
      expect(usage.fileCount).toBe(5);
    });

    it('returns custom quota from organization settings', async () => {
      const customQuota = 10 * 1024 * 1024 * 1024; // 10GB

      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: 2000000 },
        _count: { id: 10 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: {
            maxBytes: customQuota,
          },
        },
      } as any);

      const usage = await getStorageUsage('org-1');

      expect(usage.maxBytes).toBe(customQuota);
    });

    it('calculates correct percentage usage', async () => {
      const maxBytes = 1000000000; // 1GB
      const usedBytes = 500000000; // 500MB (50%)

      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: usedBytes },
        _count: { id: 5 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: { maxBytes },
        },
      } as any);

      const usage = await getStorageUsage('org-1');

      expect(usage.percentage).toBe(50);
    });

    it('handles zero file count', async () => {
      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: null },
        _count: { id: 0 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {},
      } as any);

      const usage = await getStorageUsage('org-1');

      expect(usage.usedBytes).toBe(0);
      expect(usage.fileCount).toBe(0);
      expect(usage.percentage).toBe(0);
    });

    it('completes storage usage calculation', async () => {
      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: 1000000 },
        _count: { id: 5 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {},
      } as any);

      const usage = await getStorageUsage('org-1');

      // Verify calculation completes successfully
      expect(usage).toBeDefined();
      expect(usage.usedBytes).toBe(1000000);
    });

    it('throws error when database query fails', async () => {
      vi.mocked(prisma.evidence.aggregate).mockRejectedValue(
        new Error('Database error')
      );

      await expect(getStorageUsage('org-1')).rejects.toThrow('Database error');
    });

    it('rounds percentage to 2 decimals', async () => {
      const maxBytes = 1000000000;
      const usedBytes = 333333333; // 33.3333...%

      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: usedBytes },
        _count: { id: 3 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: { storageQuota: { maxBytes } },
      } as any);

      const usage = await getStorageUsage('org-1');

      expect(usage.percentage).toBe(33.33);
    });
  });

  describe('checkQuota', () => {
    it('allows upload when quota not exceeded', async () => {
      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: 1000000 },
        _count: { id: 5 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: {
            maxBytes: 5 * 1024 * 1024 * 1024,
          },
        },
      } as any);

      const result = await checkQuota('org-1', 1000000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('blocks upload when quota would be exceeded', async () => {
      const maxBytes = 1000000;
      const usedBytes = 700000;

      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: usedBytes },
        _count: { id: 1 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: { maxBytes },
        },
      } as any);

      const result = await checkQuota('org-1', 400000);

      expect(result.allowed).toBe(false);
    });

    it('allows upload when exactly at quota limit', async () => {
      const maxBytes = 1000000;
      const usedBytes = 500000;
      const additionalBytes = 500000;

      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: usedBytes },
        _count: { id: 1 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: { maxBytes },
        },
      } as any);

      const result = await checkQuota('org-1', additionalBytes);

      expect(result.allowed).toBe(true);
      // remaining is calculated before the upload, so it's maxBytes - usedBytes
      expect(result.remaining).toBe(500000);
    });

    it('calculates correct remaining bytes', async () => {
      const maxBytes = 1000000;
      const usedBytes = 300000;

      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: usedBytes },
        _count: { id: 3 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: { maxBytes },
        },
      } as any);

      const result = await checkQuota('org-1', 0);

      expect(result.remaining).toBe(700000);
    });

    it('completes quota check', async () => {
      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: 1000000 },
        _count: { id: 5 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {},
      } as any);

      const result = await checkQuota('org-1', 500000);

      // Verify check completes successfully
      expect(result).toBeDefined();
      expect(result.allowed).toBeDefined();
    });

    it('throws error when quota check fails', async () => {
      vi.mocked(prisma.evidence.aggregate).mockRejectedValue(
        new Error('Query failed')
      );

      await expect(checkQuota('org-1', 1000000)).rejects.toThrow('Query failed');
    });

    it('handles zero additional bytes', async () => {
      vi.mocked(prisma.evidence.aggregate).mockResolvedValue({
        _sum: { fileSize: 500000 },
        _count: { id: 5 },
      } as any);

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        settings: {
          storageQuota: { maxBytes: 1000000 },
        },
      } as any);

      const result = await checkQuota('org-1', 0);

      expect(result.allowed).toBe(true);
    });
  });

  describe('updateUsage', () => {
    it('is a no-op function that completes without error', async () => {
      await expect(updateUsage('org-1', 1000000)).resolves.toBeUndefined();
    });

    it('handles positive delta bytes', async () => {
      await expect(updateUsage('org-1', 500000)).resolves.toBeUndefined();
    });

    it('handles negative delta bytes', async () => {
      await expect(updateUsage('org-1', -500000)).resolves.toBeUndefined();
    });

    it('handles zero delta bytes', async () => {
      await expect(updateUsage('org-1', 0)).resolves.toBeUndefined();
    });
  });
});
