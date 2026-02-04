import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as listFilters, POST as createFilter } from '@/app/api/saved-filters/route';
import { GET as getFilter, PUT as updateFilter, DELETE as deleteFilter } from '@/app/api/saved-filters/[id]/route';
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

describe('Saved Filters API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/saved-filters', () => {
    it('should list all saved filters for user', async () => {
      const mockFilters = [
        {
          id: 'filter-1',
          name: 'High Risk AI Systems',
          entityType: 'ai_system',
          filters: { riskTier: 'HIGH' },
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'filter-2',
          name: 'Approved Assessments',
          entityType: 'assessment',
          filters: { status: 'APPROVED' },
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.savedFilter.findMany.mockResolvedValue(mockFilters as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters');
      const response = await listFilters(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should filter by entity type', async () => {
      prismaMock.savedFilter.findMany.mockResolvedValue([
        {
          id: 'filter-1',
          name: 'High Risk Systems',
          entityType: 'ai_system',
          filters: { riskTier: 'HIGH' },
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);

      const request = new NextRequest(
        'http://localhost:3000/api/saved-filters?entityType=ai_system'
      );
      const response = await listFilters(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.savedFilter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            entityType: 'ai_system',
          }),
        })
      );
    });

    it('should return 400 for invalid entity type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/saved-filters?entityType=invalid'
      );
      const response = await listFilters(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('INVALID_ENTITY_TYPE');
    });
  });

  describe('POST /api/saved-filters', () => {
    it('should create a new saved filter', async () => {
      const mockFilter = {
        id: 'filter-1',
        name: 'My Filter',
        entityType: 'ai_system',
        filters: { riskTier: 'HIGH' },
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.savedFilter.create.mockResolvedValue(mockFilter as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters', {
        method: 'POST',
        body: JSON.stringify({
          name: 'My Filter',
          entityType: 'ai_system',
          filters: { riskTier: 'HIGH' },
        }),
      });

      const response = await createFilter(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('My Filter');
    });

    it('should set as default and unset other defaults', async () => {
      prismaMock.savedFilter.updateMany.mockResolvedValue({ count: 1 } as any);
      prismaMock.savedFilter.create.mockResolvedValue({
        id: 'filter-1',
        name: 'Default Filter',
        entityType: 'risk',
        filters: {},
        isDefault: true,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Default Filter',
          entityType: 'risk',
          filters: {},
          isDefault: true,
        }),
      });

      const response = await createFilter(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Should unset other defaults first
      expect(prismaMock.savedFilter.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          entityType: 'risk',
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/saved-filters', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
          entityType: 'invalid_type',
        }),
      });

      const response = await createFilter(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/saved-filters/[id]', () => {
    it('should get a saved filter by id', async () => {
      const mockFilter = {
        id: 'filter-1',
        name: 'My Filter',
        entityType: 'ai_system',
        filters: { riskTier: 'HIGH' },
        isDefault: false,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.savedFilter.findUnique.mockResolvedValue(mockFilter as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/filter-1');
      const params = Promise.resolve({ id: 'filter-1' });
      const response = await getFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('filter-1');
      expect(data.data.userId).toBeUndefined(); // Should be excluded
    });

    it('should return 404 if filter not found', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/nonexistent');
      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await getFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.code).toBe('NOT_FOUND');
    });

    it('should return 403 if user does not own filter', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue({
        id: 'filter-1',
        userId: 'other-user',
        name: 'Other Filter',
        entityType: 'ai_system',
        filters: {},
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/filter-1');
      const params = Promise.resolve({ id: 'filter-1' });
      const response = await getFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.code).toBe('FORBIDDEN');
    });
  });

  describe('PUT /api/saved-filters/[id]', () => {
    it('should update a saved filter', async () => {
      const existingFilter = {
        id: 'filter-1',
        userId: 'user-1',
        entityType: 'ai_system',
        name: 'Old Name',
        filters: {},
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedFilter = {
        ...existingFilter,
        name: 'New Name',
      };

      prismaMock.savedFilter.findUnique.mockResolvedValue(existingFilter as any);
      prismaMock.savedFilter.update.mockResolvedValue(updatedFilter as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/filter-1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'New Name',
        }),
      });

      const params = Promise.resolve({ id: 'filter-1' });
      const response = await updateFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Name');
    });

    it('should handle setting as default', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue({
        id: 'filter-1',
        userId: 'user-1',
        entityType: 'risk',
        name: 'Filter',
        filters: {},
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      prismaMock.savedFilter.updateMany.mockResolvedValue({ count: 1 } as any);
      prismaMock.savedFilter.update.mockResolvedValue({
        id: 'filter-1',
        userId: 'user-1',
        entityType: 'risk',
        name: 'Filter',
        filters: {},
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/filter-1', {
        method: 'PUT',
        body: JSON.stringify({
          isDefault: true,
        }),
      });

      const params = Promise.resolve({ id: 'filter-1' });
      const response = await updateFilter(request, { params });

      expect(response.status).toBe(200);
      // Should unset other defaults
      expect(prismaMock.savedFilter.updateMany).toHaveBeenCalled();
    });

    it('should return 404 if filter not found', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ name: 'New Name' }),
      });

      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await updateFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/saved-filters/[id]', () => {
    it('should delete a saved filter', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue({
        id: 'filter-1',
        userId: 'user-1',
        name: 'Filter',
        entityType: 'ai_system',
        filters: {},
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      prismaMock.savedFilter.delete.mockResolvedValue({} as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/filter-1', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: 'filter-1' });
      const response = await deleteFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prismaMock.savedFilter.delete).toHaveBeenCalledWith({
        where: { id: 'filter-1' },
      });
    });

    it('should return 404 if filter not found', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/nonexistent', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await deleteFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.code).toBe('NOT_FOUND');
    });

    it('should return 403 if user does not own filter', async () => {
      prismaMock.savedFilter.findUnique.mockResolvedValue({
        id: 'filter-1',
        userId: 'other-user',
        name: 'Filter',
        entityType: 'ai_system',
        filters: {},
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/saved-filters/filter-1', {
        method: 'DELETE',
      });

      const params = Promise.resolve({ id: 'filter-1' });
      const response = await deleteFilter(request, { params });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.code).toBe('FORBIDDEN');
    });
  });
});
