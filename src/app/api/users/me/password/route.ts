import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, verifyPassword, hashPassword } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  validationError,
} from '@/lib/api-error-handler';
import { changePasswordSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';

/**
 * PUT /api/users/me/password - Change current user's password
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(changePasswordSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return unauthorizedError();
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return validationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password and clear forced change flag
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash, mustChangePassword: false },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'User',
        entityId: session.user.id,
        oldValues: { action: 'password_change' },
        newValues: { action: 'password_changed' },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    return handleApiError(error, 'changing password');
  }
}
