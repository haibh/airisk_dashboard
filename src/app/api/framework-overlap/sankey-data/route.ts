import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import { formatZodErrors } from '@/lib/api-validation-schemas';
import { transformToSankeyData } from '@/lib/control-mapping-transformer';

// Query param validation schema
const querySchema = z.object({
  frameworkIds: z.string().optional(), // Comma-separated, limit 2-6
});

/**
 * GET /api/framework-overlap/sankey-data
 * Returns control mapping data in Sankey/React Flow visualization format
 * Query params: frameworkIds (comma-separated, optional, limit 2-6)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const validation = querySchema.safeParse({
      frameworkIds: searchParams.get('frameworkIds') ?? undefined,
    });

    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { frameworkIds } = validation.data;

    // Parse framework IDs
    let frameworkIdArray: string[] = [];
    if (frameworkIds) {
      frameworkIdArray = frameworkIds.split(',').filter((id) => id.trim());
      if (frameworkIdArray.length < 2) {
        return validationError('At least 2 frameworks are required for visualization');
      }
      if (frameworkIdArray.length > 6) {
        return validationError('Maximum 6 frameworks allowed for visualization');
      }
    }

    // Build where clause
    const whereClause: {
      OR?: Array<{
        sourceFrameworkId?: { in: string[] };
        targetFrameworkId?: { in: string[] };
      }>;
    } = {};

    if (frameworkIdArray.length > 0) {
      whereClause.OR = [
        { sourceFrameworkId: { in: frameworkIdArray } },
        { targetFrameworkId: { in: frameworkIdArray } },
      ];
    }

    // Get frameworks
    const frameworks = await prisma.framework.findMany({
      where: frameworkIdArray.length > 0 ? { id: { in: frameworkIdArray } } : {},
      select: {
        id: true,
        name: true,
        shortName: true,
      },
    });

    // Get mappings with controls
    const mappings = await prisma.controlMapping.findMany({
      where: whereClause,
      include: {
        sourceControl: {
          select: {
            id: true,
            code: true,
            title: true,
            frameworkId: true,
          },
        },
        targetControl: {
          select: {
            id: true,
            code: true,
            title: true,
            frameworkId: true,
          },
        },
      },
    });

    // Transform to Sankey data format
    const sankeyData = transformToSankeyData(mappings, frameworks);

    return NextResponse.json(sankeyData);
  } catch (error) {
    return handleApiError(error, 'fetching framework overlap sankey data');
  }
}
