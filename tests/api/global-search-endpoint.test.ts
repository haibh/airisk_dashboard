import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/search/route';
import { prismaMock } from '../setup';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth-helpers', () => ({
  getServerSession: vi.fn(() =>
    Promise.resolve({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'VIEWER',
        organizationId: 'org-1',
      },
    })
  ),
}));

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 if no query provided', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/search')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe('INVALID_QUERY');
  });

  it('should return 400 if query is too long', async () => {
    const longQuery = 'a'.repeat(201);
    const request = new NextRequest(
      new URL(`http://localhost:3000/api/search?q=${longQuery}`)
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe('QUERY_TOO_LONG');
  });

  it('should search across all entity types by default', async () => {
    const mockAISystem = {
      id: 'sys-1',
      name: 'Test AI System',
      description: 'Test description',
      purpose: null,
      systemType: 'GENAI',
      lifecycleStatus: 'PRODUCTION',
      riskTier: 'MEDIUM',
      createdAt: new Date(),
    };

    const mockAssessment = {
      id: 'assess-1',
      title: 'Test Assessment',
      description: 'Assessment for testing',
      status: 'APPROVED',
      assessmentDate: new Date(),
      aiSystem: { name: 'Test AI System' },
      framework: { name: 'NIST AI RMF' },
    };

    prismaMock.aISystem.findMany.mockResolvedValue([mockAISystem]);
    prismaMock.riskAssessment.findMany.mockResolvedValue([mockAssessment as any]);
    prismaMock.risk.findMany.mockResolvedValue([]);
    prismaMock.evidence.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeInstanceOf(Array);
    expect(data.total).toBeGreaterThan(0);
    expect(data.queryTime).toBeGreaterThanOrEqual(0);

    // Verify Prisma calls
    expect(prismaMock.aISystem.findMany).toHaveBeenCalled();
    expect(prismaMock.riskAssessment.findMany).toHaveBeenCalled();
    expect(prismaMock.risk.findMany).toHaveBeenCalled();
    expect(prismaMock.evidence.findMany).toHaveBeenCalled();
  });

  it('should filter by entity type', async () => {
    prismaMock.aISystem.findMany.mockResolvedValue([
      {
        id: 'sys-1',
        name: 'AI System 1',
        description: 'Description 1',
        purpose: null,
        systemType: 'GENAI',
        lifecycleStatus: 'PRODUCTION',
        riskTier: 'HIGH',
        createdAt: new Date(),
      },
    ]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test&type=ai_system')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Only AI system search should be called
    expect(prismaMock.aISystem.findMany).toHaveBeenCalled();
    expect(prismaMock.riskAssessment.findMany).not.toHaveBeenCalled();
    expect(prismaMock.risk.findMany).not.toHaveBeenCalled();
    expect(prismaMock.evidence.findMany).not.toHaveBeenCalled();
  });

  it('should support pagination', async () => {
    prismaMock.aISystem.findMany.mockResolvedValue([]);
    prismaMock.riskAssessment.findMany.mockResolvedValue([]);
    prismaMock.risk.findMany.mockResolvedValue([]);
    prismaMock.evidence.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test&page=2&pageSize=10')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.page).toBe(2);
    expect(data.pageSize).toBe(10);
  });

  it('should cap pageSize at 100', async () => {
    prismaMock.aISystem.findMany.mockResolvedValue([]);
    prismaMock.riskAssessment.findMany.mockResolvedValue([]);
    prismaMock.risk.findMany.mockResolvedValue([]);
    prismaMock.evidence.findMany.mockResolvedValue([]);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test&pageSize=200')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pageSize).toBe(100); // Capped at 100
  });

  it('should return 400 for invalid entity type', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test&type=invalid_type')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe('INVALID_ENTITY_TYPE');
  });

  it('should parse and apply filters', async () => {
    prismaMock.aISystem.findMany.mockResolvedValue([]);

    const filters = JSON.stringify({ systemType: 'GENAI', riskTier: 'HIGH' });
    const request = new NextRequest(
      new URL(`http://localhost:3000/api/search?q=test&type=ai_system&filters=${encodeURIComponent(filters)}`)
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify filter was applied
    const call = prismaMock.aISystem.findMany.mock.calls[0][0];
    expect(call?.where).toMatchObject({
      organizationId: 'org-1',
      systemType: 'GENAI',
      riskTier: 'HIGH',
    });
  });

  it('should return 400 for invalid filters JSON', async () => {
    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test&filters=invalid-json')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.code).toBe('INVALID_FILTERS');
  });

  it('should require authentication', async () => {
    const { getServerSession } = await import('@/lib/auth-helpers');
    vi.mocked(getServerSession).mockResolvedValueOnce(null as any);

    const request = new NextRequest(
      new URL('http://localhost:3000/api/search?q=test')
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });
});
