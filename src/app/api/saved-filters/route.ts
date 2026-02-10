import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * Validation schema for creating/updating saved filters
 */
const SavedFilterSchema = z.object({
  name: z.string().min(1, 'Filter name is required').max(100, 'Filter name too long'),
  entityType: z.enum(['ai_system', 'assessment', 'risk', 'evidence']),
  filters: z.record(z.string(), z.unknown()),
  isDefault: z.boolean().optional().default(false),
});

/**
 * GET /api/saved-filters
 * List user's saved filters
 *
 * Query params:
 * - entityType: Filter by entity type (optional)
 *
 * Requires: VIEWER+ role
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const entityType = searchParams.get('entityType');

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (entityType) {
      if (!['ai_system', 'assessment', 'risk', 'evidence'].includes(entityType)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid entity type',
            code: 'INVALID_ENTITY_TYPE'
          },
          { status: 400 }
        );
      }
      where.entityType = entityType;
    }

    // Fetch saved filters
    const savedFilters = await prisma.savedFilter.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        entityType: true,
        filters: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: savedFilters,
      total: savedFilters.length,
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch saved filters',
        code: 'FETCH_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-filters
 * Create a new saved filter
 *
 * Body:
 * - name: Filter name
 * - entityType: Entity type (ai_system|assessment|risk|evidence)
 * - filters: Filter configuration object
 * - isDefault: Whether this is the default filter (optional)
 *
 * Requires: VIEWER+ role
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = SavedFilterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, entityType, filters, isDefault } = validation.data;

    // If setting as default, unset other defaults for same entity type
    if (isDefault) {
      await prisma.savedFilter.updateMany({
        where: {
          userId: session.user.id,
          entityType,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create saved filter
    const savedFilter = await prisma.savedFilter.create({
      data: {
        name,
        entityType,
        filters: filters as any, // Prisma Json type
        isDefault: isDefault || false,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: savedFilter,
      },
      { status: 201 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create saved filter',
        code: 'CREATE_FAILED'
      },
      { status: 500 }
    );
  }
}
