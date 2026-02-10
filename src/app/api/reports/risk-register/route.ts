import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { TreatmentStatus } from '@prisma/client';

/**
 * Convert risk register data to CSV format
 */
function convertToCSV(risks: any[]): string {
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];

  // Header
  lines.push('Risk Register Report');
  lines.push('');
  lines.push('Risk ID,Title,Category,Assessment,AI System,Likelihood,Impact,Inherent Score,Control Effectiveness,Residual Score,Treatment Status,Treatment Plan,Due Date,Created Date,Last Updated');

  if (risks.length > 0) {
    for (const risk of risks) {
      lines.push([
        escapeCSV(risk.id),
        escapeCSV(risk.title),
        escapeCSV(risk.category),
        escapeCSV(risk.assessment?.title),
        escapeCSV(risk.assessment?.aiSystem?.name),
        escapeCSV(risk.likelihood),
        escapeCSV(risk.impact),
        escapeCSV(risk.inherentScore),
        escapeCSV(risk.controlEffectiveness),
        escapeCSV(risk.residualScore),
        escapeCSV(risk.treatmentStatus),
        escapeCSV(risk.treatmentPlan),
        escapeCSV(risk.treatmentDueDate),
        escapeCSV(risk.createdAt),
        escapeCSV(risk.updatedAt),
      ].join(','));
    }
  } else {
    lines.push('No risks found');
  }

  return lines.join('\n');
}

/**
 * GET /api/reports/risk-register - Generate risk register report
 * Query params:
 *   - format (optional): 'json' or 'csv' (default: 'json')
 *   - status (optional): Filter by treatment status
 *   - category (optional): Filter by risk category
 *   - minScore (optional): Filter by minimum residual score
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const status = searchParams.get('status') as TreatmentStatus | null;
    const category = searchParams.get('category') || undefined;
    const minScore = searchParams.get('minScore')
      ? parseFloat(searchParams.get('minScore')!)
      : undefined;

    // Validate format
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be json or csv' },
        { status: 400 }
      );
    }

    // Build where clause
    const riskWhere: any = {
      assessment: {
        organizationId: session.user.organizationId,
      },
    };

    if (status) {
      riskWhere.treatmentStatus = status;
    }

    if (category) {
      riskWhere.category = category;
    }

    if (minScore !== undefined) {
      riskWhere.residualScore = {
        gte: minScore,
      };
    }

    // Fetch risks with related data
    const risks = await prisma.risk.findMany({
      where: riskWhere,
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            status: true,
            assessmentDate: true,
            aiSystem: {
              select: {
                id: true,
                name: true,
                systemType: true,
                riskTier: true,
              },
            },
            framework: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
          },
        },
        controls: {
          include: {
            control: {
              select: {
                id: true,
                code: true,
                title: true,
                frameworkId: true,
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        residualScore: 'desc',
      },
    });

    // Calculate statistics
    const totalRisks = risks.length;
    const highRisks = risks.filter((r: any) => r.residualScore >= 15).length;
    const mediumRisks = risks.filter((r: any) => r.residualScore >= 9 && r.residualScore < 15).length;
    const lowRisks = risks.filter((r: any) => r.residualScore < 9).length;

    const risksByStatus = {
      PENDING: risks.filter((r: any) => r.treatmentStatus === 'PENDING').length,
      ACCEPTED: risks.filter((r: any) => r.treatmentStatus === 'ACCEPTED').length,
      MITIGATING: risks.filter((r: any) => r.treatmentStatus === 'MITIGATING').length,
      TRANSFERRED: risks.filter((r: any) => r.treatmentStatus === 'TRANSFERRED').length,
      AVOIDED: risks.filter((r: any) => r.treatmentStatus === 'AVOIDED').length,
      COMPLETED: risks.filter((r: any) => r.treatmentStatus === 'COMPLETED').length,
    };

    const risksByCategory = risks.reduce((acc: Record<string, number>, risk: any) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgInherentScore = totalRisks > 0
      ? risks.reduce((sum: number, r: any) => sum + r.inherentScore, 0) / totalRisks
      : 0;

    const avgResidualScore = totalRisks > 0
      ? risks.reduce((sum: number, r: any) => sum + r.residualScore, 0) / totalRisks
      : 0;

    const avgControlEffectiveness = totalRisks > 0
      ? risks.reduce((sum: number, r: any) => sum + r.controlEffectiveness, 0) / totalRisks
      : 0;

    const summary = {
      risks,
      statistics: {
        totalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        risksByStatus,
        risksByCategory,
        avgInherentScore: Math.round(avgInherentScore * 100) / 100,
        avgResidualScore: Math.round(avgResidualScore * 100) / 100,
        avgControlEffectiveness: Math.round(avgControlEffectiveness * 100) / 100,
      },
      filters: {
        status: status || 'all',
        category: category || 'all',
        minScore: minScore || 'none',
      },
      generatedAt: new Date().toISOString(),
    };

    // Return CSV format
    if (format === 'csv') {
      const csvContent = convertToCSV(risks);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="risk-register-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate risk register report' },
      { status: 500 }
    );
  }
}
