import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  validationError,
} from '@/lib/api-error-handler';
import { updateUserSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';

const ROLE_HIERARCHY = ['VIEWER', 'AUDITOR', 'ASSESSOR', 'RISK_MANAGER', 'ADMIN'];

const userSelect = {
  id: true, email: true, name: true, role: true, isActive: true,
  lastLoginAt: true, languagePref: true, image: true, createdAt: true, updatedAt: true,
  organization: { select: { id: true, name: true } },
};

/** GET /api/users/[id] - Get user details (ADMIN or self) */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { id } = await params;
    const isAdmin = hasMinimumRole(session.user.role, 'ADMIN');
    const isSelf = session.user.id === id;

    if (!isAdmin && !isSelf) {
      return forbiddenError('You can only view your own profile or be an administrator');
    }

    const user = await prisma.user.findFirst({
      where: { id, organizationId: session.user.organizationId },
      select: userSelect,
    });

    if (!user) return notFoundError('User');
    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error, 'fetching user');
  }
}

/** PUT /api/users/[id] - Update user (ADMIN only) */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can update users');
    }

    const { id } = await params;
    const existingUser = await prisma.user.findFirst({
      where: { id, organizationId: session.user.organizationId },
    });
    if (!existingUser) return notFoundError('User');

    const body = await request.json();
    const validation = validateBody(updateUserSchema, body);
    if (!validation.success) return validationError(formatZodErrors(validation.error));

    const data = validation.data;

    if (session.user.id === id && data.isActive === false) {
      return validationError('You cannot deactivate your own account');
    }

    if (data.role) {
      const currentLevel = ROLE_HIERARCHY.indexOf(session.user.role);
      const targetLevel = ROLE_HIERARCHY.indexOf(data.role);
      if (targetLevel > currentLevel) {
        return validationError('You cannot assign a role higher than your own');
      }
    }

    const oldValues = { name: existingUser.name, role: existingUser.role, isActive: existingUser.isActive };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE', entityType: 'User', entityId: id, oldValues,
        newValues: { name: updatedUser.name, role: updatedUser.role, isActive: updatedUser.isActive },
        userId: session.user.id, organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error, 'updating user');
  }
}

/** DELETE /api/users/[id] - Soft delete (ADMIN only) */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can delete users');
    }

    const { id } = await params;
    if (session.user.id === id) {
      return validationError('You cannot delete your own account');
    }

    const existingUser = await prisma.user.findFirst({
      where: { id, organizationId: session.user.organizationId },
    });
    if (!existingUser) return notFoundError('User');

    await prisma.user.update({ where: { id }, data: { isActive: false } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE', entityType: 'User', entityId: id,
        oldValues: { isActive: true }, newValues: { isActive: false },
        userId: session.user.id, organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    return handleApiError(error, 'deleting user');
  }
}
