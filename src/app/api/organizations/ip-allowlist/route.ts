import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { ipAllowlistEntrySchema } from '@/lib/api-validation-schemas';
import { invalidateAllowlistCache, isValidCIDR } from '@/lib/ip-allowlist-checker-service';

/**
 * GET /api/organizations/ip-allowlist
 * List IP allowlist entries for organization (ADMIN only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const entries = await prisma.iPAllowlistEntry.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    return handleApiError(error, 'fetching IP allowlist', request);
  }
}

/**
 * POST /api/organizations/ip-allowlist
 * Add IP/CIDR entry to allowlist (ADMIN only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const body = await request.json();
    const validation = ipAllowlistEntrySchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid IP allowlist entry', validation.error.issues, request);
    }

    const { cidr, description, isActive } = validation.data;

    // Additional CIDR validation
    if (!isValidCIDR(cidr)) {
      return validationError('Invalid CIDR notation', undefined, request);
    }

    // Create entry
    const entry = await prisma.iPAllowlistEntry.create({
      data: {
        cidr,
        description,
        isActive: isActive ?? true,
        organizationId: session.user.organizationId,
      },
    });

    // Invalidate cache
    invalidateAllowlistCache(session.user.organizationId);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_IP_ALLOWLIST_ENTRY',
        entityType: 'IPAllowlistEntry',
        entityId: entry.id,
        newValues: { cidr, description, isActive },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: entry,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'creating IP allowlist entry', request);
  }
}
