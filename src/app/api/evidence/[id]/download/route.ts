import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError } from '@/lib/api-error-handler';
import { getSignedUrl } from '@/lib/storage-service';
import { logger } from '@/lib/logger';

/**
 * GET /api/evidence/[id]/download - Generate presigned URL for secure download
 * Requires: VIEWER+ role
 * Logs download activity in audit log
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - requires VIEWER+
    if (!hasMinimumRole(session.user.role, 'VIEWER')) {
      return forbiddenError();
    }

    const { id } = await params;

    // Find evidence
    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!evidence) {
      return notFoundError('Evidence');
    }

    // Generate presigned URL (expires in 1 hour)
    const signedUrl = await getSignedUrl(evidence.storagePath, 3600);

    // Create audit log for download
    await prisma.auditLog.create({
      data: {
        action: 'EVIDENCE_DOWNLOAD',
        entityType: 'Evidence',
        entityId: id,
        newValues: {
          filename: evidence.filename,
          downloadedBy: session.user.id,
          downloadedAt: new Date().toISOString(),
        },
        organizationId: session.user.organizationId,
        userId: session.user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    });

    logger.info('Evidence download initiated', {
      context: 'EvidenceAPI',
      data: {
        evidenceId: id,
        filename: evidence.filename,
        downloadedBy: session.user.id,
      },
    });

    // Return signed URL for client to download
    return NextResponse.json({
      success: true,
      data: {
        url: signedUrl,
        filename: evidence.originalName,
        mimeType: evidence.mimeType,
        fileSize: evidence.fileSize,
        expiresIn: 3600, // seconds
      },
      message: 'Download URL generated successfully',
    });
  } catch (error) {
    return handleApiError(error, 'generating download URL');
  }
}
