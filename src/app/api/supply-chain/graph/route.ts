import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError } from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    const vendors = await prisma.vendor.findMany({
      where: { organizationId: session.user.organizationId },
      select: {
        id: true,
        name: true,
        tier: true,
        riskScore: true,
        category: true,
        parentVendorId: true,
      },
    });

    // Transform to React Flow format
    const nodes = vendors.map(v => ({
      id: v.id,
      label: v.name,
      tier: v.tier,
      riskScore: v.riskScore,
      category: v.category,
    }));

    const edges = vendors
      .filter(v => v.parentVendorId)
      .map(v => ({
        source: v.parentVendorId!,
        target: v.id,
        riskScore: v.riskScore,
      }));

    return NextResponse.json({ nodes, edges });
  } catch (error) {
    return handleApiError(error, 'fetching supply chain graph');
  }
}
