/**
 * GET /api/tasks?riskId=&assigneeId=&status=&priority=&page=&pageSize=
 * POST /api/tasks
 * Task list + create
 * Requires ASSESSOR+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().optional().nullable(),
  riskId: z.string().min(1, 'Risk ID is required'),
  assigneeId: z.string().optional().nullable(),
  priority: z.nativeEnum(Priority).optional().default(Priority.MEDIUM),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError();
    }

    const { searchParams } = new URL(request.url);
    const riskId = searchParams.get('riskId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status') as TaskStatus | null;
    const priority = searchParams.get('priority') as Priority | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);

    const where: any = {
      risk: {
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
    };

    if (riskId) where.riskId = riskId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
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
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'fetching tasks');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError();
    }

    const body = await request.json();
    const validation = createTaskSchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid request data', validation.error.issues);
    }

    const { title, description, riskId, assigneeId, priority, dueDate } = validation.data;

    // Verify risk exists and belongs to user's org
    const risk = await prisma.risk.findUnique({
      where: { id: riskId },
      include: {
        assessment: {
          select: { organizationId: true },
        },
      },
    });

    if (!risk) {
      return validationError('Risk not found');
    }

    if (risk.assessment.organizationId !== session.user.organizationId) {
      return forbiddenError('Risk does not belong to your organization');
    }

    // If assigneeId provided, verify user exists in same org
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
        select: { organizationId: true },
      });

      if (!assignee || assignee.organizationId !== session.user.organizationId) {
        return validationError('Assignee not found in your organization');
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        riskId,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
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

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating task');
  }
}
