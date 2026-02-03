import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession, mockUser, mockOrganization } from '../mocks/mock-session';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/ai-systems/route');
  return module;
};

describe('GET /api/ai-systems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (query: string = '') => {
    const url = `http://localhost:3000/api/ai-systems${query}`;
    return new NextRequest(url);
  };

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 401 when session user is missing', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: null,
        expires: '',
      } as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Successful Response', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 200 with paginated systems list', async () => {
      const mockSystems = [
        {
          id: 'ai-1',
          name: 'ChatBot System',
          description: 'Customer service chatbot',
          systemType: 'GENERATIVE',
          dataClassification: 'SENSITIVE',
          lifecycleStatus: 'PRODUCTION',
          riskTier: 'HIGH',
          owner: { id: 'user-1', name: 'John', email: 'john@example.com' },
        },
      ];

      vi.mocked(prisma.aISystem.count).mockResolvedValue(1);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue(mockSystems as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('systems');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('pageSize');
      expect(data).toHaveProperty('totalPages');
      expect(data.systems).toHaveLength(1);
      expect(data.systems[0].name).toBe('ChatBot System');
    });

    it('should apply search filter to name and description', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(0);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?search=chatbot'));

      expect(response.status).toBe(200);

      // Verify the where clause was constructed with search OR condition
      expect(prisma.aISystem.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'test-org-123',
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should filter by systemType parameter', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(0);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?systemType=GENERATIVE'));

      expect(response.status).toBe(200);
      expect(prisma.aISystem.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            systemType: 'GENERATIVE',
          }),
        })
      );
    });

    it('should filter by lifecycleStatus parameter', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(0);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?lifecycleStatus=PRODUCTION'));

      expect(response.status).toBe(200);
      expect(prisma.aISystem.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lifecycleStatus: 'PRODUCTION',
          }),
        })
      );
    });

    it('should filter by riskTier parameter', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(0);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?riskTier=CRITICAL'));

      expect(response.status).toBe(200);
      expect(prisma.aISystem.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskTier: 'CRITICAL',
          }),
        })
      );
    });

    it('should handle pagination with page and pageSize parameters', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(25);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?page=2&pageSize=5'));

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(5);
      expect(data.total).toBe(25);
      expect(data.totalPages).toBe(5);

      // Verify skip calculation: (page-1) * pageSize = (2-1) * 5 = 5
      expect(prisma.aISystem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should return default pagination when no parameters provided', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(10);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(10);
    });

    it('should include owner information in response', async () => {
      const mockSystems = [
        {
          id: 'ai-1',
          name: 'System 1',
          owner: { id: 'user-1', name: 'Owner Name', email: 'owner@example.com' },
        },
      ];

      vi.mocked(prisma.aISystem.count).mockResolvedValue(1);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue(mockSystems as any);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.systems[0].owner).toEqual({
        id: 'user-1',
        name: 'Owner Name',
        email: 'owner@example.com',
      });
    });

    it('should order systems by updatedAt descending', async () => {
      vi.mocked(prisma.aISystem.count).mockResolvedValue(0);
      vi.mocked(prisma.aISystem.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

      expect(prisma.aISystem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
        })
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.aISystem.count).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch AI systems');
    });
  });
});

describe('POST /api/ai-systems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = async (body: any) => {
    const request = new NextRequest('http://localhost:3000/api/ai-systems', {
      method: 'POST',
    });

    // Mock the json() method on the request
    Object.defineProperty(request, 'json', {
      value: async () => body,
    });

    return request;
  };

  describe('Authentication', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Authorization', () => {
    it('should return 403 for VIEWER role', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { ...mockSessionUser, role: 'VIEWER' },
        expires: '',
      } as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Insufficient permissions');
    });

    it('should allow RISK_MANAGER role', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { ...mockSessionUser, role: 'RISK_MANAGER' },
        expires: '',
      } as any);

      const mockAISystem = {
        id: 'ai-1',
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
        owner: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.aISystem.create).mockResolvedValue(mockAISystem as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should allow ADMIN role', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { ...mockSessionUser, role: 'ADMIN' },
        expires: '',
      } as any);

      const mockAISystem = {
        id: 'ai-1',
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
        owner: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.aISystem.create).mockResolvedValue(mockAISystem as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 400 when name is missing', async () => {
      const { POST } = await importRoute();
      const request = await createRequest({
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when systemType is missing', async () => {
      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 when dataClassification is missing', async () => {
      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });
  });

  describe('Successful Creation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should create AI system with required fields only', async () => {
      const mockAISystem = {
        id: 'ai-1',
        name: 'Test System',
        description: null,
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
        lifecycleStatus: 'DEVELOPMENT',
        riskTier: null,
        organizationId: 'test-org-123',
        ownerId: 'test-user-123',
        owner: { id: 'test-user-123', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.aISystem.create).mockResolvedValue(mockAISystem as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Test System');
      expect(data.systemType).toBe('GENERATIVE');
      expect(data.dataClassification).toBe('SENSITIVE');
      expect(data.lifecycleStatus).toBe('DEVELOPMENT');
    });

    it('should create AI system with all optional fields', async () => {
      const mockAISystem = {
        id: 'ai-1',
        name: 'Advanced System',
        description: 'Advanced AI system',
        systemType: 'GENERATIVE',
        dataClassification: 'PUBLIC',
        lifecycleStatus: 'PRODUCTION',
        riskTier: 'HIGH',
        purpose: 'Data analysis',
        dataInputs: 'User queries',
        dataOutputs: 'Analytics reports',
        thirdPartyAPIs: ['API1', 'API2'],
        baseModels: ['GPT-4', 'Claude'],
        trainingDataSources: ['Internal DB'],
        organizationId: 'test-org-123',
        ownerId: 'test-user-123',
        owner: { id: 'test-user-123', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.aISystem.create).mockResolvedValue(mockAISystem as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Advanced System',
        description: 'Advanced AI system',
        systemType: 'GENERATIVE',
        dataClassification: 'PUBLIC',
        lifecycleStatus: 'PRODUCTION',
        riskTier: 'HIGH',
        purpose: 'Data analysis',
        dataInputs: 'User queries',
        dataOutputs: 'Analytics reports',
        thirdPartyAPIs: ['API1', 'API2'],
        baseModels: ['GPT-4', 'Claude'],
        trainingDataSources: ['Internal DB'],
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.name).toBe('Advanced System');
      expect(data.description).toBe('Advanced AI system');
      expect(data.thirdPartyAPIs).toEqual(['API1', 'API2']);
      expect(data.baseModels).toEqual(['GPT-4', 'Claude']);
    });

    it('should set organizationId and ownerId from session', async () => {
      vi.mocked(prisma.aISystem.create).mockResolvedValue({} as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      await POST(request);

      expect(prisma.aISystem.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: 'test-org-123',
            ownerId: 'test-user-123',
          }),
        })
      );
    });

    it('should include owner information in response', async () => {
      const mockAISystem = {
        id: 'ai-1',
        name: 'Test System',
        owner: {
          id: 'owner-1',
          name: 'Owner Name',
          email: 'owner@example.com',
        },
      };

      vi.mocked(prisma.aISystem.create).mockResolvedValue(mockAISystem as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.owner).toEqual({
        id: 'owner-1',
        name: 'Owner Name',
        email: 'owner@example.com',
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.aISystem.create).mockRejectedValue(
        new Error('Database error')
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        name: 'Test System',
        systemType: 'GENERATIVE',
        dataClassification: 'SENSITIVE',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to create AI system');
    });
  });
});

// Mock session user for authorization tests
const mockSessionUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  organizationId: 'test-org-123',
  role: 'RISK_MANAGER',
};
