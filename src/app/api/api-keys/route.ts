import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
} from '@/lib/api-error-handler';
import {
  createAPIKeySchema,
  validateBody,
  formatZodErrors,
} from '@/lib/api-validation-schemas';
import { generateAPIKey } from '@/lib/api-key-generator';
import { KeyPermission } from '@prisma/client';

/**
 * GET /api/api-keys - List API keys (ADMIN only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can view API keys');
    }

    const keys = await prisma.aPIKey.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Mask keys - only show prefix
    const maskedKeys = keys.map((key) => ({
      id: key.id,
      name: key.name,
      keyPrefix: key.keyPrefix + '...',
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      revokedAt: key.revokedAt,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
      createdBy: key.createdBy,
    }));

    return NextResponse.json({ success: true, data: maskedKeys });
  } catch (error) {
    return handleApiError(error, 'fetching API keys');
  }
}

/**
 * POST /api/api-keys - Create API key (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can create API keys');
    }

    const body = await request.json();
    const validation = validateBody(createAPIKeySchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { name, permissions, expiresAt } = validation.data;

    // Check limit: max 10 per org
    const count = await prisma.aPIKey.count({
      where: {
        organizationId: session.user.organizationId,
        revokedAt: null,
      },
    });

    if (count >= 10) {
      return validationError('Maximum of 10 API keys per organization');
    }

    // Generate key
    const { fullKey, prefix, hash } = generateAPIKey('live');

    // Create key record
    const apiKey = await prisma.aPIKey.create({
      data: {
        name,
        keyPrefix: prefix,
        keyHash: hash,
        permissions: permissions as KeyPermission,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'API_KEY',
        entityId: apiKey.id,
        action: 'CREATE',
        newValues: { name, permissions },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    // Return full key ONCE
    return NextResponse.json(
      {
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          fullKey, // Show only once
          permissions: apiKey.permissions,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'creating API key');
  }
}
