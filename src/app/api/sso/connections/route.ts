/**
 * SSO Connections API - List and Create
 * ADMIN only - manages organization SSO/SAML configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
} from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getConnectionAPIController } from '@/lib/saml-jackson-service';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const organizationId = session.user.organizationId;

    // Get SSO connection for organization
    const ssoConnection = await prisma.sSOConnection.findUnique({
      where: { organizationId },
    });

    if (!ssoConnection) {
      return NextResponse.json({ connection: null }, { status: 200 });
    }

    // Return connection (exclude sensitive fields)
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const organizationId = session.user.organizationId;
    const body = await request.json();

    // Validate required fields
    const {
      metadataUrl,
      metadataXml,
      idpEntityId,
      idpSsoUrl,
      idpCertificate,
      defaultRole,
      allowedDomains,
      forceSSO,
      scimEnabled,
    } = body;

    if (!idpEntityId || !idpSsoUrl || !idpCertificate) {
      return validationError('Missing required IdP configuration', undefined, request);
    }

    if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
      return validationError('At least one allowed domain required', undefined, request);
    }

    // Generate SP configuration
    const externalUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const spEntityId = `${externalUrl}/api/auth/saml/metadata`;
    const acsUrl = `${externalUrl}/api/auth/saml/acs`;

    // Create or update SSO connection in database
    const ssoConnection = await prisma.sSOConnection.upsert({
      where: { organizationId },
      create: {
        organizationId,
        metadataUrl: metadataUrl || null,
        metadataXml: metadataXml || null,
        idpEntityId,
        idpSsoUrl,
        idpCertificate,
        spEntityId,
        acsUrl,
        defaultRole: defaultRole || 'VIEWER',
        allowedDomains,
        forceSSO: forceSSO || false,
        isActive: true,
        scimEnabled: scimEnabled || false,
      },
      update: {
        metadataUrl: metadataUrl || null,
        metadataXml: metadataXml || null,
        idpEntityId,
        idpSsoUrl,
        idpCertificate,
        defaultRole: defaultRole || 'VIEWER',
        allowedDomains,
        forceSSO: forceSSO || false,
        scimEnabled: scimEnabled || false,
        updatedAt: new Date(),
      },
    });

    // Create/update Jackson SAML connection
    const connectionController = await getConnectionAPIController();

    await connectionController.createSAMLConnection({
      tenant: organizationId,
      product: 'airm-ip',
      redirectUrl: [`${externalUrl}/api/auth/saml/acs`],
      defaultRedirectUrl: `${externalUrl}/dashboard`,
      rawMetadata: metadataXml || undefined,
      metadataUrl: metadataUrl || undefined,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'SSO_CONNECTION_CREATED',
        entityType: 'SSOConnection',
        entityId: ssoConnection.id,
        userId: session.user.id,
        organizationId,
        newValues: {
          idpEntityId,
          allowedDomains,
          defaultRole: ssoConnection.defaultRole,
        },
      },
    });

    logger.info('SSO connection created', {
      context: 'sso-admin',
      data: { organizationId, connectionId: ssoConnection.id },
    });

    return NextResponse.json(
      {
        connection: {
          id: ssoConnection.id,
          organizationId: ssoConnection.organizationId,
          spEntityId: ssoConnection.spEntityId,
          acsUrl: ssoConnection.acsUrl,
          metadataUrl: `${externalUrl}/api/auth/saml/metadata?orgId=${organizationId}`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'creating SSO connection', request);
  }
}
