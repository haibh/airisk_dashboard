import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, validationError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const propagationSchema = z.object({
  vendorId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const params = { vendorId: searchParams.get('vendorId') || '' };
    const validation = propagationSchema.safeParse(params);

    if (!validation.success) {
      return validationError(validation.error.issues.map((e: any) => e.message).join(', '));
    }

    const { vendorId } = validation.data;

    // Get vendor to ensure it belongs to org
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: vendorId,
        organizationId: session.user.organizationId,
      },
    });

    if (!vendor) {
      return validationError('Vendor not found');
    }

    // Recursive CTE to get all descendants
    const descendants = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      tier: number;
      riskScore: number;
    }>>`
      WITH RECURSIVE vendor_tree AS (
        SELECT id, name, tier, "riskScore", "parentVendorId"
        FROM vendors
        WHERE id = ${vendorId} AND "organizationId" = ${session.user.organizationId}

        UNION ALL

        SELECT v.id, v.name, v.tier, v."riskScore", v."parentVendorId"
        FROM vendors v
        INNER JOIN vendor_tree vt ON v."parentVendorId" = vt.id
      )
      SELECT id, name, tier, "riskScore"
      FROM vendor_tree
      WHERE id != ${vendorId}
      ORDER BY tier
    `;

    // Calculate propagated risk (80% of parent risk flows to children)
    const propagationFactor = 0.8;
    const affectedVendors = descendants.map(v => {
      const inheritedRisk = vendor.riskScore * propagationFactor;
      const newRisk = Math.max(inheritedRisk, v.riskScore);
      return {
        id: v.id,
        name: v.name,
        tier: v.tier,
        currentRisk: v.riskScore,
        propagatedRisk: newRisk,
        riskIncrease: newRisk - v.riskScore,
      };
    });

    return NextResponse.json({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorRisk: vendor.riskScore,
      affectedVendors,
      totalAffected: affectedVendors.length,
    });
  } catch (error) {
    return handleApiError(error, 'calculating risk propagation');
  }
}
