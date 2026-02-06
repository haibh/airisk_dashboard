import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { calculateOverlapStatistics } from '@/lib/control-mapping-transformer';

/**
 * GET /api/framework-overlap/statistics
 * Returns overlap statistics between frameworks
 * Calculates total mappings, confidence distribution, and mapping type breakdown per framework pair
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    // Get all frameworks
    const frameworks = await prisma.framework.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
      },
      orderBy: { name: 'asc' },
    });

    // Get all mappings with source/target framework info
    const mappings = await prisma.controlMapping.findMany({
      select: {
        id: true,
        sourceFrameworkId: true,
        targetFrameworkId: true,
        confidenceScore: true,
        mappingType: true,
      },
    });

    // Calculate statistics
    const statistics = calculateOverlapStatistics(mappings, frameworks);

    return NextResponse.json({
      pairs: statistics,
      totalMappings: mappings.length,
      totalFrameworks: frameworks.length,
    });
  } catch (error) {
    return handleApiError(error, 'fetching framework overlap statistics');
  }
}
