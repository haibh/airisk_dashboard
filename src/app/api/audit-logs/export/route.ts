import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { auditLogFilterSchema } from '@/lib/api-validation-schemas';

/**
 * GET /api/audit-logs/export
 * Export audit logs as CSV (ADMIN or AUDITOR role required)
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

    // Parse and validate query params
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      entityType: searchParams.get('entityType'),
      action: searchParams.get('action'),
      userId: searchParams.get('userId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      search: searchParams.get('search'),
    };

    const validation = auditLogFilterSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { entityType, action, userId, dateFrom, dateTo, search } =
      validation.data;

    // Build where clause
    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (search) {
      where.entityId = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    // Fetch logs (max 10,000 rows)
    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    // Generate CSV
    const csvRows: string[] = [];

    // Headers
    csvRows.push(
      'Timestamp,User,Action,Entity Type,Entity ID,Old Values,New Values'
    );

    // Data rows
    for (const log of logs) {
      const timestamp = log.createdAt.toISOString();
      const user = log.user.name || log.user.email;
      const action = log.action;
      const entityType = log.entityType;
      const entityId = log.entityId;
      const oldValues = log.oldValues
        ? JSON.stringify(log.oldValues).replace(/"/g, '""')
        : '';
      const newValues = log.newValues
        ? JSON.stringify(log.newValues).replace(/"/g, '""')
        : '';

      csvRows.push(
        `"${timestamp}","${user}","${action}","${entityType}","${entityId}","${oldValues}","${newValues}"`
      );
    }

    const csvContent = csvRows.join('\n');

    // Return CSV response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('GET /api/audit-logs/export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export audit logs' },
      { status: 500 }
    );
  }
}
