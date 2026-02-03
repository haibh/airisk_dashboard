import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * GET /api/dashboard/risk-heatmap
 * Returns 5x5 risk heatmap matrix with risk counts at each likelihood/impact intersection
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

    // Get all risks with their likelihood and impact
    const risks = await prisma.risk.findMany({
      where: {
        assessment: { organizationId },
      },
      select: {
        likelihood: true,
        impact: true,
      },
    });

    // Initialize 5x5 matrix (likelihood x impact)
    const heatmap: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));

    // Count risks at each intersection
    risks.forEach((risk: any) => {
      const likelihoodIndex = risk.likelihood - 1; // Convert 1-5 to 0-4
      const impactIndex = risk.impact - 1; // Convert 1-5 to 0-4

      if (likelihoodIndex >= 0 && likelihoodIndex < 5 &&
          impactIndex >= 0 && impactIndex < 5) {
        heatmap[likelihoodIndex][impactIndex]++;
      }
    });

    // Calculate total risks and highest concentration
    const totalRisks = risks.length;
    const maxCount = Math.max(...heatmap.flat());

    return NextResponse.json({
      heatmap,
      totalRisks,
      maxCount,
      dimensions: {
        likelihood: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
        impact: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
      },
    });
  } catch (error) {
    console.error('Error fetching risk heatmap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
