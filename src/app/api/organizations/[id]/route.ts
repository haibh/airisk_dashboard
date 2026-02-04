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
import { updateOrganizationSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';

/**
 * GET /api/organizations/[id] - Get organization profile
 * Any authenticated user in the organization can view
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

    const { id } = await params;

    // Validate user is requesting their own organization
    if (id !== session.user.organizationId) {
      return forbiddenError('You can only view your own organization');
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            aiSystems: true,
            riskAssessments: true,
          },
        },
      },
    });

    if (!organization) {
      return notFoundError('Organization');
    }

    return NextResponse.json(organization);
  } catch (error) {
    return handleApiError(error, 'fetching organization');
  }
}

/**
 * PUT /api/organizations/[id] - Update organization
 * ADMIN only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check ADMIN role
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can update organization settings');
    }

    const { id } = await params;

    // Validate user is updating their own organization
    if (id !== session.user.organizationId) {
      return forbiddenError('You can only update your own organization');
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(updateOrganizationSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Get old values for audit log
    const oldOrg = await prisma.organization.findUnique({
      where: { id },
      select: { name: true, settings: true },
    });

    if (!oldOrg) {
      return notFoundError('Organization');
    }

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.settings !== undefined && { settings: data.settings }),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'Organization',
        entityId: id,
        oldValues: { name: oldOrg.name, settings: oldOrg.settings },
        newValues: { name: updatedOrganization.name, settings: updatedOrganization.settings },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(updatedOrganization);
  } catch (error) {
    return handleApiError(error, 'updating organization');
  }
}
