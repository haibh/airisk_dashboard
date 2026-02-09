import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { getConnectionAPIController } from '@/lib/saml-jackson-service';

const importRoute = async () => import('@/app/api/sso/connections/route');

const mockSession = {
  user: {
    id: 'user-1',
    role: 'ADMIN',
    organizationId: 'org-1',
    organizationName: 'Test Org',
  },
};

describe('SSO Connections Endpoint (GET/POST)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    // Initialize getConnectionAPIController mock
    const mockController = {
      createSAMLConnection: vi.fn(async () => ({})),
      getSAMLConnections: vi.fn(async () => []),
      deleteConnections: vi.fn(async () => ({})),
    };
    vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);
  });

  describe('GET /api/sso/connections', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/sso/connections'));
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when session user is null', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null,
        expires: '',
      } as any);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/sso/connections'));
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/sso/connections'));
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 200 with null connection when no SSO connection exists', async () => {
      vi.mocked(prisma.sSOConnection.findUnique).mockResolvedValue(null);
      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/sso/connections'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.connection).toBeNull();
    });

    it('returns 200 with SSO connection excluding sensitive fields', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        idpEntityId: 'entity-id',
        idpSsoUrl: 'https://idp.example.com/sso',
        idpCertificate: 'CERT_SECRET_DATA', // Should NOT be returned
        spEntityId: 'sp-entity-id',
        acsUrl: 'https://localhost:3000/api/auth/saml/acs',
        defaultRole: 'VIEWER',
        allowedDomains: ['example.com'],
        forceSSO: false,
        isActive: true,
        scimEnabled: false,
        scimTokenPrefix: 'scim_prefix',
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date('2026-02-01'),
      };
      vi.mocked(prisma.sSOConnection.findUnique).mockResolvedValue(mockConnection as any);

      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/sso/connections'));

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.connection).toBeDefined();
      expect(data.connection.id).toBe('sso-1');
      expect(data.connection.idpEntityId).toBe('entity-id');
      expect(data.connection.idpSsoUrl).toBe('https://idp.example.com/sso');
      expect(data.connection.spEntityId).toBe('sp-entity-id');
      expect(data.connection.acsUrl).toBe('https://localhost:3000/api/auth/saml/acs');
      // Verify sensitive field is NOT returned
      expect(data.connection.idpCertificate).toBeUndefined();
    });

    it('returns all non-sensitive fields in SSO connection', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        idpEntityId: 'entity-id',
        idpSsoUrl: 'https://idp.example.com/sso',
        idpCertificate: 'SECRET',
        spEntityId: 'sp-entity-id',
        acsUrl: 'https://localhost:3000/api/auth/saml/acs',
        defaultRole: 'ASSESSOR',
        allowedDomains: ['example.com', 'test.com'],
        forceSSO: true,
        isActive: true,
        scimEnabled: true,
        scimTokenPrefix: 'prefix_123',
        createdAt: new Date('2026-02-01'),
        updatedAt: new Date('2026-02-05'),
      };
      vi.mocked(prisma.sSOConnection.findUnique).mockResolvedValue(mockConnection as any);

      const { GET } = await importRoute();
      const response = await GET(new NextRequest('http://localhost:3000/api/sso/connections'));

      const data = await response.json();
      expect(data.connection).toMatchObject({
        id: 'sso-1',
        organizationId: 'org-1',
        idpEntityId: 'entity-id',
        idpSsoUrl: 'https://idp.example.com/sso',
        spEntityId: 'sp-entity-id',
        acsUrl: 'https://localhost:3000/api/auth/saml/acs',
        defaultRole: 'ASSESSOR',
        allowedDomains: ['example.com', 'test.com'],
        forceSSO: true,
        isActive: true,
        scimEnabled: true,
        scimTokenPrefix: 'prefix_123',
      });
      expect(data.connection.createdAt).toBeDefined();
      expect(data.connection.updatedAt).toBeDefined();
    });

    it('queries SSO connection by organizationId', async () => {
      vi.mocked(prisma.sSOConnection.findUnique).mockResolvedValue(null);
      const { GET } = await importRoute();
      await GET(new NextRequest('http://localhost:3000/api/sso/connections'));

      expect(prisma.sSOConnection.findUnique).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
      });
    });
  });

  describe('POST /api/sso/connections', () => {
    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 401 when session user is null', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null,
      } as any);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user is not admin', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Admin access required');
    });

    it('returns 400 when idpEntityId is missing', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required IdP configuration');
    });

    it('returns 400 when idpSsoUrl is missing', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required IdP configuration');
    });

    it('returns 400 when idpCertificate is missing', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Missing required IdP configuration');
    });

    it('returns 400 when allowedDomains is empty array', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: [],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('At least one allowed domain required');
    });

    it('returns 400 when allowedDomains is missing', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when allowedDomains is not an array', async () => {
      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: 'example.com',
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('creates SSO connection successfully with 201', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        idpEntityId: 'entity-id',
        idpSsoUrl: 'https://idp.example.com/sso',
        idpCertificate: 'CERT',
        spEntityId: 'http://localhost:3000/api/auth/saml/metadata',
        acsUrl: 'http://localhost:3000/api/auth/saml/acs',
        defaultRole: 'VIEWER',
        allowedDomains: ['example.com'],
        forceSSO: false,
        isActive: true,
        scimEnabled: false,
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.connection).toBeDefined();
      expect(data.connection.id).toBe('sso-1');
      expect(data.connection.spEntityId).toBe('http://localhost:3000/api/auth/saml/metadata');
    });

    it('creates Jackson SAML connection after database creation', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        spEntityId: 'http://localhost:3000/api/auth/saml/metadata',
        acsUrl: 'http://localhost:3000/api/auth/saml/acs',
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          metadataXml: '<xml>metadata</xml>',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(mockController.createSAMLConnection).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant: 'org-1',
          product: 'airm-ip',
          redirectUrl: ['http://localhost:3000/api/auth/saml/acs'],
          defaultRedirectUrl: 'http://localhost:3000/dashboard',
          rawMetadata: '<xml>metadata</xml>',
        })
      );
    });

    it('creates audit log on SSO connection creation', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        defaultRole: 'VIEWER',
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'SSO_CONNECTION_CREATED',
          entityType: 'SSOConnection',
          entityId: 'sso-1',
          userId: 'user-1',
          organizationId: 'org-1',
          newValues: expect.objectContaining({
            idpEntityId: 'entity-id',
            allowedDomains: ['example.com'],
          }),
        }),
      });
    });

    it('sets defaultRole to VIEWER if not provided', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        defaultRole: 'VIEWER',
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(prisma.sSOConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            defaultRole: 'VIEWER',
          }),
        })
      );
    });

    it('accepts custom defaultRole', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        defaultRole: 'ASSESSOR',
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          defaultRole: 'ASSESSOR',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(prisma.sSOConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            defaultRole: 'ASSESSOR',
          }),
        })
      );
    });

    it('sets forceSSO to false by default', async () => {
      const mockConnection = { id: 'sso-1', organizationId: 'org-1', forceSSO: false };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(prisma.sSOConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            forceSSO: false,
          }),
        })
      );
    });

    it('sets isActive to true on creation', async () => {
      const mockConnection = { id: 'sso-1', organizationId: 'org-1', isActive: true };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(prisma.sSOConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('returns connection metadata URL in response', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        spEntityId: 'http://localhost:3000/api/auth/saml/metadata',
        acsUrl: 'http://localhost:3000/api/auth/saml/acs',
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);
      const data = await response.json();

      expect(data.connection.metadataUrl).toBe('http://localhost:3000/api/auth/saml/metadata?orgId=org-1');
    });

    it('accepts multiple allowed domains', async () => {
      const mockConnection = {
        id: 'sso-1',
        organizationId: 'org-1',
        allowedDomains: ['example.com', 'test.com', 'corp.example.com'],
      };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com', 'test.com', 'corp.example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('upserts SSO connection (create if not exists, update if exists)', async () => {
      const mockConnection = { id: 'sso-1', organizationId: 'org-1' };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      await POST(request);

      expect(prisma.sSOConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1' },
          create: expect.any(Object),
          update: expect.any(Object),
        })
      );
    });

    it('handles optional metadataUrl field', async () => {
      const mockConnection = { id: 'sso-1', organizationId: 'org-1', metadataUrl: 'https://idp.example.com/metadata' };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          metadataUrl: 'https://idp.example.com/metadata',
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(prisma.sSOConnection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            metadataUrl: 'https://idp.example.com/metadata',
          }),
        })
      );
    });

    it('handles optional scimEnabled field', async () => {
      const mockConnection = { id: 'sso-1', organizationId: 'org-1', scimEnabled: true };
      vi.mocked(prisma.sSOConnection.upsert).mockResolvedValue(mockConnection as any);
      const mockController = { createSAMLConnection: vi.fn(async () => ({})) };
      vi.mocked(getConnectionAPIController).mockResolvedValue(mockController as any);

      const { POST } = await importRoute();
      const request = new NextRequest('http://localhost:3000/api/sso/connections', {
        method: 'POST',
        body: JSON.stringify({
          idpEntityId: 'entity-id',
          idpSsoUrl: 'https://idp.example.com/sso',
          idpCertificate: 'CERT',
          scimEnabled: true,
          allowedDomains: ['example.com'],
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});
