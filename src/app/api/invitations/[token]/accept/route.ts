import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';
import {
  handleApiError,
  notFoundError,
  validationError,
} from '@/lib/api-error-handler';
import { validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { createNotification } from '@/lib/notification-service';
import { z } from 'zod';

/**
 * POST /api/invitations/[token]/accept - Accept invitation (PUBLIC)
 * No auth required - creates new user account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return notFoundError('Invitation');
    }

    // Validate invitation status
    if (invitation.status !== 'PENDING') {
      return validationError(`This invitation has already been ${invitation.status.toLowerCase()}`);
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      // Update status to EXPIRED
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return validationError('This invitation has expired');
    }

    const body = await request.json();

    // Define accept invitation schema
    const acceptInvitationSchema = z.object({
      name: z.string().min(1, 'Name is required').max(255),
      password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    });

    // Validate request body
    const validation = validateBody(acceptInvitationSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { name, password } = validation.data;

    // Check if user already exists with this email
    const existingUser = await prisma.user.findFirst({
      where: {
        email: invitation.email,
        organizationId: invitation.organizationId,
      },
    });

    if (existingUser) {
      return validationError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and update invitation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: invitation.email,
          name,
          passwordHash,
          role: invitation.role,
          organizationId: invitation.organizationId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
        },
      });

      // Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });

      // Write audit log
      await tx.auditLog.create({
        data: {
          action: 'CREATE',
          entityType: 'User',
          entityId: newUser.id,
          oldValues: {},
          newValues: {
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            source: 'invitation',
          },
          userId: newUser.id,
          organizationId: newUser.organizationId,
        },
      });

      return newUser;
    });

    // Create notification for inviting admin (async, non-blocking)
    createNotification({
      userId: invitation.invitedById,
      orgId: invitation.organizationId,
      type: 'INVITE_ACCEPTED',
      title: 'Invitation Accepted',
      body: `${name} (${invitation.email}) has accepted your invitation and joined the organization.`,
      link: null,
    }).catch((err) => console.error('Failed to create notification:', err));

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        organizationId: result.organizationId,
      },
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'accepting invitation');
  }
}
