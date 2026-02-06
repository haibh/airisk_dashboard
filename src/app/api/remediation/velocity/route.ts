import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import { formatZodErrors } from '@/lib/api-validation-schemas';

// Query param validation schema
const querySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(52).optional().default(12),
  assessmentId: z.string().optional(),
});

/**
 * GET /api/remediation/velocity
 * Returns task completion velocity over time
 * Query params: weeks (default 12), assessmentId (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const validation = querySchema.safeParse({
      weeks: searchParams.get('weeks') ?? undefined,
      assessmentId: searchParams.get('assessmentId') ?? undefined,
    });

    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { weeks, assessmentId } = validation.data;
    const organizationId = session.user.organizationId;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    // Build where clause for completed tasks
    const whereClause: {
      risk: {
        assessment: {
          organizationId: string;
          id?: string;
        };
      };
      status: 'COMPLETED';
      completedAt: { gte: Date; lte: Date };
    } = {
      risk: {
        assessment: {
          organizationId,
        },
      },
      status: 'COMPLETED',
      completedAt: { gte: startDate, lte: endDate },
    };

    if (assessmentId) {
      whereClause.risk.assessment.id = assessmentId;
    }

    // Get completed tasks within the date range
    const completedTasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        completedAt: true,
        createdAt: true,
      },
      orderBy: { completedAt: 'asc' },
    });

    // Group by week and calculate velocity
    const velocityData: Array<{
      week: string;
      completed: number;
      avgDaysToComplete: number;
    }> = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Filter tasks completed in this week
      const weekTasks = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        return completedDate >= weekStart && completedDate < weekEnd;
      });

      // Calculate average days to complete
      const totalDays = weekTasks.reduce((sum, t) => {
        if (!t.completedAt) return sum;
        const created = new Date(t.createdAt);
        const completed = new Date(t.completedAt);
        const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);

      const avgDaysToComplete =
        weekTasks.length > 0 ? Math.round((totalDays / weekTasks.length) * 10) / 10 : 0;

      velocityData.push({
        week: weekStart.toISOString().split('T')[0],
        completed: weekTasks.length,
        avgDaysToComplete,
      });
    }

    // Calculate overall average velocity
    const totalCompleted = completedTasks.length;
    const average = totalCompleted > 0 ? Math.round((totalCompleted / weeks) * 10) / 10 : 0;

    return NextResponse.json({ velocity: velocityData, average });
  } catch (error) {
    return handleApiError(error, 'fetching remediation velocity');
  }
}
