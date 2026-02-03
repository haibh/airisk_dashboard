import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * GET /api/dashboard/compliance
 * Returns compliance data for each framework including percentage, total controls, and mapped controls
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      return NextResponse.json(
        { error: 'User or organization not found' },
        { status: 404 }
      );
    }

    const organizationId = user.organizationId;

    // Get all active frameworks
    const frameworks = await prisma.framework.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        shortName: true,
        version: true,
      },
    });

    // For each framework, calculate compliance metrics
    const complianceData = await Promise.all(
      frameworks.map(async (framework: any) => {
        // Get total controls for this framework
        const totalControls = await prisma.control.count({
          where: { frameworkId: framework.id },
        });

        // Get mapped controls (controls that are linked to risks in this organization)
        const mappedControls = await prisma.riskControl.count({
          where: {
            control: { frameworkId: framework.id },
            risk: {
              assessment: { organizationId },
            },
          },
          distinct: ['controlId'],
        });

        // Calculate compliance percentage
        const percentage = totalControls > 0
          ? Math.round((mappedControls / totalControls) * 100)
          : 0;

        // Get average effectiveness of mapped controls
        const effectivenessAgg = await prisma.riskControl.aggregate({
          where: {
            control: { frameworkId: framework.id },
            risk: {
              assessment: { organizationId },
            },
          },
          _avg: {
            effectiveness: true,
          },
        });

        const avgEffectiveness = effectivenessAgg._avg.effectiveness || 0;

        return {
          framework: `${framework.shortName} ${framework.version}`,
          frameworkId: framework.id,
          frameworkName: framework.name,
          percentage,
          totalControls,
          mappedControls,
          avgEffectiveness: Math.round(avgEffectiveness),
        };
      })
    );

    // Sort by percentage descending
    complianceData.sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      frameworks: complianceData,
      summary: {
        totalFrameworks: frameworks.length,
        avgCompliance: Math.round(
          complianceData.reduce((sum, f) => sum + f.percentage, 0) /
          (frameworks.length || 1)
        ),
      },
    });
  } catch (error) {
    console.error('Error fetching compliance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
