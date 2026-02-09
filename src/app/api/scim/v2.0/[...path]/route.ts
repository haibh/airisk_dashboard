/**
 * SCIM 2.0 Endpoint (catch-all)
 * Handles SCIM user provisioning operations via Jackson
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getSCIMController } from '@/lib/saml-jackson-service';
import crypto from 'crypto';

/**
 * Validate SCIM bearer token
 */
async function validateScimToken(
  request: NextRequest
): Promise<{ organizationId: string } | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  if (!token) {
    return null;
  }

  // Hash the token to compare with stored hash
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find SSO connection with matching token hash
  const ssoConnection = await prisma.sSOConnection.findFirst({
    where: {
      scimEnabled: true,
      scimToken: tokenHash,
      isActive: true,
    },
  });

  if (!ssoConnection) {
    return null;
  }

  return { organizationId: ssoConnection.organizationId };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const auth = await validateScimToken(request);

    if (!auth) {
      return unauthorizedError(request);
    }

    const scimController = await getSCIMController();
    const { path: pathSegments } = await params;

    logger.info('SCIM GET request', {
      context: 'scim',
      data: { organizationId: auth.organizationId, path: pathSegments },
    });

    // Forward to Jackson SCIM controller
    // Jackson v5+ SCIM uses requests.handle() — cast to any for incomplete types
    const result = await (scimController as any).requests.handle(request, {
      tenant: auth.organizationId,
      product: 'airm-ip',
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'SCIM GET', request);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const auth = await validateScimToken(request);

    if (!auth) {
      return unauthorizedError(request);
    }

    const scimController = await getSCIMController();
    const { path: pathSegments } = await params;

    logger.info('SCIM POST request', {
      context: 'scim',
      data: { organizationId: auth.organizationId, path: pathSegments },
    });

    // Forward to Jackson SCIM controller
    // Jackson v5+ SCIM uses requests.handle() — cast to any for incomplete types
    const result = await (scimController as any).requests.handle(request, {
      tenant: auth.organizationId,
      product: 'airm-ip',
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'SCIM POST', request);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const auth = await validateScimToken(request);

    if (!auth) {
      return unauthorizedError(request);
    }

    const scimController = await getSCIMController();
    const { path: pathSegments } = await params;

    logger.info('SCIM PUT request', {
      context: 'scim',
      data: { organizationId: auth.organizationId, path: pathSegments },
    });

    // Forward to Jackson SCIM controller
    // Jackson v5+ SCIM uses requests.handle() — cast to any for incomplete types
    const result = await (scimController as any).requests.handle(request, {
      tenant: auth.organizationId,
      product: 'airm-ip',
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'SCIM PUT', request);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const auth = await validateScimToken(request);

    if (!auth) {
      return unauthorizedError(request);
    }

    const scimController = await getSCIMController();
    const { path: pathSegments } = await params;

    logger.info('SCIM PATCH request', {
      context: 'scim',
      data: { organizationId: auth.organizationId, path: pathSegments },
    });

    // Forward to Jackson SCIM controller
    // Jackson v5+ SCIM uses requests.handle() — cast to any for incomplete types
    const result = await (scimController as any).requests.handle(request, {
      tenant: auth.organizationId,
      product: 'airm-ip',
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'SCIM PATCH', request);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const auth = await validateScimToken(request);

    if (!auth) {
      return unauthorizedError(request);
    }

    const scimController = await getSCIMController();
    const { path: pathSegments } = await params;

    logger.info('SCIM DELETE request', {
      context: 'scim',
      data: { organizationId: auth.organizationId, path: pathSegments },
    });

    // Forward to Jackson SCIM controller
    // Jackson v5+ SCIM uses requests.handle() — cast to any for incomplete types
    const result = await (scimController as any).requests.handle(request, {
      tenant: auth.organizationId,
      product: 'airm-ip',
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error, 'SCIM DELETE', request);
  }
}
