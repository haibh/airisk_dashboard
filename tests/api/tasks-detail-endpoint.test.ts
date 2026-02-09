import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { Priority, TaskStatus } from '@prisma/client';
import { mockAdminSession, mockViewerSession } from '../mocks/mock-session';

vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
vi.mocked(hasMinimumRole).mockReturnValue(true);

describe('/api/tasks/[id] - Task detail, update, delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
  });

  describe('GET /api/tasks/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks ASSESSOR role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when task not found', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      const { GET } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 403 when task belongs to different organization', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: 'different-org' },
        },
      } as any);

      const { GET } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns task with all details and comments', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Fix bias',
        description: 'Model bias issue',
        status: TaskStatus.OPEN,
        priority: Priority.HIGH,
        riskId: 'risk-1',
        assigneeId: 'user-1',
        createdAt: new Date(),
        dueDate: new Date(),
        completedAt: null,
        risk: {
          id: 'risk-1',
          title: 'Model bias',
          category: 'BIAS_FAIRNESS',
          assessment: {
            id: 'assess-1',
            title: 'Q1 Assessment',
            organizationId: mockAdminSession.user.organizationId,
          },
        },
        assignee: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
        comments: [
          {
            id: 'comment-1',
            content: 'Test comment',
            createdAt: new Date(),
            author: {
              id: 'user-1',
              name: 'John Doe',
              email: 'john@example.com',
            },
          },
        ],
      };

      vi.mocked(prisma.task.findUnique).mockResolvedValue(mockTask as any);

      const { GET } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('task-1');
      expect(data.title).toBe('Fix bias');
      expect(data.comments).toHaveLength(1);
    });
  });

  describe('PUT /api/tasks/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks ASSESSOR role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when task not found', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 403 when task belongs to different organization', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: 'different-org' },
        },
      } as any);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('updates task title', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const updatedTask = {
        id: 'task-1',
        title: 'Updated Title',
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
      };

      vi.mocked(prisma.task.update).mockResolvedValue(updatedTask as any);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.task.update)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Updated Title',
          }),
        })
      );
    });

    it('sets completedAt when status changes to COMPLETED', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const updatedTask = {
        id: 'task-1',
        status: TaskStatus.COMPLETED,
        completedAt: new Date(),
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
      };

      vi.mocked(prisma.task.update).mockResolvedValue(updatedTask as any);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ status: TaskStatus.COMPLETED }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.task.update)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TaskStatus.COMPLETED,
            completedAt: expect.any(Date),
          }),
        })
      );
    });

    it('clears completedAt when status changes away from COMPLETED', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const updatedTask = {
        id: 'task-1',
        status: TaskStatus.OPEN,
        completedAt: null,
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
      };

      vi.mocked(prisma.task.update).mockResolvedValue(updatedTask as any);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ status: TaskStatus.OPEN }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      const task = await response.json();

      expect(response.status).toBe(200);
      expect(task.status).toBe(TaskStatus.OPEN);
      expect(task.completedAt).toBeNull();
    });

    it('updates priority', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      vi.mocked(prisma.task.update).mockResolvedValue({
        id: 'task-1',
        priority: Priority.CRITICAL,
        risk: { id: 'risk-1', title: 'Risk', category: 'BIAS_FAIRNESS' },
      } as any);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ priority: Priority.CRITICAL }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });

      expect(response.status).toBe(200);
    });

    it('returns 400 for invalid title length', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const { PUT } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'PUT',
        body: JSON.stringify({ title: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/tasks/[id]', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { DELETE } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks RISK_MANAGER role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { DELETE } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when task not found', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      const { DELETE } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      expect(response.status).toBe(404);
    });

    it('returns 403 when task belongs to different organization', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: 'different-org' },
        },
      } as any);

      const { DELETE } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('deletes task successfully', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      vi.mocked(prisma.task.delete).mockResolvedValue({ id: 'task-1' } as any);

      const { DELETE } = await import('@/app/api/tasks/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Task deleted successfully');
      expect(vi.mocked(prisma.task.delete)).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });
  });
});
