/**
 * GET /api/insights/active
 * Returns active (unacknowledged) insights for the organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const query = querySchema.parse({
      priority: searchParams.get('priority') || undefined,
      limit: searchParams.get('limit') || undefined,
    });

    const where: any = {
      organizationId: session.user.organizationId,
      acknowledgedAt: null,
    };

    if (query.priority) {
      where.priority = query.priority;
    }

    const insights = await prisma.generatedInsight.findMany({
      where,
      include: {
        template: {
          select: {
            id: true,
            category: true,
            condition: true,
            priority: true,
          },
        },
      },
      orderBy: [
        { detectedAt: 'desc' },
      ],
      take: query.limit,
    });

    // Sort by template priority (CRITICAL first)
    insights.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.template.priority] - priorityOrder[b.template.priority];
    });

    return NextResponse.json({
      insights,
      total: insights.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching active insights');
  }
}
