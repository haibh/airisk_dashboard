import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { invitationFilterSchema, createInvitationSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { generateInviteToken, getInviteExpiry } from '@/lib/invitation-token-generator';

const invitationSelect = {
  id: true, email: true, role: true, status: true, expiresAt: true, acceptedAt: true, createdAt: true,
  invitedBy: { select: { id: true, name: true, email: true } },
};

/** GET /api/invitations - List invitations (ADMIN only) */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can view invitations');
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
      status: searchParams.get('status'),
    };

    const validation = validateBody(invitationFilterSchema, filters);
    if (!validation.success) return validationError(formatZodErrors(validation.error));

    const { page, pageSize, search, status } = validation.data;
    const skip = (page - 1) * pageSize;

    const where: any = { organizationId: session.user.organizationId };
    if (status) where.status = status;
    if (search) where.email = { contains: search, mode: 'insensitive' };

    const total = await prisma.invitation.count({ where });
    const invitations = await prisma.invitation.findMany({
      where, select: invitationSelect, orderBy: { createdAt: 'desc' }, skip, take: pageSize,
    });

    return NextResponse.json({ success: true, data: invitations, total, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'listing invitations');
  }
}

/** POST /api/invitations - Create invitation (ADMIN only) */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can create invitations');
    }

    const body = await request.json();
    const validation = validateBody(createInvitationSchema, body);
    if (!validation.success) return validationError(formatZodErrors(validation.error));

    const { email, role } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: { email, organizationId: session.user.organizationId },
    });
    if (existingUser) {
      return validationError('User with this email already exists in your organization');
    }

    const pendingInvitation = await prisma.invitation.findFirst({
      where: { email, organizationId: session.user.organizationId, status: 'PENDING' },
    });
    if (pendingInvitation) {
      return validationError('A pending invitation already exists for this email');
    }

    const token = generateInviteToken();
    const expiresAt = getInviteExpiry();

    const invitation = await prisma.invitation.create({
      data: {
        email, role, token, expiresAt,
        organizationId: session.user.organizationId,
        invitedById: session.user.id,
      },
      include: { invitedBy: { select: { id: true, name: true, email: true } } },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE', entityType: 'Invitation', entityId: invitation.id,
        oldValues: {}, newValues: { email, role, status: 'PENDING' },
        userId: session.user.id, organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id, email: invitation.email, role: invitation.role, token: invitation.token,
        status: invitation.status, expiresAt: invitation.expiresAt, createdAt: invitation.createdAt,
        invitedBy: invitation.invitedBy,
      },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating invitation');
  }
}
