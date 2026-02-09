import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { invalidateAllowlistCache } from '@/lib/ip-allowlist-checker-service';

const importRoute = async () => import('@/app/api/organizations/ip-allowlist/[id]/route');

const mockSession = {
  user: {
    id: 'user-1',
    role: 'ADMIN',
    organizationId: 'org-1',
    organizationName: 'Test Org',
  },
};

describe('IP Allowlist Detail Endpoint (PUT/DELETE)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    vi.mocked(invalidateAllowlistCache).mockReturnValue(undefined);
  });

  describe('PUT /api/organizations/ip-allowlist/[id]', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(401);
    });

    it('returns 401 when session missing user.id', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'ADMIN', organizationId: 'org-1' },
      } as any);
      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 404 when entry does not exist', async () => {
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(null);
      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('IP allowlist entry not found');
    });

    it('returns 403 when entry belongs to different organization', async () => {
      const existingEntry = {
        id: 'entry-1',
        cidr: '192.168.1.0/24',
        organizationId: 'org-2', // Different org
        description: 'Original',
        isActive: true,
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Cannot update entries from other organizations');
    });

    it('updates description successfully', async () => {
      const existingEntry = {
        id: 'entry-1',
        cidr: '192.168.1.0/24',
        organizationId: 'org-1',
        description: 'Old description',
        isActive: true,
      };
      const updatedEntry = {
        ...existingEntry,
        description: 'New description',
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.update).mockResolvedValue(updatedEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'New description' }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.description).toBe('New description');
    });

    it('updates isActive status successfully', async () => {
      const existingEntry = {
        id: 'entry-1',
        cidr: '192.168.1.0/24',
        organizationId: 'org-1',
        description: 'Test',
        isActive: true,
      };
      const updatedEntry = {
        ...existingEntry,
        isActive: false,
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.update).mockResolvedValue(updatedEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ isActive: false }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.isActive).toBe(false);
    });

    it('updates both description and isActive', async () => {
      const existingEntry = {
        id: 'entry-1',
        organizationId: 'org-1',
        description: 'Old',
        isActive: true,
      };
      const updatedEntry = {
        ...existingEntry,
        description: 'New',
        isActive: false,
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.update).mockResolvedValue(updatedEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'New', isActive: false }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(response.status).toBe(200);
      expect(prisma.iPAllowlistEntry.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            description: 'New',
            isActive: false,
          }),
        })
      );
    });

    it('creates audit log with old and new values', async () => {
      const existingEntry = {
        id: 'entry-1',
        organizationId: 'org-1',
        description: 'Old',
        isActive: true,
      };
      const updatedEntry = {
        ...existingEntry,
        description: 'New',
        isActive: false,
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.update).mockResolvedValue(updatedEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'New', isActive: false }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '203.0.113.45',
          'user-agent': 'Mozilla/5.0',
        },
      });
      await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'UPDATE_IP_ALLOWLIST_ENTRY',
          entityType: 'IPAllowlistEntry',
          entityId: 'entry-1',
          oldValues: expect.objectContaining({
            description: 'Old',
            isActive: true,
          }),
          newValues: expect.objectContaining({
            description: 'New',
            isActive: false,
          }),
          userId: 'user-1',
          organizationId: 'org-1',
        }),
      });
    });

    it('invalidates allowlist cache on update', async () => {
      const existingEntry = { id: 'entry-1', organizationId: 'org-1', description: 'Old' };
      const updatedEntry = { ...existingEntry, description: 'New' };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.update).mockResolvedValue(updatedEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: 'New' }),
        headers: { 'Content-Type': 'application/json' },
      });
      await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(invalidateAllowlistCache).toHaveBeenCalledWith('org-1');
    });

    it('returns 400 for invalid description (too long)', async () => {
      const existingEntry = { id: 'entry-1', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { PUT } = await importRoute();
      const longDescription = 'a'.repeat(300); // Exceeds 255 limit
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: longDescription }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(400);
    });

    it('allows nullable description', async () => {
      const existingEntry = { id: 'entry-1', organizationId: 'org-1', description: 'Old' };
      const updatedEntry = { ...existingEntry, description: null };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.update).mockResolvedValue(updatedEntry as any);

      const { PUT } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'PUT',
        body: JSON.stringify({ description: null }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await PUT(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/organizations/ip-allowlist/[id]', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(401);
    });

    it('returns 401 when session missing user.id', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { role: 'ADMIN', organizationId: 'org-1' },
      } as any);
      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 404 when entry does not exist', async () => {
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(null);
      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('IP allowlist entry not found');
    });

    it('returns 403 when entry belongs to different organization', async () => {
      const existingEntry = {
        id: 'entry-1',
        organizationId: 'org-2', // Different org
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Cannot delete entries from other organizations');
    });

    it('deletes entry successfully', async () => {
      const existingEntry = {
        id: 'entry-1',
        organizationId: 'org-1',
        cidr: '192.168.1.0/24',
        description: 'Test',
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);
      vi.mocked(prisma.iPAllowlistEntry.delete).mockResolvedValue(existingEntry as any);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('IP allowlist entry deleted');
    });

    it('calls delete with correct entry ID', async () => {
      const existingEntry = { id: 'entry-1', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(prisma.iPAllowlistEntry.delete).toHaveBeenCalledWith({
        where: { id: 'entry-1' },
      });
    });

    it('creates audit log with old values', async () => {
      const existingEntry = {
        id: 'entry-1',
        organizationId: 'org-1',
        cidr: '192.168.1.0/24',
        description: 'To be deleted',
      };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
        headers: {
          'x-forwarded-for': '203.0.113.45',
          'user-agent': 'Mozilla/5.0',
        },
      });
      await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'DELETE_IP_ALLOWLIST_ENTRY',
          entityType: 'IPAllowlistEntry',
          entityId: 'entry-1',
          oldValues: expect.objectContaining({
            cidr: '192.168.1.0/24',
            description: 'To be deleted',
          }),
          userId: 'user-1',
          organizationId: 'org-1',
        }),
      });
    });

    it('invalidates allowlist cache on delete', async () => {
      const existingEntry = { id: 'entry-1', organizationId: 'org-1' };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(invalidateAllowlistCache).toHaveBeenCalledWith('org-1');
    });

    it('validates entry existence before deletion', async () => {
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(null);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(prisma.iPAllowlistEntry.delete).not.toHaveBeenCalled();
    });

    it('validates organization ownership before deletion', async () => {
      const existingEntry = { id: 'entry-1', organizationId: 'org-2' };
      vi.mocked(prisma.iPAllowlistEntry.findUnique).mockResolvedValue(existingEntry as any);

      const { DELETE } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/organizations/ip-allowlist/entry-1', {
        method: 'DELETE',
      });
      await DELETE(request, { params: Promise.resolve({ id: 'entry-1' }) });

      expect(prisma.iPAllowlistEntry.delete).not.toHaveBeenCalled();
    });
  });
});
