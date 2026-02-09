import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
} from '@/lib/api-error-handler';
import { getReportDownloadUrl } from '@/lib/scheduled-report-file-manager';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Get presigned download URL for a report file
 *
 * GET /api/reports/download?key=reports/{orgId}/...
 *
 * Security: Validates that the report key belongs to the user's organization
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return validationError('Missing required parameter: key');
    }

    // Verify key format and organization access
    const expectedPrefix = `reports/${session.user.organizationId}/`;
    if (!key.startsWith(expectedPrefix)) {
      logger.warn('Unauthorized report download attempt', {
        data: {
          userId: session.user.id,
          organizationId: session.user.organizationId,
          requestedKey: key,
        },
      });
      return forbiddenError('Access denied to this report');
    }

    // Generate presigned download URL (1 hour expiration)
    const downloadUrl = await getReportDownloadUrl(key, 3600);

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'DOWNLOAD_REPORT',
        entityType: 'Report',
        entityId: key,
        userId: session.user.id,
        organizationId: session.user.organizationId,
        ipAddress:
          request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    logger.info('Report download URL generated', {
      data: {
        userId: session.user.id,
        reportKey: key,
      },
    });

    return NextResponse.json({
      downloadUrl,
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (error) {
    return handleApiError(error, 'generating report download URL');
  }
}
