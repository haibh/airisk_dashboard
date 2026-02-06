import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import { formatZodErrors } from '@/lib/api-validation-schemas';

// Query param validation schema
const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
  assessmentId: z.string().optional(),
});

/**
 * GET /api/remediation/burndown
 * Returns burndown data for tasks in the organization
 * Query params: days (default 30), assessmentId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const validation = querySchema.safeParse({
      days: searchParams.get('days') ?? undefined,
      assessmentId: searchParams.get('assessmentId') ?? undefined,
    });

    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { days, assessmentId } = validation.data;
    const organizationId = session.user.organizationId;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause
    const whereClause: {
      risk: {
        assessment: {
          organizationId: string;
          id?: string;
        };
      };
    } = {
      risk: {
        assessment: {
          organizationId,
        },
      },
    };

    if (assessmentId) {
      whereClause.risk.assessment.id = assessmentId;
    }

    // Get all tasks for the organization (or assessment)
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        risk: {
          include: {
            assessment: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group tasks by date for burndown calculation
    const totalTasks = tasks.length;
    const burndownData: Array<{
      date: string;
      remaining: number;
      completed: number;
      ideal: number;
    }> = [];

    // Generate daily data points
    for (let i = 0; i <= days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Count tasks created before or on this date
      const tasksAtDate = tasks.filter(
        (t) => new Date(t.createdAt) <= currentDate
      ).length;

      // Count tasks completed by this date
      const completedByDate = tasks.filter(
        (t) =>
          t.status === 'COMPLETED' &&
          t.completedAt &&
          new Date(t.completedAt) <= currentDate
      ).length;

      const remaining = tasksAtDate - completedByDate;
      const ideal = Math.max(0, totalTasks - (totalTasks / days) * i);

      burndownData.push({
        date: dateStr,
        remaining,
        completed: completedByDate,
        ideal: Math.round(ideal),
      });
    }

    // Calculate summary statistics
    const now = new Date();
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = tasks.filter(
      (t) =>
        t.status !== 'COMPLETED' &&
        t.status !== 'CANCELLED' &&
        t.dueDate &&
        new Date(t.dueDate) < now
    ).length;

    const summary = {
      total: totalTasks,
      completed,
      inProgress,
      overdue,
    };

    return NextResponse.json({ burndown: burndownData, summary });
  } catch (error) {
    return handleApiError(error, 'fetching remediation burndown');
  }
}
