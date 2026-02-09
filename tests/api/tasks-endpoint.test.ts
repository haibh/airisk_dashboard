import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { Priority, TaskStatus } from '@prisma/client';
import { mockAdminSession, mockViewerSession } from '../mocks/mock-session';

vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
vi.mocked(hasMinimumRole).mockReturnValue(true);

describe('/api/tasks - Task list and create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
  });

  describe('GET /api/tasks', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks');

      const response = await GET(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks ASSESSOR role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks');

      const response = await GET(request);
      expect(response.status).toBe(403);
    });

    it('returns tasks list with pagination', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Fix bias issue',
          riskId: 'risk-1',
          status: TaskStatus.OPEN,
          priority: Priority.HIGH,
          risk: {
            id: 'risk-1',
            title: 'Model bias',
            category: 'BIAS_FAIRNESS',
          },
          assignee: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      ];

      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks as any);
      vi.mocked(prisma.task.count).mockResolvedValue(1);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?page=1&pageSize=20');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(20);
      expect(data.totalPages).toBe(1);
    });

    it('filters tasks by status', async () => {
      const mockTasks = [];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.task.count).mockResolvedValue(0);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?status=COMPLETED');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.task.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: TaskStatus.COMPLETED,
          }),
        })
      );
    });

    it('filters tasks by priority', async () => {
      const mockTasks = [];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.task.count).mockResolvedValue(0);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?priority=HIGH');

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.task.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: Priority.HIGH,
          }),
        })
      );
    });

    it('filters tasks by riskId', async () => {
      const mockTasks = [];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.task.count).mockResolvedValue(0);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?riskId=risk-1');

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.task.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            riskId: 'risk-1',
          }),
        })
      );
    });

    it('filters tasks by assigneeId', async () => {
      const mockTasks = [];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.task.count).mockResolvedValue(0);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?assigneeId=user-1');

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.task.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assigneeId: 'user-1',
          }),
        })
      );
    });

    it('handles pagination with custom pageSize', async () => {
      const mockTasks = [];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.task.count).mockResolvedValue(50);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?page=2&pageSize=10');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(10);
      expect(vi.mocked(prisma.task.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('caps pageSize at 100', async () => {
      const mockTasks = [];
      vi.mocked(prisma.task.findMany).mockResolvedValue(mockTasks);
      vi.mocked(prisma.task.count).mockResolvedValue(200);

      const { GET } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks?pageSize=500');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pageSize).toBe(100);
    });
  });

  describe('POST /api/tasks', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks ASSESSOR role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test', riskId: 'risk-1' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 for missing title', async () => {
      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ riskId: 'risk-1' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for missing riskId', async () => {
      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'Test Task' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 for title exceeding 255 characters', async () => {
      const { POST } = await import('@/app/api/tasks/route');
      const longTitle = 'a'.repeat(256);
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: longTitle, riskId: 'risk-1' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when risk not found', async () => {
      vi.mocked(prisma.risk.findUnique).mockResolvedValue(null);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          riskId: 'nonexistent-risk',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 403 when risk belongs to different organization', async () => {
      vi.mocked(prisma.risk.findUnique).mockResolvedValue({
        id: 'risk-1',
        assessment: { organizationId: 'different-org' },
      } as any);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          riskId: 'risk-1',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });

    it('returns 400 when assignee not found', async () => {
      vi.mocked(prisma.risk.findUnique).mockResolvedValue({
        id: 'risk-1',
        assessment: { organizationId: mockAdminSession.user.organizationId },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          riskId: 'risk-1',
          assigneeId: 'nonexistent-user',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('returns 400 when assignee belongs to different organization', async () => {
      vi.mocked(prisma.risk.findUnique).mockResolvedValue({
        id: 'risk-1',
        assessment: { organizationId: mockAdminSession.user.organizationId },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        organizationId: 'different-org',
      } as any);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          riskId: 'risk-1',
          assigneeId: 'user-1',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('creates task with all fields', async () => {
      const now = new Date();
      vi.mocked(prisma.risk.findUnique).mockResolvedValue({
        id: 'risk-1',
        assessment: { organizationId: mockAdminSession.user.organizationId },
      } as any);

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        organizationId: mockAdminSession.user.organizationId,
      } as any);

      const createdTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test description',
        riskId: 'risk-1',
        assigneeId: 'user-1',
        priority: Priority.HIGH,
        dueDate: now,
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
        assignee: { id: 'user-1', name: 'User', email: 'user@example.com' },
      };

      vi.mocked(prisma.task.create).mockResolvedValue(createdTask as any);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test description',
          riskId: 'risk-1',
          assigneeId: 'user-1',
          priority: Priority.HIGH,
          dueDate: now.toISOString(),
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('task-1');
      expect(data.title).toBe('Test Task');
      expect(data.assigneeId).toBe('user-1');
    });

    it('creates task with default priority MEDIUM', async () => {
      vi.mocked(prisma.risk.findUnique).mockResolvedValue({
        id: 'risk-1',
        assessment: { organizationId: mockAdminSession.user.organizationId },
      } as any);

      const createdTask = {
        id: 'task-1',
        title: 'Test Task',
        riskId: 'risk-1',
        priority: Priority.MEDIUM,
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
      };

      vi.mocked(prisma.task.create).mockResolvedValue(createdTask as any);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          riskId: 'risk-1',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(vi.mocked(prisma.task.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            priority: Priority.MEDIUM,
          }),
        })
      );
    });

    it('creates task without optional fields', async () => {
      vi.mocked(prisma.risk.findUnique).mockResolvedValue({
        id: 'risk-1',
        assessment: { organizationId: mockAdminSession.user.organizationId },
      } as any);

      const createdTask = {
        id: 'task-1',
        title: 'Test Task',
        riskId: 'risk-1',
        description: null,
        assigneeId: null,
        dueDate: null,
        priority: Priority.MEDIUM,
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
        assignee: null,
      };

      vi.mocked(prisma.task.create).mockResolvedValue(createdTask as any);

      const { POST } = await import('@/app/api/tasks/route');
      const request = new NextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Task',
          riskId: 'risk-1',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });
  });
});
