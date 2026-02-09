import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { generateAuditLogCSV } from '@/lib/audit-log-export-csv-generator';
import { mockAdminSession, mockViewerSession, mockSession } from '../mocks/mock-session';

const importRoute = async () => import('@/app/api/audit-logs/export/route');

const createRequest = (query = '') => {
  const base = '?format=csv';
  const extra = query ? `&${query.replace('?', '')}` : '';
  return new NextRequest(`http://localhost:3000/api/audit-logs/export${base}${extra}`, {
    headers: {
      'x-forwarded-for': '192.168.1.100',
      'user-agent': 'Mozilla/5.0 (test)',
    },
  });
};

describe('GET /api/audit-logs/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication & Authorization', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(401);
    });

    it('should return 403 for viewer role (insufficient permissions)', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockViewerSession);
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Insufficient permissions');
    });

    it('should return 200 for auditor role (AUDITOR+)', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
      vi.mocked(generateAuditLogCSV).mockResolvedValue(
        Buffer.from('Date,User,Action\n2026-01-01,admin,LOGIN')
      );
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
    });
  });

  describe('CSV Export', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return CSV file with correct Content-Type header', async () => {
      const csvData = Buffer.from('Date,User,Action\n2026-01-01,admin,LOGIN');
      vi.mocked(generateAuditLogCSV).mockResolvedValue(csvData);
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
        {
          id: 'log-1',
          action: 'LOGIN',
          entityType: 'User',
          entityId: 'user-1',
          createdAt: new Date(),
          user: { name: 'Admin', email: 'admin@test.com' },
        },
      ] as any);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/csv');
    });

    it('should return CSV with Content-Disposition attachment header', async () => {
      const csvData = Buffer.from('Date,User,Action\n');
      vi.mocked(generateAuditLogCSV).mockResolvedValue(csvData);
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      const disposition = res.headers.get('Content-Disposition');
      expect(disposition).toContain('attachment');
      expect(disposition).toContain('audit-log-');
      expect(disposition).toContain('.csv');
    });

    it('should handle empty results (CSV with just headers)', async () => {
      const csvData = Buffer.from('Date,User,Action\n');
      vi.mocked(generateAuditLogCSV).mockResolvedValue(csvData);
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(generateAuditLogCSV).toHaveBeenCalledWith([], 'Test Org');
    });

    it('should call generateAuditLogCSV with correct parameters', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          action: 'CREATE',
          entityType: 'AISystem',
          entityId: 'sys-1',
          createdAt: new Date(),
          user: { name: 'User', email: 'user@test.com' },
        },
      ];
      const csvData = Buffer.from('data');
      vi.mocked(generateAuditLogCSV).mockResolvedValue(csvData);
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue(mockLogs as any);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Acme Corp' } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(generateAuditLogCSV).toHaveBeenCalledWith(mockLogs, 'Acme Corp');
    });
  });

  describe('Query Parameter Filters', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
      vi.mocked(generateAuditLogCSV).mockResolvedValue(
        Buffer.from('Date,User,Action\n')
      );
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);
    });

    it('should apply entityType filter', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(createRequest('entityType=Risk'));
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'Risk' }),
        })
      );
    });

    it('should apply action filter', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(createRequest('action=UPDATE'));
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ action: 'UPDATE' }),
        })
      );
    });

    it('should apply userId filter', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(createRequest('userId=user-123'));
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-123' }),
        })
      );
    });

    it('should apply search filter on entityId', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(createRequest('search=risk-123'));
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entityId: {
              contains: 'risk-123',
              mode: 'insensitive',
            },
          }),
        })
      );
    });

    it('should apply dateFrom filter', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(createRequest('dateFrom=2026-01-01T00:00:00Z'));
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should apply dateTo filter', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(createRequest('dateTo=2026-12-31T23:59:59Z'));
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should apply both dateFrom and dateTo filters', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(
        createRequest('dateFrom=2026-01-01T00:00:00Z&dateTo=2026-12-31T23:59:59Z')
      );
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('should apply multiple filters together', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      const { GET } = await importRoute();
      const res = await GET(
        createRequest(
          'entityType=Risk&action=CREATE&userId=user-123&search=risk-1&dateFrom=2026-01-01T00:00:00Z'
        )
      );
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            entityType: 'Risk',
            action: 'CREATE',
            userId: 'user-123',
            entityId: expect.any(Object),
            createdAt: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('Format Parameter Validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return 400 for invalid format parameter', async () => {
      const { GET } = await importRoute();
      const res = await GET(
        new NextRequest('http://localhost:3000/api/audit-logs/export?format=invalid')
      );
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('should return 501 for PDF format (not yet implemented)', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(
        new NextRequest('http://localhost:3000/api/audit-logs/export?format=pdf')
      );
      expect(res.status).toBe(501);
      const data = await res.json();
      expect(data.error).toContain('PDF export not yet implemented');
    });

    it('should default to CSV when format not specified', async () => {
      vi.mocked(generateAuditLogCSV).mockResolvedValue(Buffer.from('data'));
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(
        new NextRequest('http://localhost:3000/api/audit-logs/export')
      );
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('text/csv');
    });
  });

  describe('Audit Log Creation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
      vi.mocked(generateAuditLogCSV).mockResolvedValue(Buffer.from('data'));
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([
        { id: 'log-1', action: 'LOGIN' } as any,
      ]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);
    });

    it('should create audit log entry for the export action', async () => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'EXPORT_AUDIT_LOGS',
            entityType: 'AuditLog',
            entityId: 'export',
            userId: mockAdminSession.user.id,
            organizationId: mockAdminSession.user.organizationId,
          }),
        })
      );
    });

    it('should include format and record count in audit log newValues', async () => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            newValues: {
              format: 'csv',
              recordCount: 1,
            },
          }),
        })
      );
    });

    it('should include IP address and user agent in audit log', async () => {
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (test)',
          }),
        })
      );
    });
  });

  describe('Organization Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
      vi.mocked(generateAuditLogCSV).mockResolvedValue(Buffer.from('data'));
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
    });

    it('should use organization name in CSV generation', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        name: 'Acme Corporation',
      } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(generateAuditLogCSV).toHaveBeenCalledWith([], 'Acme Corporation');
    });

    it('should use default name when organization not found', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue(null);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(generateAuditLogCSV).toHaveBeenCalledWith([], 'Unknown Organization');
    });

    it('should filter logs by organization ID from session', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: mockAdminSession.user.organizationId,
          }),
        })
      );
    });
  });

  describe('User Info Inclusion', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
      vi.mocked(generateAuditLogCSV).mockResolvedValue(Buffer.from('data'));
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);
    });

    it('should include user info in audit log query', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
      );
    });

    it('should order logs by createdAt descending', async () => {
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const res = await GET(createRequest());
      expect(res.status).toBe(200);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('Validation Errors', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return 400 for invalid date format in dateFrom', async () => {
      const { GET } = await importRoute();
      const res = await GET(createRequest('dateFrom=invalid-date'));
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid date format in dateTo', async () => {
      const { GET } = await importRoute();
      const res = await GET(createRequest('dateTo=not-a-date'));
      expect(res.status).toBe(400);
    });

    it('should accept valid ISO datetime strings', async () => {
      vi.mocked(generateAuditLogCSV).mockResolvedValue(Buffer.from('data'));
      vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({ name: 'Test Org' } as any);

      const { GET } = await importRoute();
      const res = await GET(
        createRequest('dateFrom=2026-01-01T00:00:00.000Z&dateTo=2026-12-31T23:59:59.999Z')
      );
      expect(res.status).toBe(200);
    });
  });
});
