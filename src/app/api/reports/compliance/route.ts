import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';

/**
 * Convert compliance data to CSV format
 */
function convertToCSV(complianceData: any[]): string {
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
  lines.push('Compliance Status Report');
  lines.push('');
  lines.push('Framework,Version,Category,Total Controls,Assessed Controls,Compliance %,Status');

  if (complianceData.length > 0) {
    for (const framework of complianceData) {
      lines.push([
        escapeCSV(framework.name),
        escapeCSV(framework.version),
        escapeCSV(framework.category),
        escapeCSV(framework.totalControls),
        escapeCSV(framework.assessedControls),
        escapeCSV(framework.compliancePercentage),
        escapeCSV(framework.status),
      ].join(','));
    }

    // Add detailed controls section
    lines.push('');
    lines.push('Detailed Control Assessment');
    lines.push('Framework,Control Code,Control Title,Assessment Status,Linked Risks,Evidence Count');

    for (const framework of complianceData) {
      if (framework.controls && framework.controls.length > 0) {
        for (const control of framework.controls) {
          lines.push([
            escapeCSV(framework.shortName),
            escapeCSV(control.code),
            escapeCSV(control.title),
            escapeCSV(control.assessmentStatus),
            escapeCSV(control.linkedRisks),
            escapeCSV(control.evidenceCount),
          ].join(','));
        }
      }
    }
  } else {
    lines.push('No compliance data available');
  }

  return lines.join('\n');
}

/**
 * GET /api/reports/compliance - Generate compliance status report
 * Query params:
 *   - frameworkId (optional): Filter by specific framework
 *   - format (optional): 'json' or 'csv' (default: 'json')
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const frameworkId = searchParams.get('frameworkId') || undefined;
    const format = searchParams.get('format') || 'json';

    // Validate format
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be json or csv' },
        { status: 400 }
      );
    }

    // Build where clause for frameworks
    const frameworkWhere: any = {
      isActive: true,
    };

    if (frameworkId) {
      frameworkWhere.id = frameworkId;
    }

    // Fetch frameworks with controls and related data
    const frameworks = await prisma.framework.findMany({
      where: frameworkWhere,
      include: {
        controls: {
          include: {
            riskControls: {
              include: {
                risk: {
                  include: {
                    assessment: {
                      where: {
                        organizationId: session.user.organizationId,
                      },
                      select: {
                        id: true,
                        status: true,
                      },
                    },
                  },
                },
              },
            },
            evidenceLinks: {
              include: {
                evidence: {
                  where: {
                    organizationId: session.user.organizationId,
                  },
                  select: {
                    id: true,
                    reviewStatus: true,
                  },
                },
              },
            },
          },
        },
        riskAssessments: {
          where: {
            organizationId: session.user.organizationId,
          },
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Process compliance data for each framework
    const complianceData = frameworks.map((framework: any) => {
      const totalControls = framework.controls.length;

      // Count controls that have been assessed (linked to risks in assessments)
      const assessedControls = framework.controls.filter((control: any) => {
        return control.riskControls.some((rc: any) => rc.risk.assessment !== null);
      }).length;

      const compliancePercentage = totalControls > 0
        ? Math.round((assessedControls / totalControls) * 100)
        : 0;

      // Determine overall status
      let status = 'NOT_STARTED';
      if (compliancePercentage === 100) {
        status = 'COMPLIANT';
      } else if (compliancePercentage >= 80) {
        status = 'MOSTLY_COMPLIANT';
      } else if (compliancePercentage > 0) {
        status = 'IN_PROGRESS';
      }

      // Process control details
      const controls = framework.controls.map((control: any) => {
        const linkedRisks = control.riskControls.filter(
          (rc: any) => rc.risk.assessment !== null
        ).length;
        const evidenceCount = control.evidenceLinks.filter(
          (el: any) => el.evidence !== null
        ).length;

        let assessmentStatus = 'NOT_ASSESSED';
        if (linkedRisks > 0 && evidenceCount > 0) {
          assessmentStatus = 'FULLY_ASSESSED';
        } else if (linkedRisks > 0 || evidenceCount > 0) {
          assessmentStatus = 'PARTIALLY_ASSESSED';
        }

        return {
          id: control.id,
          code: control.code,
          title: control.title,
          description: control.description,
          assessmentStatus,
          linkedRisks,
          evidenceCount,
        };
      });

      return {
        id: framework.id,
        name: framework.name,
        shortName: framework.shortName,
        version: framework.version,
        category: framework.category,
        totalControls,
        assessedControls,
        compliancePercentage,
        status,
        totalAssessments: framework.riskAssessments.length,
        controls,
      };
    });

    const summary = {
      frameworks: complianceData,
      overallStatistics: {
        totalFrameworks: complianceData.length,
        compliantFrameworks: complianceData.filter((f: any) => f.status === 'COMPLIANT').length,
        inProgressFrameworks: complianceData.filter((f: any) => f.status === 'IN_PROGRESS' || f.status === 'MOSTLY_COMPLIANT').length,
        notStartedFrameworks: complianceData.filter((f: any) => f.status === 'NOT_STARTED').length,
      },
      generatedAt: new Date().toISOString(),
    };

    // Return CSV format
    if (format === 'csv') {
      const csvContent = convertToCSV(complianceData);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-report-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating compliance report:', error);
    return NextResponse.json(
      { error: 'Failed to generate compliance report' },
      { status: 500 }
    );
  }
}
