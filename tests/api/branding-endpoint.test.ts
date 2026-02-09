import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockAdminSession, mockAdminUser, mockSessionUser, mockSession } from '../mocks/mock-session';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/organizations/branding/route');
  return module;
};

describe('GET /api/organizations/branding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (query: string = '') => {
    const url = `http://localhost:3000/api/organizations/branding${query}`;
    return new NextRequest(url);
  };

  describe('Public Domain-Based Lookup', () => {
    it('should return public branding fields for valid domain', async () => {
      const mockOrg = {
        id: 'org-1',
        name: 'Test Organization',
        brandingConfig: {
          logoUrl: 'https://example.com/logo.png',
          primaryColor: '#1a73e8',
          accentColor: '#e8453c',
          faviconUrl: 'https://example.com/favicon.ico',
          loginMessage: 'Welcome to Test Org',
        },
      };

      vi.mocked(prisma.organization.findFirst).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?domain=example.com'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        organizationName: 'Test Organization',
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#1a73e8',
        accentColor: '#e8453c',
      });
      // Ensure sensitive fields are not returned in public response
      expect(data.data).not.toHaveProperty('faviconUrl');
      expect(data.data).not.toHaveProperty('loginMessage');
    });

    it('should return null when organization not found for domain', async () => {
      vi.mocked(prisma.organization.findFirst).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?domain=nonexistent.com'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
    });

    it('should return null when branding config is not set', async () => {
      const mockOrg = {
        id: 'org-1',
        name: 'Test Organization',
        brandingConfig: null,
      };

      vi.mocked(prisma.organization.findFirst).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?domain=example.com'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
    });

    it('should handle missing optional branding fields', async () => {
      const mockOrg = {
        id: 'org-1',
        name: 'Test Organization',
        brandingConfig: {
          logoUrl: null,
          primaryColor: null,
          accentColor: null,
        },
      };

      vi.mocked(prisma.organization.findFirst).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?domain=example.com'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual({
        organizationName: 'Test Organization',
        logoUrl: null,
        primaryColor: null,
        accentColor: null,
      });
    });

    it('should construct email query correctly with domain parameter', async () => {
      const mockOrg = {
        id: 'org-1',
        name: 'Test Organization',
        brandingConfig: {},
      };

      vi.mocked(prisma.organization.findFirst).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      await GET(createRequest('?domain=acme.com'));

      expect(vi.mocked(prisma.organization.findFirst)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            users: {
              some: {
                email: {
                  endsWith: '@acme.com',
                },
              },
            },
          }),
        })
      );
    });
  });

  describe('Authenticated Org-Scoped Lookup', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return full branding config for authenticated user', async () => {
      const mockOrg = {
        brandingConfig: {
          logoUrl: 'https://example.com/logo.png',
          primaryColor: '#1a73e8',
          accentColor: '#e8453c',
          faviconUrl: 'https://example.com/favicon.ico',
          loginMessage: 'Welcome to Our Platform',
        },
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockOrg.brandingConfig);
      // Verify all fields are returned
      expect(data.data).toHaveProperty('logoUrl');
      expect(data.data).toHaveProperty('primaryColor');
      expect(data.data).toHaveProperty('accentColor');
      expect(data.data).toHaveProperty('faviconUrl');
      expect(data.data).toHaveProperty('loginMessage');
    });

    it('should return null when branding config is not set', async () => {
      const mockOrg = {
        brandingConfig: null,
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeNull();
    });

    it('should filter query by authenticated user organizationId', async () => {
      const mockOrg = {
        brandingConfig: {},
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue(mockOrg as any);

      const { GET } = await importRoute();
      await GET(createRequest());

      expect(vi.mocked(prisma.organization.findUnique)).toHaveBeenCalledWith({
        where: { id: 'test-org-123' },
        select: { brandingConfig: true },
      });
    });

    it('should return 401 when user organization is missing', async () => {
      const incompleteSession = {
        user: { id: 'user-1', role: 'ADMIN' },
        expires: '',
      };
      vi.mocked(getServerSession).mockResolvedValue(incompleteSession as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
    });
  });
});

describe('PUT /api/organizations/branding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body?: any) => {
    const url = 'http://localhost:3000/api/organizations/branding';
    return new NextRequest(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
  };

  describe('Authentication & Authorization', () => {
    it('should return 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest({ logoUrl: 'https://example.com/logo.png' }));

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when organizationId is missing', async () => {
      const incompleteSession = {
        user: { id: 'user-1', role: 'ADMIN' },
        expires: '',
      };
      vi.mocked(getServerSession).mockResolvedValue(incompleteSession as any);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest({ logoUrl: 'https://example.com/logo.png' }));

      expect(response.status).toBe(401);
    });

    it('should return 403 when non-admin user tries to update', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(false);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest({ logoUrl: 'https://example.com/logo.png' }));

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('Admin');
    });

    it('should allow admin user to update', async () => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);

      const updatedConfig = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#1a73e8',
        accentColor: '#e8453c',
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: null,
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: updatedConfig,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(updatedConfig));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedConfig);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should accept valid hex color format', async () => {
      const validConfig = {
        primaryColor: '#1a73e8',
        accentColor: '#e8453c',
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: null,
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: validConfig,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(validConfig));

      expect(response.status).toBe(200);
    });

    it('should reject invalid hex color format', async () => {
      const invalidConfig = {
        primaryColor: 'not-a-color',
      };

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(invalidConfig));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject invalid URL for logoUrl', async () => {
      const invalidConfig = {
        logoUrl: 'not-a-url',
      };

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(invalidConfig));

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should reject logoUrl exceeding max length', async () => {
      const invalidConfig = {
        logoUrl: 'https://example.com/' + 'a'.repeat(500),
      };

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(invalidConfig));

      expect(response.status).toBe(400);
    });

    it('should accept null values for optional fields', async () => {
      const validConfig = {
        logoUrl: null,
        primaryColor: null,
        accentColor: null,
        faviconUrl: null,
        loginMessage: null,
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: {},
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: validConfig,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(validConfig));

      expect(response.status).toBe(200);
    });

    it('should reject loginMessage exceeding max length', async () => {
      const invalidConfig = {
        loginMessage: 'a'.repeat(501),
      };

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(invalidConfig));

      expect(response.status).toBe(400);
    });
  });

  describe('Update Behavior', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should update organization branding config', async () => {
      const updateData = {
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#1a73e8',
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: null,
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: updateData,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(updateData));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data).toEqual(updateData);

      expect(vi.mocked(prisma.organization.update)).toHaveBeenCalledWith({
        where: { id: 'test-org-123' },
        data: { brandingConfig: updateData },
        select: { brandingConfig: true },
      });
    });

    it('should return updated branding config', async () => {
      const updateData = {
        primaryColor: '#ff5733',
        accentColor: '#33ff57',
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: {
          primaryColor: '#1a73e8',
        },
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: updateData,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PUT } = await importRoute();
      const response = await PUT(createRequest(updateData));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updateData);
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should create audit log on successful update', async () => {
      const oldConfig = {
        primaryColor: '#1a73e8',
      };

      const newConfig = {
        primaryColor: '#ff5733',
        accentColor: '#33ff57',
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: oldConfig,
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: newConfig,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const { PUT } = await importRoute();
      await PUT(createRequest(newConfig));

      expect(vi.mocked(prisma.auditLog.create)).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'UPDATE_BRANDING_CONFIG',
          entityType: 'Organization',
          entityId: 'test-org-123',
          oldValues: oldConfig,
          newValues: newConfig,
          userId: 'admin-user-123',
          organizationId: 'test-org-123',
        }),
      });
    });

    it('should capture IP address and user agent in audit log', async () => {
      const updateData = {
        primaryColor: '#ff5733',
      };

      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: null,
      } as any);

      vi.mocked(prisma.organization.update).mockResolvedValue({
        brandingConfig: updateData,
      } as any);

      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/organizations/branding', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0',
        },
        body: JSON.stringify(updateData),
      });

      const { PUT } = await importRoute();
      await PUT(request);

      expect(vi.mocked(prisma.auditLog.create)).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(prisma.organization.findUnique).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { PUT } = await importRoute();
      const response = await PUT(createRequest({ primaryColor: '#1a73e8' }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle update errors gracefully', async () => {
      vi.mocked(prisma.organization.findUnique).mockResolvedValue({
        brandingConfig: null,
      } as any);

      vi.mocked(prisma.organization.update).mockRejectedValue(
        new Error('Update failed')
      );

      const { PUT } = await importRoute();
      const response = await PUT(createRequest({ primaryColor: '#1a73e8' }));

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
