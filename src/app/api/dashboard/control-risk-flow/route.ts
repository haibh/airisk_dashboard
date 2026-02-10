import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

/**
 * GET /api/dashboard/control-risk-flow
 * Returns Sankey diagram data for control→risk mitigation flow
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const frameworkId = searchParams.get('frameworkId');
    const riskCategory = searchParams.get('riskCategory');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Build where clause for risk controls
    const where: Prisma.RiskControlWhereInput = {
      risk: {
        assessment: {
          organizationId: session.user.organizationId,
        },
      },
    };

    if (frameworkId) {
      where.control = { frameworkId };
    }

    if (riskCategory) {
      where.risk = {
        ...(where.risk as Prisma.RiskWhereInput),
        category: riskCategory as Prisma.EnumRiskCategoryFilter,
      };
    }

    // Fetch risk-control relationships with related data
    const riskControls = await prisma.riskControl.findMany({
      where,
      include: {
        risk: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        control: {
          select: {
            id: true,
            code: true,
            title: true,
            framework: {
              select: {
                id: true,
                shortName: true,
              },
            },
          },
        },
      },
      take: limit,
    });

    // Build nodes and links for Sankey
    const controlMap = new Map<
      string,
      { node: { name: string; id: string; type: string; category: string }; index: number }
    >();
    const riskMap = new Map<
      string,
      { node: { name: string; id: string; type: string; category: string }; index: number }
    >();
    const nodes: { name: string; id: string; type: string; category: string }[] = [];
    const links: {
      source: number;
      target: number;
      value: number;
      controlId: string;
      riskId: string;
      controlName: string;
      riskName: string;
      effectiveness: number;
    }[] = [];

    // First pass: collect unique controls and risks
    for (const rc of riskControls) {
      // Control node
      if (!controlMap.has(rc.control.id)) {
        const index = nodes.length;
        const node = {
          name: `${rc.control.code}: ${rc.control.title.slice(0, 30)}${rc.control.title.length > 30 ? '...' : ''}`,
          id: rc.control.id,
          type: 'control',
          category: rc.control.framework.shortName,
        };
        nodes.push(node);
        controlMap.set(rc.control.id, { node, index });
      }

      // Risk node
      if (!riskMap.has(rc.risk.id)) {
        const index = nodes.length;
        const node = {
          name: rc.risk.title.slice(0, 40) + (rc.risk.title.length > 40 ? '...' : ''),
          id: rc.risk.id,
          type: 'risk',
          category: rc.risk.category,
        };
        nodes.push(node);
        riskMap.set(rc.risk.id, { node, index });
      }
    }

    // Second pass: create links
    for (const rc of riskControls) {
      const sourceData = controlMap.get(rc.control.id);
      const targetData = riskMap.get(rc.risk.id);

      if (sourceData && targetData) {
        links.push({
          source: sourceData.index,
          target: targetData.index,
          value: Math.max(rc.effectiveness, 5), // Min value for visibility
          controlId: rc.control.id,
          riskId: rc.risk.id,
          controlName: `${rc.control.code}: ${rc.control.title}`,
          riskName: rc.risk.title,
          effectiveness: rc.effectiveness,
        });
      }
    }

    // Calculate stats
    const avgEffectiveness =
      links.length > 0
        ? links.reduce((sum, l) => sum + l.effectiveness, 0) / links.length
        : 0;

    return NextResponse.json({
      nodes,
      links,
      totalControls: controlMap.size,
      totalRisks: riskMap.size,
      avgEffectiveness: Math.round(avgEffectiveness * 10) / 10,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch control-risk flow' },
      { status: 500 }
    );
  }
}
