import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { auditLogFilterSchema } from '@/lib/api-validation-schemas';

/**
 * GET /api/audit-logs
 * Get paginated audit logs for organization (ADMIN or AUDITOR role required)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check role - AUDITOR or higher
    if (!hasMinimumRole(session.user.role, 'AUDITOR')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse and validate query params — filter nulls for Zod .optional() compatibility
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(
      Object.entries({
        page: searchParams.get('page'),
        pageSize: searchParams.get('pageSize'),
        search: searchParams.get('search'),
        entityType: searchParams.get('entityType'),
        action: searchParams.get('action'),
        userId: searchParams.get('userId'),
        dateFrom: searchParams.get('dateFrom'),
        dateTo: searchParams.get('dateTo'),
      }).filter(([, v]) => v !== null)
    );

    const validation = auditLogFilterSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const {
      page,
      pageSize,
      search,
      entityType,
      action,
      userId,
      dateFrom,
      dateTo,
    } = validation.data;

    // Build where clause
    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (entityType) {
      where.entityType = entityType;
    }

    if (action) {
      where.action = action;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.entityId = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    const skip = (page - 1) * pageSize;

    // Fetch logs with user info
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
