/**
 * POST /api/roi/scenarios
 * What-if analysis: compare multiple control investment scenarios
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
const scenarioSchema = z.object({
  name: z.string().min(1, 'Scenario name is required'),
  controlIds: z.array(z.string()).min(1, 'At least one control required'),
  mitigationPercent: z.number().min(0).max(100).optional(),
});

const scenariosRequestSchema = z.object({
  scenarios: z.array(scenarioSchema).min(1, 'At least one scenario required'),
});

type ScenarioInput = z.infer<typeof scenarioSchema>;
type ScenariosRequest = z.infer<typeof scenariosRequestSchema>;

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
    const parseResult = scenariosRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { scenarios } = parseResult.data;
    const orgId = session.user.organizationId;

    // Get all risks for the organization (via assessment)
    const risks = await prisma.risk.findMany({
      where: {
        assessment: {
          organizationId: orgId,
        },
      },
      select: {
        id: true,
      },
    });

    const riskIdsList = risks.map((r) => r.id);

    // Get all risk cost profiles for the org
    const costProfiles = await prisma.riskCostProfile.findMany({
      where: {
        riskId: { in: riskIdsList },
      },
      include: {
        risk: true,
      },
    });

    // Calculate total ALE (same for all scenarios)
    const totalALE = costProfiles.reduce((sum, profile) => {
      const ale = calculateALE(profile.sle, profile.aro);
      return sum + ale;
    }, 0);

    // Calculate ROSI for each scenario
    const scenarioResults = await Promise.all(
      scenarios.map(async (scenario) => {
        // Get investments for this scenario's controls
        const investments = await prisma.mitigationInvestment.findMany({
          where: {
            controlId: { in: scenario.controlIds },
          },
        });

        const totalImplementationCost = investments.reduce(
          (sum, inv) => sum + inv.implementationCost,
          0
        );
        const totalAnnualMaintenance = investments.reduce(
          (sum, inv) => sum + inv.annualMaintenanceCost,
          0
        );
        const totalInvestment = totalImplementationCost + totalAnnualMaintenance;

        // Use provided mitigation or average from investments
        const mitigationPercent =
          scenario.mitigationPercent ??
          (investments.length > 0
            ? investments.reduce((sum, inv) => sum + inv.mitigationPercent, 0) /
              investments.length
            : 0);

        const rosi = calculateROSI(totalALE, mitigationPercent, totalInvestment);
        const annualSavings = calculateAnnualSavings(
          totalALE,
          mitigationPercent,
          totalAnnualMaintenance
        );
        const paybackPeriod = calculatePaybackPeriod(
          totalImplementationCost,
          annualSavings
        );

        return {
          name: scenario.name,
          controlsCount: investments.length,
          totalInvestment: {
            implementation: totalImplementationCost,
            annualMaintenance: totalAnnualMaintenance,
            total: totalInvestment,
          },
          mitigationPercent,
          rosi: rosi * 100, // Return as percentage
          annualSavings,
          paybackMonths: paybackPeriod === Infinity ? null : paybackPeriod,
          netBenefit: annualSavings - totalInvestment,
        };
      })
    );

    // Sort by ROSI descending
    scenarioResults.sort((a, b) => b.rosi - a.rosi);

    return NextResponse.json({
      totalALE,
      risksAnalyzed: costProfiles.length,
      scenarios: scenarioResults,
      bestScenario: scenarioResults[0]?.name ?? null,
    });
  } catch (error) {
    return handleApiError(error, 'analyzing ROI scenarios');
  }
}
