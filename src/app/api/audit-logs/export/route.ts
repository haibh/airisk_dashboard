import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { auditLogExportSchema } from '@/lib/api-validation-schemas';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { generateAuditLogCSV } from '@/lib/audit-log-export-csv-generator';

/**
 * GET /api/audit-logs/export
 * Export audit logs as CSV or PDF (AUDITOR+ role required)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    // Check role - AUDITOR or higher
    if (!hasMinimumRole(session.user.role, 'AUDITOR')) {
      return forbiddenError('Insufficient permissions to export audit logs', request);
    }

    // Parse and validate query params
    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(
      Object.entries({
        format: searchParams.get('format') || 'csv', // Default to CSV
        search: searchParams.get('search'),
        entityType: searchParams.get('entityType'),
        action: searchParams.get('action'),
        userId: searchParams.get('userId'),
        dateFrom: searchParams.get('dateFrom'),
        dateTo: searchParams.get('dateTo'),
      }).filter(([, v]) => v !== null)
    );

    const validation = auditLogExportSchema.safeParse(queryParams);
    if (!validation.success) {
      return validationError('Invalid export parameters', validation.error.issues, request);
    }

    const { format, search, entityType, action, userId, dateFrom, dateTo } = validation.data;

    // Build where clause (same logic as list endpoint)
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

    // Fetch all matching logs (cap at 100K for safety)
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
      take: 100000,
    });

    // Get organization name
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    });

    const organizationName = org?.name || 'Unknown Organization';

    // Generate export file
    if (format === 'csv') {
      const buffer = await generateAuditLogCSV(logs, organizationName);

      // Create audit log entry for this export
      await prisma.auditLog.create({
        data: {
          action: 'EXPORT_AUDIT_LOGS',
          entityType: 'AuditLog',
          entityId: 'export',
          newValues: { format: 'csv', recordCount: logs.length },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
          userAgent: request.headers.get('user-agent'),
          userId: session.user.id,
          organizationId: session.user.organizationId,
        },
      });

      return new NextResponse(Buffer.from(buffer), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // PDF export - return 501 Not Implemented for now
      return NextResponse.json(
        { error: 'PDF export not yet implemented' },
        { status: 501 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'exporting audit logs', request);
  }
}
