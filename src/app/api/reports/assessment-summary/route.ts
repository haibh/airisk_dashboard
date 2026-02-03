import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * Convert assessment data to CSV format
 */
function convertToCSV(assessment: any): string {
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines: string[] = [];

  // Header section
  lines.push('Assessment Summary Report');
  lines.push('');
  lines.push(`Assessment Title,${escapeCSV(assessment.title)}`);
  lines.push(`Description,${escapeCSV(assessment.description)}`);
  lines.push(`Status,${escapeCSV(assessment.status)}`);
  lines.push(`Assessment Date,${escapeCSV(assessment.assessmentDate)}`);
  lines.push(`Next Review Date,${escapeCSV(assessment.nextReviewDate)}`);
  lines.push('');
  lines.push(`AI System,${escapeCSV(assessment.aiSystem?.name)}`);
  lines.push(`System Type,${escapeCSV(assessment.aiSystem?.systemType)}`);
  lines.push(`Data Classification,${escapeCSV(assessment.aiSystem?.dataClassification)}`);
  lines.push('');
  lines.push(`Framework,${escapeCSV(assessment.framework?.name)}`);
  lines.push(`Framework Version,${escapeCSV(assessment.framework?.version)}`);
  lines.push('');

  // Risks section
  lines.push('Risk Register');
  lines.push('Title,Category,Likelihood,Impact,Inherent Score,Control Effectiveness,Residual Score,Treatment Status,Treatment Plan,Due Date');

  if (assessment.risks && assessment.risks.length > 0) {
    for (const risk of assessment.risks) {
      lines.push([
        escapeCSV(risk.title),
        escapeCSV(risk.category),
        escapeCSV(risk.likelihood),
        escapeCSV(risk.impact),
        escapeCSV(risk.inherentScore),
        escapeCSV(risk.controlEffectiveness),
        escapeCSV(risk.residualScore),
        escapeCSV(risk.treatmentStatus),
        escapeCSV(risk.treatmentPlan),
        escapeCSV(risk.treatmentDueDate),
      ].join(','));
    }
  } else {
    lines.push('No risks identified');
  }

  return lines.join('\n');
}

/**
 * GET /api/reports/assessment-summary - Generate assessment summary report
 * Query params:
 *   - assessmentId (required): Assessment ID
 *   - format (optional): 'json' or 'csv' (default: 'json')
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');
    const format = searchParams.get('format') || 'json';

    // Validate required params
    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Missing required parameter: assessmentId' },
        { status: 400 }
      );
    }

    // Validate format
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be json or csv' },
        { status: 400 }
      );
    }

    // Fetch assessment with all related data
    const assessment = await prisma.riskAssessment.findFirst({
      where: {
        id: assessmentId,
        organizationId: session.user.organizationId,
      },
      include: {
        aiSystem: {
          select: {
            id: true,
            name: true,
            systemType: true,
            dataClassification: true,
            lifecycleStatus: true,
            riskTier: true,
          },
        },
        framework: {
          select: {
            id: true,
            name: true,
            shortName: true,
            version: true,
            category: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        risks: {
          include: {
            controls: {
              include: {
                control: {
                  select: {
                    id: true,
                    code: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            residualScore: 'desc',
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate summary statistics
    const totalRisks = assessment.risks.length;
    const highRisks = assessment.risks.filter((r: any) => r.residualScore >= 15).length;
    const mediumRisks = assessment.risks.filter((r: any) => r.residualScore >= 9 && r.residualScore < 15).length;
    const lowRisks = assessment.risks.filter((r: any) => r.residualScore < 9).length;

    const avgInherentScore = totalRisks > 0
      ? assessment.risks.reduce((sum: number, r: any) => sum + r.inherentScore, 0) / totalRisks
      : 0;
    const avgResidualScore = totalRisks > 0
      ? assessment.risks.reduce((sum: number, r: any) => sum + r.residualScore, 0) / totalRisks
      : 0;

    const summary = {
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        status: assessment.status,
        assessmentDate: assessment.assessmentDate,
        nextReviewDate: assessment.nextReviewDate,
        completedAt: assessment.completedAt,
      },
      aiSystem: assessment.aiSystem,
      framework: assessment.framework,
      createdBy: assessment.createdBy,
      statistics: {
        totalRisks,
        highRisks,
        mediumRisks,
        lowRisks,
        avgInherentScore: Math.round(avgInherentScore * 100) / 100,
        avgResidualScore: Math.round(avgResidualScore * 100) / 100,
      },
      risks: assessment.risks,
      generatedAt: new Date().toISOString(),
    };

    // Return CSV format
    if (format === 'csv') {
      const csvContent = convertToCSV({
        ...assessment,
        statistics: summary.statistics,
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="assessment-summary-${assessmentId}-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating assessment summary report:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment summary report' },
      { status: 500 }
    );
  }
}
