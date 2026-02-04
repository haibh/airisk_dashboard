import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * Validation schema for updating saved filters
 */
const UpdateSavedFilterSchema = z.object({
  name: z.string().min(1, 'Filter name is required').max(100, 'Filter name too long').optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/saved-filters/[id]
 * Get a saved filter by ID
 *
 * Requires: VIEWER+ role (user must own the filter)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch saved filter
    const savedFilter = await prisma.savedFilter.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        entityType: true,
        filters: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!savedFilter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Saved filter not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (savedFilter.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to access this filter',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Remove userId from response
    const { userId, ...filterData } = savedFilter;

    return NextResponse.json({
      success: true,
      data: filterData,
    });

  } catch (error) {
    console.error('[SAVED_FILTER_GET_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch saved filter',
        code: 'FETCH_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/saved-filters/[id]
 * Update a saved filter
 *
 * Body:
 * - name: Filter name (optional)
 * - filters: Filter configuration object (optional)
 * - isDefault: Whether this is the default filter (optional)
 *
 * Requires: VIEWER+ role (user must own the filter)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if filter exists and user owns it
    const existingFilter = await prisma.savedFilter.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        entityType: true,
      },
    });

    if (!existingFilter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Saved filter not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingFilter.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to update this filter',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateSavedFilterSchema.safeParse(body);

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

    const { name, filters, isDefault } = validation.data;

    // If setting as default, unset other defaults for same entity type
    if (isDefault === true) {
      await prisma.savedFilter.updateMany({
        where: {
          userId: session.user.id,
          entityType: existingFilter.entityType,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Update saved filter
    const updatedFilter = await prisma.savedFilter.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(filters !== undefined && { filters: filters as any }),
        ...(isDefault !== undefined && { isDefault }),
      },
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
      data: updatedFilter,
    });

  } catch (error) {
    console.error('[SAVED_FILTER_UPDATE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update saved filter',
        code: 'UPDATE_FAILED'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-filters/[id]
 * Delete a saved filter
 *
 * Requires: VIEWER+ role (user must own the filter)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if filter exists and user owns it
    const existingFilter = await prisma.savedFilter.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!existingFilter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Saved filter not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check ownership
    if (existingFilter.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to delete this filter',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Delete saved filter
    await prisma.savedFilter.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Saved filter deleted successfully',
    });

  } catch (error) {
    console.error('[SAVED_FILTER_DELETE_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete saved filter',
        code: 'DELETE_FAILED'
      },
      { status: 500 }
    );
  }
}
