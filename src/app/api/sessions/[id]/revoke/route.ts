import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError } from '@/lib/api-error-handler';
import { revokeSession } from '@/lib/active-session-tracker-service';

/**
 * PATCH /api/sessions/[id]/revoke
 * Revoke a session (force logout)
 * - ADMIN: can revoke any session in their org
 * - Regular user: can only revoke their own sessions
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    const { id: sessionId } = await params;

    // Find the target session
    const targetSession = await prisma.activeSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        isRevoked: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!targetSession) {
      return notFoundError('Session', request);
    }

    // Check authorization
    const isAdmin = hasMinimumRole(session.user.role, 'ADMIN');
    const isOwnSession = targetSession.userId === session.user.id;
    const isSameOrg = targetSession.organizationId === session.user.organizationId;

    if (!isSameOrg) {
      return forbiddenError('Cannot revoke sessions from other organizations', request);
    }

    if (!isAdmin && !isOwnSession) {
      return forbiddenError('You can only revoke your own sessions', request);
    }

    if (targetSession.isRevoked) {
      return NextResponse.json(
        { success: false, error: 'Session already revoked' },
        { status: 400 }
      );
    }

    // Revoke the session
    await revokeSession(sessionId, session.user.id);

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'REVOKE_SESSION',
        entityType: 'ActiveSession',
        entityId: sessionId,
        oldValues: { userId: targetSession.userId, isRevoked: false },
        newValues: { userId: targetSession.userId, isRevoked: true, revokedBy: session.user.id },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    return handleApiError(error, 'revoking session', request);
  }
}
