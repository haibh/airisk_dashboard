import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Dynamic import to avoid module resolution issues
const importRoute = async () => {
  const module = await import('@/app/api/frameworks/route');
  return module;
};

describe('GET /api/frameworks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = () => {
    return new NextRequest('http://localhost:3000/api/frameworks');
  };

  describe('Successful Response', () => {
    it('should return 200 with active frameworks list', async () => {
      const mockFrameworks = [
        {
          id: 'fw-1',
          name: 'NIST AI Risk Management Framework',
          shortName: 'NIST',
          description: 'Risk management framework for AI systems',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          _count: { controls: 12 },
        },
        {
          id: 'fw-2',
          name: 'ISO/IEC 42001',
          shortName: 'ISO42001',
          description: 'AI management systems standard',
          isActive: true,
          createdAt: new Date('2024-01-02'),
          _count: { controls: 8 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe('NIST AI Risk Management Framework');
      expect(data[0].shortName).toBe('NIST');
      expect(data[1].name).toBe('ISO/IEC 42001');
    });

    it('should only return active frameworks', async () => {
      vi.mocked(prisma.framework.findMany).mockResolvedValue([] as any);

      const { GET } = await importRoute();
      await GET(createRequest());

      expect(prisma.framework.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      );
    });

    it('should include control count in response', async () => {
      const mockFrameworks = [
        {
          id: 'fw-1',
          name: 'NIST',
          shortName: 'NIST',
          isActive: true,
          _count: { controls: 15 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data[0]._count.controls).toBe(15);
    });

    it('should order frameworks by createdAt descending', async () => {
      vi.mocked(prisma.framework.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

      expect(prisma.framework.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should return empty array when no active frameworks exist', async () => {
      vi.mocked(prisma.framework.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });

    it('should include all framework properties in response', async () => {
      const mockFrameworks = [
        {
          id: 'fw-complete',
          name: 'Complete Framework',
          shortName: 'CF',
          description: 'A complete framework with all properties',
          isActive: true,
          version: '1.0',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-02-01'),
          _count: { controls: 20 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      const framework = data[0];

      expect(framework).toHaveProperty('id');
      expect(framework).toHaveProperty('name');
      expect(framework).toHaveProperty('shortName');
      expect(framework).toHaveProperty('description');
      expect(framework).toHaveProperty('isActive');
      expect(framework).toHaveProperty('_count');
    });

    it('should properly format frameworks for API consumption', async () => {
      const mockFrameworks = [
        {
          id: 'fw-api-1',
          name: 'API Framework',
          shortName: 'AF',
          description: 'Framework for testing API response format',
          isActive: true,
          createdAt: new Date(),
          _count: { controls: 5 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.headers.get('content-type')).toContain('application/json');
      const data = await response.json();

      expect(typeof data).toBe('object');
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      vi.mocked(prisma.framework.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An unexpected error occurred');
    });

    it('should handle timeout error gracefully', async () => {
      vi.mocked(prisma.framework.findMany).mockRejectedValue(
        new Error('Query timeout')
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('An unexpected error occurred');
    });

    it('should handle prisma validation error', async () => {
      const prismaError = new Error('Prisma validation error');
      (prismaError as any).code = 'P2001';

      vi.mocked(prisma.framework.findMany).mockRejectedValue(prismaError);

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      // Validation errors correctly return 400 Bad Request
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data types in response', async () => {
      const mockFrameworks = [
        {
          id: 'fw-types-1',
          name: 'Type Test Framework',
          shortName: 'TTF',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          _count: { controls: 7 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      const framework = data[0];

      expect(typeof framework.id).toBe('string');
      expect(typeof framework.name).toBe('string');
      expect(typeof framework.shortName).toBe('string');
      expect(typeof framework.isActive).toBe('boolean');
      expect(typeof framework._count.controls).toBe('number');
    });

    it('should not include inactive frameworks', async () => {
      const mockFrameworks = [
        {
          id: 'fw-active-1',
          name: 'Active Framework',
          isActive: true,
          _count: { controls: 10 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data.every((f: any) => f.isActive === true)).toBe(true);

      // Verify the query filter
      expect(prisma.framework.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
        })
      );
    });
  });

  describe('Performance', () => {
    it('should handle large number of frameworks', async () => {
      const mockFrameworks = Array.from({ length: 50 }, (_, i) => ({
        id: `fw-${i}`,
        name: `Framework ${i}`,
        shortName: `FW${i}`,
        isActive: true,
        _count: { controls: Math.floor(Math.random() * 30) },
      }));

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data).toHaveLength(50);
    });

    it('should use efficient database query', async () => {
      vi.mocked(prisma.framework.findMany).mockResolvedValue([]);

      const { GET } = await importRoute();
      await GET(createRequest());

      // Verify query includes _count select to avoid N+1 queries
      expect(prisma.framework.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.objectContaining({
              select: { controls: true },
            }),
          }),
        })
      );
    });
  });

  describe('Response Format', () => {
    it('should return JSON response with correct content-type', async () => {
      const mockFrameworks = [
        {
          id: 'fw-json-1',
          name: 'JSON Framework',
          shortName: 'JF',
          isActive: true,
          _count: { controls: 5 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    it('should handle serialization of dates correctly', async () => {
      const now = new Date('2024-02-03T12:00:00Z');
      const mockFrameworks = [
        {
          id: 'fw-date-1',
          name: 'Date Framework',
          shortName: 'DF',
          isActive: true,
          createdAt: now,
          _count: { controls: 3 },
        },
      ];

      vi.mocked(prisma.framework.findMany).mockResolvedValue(
        mockFrameworks as any
      );

      const { GET } = await importRoute();
      const response = await GET(createRequest());

      const data = await response.json();
      expect(data[0].createdAt).toBeDefined();
    });
  });
});
