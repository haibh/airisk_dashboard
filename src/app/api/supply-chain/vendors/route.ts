import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schemas (inline per requirements)
const createVendorSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1),
  tier: z.number().int().min(1).max(10).optional(),
  riskScore: z.number().min(0).max(25).optional(),
  contactEmail: z.string().email().optional(),
  website: z.string().url().optional(),
  parentVendorId: z.string().optional(),
});

const vendorFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  tier: z.coerce.number().int().optional(),
  category: z.string().optional(),
  minRiskScore: z.coerce.number().optional(),
  maxRiskScore: z.coerce.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams);
    const validation = vendorFilterSchema.safeParse(params);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { page, pageSize, search, tier, category, minRiskScore, maxRiskScore } = validation.data;
    const skip = (page - 1) * pageSize;

    const where: any = {
      organizationId: session.user.organizationId,
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      ...(tier && { tier }),
      ...(category && { category }),
      ...(minRiskScore !== undefined && { riskScore: { gte: minRiskScore } }),
      ...(maxRiskScore !== undefined && {
        riskScore: minRiskScore !== undefined
          ? { gte: minRiskScore, lte: maxRiskScore }
          : { lte: maxRiskScore }
      }),
    };

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({
        where,
        include: {
          parentVendor: { select: { id: true, name: true } },
          _count: { select: { subVendors: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vendor.count({ where }),
    ]);

    return NextResponse.json({ vendors, total, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'fetching vendors');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const validation = createVendorSchema.safeParse(body);
    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const data = validation.data;

    // Auto-calculate tier if parent provided
    let tier = data.tier || 1;
    if (data.parentVendorId) {
      const parent = await prisma.vendor.findUnique({
        where: { id: data.parentVendorId },
        select: { tier: true, organizationId: true },
      });

      if (!parent) {
        return validationError('Parent vendor not found');
      }

      if (parent.organizationId !== session.user.organizationId) {
        return forbiddenError();
      }

      tier = parent.tier + 1;
    }

    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        category: data.category,
        tier,
        riskScore: data.riskScore || 0,
        contactEmail: data.contactEmail,
        website: data.website,
        parentVendorId: data.parentVendorId,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating vendor');
  }
}
