import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { calculateBatchVelocity } from '@/lib/risk-velocity-batch-calculator';

/**
 * GET /api/risks
 * List risks with optional velocity data
 * Query params: pageSize, page, sortBy, sortOrder, includeVelocity, category, treatmentStatus
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);
    const sortBy = searchParams.get('sortBy') || 'residualScore';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const includeVelocity = searchParams.get('includeVelocity') === 'true';
    const category = searchParams.get('category') || undefined;
    const treatmentStatus = searchParams.get('treatmentStatus') || undefined;

    // Build where clause
    const where: any = {
      assessment: {
        organizationId: session.user.organizationId,
      },
    };

    if (category) where.category = category;
    if (treatmentStatus) where.treatmentStatus = treatmentStatus;

    // Get total count
    const total = await prisma.risk.count({ where });

    // Get risks
    const risks = await prisma.risk.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        likelihood: true,
        impact: true,
        inherentScore: true,
        residualScore: true,
        controlEffectiveness: true,
        treatmentStatus: true,
        treatmentDueDate: true,
        assessment: {
          select: {
            id: true,
            title: true,
            aiSystem: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Calculate velocity if requested
    let velocityMap = new Map();
    if (includeVelocity && risks.length > 0) {
      const riskIds = risks.map((r) => r.id);
      velocityMap = await calculateBatchVelocity(riskIds);
    }

    // Format response
    const items = risks.map((risk) => ({
      ...risk,
      assessmentId: risk.assessment.id,
      assessmentTitle: risk.assessment.title,
      aiSystemId: risk.assessment.aiSystem.id,
      aiSystemName: risk.assessment.aiSystem.name,
      velocity: includeVelocity ? velocityMap.get(risk.id) : undefined,
    }));

    return NextResponse.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'fetching risks');
  }
}
