import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { mockSession, mockUser, mockOrganization, mockSessionUser } from '../mocks/mock-session';

// Valid UUIDs for testing (Zod validation requires UUID format)
const MOCK_AI_SYSTEM_ID = '550e8400-e29b-41d4-a716-446655440001';
const MOCK_FRAMEWORK_ID = '660e8400-e29b-41d4-a716-446655440002';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/assessments/route');
  return module;
};

describe('GET /api/assessments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (query: string = '') => {
    const url = `http://localhost:3000/api/assessments${query}`;
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

    it('should return 200 with paginated assessments list', async () => {
      const mockAssessments = [
        {
          id: 'assess-1',
          title: 'Annual Risk Assessment',
          description: 'Comprehensive annual assessment',
          status: 'APPROVED',
          assessmentDate: new Date('2024-01-15'),
          aiSystem: { id: 'ai-1', name: 'ChatBot', systemType: 'GENAI' },
          framework: { id: 'fw-1', name: 'NIST', shortName: 'NIST' },
          createdBy: { id: 'user-1', name: 'John', email: 'john@example.com' },
          _count: { risks: 5 },
        },
      ];

      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(1);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue(
        mockAssessments as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveProperty('assessments');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('pageSize');
      expect(data).toHaveProperty('totalPages');
      expect(data.assessments).toHaveLength(1);
      expect(data.assessments[0].title).toBe('Annual Risk Assessment');
    });

    it('should apply search filter to title and description', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(0);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?search=annual'));

      expect(response.status).toBe(200);

      expect(prisma.riskAssessment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'test-org-123',
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should filter by status parameter', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(0);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?status=APPROVED'));

      expect(response.status).toBe(200);
      expect(prisma.riskAssessment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'APPROVED',
          }),
        })
      );
    });

    it('should filter by aiSystemId parameter', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(0);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest(`?aiSystemId=${MOCK_AI_SYSTEM_ID}`));

      expect(response.status).toBe(200);
      expect(prisma.riskAssessment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            aiSystemId: MOCK_AI_SYSTEM_ID,
          }),
        })
      );
    });

    it('should filter by frameworkId parameter', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(0);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest(`?frameworkId=${MOCK_FRAMEWORK_ID}`));

      expect(response.status).toBe(200);
      expect(prisma.riskAssessment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            frameworkId: MOCK_FRAMEWORK_ID,
          }),
        })
      );
    });

    it('should handle pagination with page and pageSize parameters', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(50);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest('?page=3&pageSize=20'));

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.page).toBe(3);
      expect(data.pageSize).toBe(20);
      expect(data.total).toBe(50);
      expect(data.totalPages).toBe(3);

      // Verify skip calculation: (page-1) * pageSize = (3-1) * 20 = 40
      expect(prisma.riskAssessment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 20,
        })
      );
    });

    it('should return default pagination when no parameters provided', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(8);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(10);
    });

    it('should include assessment relations in response', async () => {
      const mockAssessments = [
        {
          id: 'assess-1',
          title: 'Test Assessment',
          aiSystem: { id: 'ai-1', name: 'System 1', systemType: 'GENAI' },
          framework: { id: 'fw-1', name: 'NIST', shortName: 'NIST' },
          createdBy: { id: 'user-1', name: 'Creator', email: 'creator@example.com' },
          _count: { risks: 3 },
        },
      ];

      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(1);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue(
        mockAssessments as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      const assessment = data.assessments[0];

      expect(assessment.aiSystem).toBeDefined();
      expect(assessment.framework).toBeDefined();
      expect(assessment.createdBy).toBeDefined();
      expect(assessment._count.risks).toBe(3);
    });

    it('should order assessments by updatedAt descending', async () => {
      vi.mocked(prisma.riskAssessment.count).mockResolvedValue(0);
      vi.mocked(prisma.riskAssessment.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

      expect(prisma.riskAssessment.findMany).toHaveBeenCalledWith(
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
      vi.mocked(prisma.riskAssessment.count).mockRejectedValue(
        new Error('Database error')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An unexpected error occurred');
    });
  });
});

describe('POST /api/assessments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = async (body: any) => {
    const request = new NextRequest('http://localhost:3000/api/assessments', {
      method: 'POST',
    });

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
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
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

      // Mock hasMinimumRole to return false for VIEWER
      vi.mocked(hasMinimumRole).mockReturnValue(false);

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('role');
    });

    it('should allow ASSESSOR role', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { ...mockSessionUser, role: 'ASSESSOR' },
        expires: '',
      } as any);

      vi.mocked(hasMinimumRole).mockReturnValue(true);

      const mockAssessment = {
        id: 'assess-1',
        title: 'Test Assessment',
        aiSystem: { id: MOCK_AI_SYSTEM_ID, name: 'System 1', systemType: 'GENAI' },
        framework: { id: MOCK_FRAMEWORK_ID, name: 'NIST', shortName: 'NIST' },
        createdBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
        id: MOCK_AI_SYSTEM_ID,
      } as any);
      vi.mocked(prisma.framework.findUnique).mockResolvedValue({
        id: MOCK_FRAMEWORK_ID,
      } as any);
      vi.mocked(prisma.riskAssessment.create).mockResolvedValue(
        mockAssessment as any
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('should allow RISK_MANAGER role', async () => {
      vi.mocked(getServerSession).mockResolvedValue({
        user: { ...mockSessionUser, role: 'RISK_MANAGER' },
        expires: '',
      } as any);

      vi.mocked(hasMinimumRole).mockReturnValue(true);

      const mockAssessment = {
        id: 'assess-1',
        title: 'Test Assessment',
        aiSystem: { id: MOCK_AI_SYSTEM_ID, name: 'System 1', systemType: 'GENAI' },
        framework: { id: MOCK_FRAMEWORK_ID, name: 'NIST', shortName: 'NIST' },
        createdBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
        id: MOCK_AI_SYSTEM_ID,
      } as any);
      vi.mocked(prisma.framework.findUnique).mockResolvedValue({
        id: MOCK_FRAMEWORK_ID,
      } as any);
      vi.mocked(prisma.riskAssessment.create).mockResolvedValue(
        mockAssessment as any
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return 400 when title is missing', async () => {
      const { POST } = await importRoute();
      const request = await createRequest({
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('title');
    });

    it('should return 400 when aiSystemId is missing', async () => {
      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('aiSystemId');
    });

    it('should return 400 when frameworkId is missing', async () => {
      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('frameworkId');
    });
  });

  describe('Verification', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);
    });

    it('should return 404 when AI system not found', async () => {
      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(null);

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('AI system not found');
    });

    it('should return 404 when framework not found', async () => {
      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
        id: MOCK_AI_SYSTEM_ID,
      } as any);
      vi.mocked(prisma.framework.findUnique).mockResolvedValue(null);

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Framework not found');
    });

    it('should verify AI system belongs to organization', async () => {
      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue(null);

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      await POST(request);

      expect(prisma.aISystem.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: 'test-org-123',
          }),
        })
      );
    });
  });

  describe('Successful Creation', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);

      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
        id: MOCK_AI_SYSTEM_ID,
      } as any);
      vi.mocked(prisma.framework.findUnique).mockResolvedValue({
        id: MOCK_FRAMEWORK_ID,
      } as any);
    });

    it('should create assessment with required fields only', async () => {
      const mockAssessment = {
        id: 'assess-1',
        title: 'New Assessment',
        description: null,
        assessmentDate: expect.any(Date),
        nextReviewDate: null,
        organizationId: 'test-org-123',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
        createdById: 'test-user-123',
        aiSystem: { id: MOCK_AI_SYSTEM_ID, name: 'System 1', systemType: 'GENAI' },
        framework: { id: MOCK_FRAMEWORK_ID, name: 'NIST', shortName: 'NIST' },
        createdBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.riskAssessment.create).mockResolvedValue(
        mockAssessment as any
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'New Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data).toHaveProperty('id');
      expect(data.title).toBe('New Assessment');
      expect(data.aiSystemId).toBe(MOCK_AI_SYSTEM_ID);
      expect(data.frameworkId).toBe(MOCK_FRAMEWORK_ID);
    });

    it('should create assessment with all optional fields', async () => {
      const assessmentDate = new Date('2024-02-01');
      const nextReviewDate = new Date('2025-02-01');

      const mockAssessment = {
        id: 'assess-1',
        title: 'Complete Assessment',
        description: 'Detailed assessment',
        assessmentDate,
        nextReviewDate,
        organizationId: 'test-org-123',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
        createdById: 'test-user-123',
        aiSystem: { id: MOCK_AI_SYSTEM_ID, name: 'System 1', systemType: 'GENAI' },
        framework: { id: MOCK_FRAMEWORK_ID, name: 'NIST', shortName: 'NIST' },
        createdBy: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
      };

      vi.mocked(prisma.riskAssessment.create).mockResolvedValue(
        mockAssessment as any
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Complete Assessment',
        description: 'Detailed assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
        assessmentDate: assessmentDate.toISOString(),
        nextReviewDate: nextReviewDate.toISOString(),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();

      expect(data.description).toBe('Detailed assessment');
      expect(data.nextReviewDate).toBeDefined();
    });

    it('should set organizationId and createdById from session', async () => {
      vi.mocked(prisma.riskAssessment.create).mockResolvedValue({} as any);

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      await POST(request);

      expect(prisma.riskAssessment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: 'test-org-123',
            createdById: 'test-user-123',
          }),
        })
      );
    });

    it('should include assessment relations in response', async () => {
      const mockAssessment = {
        id: 'assess-1',
        title: 'Test Assessment',
        aiSystem: { id: MOCK_AI_SYSTEM_ID, name: 'System 1', systemType: 'GENAI' },
        framework: { id: MOCK_FRAMEWORK_ID, name: 'NIST', shortName: 'NIST' },
        createdBy: { id: 'user-1', name: 'Creator', email: 'creator@example.com' },
      };

      vi.mocked(prisma.riskAssessment.create).mockResolvedValue(
        mockAssessment as any
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.aiSystem).toBeDefined();
      expect(data.framework).toBeDefined();
      expect(data.createdBy).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(getServerSession).mockResolvedValue(mockSession);
      vi.mocked(hasMinimumRole).mockReturnValue(true);

      vi.mocked(prisma.aISystem.findFirst).mockResolvedValue({
        id: MOCK_AI_SYSTEM_ID,
      } as any);
      vi.mocked(prisma.framework.findUnique).mockResolvedValue({
        id: MOCK_FRAMEWORK_ID,
      } as any);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(prisma.riskAssessment.create).mockRejectedValue(
        new Error('Database error')
      );

      const { POST } = await importRoute();
      const request = await createRequest({
        title: 'Test Assessment',
        aiSystemId: MOCK_AI_SYSTEM_ID,
        frameworkId: MOCK_FRAMEWORK_ID,
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An unexpected error occurred');
    });
  });
});
