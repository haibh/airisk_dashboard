import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import { formatZodErrors } from '@/lib/api-validation-schemas';

// Query param validation schema
const querySchema = z.object({
  frameworkIds: z.string().optional(), // Comma-separated framework IDs
  confidenceLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

/**
 * GET /api/framework-overlap/mappings
 * Returns all control mappings, optionally filtered by frameworks and confidence level
 * Query params: frameworkIds (comma-separated), confidenceLevel, page, pageSize
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = request.nextUrl;
    const validation = querySchema.safeParse({
      frameworkIds: searchParams.get('frameworkIds') ?? undefined,
      confidenceLevel: searchParams.get('confidenceLevel') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      pageSize: searchParams.get('pageSize') ?? undefined,
    });

    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { frameworkIds, confidenceLevel, page, pageSize } = validation.data;

    // Build where clause
    const whereClause: {
      confidenceScore?: 'HIGH' | 'MEDIUM' | 'LOW';
      OR?: Array<{
        sourceFrameworkId?: { in: string[] };
        targetFrameworkId?: { in: string[] };
      }>;
    } = {};

    if (confidenceLevel) {
      whereClause.confidenceScore = confidenceLevel;
    }

    if (frameworkIds) {
      const frameworkIdArray = frameworkIds.split(',').filter((id) => id.trim());
      if (frameworkIdArray.length > 0) {
        whereClause.OR = [
          { sourceFrameworkId: { in: frameworkIdArray } },
          { targetFrameworkId: { in: frameworkIdArray } },
        ];
      }
    }

    // Get total count
    const total = await prisma.controlMapping.count({ where: whereClause });

    // Get paginated mappings with full control and framework info
    const mappings = await prisma.controlMapping.findMany({
      where: whereClause,
      include: {
        sourceControl: {
          include: {
            framework: true,
          },
        },
        targetControl: {
          include: {
            framework: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ confidenceScore: 'desc' }, { createdAt: 'desc' }],
    });

    // Transform response to include confidence and mappingType
    const transformedMappings = mappings.map((m) => ({
      id: m.id,
      sourceControl: {
        id: m.sourceControl.id,
        code: m.sourceControl.code,
        title: m.sourceControl.title,
        framework: {
          id: m.sourceControl.framework.id,
          name: m.sourceControl.framework.name,
          shortName: m.sourceControl.framework.shortName,
        },
      },
      targetControl: {
        id: m.targetControl.id,
        code: m.targetControl.code,
        title: m.targetControl.title,
        framework: {
          id: m.targetControl.framework.id,
          name: m.targetControl.framework.name,
          shortName: m.targetControl.framework.shortName,
        },
      },
      confidence: m.confidenceScore,
      mappingType: m.mappingType,
      rationale: m.rationale,
    }));

    return NextResponse.json({
      mappings: transformedMappings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return handleApiError(error, 'fetching framework overlap mappings');
  }
}
