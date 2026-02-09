/**
 * SAML SP Metadata Endpoint
 * Returns Service Provider metadata XML for IdP configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, validationError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getConnectionAPIController } from '@/lib/saml-jackson-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return validationError('Missing orgId parameter', undefined, request);
    }

    // Get Jackson connection API controller
    const connectionController = await getConnectionAPIController();

    // Get connections for this tenant
    const connections = await connectionController.getConnections({
      tenant: orgId,
      product: 'airm-ip',
    });

    if (!connections || connections.length === 0) {
      return validationError('SAML connection not configured', undefined, request);
    }

    // Get first connection
    const connection = connections[0];

    // Generate SP metadata XML manually (simple format)
    const externalUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
  entityID="${externalUrl}/api/auth/saml/metadata?orgId=${orgId}">
  <md:SPSSODescriptor
    AuthnRequestsSigned="false"
    WantAssertionsSigned="true"
    protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${externalUrl}/api/auth/saml/acs"
      index="0"
      isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

    logger.info('SAML SP metadata requested', {
      context: 'saml-metadata',
      data: { orgId },
    });

    // Return XML with correct content type
    return new NextResponse(metadata, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': `attachment; filename="saml-sp-metadata-${orgId}.xml"`,
      },
    });
  } catch (error) {
    return handleApiError(error, 'SAML metadata', request);
  }
}
