import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { mockAdminSession } from '../mocks/mock-session';

vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
vi.mocked(hasMinimumRole).mockReturnValue(true);

describe('/api/report-templates/[id] - Report template detail operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
  });

  describe('GET /api/report-templates/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks RISK_MANAGER role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when template not found', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue(null);

      const { GET } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/nonexistent');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 403 when template belongs to different organization', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: 'different-org',
      } as any);

      const { GET } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns template details', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Risk Summary',
        dataSource: 'risks',
        columns: ['title', 'category'],
        format: 'csv',
        organizationId: mockAdminSession.user.organizationId,
        createdById: mockAdminSession.user.id,
        createdAt: new Date(),
        createdBy: {
          id: mockAdminSession.user.id,
          name: 'Admin',
          email: mockAdminSession.user.email,
        },
      };

      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue(mockTemplate as any);

      const { GET } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('template-1');
      expect(data.name).toBe('Risk Summary');
    });
  });

  describe('PUT /api/report-templates/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks RISK_MANAGER role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when template not found', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue(null);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 403 when template belongs to different organization', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: 'different-org',
      } as any);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('updates template name', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      const updatedTemplate = {
        id: 'template-1',
        name: 'Updated Name',
        dataSource: 'risks',
        columns: ['title'],
        organizationId: mockAdminSession.user.organizationId,
        createdBy: {
          id: mockAdminSession.user.id,
          name: 'Admin',
          email: mockAdminSession.user.email,
        },
      };

      vi.mocked(prisma.reportTemplate.update).mockResolvedValue(updatedTemplate as any);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated Name' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.reportTemplate.update)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Updated Name',
          }),
        })
      );
    });

    it('updates template columns', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      vi.mocked(prisma.reportTemplate.update).mockResolvedValue({
        id: 'template-1',
        columns: ['title', 'inherentScore', 'residualScore'],
        createdBy: { id: mockAdminSession.user.id, name: 'Admin', email: mockAdminSession.user.email },
      } as any);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ columns: ['title', 'inherentScore', 'residualScore'] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });

      expect(response.status).toBe(200);
    });

    it('updates template format', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      vi.mocked(prisma.reportTemplate.update).mockResolvedValue({
        id: 'template-1',
        format: 'pdf',
        createdBy: { id: mockAdminSession.user.id, name: 'Admin', email: mockAdminSession.user.email },
      } as any);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ format: 'pdf' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });

      expect(response.status).toBe(200);
    });

    it('returns 400 for invalid format', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ format: 'invalid-format' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });

      expect(response.status).toBe(400);
    });

    it('returns 400 for empty columns', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      const { PUT } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'PUT',
        body: JSON.stringify({ columns: [] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/report-templates/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { DELETE } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks RISK_MANAGER role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { DELETE } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when template not found', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue(null);

      const { DELETE } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 403 when template belongs to different organization', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: 'different-org',
      } as any);

      const { DELETE } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('deletes template successfully', async () => {
      vi.mocked(prisma.reportTemplate.findUnique).mockResolvedValue({
        id: 'template-1',
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      vi.mocked(prisma.reportTemplate.delete).mockResolvedValue({ id: 'template-1' } as any);

      const { DELETE } = await import('@/app/api/report-templates/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates/template-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'template-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Report template deleted successfully');
      expect(vi.mocked(prisma.reportTemplate.delete)).toHaveBeenCalledWith({
        where: { id: 'template-1' },
      });
    });
  });
});
