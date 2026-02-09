/**
 * GET /api/report-templates
 * POST /api/report-templates
 * Report template list + create
 * Requires RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  dataSource: z.enum(['risks', 'assessments', 'compliance', 'evidence', 'ai-systems']),
  columns: z.array(z.string()).min(1, 'At least one column is required'),
  filters: z.record(z.string(), z.unknown()).optional().nullable(),
  groupBy: z.string().optional().nullable(),
  sortBy: z.string().optional().nullable(),
  format: z.enum(['csv', 'xlsx', 'pdf']).optional().default('csv'),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const templates = await prisma.reportTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    return handleApiError(error, 'fetching report templates');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const validation = createTemplateSchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid request data', validation.error.issues);
    }

    const { name, dataSource, columns, filters, groupBy, sortBy, format } = validation.data;

    const template = await prisma.reportTemplate.create({
      data: {
        name,
        dataSource,
        columns,
        filters: (filters || {}) as any,
        groupBy,
        sortBy,
        format,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
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

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating report template');
  }
}
