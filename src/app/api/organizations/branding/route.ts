import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { brandingConfigSchema } from '@/lib/api-validation-schemas';

/**
 * GET /api/organizations/branding
 * Get organization branding config
 * - Public: if queried by domain (returns logo + colors only)
 * - Authenticated: returns full branding config for user's org
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domain = searchParams.get('domain');

    if (domain) {
      // Public domain-based lookup
      const org = await prisma.organization.findFirst({
        where: {
          users: {
            some: {
              email: {
                endsWith: `@${domain}`,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          brandingConfig: true,
        },
      });

      if (!org || !org.brandingConfig) {
        return NextResponse.json({
          success: true,
          data: null,
        });
      }

      // Return only public fields for domain lookup
      const branding = org.brandingConfig as any;
      return NextResponse.json({
        success: true,
        data: {
          organizationName: org.name,
          logoUrl: branding.logoUrl || null,
          primaryColor: branding.primaryColor || null,
          accentColor: branding.accentColor || null,
        },
      });
    } else {
      // Authenticated org-scoped lookup
      const session = await getServerSession();

      if (!session?.user?.id || !session.user.organizationId) {
        return unauthorizedError(request);
      }

      const org = await prisma.organization.findUnique({
        where: { id: session.user.organizationId },
        select: {
          brandingConfig: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: org?.brandingConfig || null,
      });
    }
  } catch (error) {
    return handleApiError(error, 'fetching branding config', request);
  }
}

/**
 * PUT /api/organizations/branding
 * Update organization branding config (ADMIN only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id || !session.user.organizationId) {
      return unauthorizedError(request);
    }

    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Admin access required', request);
    }

    const body = await request.json();
    const validation = brandingConfigSchema.safeParse(body);

    if (!validation.success) {
      return validationError('Invalid branding config', validation.error.issues, request);
    }

    const brandingData = validation.data;

    // Get current branding for audit log
    const org = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { brandingConfig: true },
    });

    // Update branding config
    const updated = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: {
        brandingConfig: brandingData,
      },
      select: {
        brandingConfig: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_BRANDING_CONFIG',
        entityType: 'Organization',
        entityId: session.user.organizationId,
        oldValues: org?.brandingConfig || {},
        newValues: brandingData,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated.brandingConfig,
    });
  } catch (error) {
    return handleApiError(error, 'updating branding config', request);
  }
}
