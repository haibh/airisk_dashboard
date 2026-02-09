/**
 * SAML Authorize Endpoint (SP-initiated login)
 * Generates SAML AuthnRequest and redirects to IdP
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, validationError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getConnectionAPIController, getSAMLController } from '@/lib/saml-jackson-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get('orgId');
    const email = searchParams.get('email');

    // Need either orgId or email to lookup SSO connection
    if (!orgId && !email) {
      return validationError('Missing orgId or email parameter', undefined, request);
    }

    let organizationId = orgId;

    // If email provided, look up organization by email domain
    if (email && !orgId) {
      const emailDomain = email.split('@')[1];
      const ssoConnection = await prisma.sSOConnection.findFirst({
        where: {
          isActive: true,
          allowedDomains: {
            has: emailDomain,
          },
        },
      });

      if (!ssoConnection) {
        return validationError('No SSO connection found for email domain', undefined, request);
      }

      organizationId = ssoConnection.organizationId;
    }

    if (!organizationId) {
      return validationError('Could not determine organization', undefined, request);
    }

    // Get SSO connection
    const ssoConnection = await prisma.sSOConnection.findUnique({
      where: { organizationId },
    });

    if (!ssoConnection || !ssoConnection.isActive) {
      return validationError('SSO not configured or inactive for this organization', undefined, request);
    }

    // Get Jackson connection API controller
    const connectionController = await getConnectionAPIController();

    // Get SAML connection from Jackson
    const connections = await connectionController.getConnections({
      tenant: organizationId,
      product: 'airm-ip',
    });

    if (!connections || connections.length === 0) {
      logger.warn('No Jackson SAML connection found', {
        context: 'saml-authorize',
        data: { organizationId },
      });
      return validationError('SAML connection not configured', undefined, request);
    }

    const connection = connections[0];

    // Use OAuth controller for SAML authorization
    const oauthController = await getSAMLController();

    // Generate SAML authorize URL via Jackson OAuth flow
    // Cast params to any — Jackson v5+ OAuthReq types are overly restrictive
    const authorizeResult = await oauthController.authorize({
      tenant: organizationId,
      product: 'airm-ip',
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/saml/acs`,
      state: organizationId,
      response_type: 'code',
      client_id: `tenant=${organizationId}&product=airm-ip`,
    } as any);

    const redirectUrl = (authorizeResult as any).redirect_url as string | undefined;

    if (!redirectUrl) {
      return validationError('Failed to generate SAML authorization URL', undefined, request);
    }

    logger.info('SAML authorize redirect', {
      context: 'saml-authorize',
      data: { organizationId },
    });

    // Redirect to IdP
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return handleApiError(error, 'SAML authorize', request);
  }
}
