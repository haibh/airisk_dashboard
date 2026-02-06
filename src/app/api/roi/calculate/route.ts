/**
 * POST /api/roi/calculate
 * Calculate ROSI for selected risks/controls or all org risks
 * Requires: RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
} from '@/lib/api-error-handler';
import { prisma } from '@/lib/db';
import {
  calculateALE,
  calculateROSI,
  calculatePaybackPeriod,
  calculateAnnualSavings,
} from '@/lib/roi-rosi-calculator';

// Validation schema
const calculateROISchema = z.object({
  riskIds: z.array(z.string()).optional(),
  controlIds: z.array(z.string()).optional(),
});

type CalculateROIInput = z.infer<typeof calculateROISchema>;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Require RISK_MANAGER+ role
    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError();
    }

    const body = await request.json();
    const parseResult = calculateROISchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { riskIds, controlIds } = parseResult.data;
    const orgId = session.user.organizationId;

    // Get all risks for the organization (via assessment)
    const risks = await prisma.risk.findMany({
      where: {
        assessment: {
          organizationId: orgId,
        },
        ...(riskIds && riskIds.length > 0 ? { id: { in: riskIds } } : {}),
      },
      select: {
        id: true,
      },
    });

    const riskIdsList = risks.map((r) => r.id);

    // Get risk cost profiles
    const costProfiles = await prisma.riskCostProfile.findMany({
      where: {
        riskId: { in: riskIdsList },
      },
      include: {
        risk: true,
      },
    });

    // Calculate total ALE
    const totalALE = costProfiles.reduce((sum, profile) => {
      const ale = calculateALE(profile.sle, profile.aro);
      return sum + ale;
    }, 0);

    // Get mitigation investments (filter by controlIds if provided)
    // Note: Controls are global, but investments are linked to risks which have organizationId
    const whereClause: any = {};
    if (controlIds && controlIds.length > 0) {
      whereClause.controlId = { in: controlIds };
    }

    const investments = await prisma.mitigationInvestment.findMany({
      where: whereClause,
      include: {
        control: true,
      },
    });

    // Calculate total investment and average mitigation
    const totalImplementationCost = investments.reduce(
      (sum, inv) => sum + inv.implementationCost,
      0
    );
    const totalAnnualMaintenance = investments.reduce(
      (sum, inv) => sum + inv.annualMaintenanceCost,
      0
    );
    const totalInvestment = totalImplementationCost + totalAnnualMaintenance;

    const avgMitigationPercent =
      investments.length > 0
        ? investments.reduce((sum, inv) => sum + inv.mitigationPercent, 0) / investments.length
        : 0;

    // Calculate ROSI
    const rosi = calculateROSI(totalALE, avgMitigationPercent, totalInvestment);
    const annualSavings = calculateAnnualSavings(
      totalALE,
      avgMitigationPercent,
      totalAnnualMaintenance
    );
    const paybackPeriod = calculatePaybackPeriod(totalImplementationCost, annualSavings);

    // Save calculation result
    const rosiCalculation = await prisma.rOSICalculation.create({
      data: {
        organizationId: orgId,
        totalALE,
        totalInvestment,
        totalMitigation: avgMitigationPercent,
        rosi,
        paybackPeriod: paybackPeriod === Infinity ? 0 : paybackPeriod,
      },
    });

    return NextResponse.json(
      {
        id: rosiCalculation.id,
        totalALE,
        totalInvestment: {
          implementation: totalImplementationCost,
          annualMaintenance: totalAnnualMaintenance,
          total: totalInvestment,
        },
        avgMitigationPercent,
        rosi: rosi * 100, // Return as percentage
        annualSavings,
        paybackMonths: paybackPeriod === Infinity ? null : paybackPeriod,
        risksAnalyzed: costProfiles.length,
        controlsAnalyzed: investments.length,
        calculatedAt: rosiCalculation.calculationDate,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'calculating ROI');
  }
}
