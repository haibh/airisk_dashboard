/**
 * GET /api/report-templates/[id]
 * PUT /api/report-templates/[id]
 * DELETE /api/report-templates/[id]
 * Report template detail operations
 * Requires RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  columns: z.array(z.string()).min(1).optional(),
  filters: z.record(z.string(), z.unknown()).optional().nullable(),
  groupBy: z.string().optional().nullable(),
  sortBy: z.string().optional().nullable(),
  format: z.enum(['csv', 'xlsx', 'pdf']).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await params;

    const template = await prisma.reportTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      return notFoundError('Report template');
    }

    if (template.organizationId !== session.user.organizationId) {
      return forbiddenError('Report template does not belong to your organization');
    }

    return NextResponse.json(template);
  } catch (error) {
    return handleApiError(error, 'fetching report template');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await params;

    const template = await prisma.reportTemplate.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!template) {
      return notFoundError('Report template');
    }

    if (template.organizationId !== session.user.organizationId) {
      return forbiddenError('Report template does not belong to your organization');
    }

    const body = await request.json();
    const validation = updateTemplateSchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid request data', validation.error.issues);
    }

    const { name, columns, filters, groupBy, sortBy, format } = validation.data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (columns) updateData.columns = columns;
    if (filters !== undefined) updateData.filters = filters || {};
    if (groupBy !== undefined) updateData.groupBy = groupBy;
    if (sortBy !== undefined) updateData.sortBy = sortBy;
    if (format) updateData.format = format;

    const updatedTemplate = await prisma.reportTemplate.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    return handleApiError(error, 'updating report template');
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const { id } = await params;

    const template = await prisma.reportTemplate.findUnique({
      where: { id },
      select: { organizationId: true },
    });

    if (!template) {
      return notFoundError('Report template');
    }

    if (template.organizationId !== session.user.organizationId) {
      return forbiddenError('Report template does not belong to your organization');
    }

    await prisma.reportTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Report template deleted successfully' });
  } catch (error) {
    return handleApiError(error, 'deleting report template');
  }
}
