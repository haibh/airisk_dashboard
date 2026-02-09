/**
 * GET /api/tasks/[id]
 * PUT /api/tasks/[id]
 * DELETE /api/tasks/[id]
 * Task detail + update + delete
 * Requires ASSESSOR+ role (delete requires RISK_MANAGER+)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError();
    }

    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        risk: {
          select: {
            id: true,
            title: true,
            category: true,
            assessment: {
              select: {
                id: true,
                title: true,
                organizationId: true,
              },
            },
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
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
        },
      },
    });

    if (!task) {
      return notFoundError('Task');
    }

    // Check org access
    if (task.risk.assessment.organizationId !== session.user.organizationId) {
      return forbiddenError('Task does not belong to your organization');
    }

    return NextResponse.json(task);
  } catch (error) {
    return handleApiError(error, 'fetching task');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError();
    }

    const { id } = await params;

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
    const validation = updateTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid request data', validation.error.issues);
    }

    const { title, description, status, priority, assigneeId, dueDate } = validation.data;

    // If assigneeId provided, verify user exists in same org
    if (assigneeId !== undefined && assigneeId !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
        select: { organizationId: true },
      });

      if (!assignee || assignee.organizationId !== session.user.organizationId) {
        return validationError('Assignee not found in your organization');
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      // Set completedAt when status is COMPLETED
      if (status === TaskStatus.COMPLETED) {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        risk: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return handleApiError(error, 'updating task');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError('Risk Manager role required to delete tasks');
    }

    const { id } = await params;

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

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'deleting task');
  }
}
