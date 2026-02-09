import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, notFoundError, validationError } from '@/lib/api-error-handler';
import { updateIPAllowlistEntrySchema } from '@/lib/api-validation-schemas';
import { invalidateAllowlistCache } from '@/lib/ip-allowlist-checker-service';

/**
 * PUT /api/organizations/ip-allowlist/[id]
 * Update IP allowlist entry (ADMIN only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const { id: entryId } = await params;

    // Find entry
    const existingEntry = await prisma.iPAllowlistEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry) {
      return notFoundError('IP allowlist entry', request);
    }

    if (existingEntry.organizationId !== session.user.organizationId) {
      return forbiddenError('Cannot update entries from other organizations', request);
    }

    // Parse and validate body
    const body = await request.json();
    const validation = updateIPAllowlistEntrySchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid update data', validation.error.issues, request);
    }

    const { description, isActive } = validation.data;

    // Update entry
    const updated = await prisma.iPAllowlistEntry.update({
      where: { id: entryId },
      data: {
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    // Invalidate cache
    invalidateAllowlistCache(session.user.organizationId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_IP_ALLOWLIST_ENTRY',
        entityType: 'IPAllowlistEntry',
        entityId: entryId,
        oldValues: { description: existingEntry.description, isActive: existingEntry.isActive },
        newValues: { description: updated.description, isActive: updated.isActive },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return handleApiError(error, 'updating IP allowlist entry', request);
  }
}

/**
 * DELETE /api/organizations/ip-allowlist/[id]
 * Remove IP allowlist entry (ADMIN only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const { id: entryId } = await params;

    // Find entry
    const existingEntry = await prisma.iPAllowlistEntry.findUnique({
      where: { id: entryId },
    });

    if (!existingEntry) {
      return notFoundError('IP allowlist entry', request);
    }

    if (existingEntry.organizationId !== session.user.organizationId) {
      return forbiddenError('Cannot delete entries from other organizations', request);
    }

    // Delete entry
    await prisma.iPAllowlistEntry.delete({
      where: { id: entryId },
    });

    // Invalidate cache
    invalidateAllowlistCache(session.user.organizationId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_IP_ALLOWLIST_ENTRY',
        entityType: 'IPAllowlistEntry',
        entityId: entryId,
        oldValues: { cidr: existingEntry.cidr, description: existingEntry.description },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'IP allowlist entry deleted',
    });
  } catch (error) {
    return handleApiError(error, 'deleting IP allowlist entry', request);
  }
}
