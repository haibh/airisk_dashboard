import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError, notFoundError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateVendorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  category: z.string().min(1).optional(),
  tier: z.number().int().min(1).max(10).optional(),
  riskScore: z.number().min(0).max(25).optional(),
  contactEmail: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  parentVendorId: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { id } = await params;

    const vendor = await prisma.vendor.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        parentVendor: true,
        subVendors: true,
        riskPaths: true,
      },
    });

    if (!vendor) return notFoundError('Vendor');

    return NextResponse.json(vendor);
  } catch (error) {
    return handleApiError(error, 'fetching vendor');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const validation = updateVendorSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { id } = await params;

    // Verify vendor exists and belongs to org
    const existingVendor = await prisma.vendor.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingVendor) return notFoundError('Vendor');

    const vendor = await prisma.vendor.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(vendor);
  } catch (error) {
    return handleApiError(error, 'updating vendor');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError();
    }

    const { id } = await params;

    const vendor = await prisma.vendor.deleteMany({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (vendor.count === 0) return notFoundError('Vendor');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'deleting vendor');
  }
}
