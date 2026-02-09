import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { mockAdminSession, mockViewerSession } from '../mocks/mock-session';

vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
vi.mocked(hasMinimumRole).mockReturnValue(true);

describe('/api/report-templates - Report template list and create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
  });

  describe('GET /api/report-templates', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await import('@/app/api/report-templates/route');

      const response = await GET();
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks RISK_MANAGER role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await import('@/app/api/report-templates/route');

      const response = await GET();
      expect(response.status).toBe(403);
    });

    it('returns list of organization templates', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Risk Summary',
          dataSource: 'risks',
          columns: ['title', 'category', 'inherentScore'],
          format: 'csv',
          createdBy: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.reportTemplate.findMany).mockResolvedValue(mockTemplates as any);

      const { GET } = await import('@/app/api/report-templates/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.templates).toHaveLength(1);
      expect(data.templates[0].name).toBe('Risk Summary');
      expect(vi.mocked(prisma.reportTemplate.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: mockAdminSession.user.organizationId,
          },
        })
      );
    });

    it('returns empty list when no templates exist', async () => {
      vi.mocked(prisma.reportTemplate.findMany).mockResolvedValue([]);

      const { GET } = await import('@/app/api/report-templates/route');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.templates).toHaveLength(0);
    });
  });

  describe('POST /api/report-templates', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks RISK_MANAGER role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', dataSource: 'risks', columns: ['title'] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 for missing name', async () => {
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({ dataSource: 'risks', columns: ['title'] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for missing dataSource', async () => {
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', columns: ['title'] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for missing columns', async () => {
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', dataSource: 'risks' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for empty columns array', async () => {
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test', dataSource: 'risks', columns: [] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for invalid dataSource enum', async () => {
      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test',
          dataSource: 'invalid-source',
          columns: ['title'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('creates template with all valid dataSource values', async () => {
      const validDataSources = ['risks', 'assessments', 'compliance', 'evidence', 'ai-systems'];

      for (const dataSource of validDataSources) {
        vi.mocked(prisma.reportTemplate.create).mockResolvedValue({
          id: 'template-1',
          name: `Test ${dataSource}`,
          dataSource,
          columns: ['col1'],
          format: 'csv',
          organizationId: mockAdminSession.user.organizationId,
          createdById: mockAdminSession.user.id,
          createdBy: {
            id: mockAdminSession.user.id,
            name: 'Admin',
            email: mockAdminSession.user.email,
          },
        } as any);

        const { POST } = await import('@/app/api/report-templates/route');
        const request = new NextRequest('http://localhost:3000/api/report-templates', {
          method: 'POST',
          body: JSON.stringify({
            name: `Test ${dataSource}`,
            dataSource,
            columns: ['col1'],
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }
    });

    it('creates template with optional filters and groupBy', async () => {
      const createdTemplate = {
        id: 'template-1',
        name: 'Advanced Report',
        dataSource: 'risks',
        columns: ['title', 'inherentScore'],
        filters: { category: 'BIAS_FAIRNESS' },
        groupBy: 'category',
        format: 'csv',
        organizationId: mockAdminSession.user.organizationId,
        createdById: mockAdminSession.user.id,
        createdBy: {
          id: mockAdminSession.user.id,
          name: 'Admin',
          email: mockAdminSession.user.email,
        },
      };

      vi.mocked(prisma.reportTemplate.create).mockResolvedValue(createdTemplate as any);

      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Advanced Report',
          dataSource: 'risks',
          columns: ['title', 'inherentScore'],
          filters: { category: 'BIAS_FAIRNESS' },
          groupBy: 'category',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Advanced Report');
      expect(data.filters).toEqual({ category: 'BIAS_FAIRNESS' });
    });

    it('creates template with default format csv', async () => {
      const createdTemplate = {
        id: 'template-1',
        name: 'Default Format',
        dataSource: 'risks',
        columns: ['title'],
        format: 'csv',
        organizationId: mockAdminSession.user.organizationId,
        createdById: mockAdminSession.user.id,
        createdBy: {
          id: mockAdminSession.user.id,
          name: 'Admin',
          email: mockAdminSession.user.email,
        },
      };

      vi.mocked(prisma.reportTemplate.create).mockResolvedValue(createdTemplate as any);

      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Default Format',
          dataSource: 'risks',
          columns: ['title'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(vi.mocked(prisma.reportTemplate.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            format: 'csv',
          }),
        })
      );
    });

    it('creates template with custom format', async () => {
      const createdTemplate = {
        id: 'template-1',
        name: 'PDF Report',
        dataSource: 'risks',
        columns: ['title'],
        format: 'pdf',
        organizationId: mockAdminSession.user.organizationId,
        createdById: mockAdminSession.user.id,
        createdBy: {
          id: mockAdminSession.user.id,
          name: 'Admin',
          email: mockAdminSession.user.email,
        },
      };

      vi.mocked(prisma.reportTemplate.create).mockResolvedValue(createdTemplate as any);

      const { POST } = await import('@/app/api/report-templates/route');
      const request = new NextRequest('http://localhost:3000/api/report-templates', {
        method: 'POST',
        body: JSON.stringify({
          name: 'PDF Report',
          dataSource: 'risks',
          columns: ['title'],
          format: 'pdf',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});
