/**
 * PATCH /api/insights/[id]/acknowledge
 * Acknowledges an insight (sets acknowledgedAt timestamp)
 * Requires RISK_MANAGER or higher
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await context.params;

    // Verify insight exists and belongs to org
    const insight = await prisma.generatedInsight.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!insight) {
      return notFoundError('Insight');
    }

    // Update acknowledgedAt
    const updatedInsight = await prisma.generatedInsight.update({
      where: { id },
      data: {
        acknowledgedAt: new Date(),
      },
      include: {
        template: {
          select: {
            id: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      insight: updatedInsight,
    });
  } catch (error) {
    return handleApiError(error, 'acknowledging insight');
  }
}
