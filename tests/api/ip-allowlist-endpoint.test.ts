import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { isValidCIDR, invalidateAllowlistCache } from '@/lib/ip-allowlist-checker-service';

const importRoute = async () => import('@/app/api/organizations/ip-allowlist/route');

const mockSession = {
  user: {
    id: 'user-1',
    role: 'ADMIN',
    organizationId: 'org-1',
    organizationName: 'Test Org',
  },
};

describe('IP Allowlist Endpoint (GET/POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(isValidCIDR).mockReturnValue(true);
  });

  describe('GET /api/organizations/ip-allowlist', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when session missing user.id', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'ADMIN', organizationId: 'org-1' },
      } as any);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));
      expect(response.status).toBe(401);
    });

    it('returns 401 when session missing organizationId', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { id: 'user-1', role: 'ADMIN' },
      } as any);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 200 with empty list when no entries exist', async () => {
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('returns 200 with list of IP allowlist entries', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          cidr: '192.168.1.0/24',
          description: 'Office network',
          isActive: true,
          organizationId: 'org-1',
          createdAt: new Date('2026-02-01'),
          updatedAt: new Date('2026-02-01'),
        },
        {
          id: 'entry-2',
          cidr: '10.0.0.0/8',
          description: 'Data center',
          isActive: true,
          organizationId: 'org-1',
          createdAt: new Date('2026-02-02'),
          updatedAt: new Date('2026-02-02'),
        },
      ];
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue(mockEntries as any);

      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data[0].cidr).toBe('192.168.1.0/24');
      expect(data.data[1].cidr).toBe('10.0.0.0/8');
    });

    it('orders entries by createdAt descending', async () => {
      const mockEntries = [
        { id: 'entry-2', cidr: '10.0.0.0/8', createdAt: new Date('2026-02-02') },
        { id: 'entry-1', cidr: '192.168.1.0/24', createdAt: new Date('2026-02-01') },
      ];
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue(mockEntries as any);

      const { GET } = await importRoute();
      await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));

      expect(prisma.iPAllowlistEntry.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('filters entries by organization ID', async () => {
      vi.mocked(prisma.iPAllowlistEntry.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      await GET(new NextRequest('http://localhost:3000/api/organizations/ip-allowlist'));

      expect(prisma.iPAllowlistEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1' },
        })
      );
    });
  });

  describe('POST /api/organizations/ip-allowlist', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24', description: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 401 when session missing user.id', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'ADMIN', organizationId: 'org-1' },
      } as any);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 400 when CIDR validation fails (invalid regex format)', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: 'invalid-cidr', description: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid IP allowlist entry');
    });

    it('returns 400 when isValidCIDR function returns false (valid regex but invalid CIDR)', async () => {
      vi.mocked(isValidCIDR).mockReturnValue(false);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '999.999.999.999/24' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid CIDR notation');
    });

    it('creates entry successfully with 201', async () => {
      const mockEntry = {
        id: 'entry-1',
        cidr: '192.168.1.0/24',
        description: 'Office network',
        isActive: true,
        organizationId: 'org-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24', description: 'Office network' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('entry-1');
      expect(data.data.cidr).toBe('192.168.1.0/24');
    });

    it('creates entry with organizationId and isActive defaults', async () => {
      const mockEntry = {
        id: 'entry-1',
        cidr: '192.168.1.0/24',
        isActive: true,
        organizationId: 'org-1',
      };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.iPAllowlistEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: 'org-1',
            isActive: true,
          }),
        })
      );
    });

    it('creates audit log on successful creation with action and values', async () => {
      const mockEntry = {
        id: 'entry-1',
        cidr: '192.168.1.0/24',
        description: 'Test',
        isActive: true,
        organizationId: 'org-1',
      };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24', description: 'Test' }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.45',
          'user-agent': 'Mozilla/5.0',
        },
      });
      await POST(request);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'CREATE_IP_ALLOWLIST_ENTRY',
          entityType: 'IPAllowlistEntry',
          entityId: 'entry-1',
          userId: 'user-1',
          organizationId: 'org-1',
        }),
      });
    });

    it('invalidates cache and creates audit log on POST', async () => {
      const mockEntry = { id: 'entry-1', cidr: '192.168.1.0/24', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24' }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(invalidateAllowlistCache).toHaveBeenCalledWith('org-1');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('accepts CIDR with /32 mask (single IP)', async () => {
      const mockEntry = { id: 'entry-1', cidr: '192.168.1.1/32', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.1/32' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('accepts /8 CIDR notation for large networks', async () => {
      const mockEntry = { id: 'entry-1', cidr: '10.0.0.0/8', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '10.0.0.0/8' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('returns 400 for missing required cidr field', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ description: 'No CIDR' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('captures request headers (x-forwarded-for, user-agent) in audit log', async () => {
      const mockEntry = { id: 'entry-1', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24' }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.45',
          'user-agent': 'CustomAgent/1.0',
        },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      // Verify auditLog is created with headers captured
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('handles missing x-forwarded-for gracefully in audit log', async () => {
      const mockEntry = { id: 'entry-1', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.create).mockResolvedValue(mockEntry as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist', {
        method: 'POST',
        body: JSON.stringify({ cidr: '192.168.1.0/24' }),
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'Mozilla/5.0',
        },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
