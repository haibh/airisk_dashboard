import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
} from '@/lib/api-error-handler';

/**
 * DELETE /api/api-keys/[id] - Revoke API key (ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can revoke API keys');
    }

    const { id } = await params;

    // Verify key exists and belongs to org
    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!apiKey) {
      return notFoundError('API key not found');
    }

    // Revoke key (set revokedAt)
    const revokedKey = await prisma.aPIKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'API_KEY',
        entityId: id,
        action: 'REVOKE',
        newValues: { revokedAt: revokedKey.revokedAt },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    return handleApiError(error, 'revoking API key');
  }
}
