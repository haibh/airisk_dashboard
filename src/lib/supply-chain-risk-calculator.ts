/**
 * Supply chain risk propagation calculator
 * Calculates how risk flows through vendor hierarchies
 */

import { prisma } from '@/lib/db';

export interface RiskPropagationResult {
  vendorId: string;
  vendorName: string;
  currentRisk: number;
  propagatedRisk: number;
  affectedVendors: Array<{
    id: string;
    name: string;
    tier: number;
    newRisk: number;
    riskIncrease: number;
  }>;
}

/**
 * Calculate how a vendor's risk change propagates to downstream vendors
 * Uses recursive CTE to traverse vendor hierarchy
 */
export async function calculateRiskPropagation(
  vendorId: string,
  newRiskScore: number,
  organizationId: string
): Promise<RiskPropagationResult> {
  // Get vendor details
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: { name: true, riskScore: true, organizationId: true },
  });

  if (!vendor || vendor.organizationId !== organizationId) {
    throw new Error('Vendor not found');
  }

  // Get all descendants using recursive CTE
  const descendants = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    tier: number;
    riskScore: number;
  }>>`
    WITH RECURSIVE vendor_tree AS (
      SELECT id, name, tier, "riskScore", "parentVendorId"
      FROM vendors
      WHERE id = ${vendorId} AND "organizationId" = ${organizationId}

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

  // Risk propagates at 70% to each tier
  const propagationFactor = 0.7;
  const affectedVendors = descendants.map(v => {
    const inheritedRisk = newRiskScore * propagationFactor;
    const newRisk = Math.max(inheritedRisk, v.riskScore);
    return {
      id: v.id,
      name: v.name,
      tier: v.tier,
      newRisk: Math.round(newRisk * 100) / 100,
      riskIncrease: Math.round((newRisk - v.riskScore) * 100) / 100,
    };
  });

  return {
    vendorId,
    vendorName: vendor.name,
    currentRisk: vendor.riskScore,
    propagatedRisk: newRiskScore,
    affectedVendors,
  };
}

/**
 * Build graph data structure from vendors for visualization
 */
export function buildGraphData(vendors: Array<{
  id: string;
  name: string;
  tier: number;
  riskScore: number;
  category: string;
  parentVendorId: string | null;
}>) {
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
      type: 'depends-on' as const,
    }));

  return { nodes, edges };
}
