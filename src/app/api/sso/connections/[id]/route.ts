/**
 * SSO Connection Detail API - Get, Update, Delete
 * ADMIN only - manages individual SSO connection
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  validationError,
} from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getConnectionAPIController } from '@/lib/saml-jackson-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const { id: connectionId } = await params;
    const organizationId = session.user.organizationId;

    const ssoConnection = await prisma.sSOConnection.findFirst({
      where: { id: connectionId, organizationId },
    });

    if (!ssoConnection) {
      return notFoundError('SSO connection', request);
    }

    // Return connection (exclude sensitive token)
    const safeConnection = {
      id: ssoConnection.id,
      organizationId: ssoConnection.organizationId,
      idpEntityId: ssoConnection.idpEntityId,
      idpSsoUrl: ssoConnection.idpSsoUrl,
      spEntityId: ssoConnection.spEntityId,
      acsUrl: ssoConnection.acsUrl,
      defaultRole: ssoConnection.defaultRole,
      allowedDomains: ssoConnection.allowedDomains,
      forceSSO: ssoConnection.forceSSO,
      isActive: ssoConnection.isActive,
      scimEnabled: ssoConnection.scimEnabled,
      scimTokenPrefix: ssoConnection.scimTokenPrefix,
      createdAt: ssoConnection.createdAt,
      updatedAt: ssoConnection.updatedAt,
    };

    return NextResponse.json({ connection: safeConnection }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'fetching SSO connection', request);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const { id: connectionId } = await params;
    const organizationId = session.user.organizationId;
    const body = await request.json();

    // Verify connection exists and belongs to org
    const existingConnection = await prisma.sSOConnection.findFirst({
      where: { id: connectionId, organizationId },
    });

    if (!existingConnection) {
      return notFoundError('SSO connection', request);
    }

    // Extract update fields
    const {
      idpEntityId,
      idpSsoUrl,
      idpCertificate,
      defaultRole,
      allowedDomains,
      forceSSO,
      isActive,
      scimEnabled,
      metadataUrl,
      metadataXml,
    } = body;

    // Update database
    const updatedConnection = await prisma.sSOConnection.update({
      where: { id: connectionId },
      data: {
        ...(idpEntityId && { idpEntityId }),
        ...(idpSsoUrl && { idpSsoUrl }),
        ...(idpCertificate && { idpCertificate }),
        ...(defaultRole && { defaultRole }),
        ...(allowedDomains && { allowedDomains }),
        ...(forceSSO !== undefined && { forceSSO }),
        ...(isActive !== undefined && { isActive }),
        ...(scimEnabled !== undefined && { scimEnabled }),
        ...(metadataUrl !== undefined && { metadataUrl }),
        ...(metadataXml !== undefined && { metadataXml }),
        updatedAt: new Date(),
      },
    });

    // Update Jackson connection if metadata changed
    if (metadataXml || metadataUrl) {
      const connectionController = await getConnectionAPIController();
      const externalUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

      // Delete old connection and create new one (Jackson doesn't have direct update)
      await connectionController.deleteConnections({
        tenant: organizationId,
        product: 'airm-ip',
      });

      await connectionController.createSAMLConnection({
        tenant: organizationId,
        product: 'airm-ip',
        redirectUrl: [`${externalUrl}/api/auth/saml/acs`],
        defaultRedirectUrl: `${externalUrl}/dashboard`,
        rawMetadata: metadataXml || undefined,
        metadataUrl: metadataUrl || undefined,
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SSO_CONNECTION_UPDATED',
        entityType: 'SSOConnection',
        entityId: connectionId,
        userId: session.user.id,
        organizationId,
        newValues: body,
      },
    });

    logger.info('SSO connection updated', {
      context: 'sso-admin',
      data: { connectionId, organizationId },
    });

    return NextResponse.json(
      {
        connection: {
          id: updatedConnection.id,
          organizationId: updatedConnection.organizationId,
          isActive: updatedConnection.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'updating SSO connection', request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const { id: connectionId } = await params;
    const organizationId = session.user.organizationId;

    // Verify connection exists and belongs to org
    const existingConnection = await prisma.sSOConnection.findFirst({
      where: { id: connectionId, organizationId },
    });

    if (!existingConnection) {
      return notFoundError('SSO connection', request);
    }

    // Delete from database (will cascade to Jackson via cleanup job)
    await prisma.sSOConnection.delete({
      where: { id: connectionId },
    });

    // Delete from Jackson
    const connectionController = await getConnectionAPIController();
    await connectionController.deleteConnections({
      tenant: organizationId,
      product: 'airm-ip',
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SSO_CONNECTION_DELETED',
        entityType: 'SSOConnection',
        entityId: connectionId,
        userId: session.user.id,
        organizationId,
        oldValues: {
          idpEntityId: existingConnection.idpEntityId,
        },
      },
    });

    logger.info('SSO connection deleted', {
      context: 'sso-admin',
      data: { connectionId, organizationId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, 'deleting SSO connection', request);
  }
}
