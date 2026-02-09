import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { mockAdminSession, mockViewerSession } from '../mocks/mock-session';

vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
vi.mocked(hasMinimumRole).mockReturnValue(true);

describe('/api/tasks/[id]/comments - Task comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerSession).mockResolvedValue(mockAdminSession);
    vi.mocked(hasMinimumRole).mockReturnValue(true);
  });

  describe('GET /api/tasks/[id]/comments', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks ASSESSOR role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when task not found', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent/comments');

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

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns list of comments', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const mockComments = [
        {
          id: 'comment-1',
          content: 'First comment',
          createdAt: new Date(),
          author: {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        {
          id: 'comment-2',
          content: 'Second comment',
          createdAt: new Date(),
          author: {
            id: 'user-2',
            name: 'Jane Doe',
            email: 'jane@example.com',
          },
        },
      ];

      vi.mocked(prisma.taskComment.findMany).mockResolvedValue(mockComments as any);

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comments).toHaveLength(2);
      expect(data.comments[0].content).toBe('First comment');
    });

    it('returns empty comments list', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      vi.mocked(prisma.taskComment.findMany).mockResolvedValue([]);

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.comments).toHaveLength(0);
    });

    it('orders comments by createdAt descending', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      vi.mocked(prisma.taskComment.findMany).mockResolvedValue([]);

      const { GET } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments');

      const response = await GET(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });

      expect(response.status).toBe(200);
      expect(vi.mocked(prisma.taskComment.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('POST /api/tasks/[id]/comments', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null);
      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test comment' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks ASSESSOR role', async () => {
      vi.mocked(hasMinimumRole).mockReturnValue(false);
      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test comment' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 404 when task not found', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue(null);

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/nonexistent/comments', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test comment' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
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

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test comment' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(403);
    });

    it('returns 400 for missing content', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(400);
    });

    it('returns 400 for empty content', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(400);
    });

    it('returns 400 for content exceeding 5000 characters', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const longContent = 'a'.repeat(5001);
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: longContent }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      expect(response.status).toBe(400);
    });

    it('creates comment with valid content', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const createdComment = {
        id: 'comment-1',
        content: 'Test comment',
        taskId: 'task-1',
        authorId: mockAdminSession.user.id,
        createdAt: new Date(),
        author: {
          id: mockAdminSession.user.id,
          name: 'Admin User',
          email: mockAdminSession.user.email,
        },
      };

      vi.mocked(prisma.taskComment.create).mockResolvedValue(createdComment as any);

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: 'Test comment' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('comment-1');
      expect(data.content).toBe('Test comment');
      expect(vi.mocked(prisma.taskComment.create)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            content: 'Test comment',
            taskId: 'task-1',
            authorId: mockAdminSession.user.id,
          }),
        })
      );
    });

    it('creates comment with max length content (5000 chars)', async () => {
      vi.mocked(prisma.task.findUnique).mockResolvedValue({
        id: 'task-1',
        risk: {
          assessment: { organizationId: mockAdminSession.user.organizationId },
        },
      } as any);

      const maxContent = 'a'.repeat(5000);

      vi.mocked(prisma.taskComment.create).mockResolvedValue({
        id: 'comment-1',
        content: maxContent,
        taskId: 'task-1',
        authorId: mockAdminSession.user.id,
        author: {
          id: mockAdminSession.user.id,
          name: 'Admin User',
          email: mockAdminSession.user.email,
        },
      } as any);

      const { POST } = await import('@/app/api/tasks/[id]/comments/route');
      const request = new NextRequest('http://localhost:3000/api/tasks/task-1/comments', {
        method: 'POST',
        body: JSON.stringify({ content: maxContent }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: 'task-1' }),
      });

      expect(response.status).toBe(201);
    });
  });
});
