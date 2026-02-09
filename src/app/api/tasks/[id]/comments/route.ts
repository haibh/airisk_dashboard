/**
 * GET /api/tasks/[id]/comments
 * POST /api/tasks/[id]/comments
 * Task comments list + create
 * Requires ASSESSOR+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment must be 5000 characters or less'),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError();
    }

    const { id } = await params;

    // Verify task exists and belongs to user's org
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        risk: {
          select: {
            assessment: {
              select: { organizationId: true },
            },
          },
        },
      },
    });

    if (!task) {
      return notFoundError('Task');
    }

    if (task.risk.assessment.organizationId !== session.user.organizationId) {
      return forbiddenError('Task does not belong to your organization');
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId: id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    return handleApiError(error, 'fetching task comments');
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError();
    }

    const { id } = await params;

    // Verify task exists and belongs to user's org
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        risk: {
          select: {
            assessment: {
              select: { organizationId: true },
            },
          },
        },
      },
    });

    if (!task) {
      return notFoundError('Task');
    }

    if (task.risk.assessment.organizationId !== session.user.organizationId) {
      return forbiddenError('Task does not belong to your organization');
    }

    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid request data', validation.error.issues);
    }

    const { content } = validation.data;

    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId: id,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating task comment');
  }
}
