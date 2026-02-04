/**
 * GET /api/gap-analysis/export - Export gap analysis results
 * Requires ASSESSOR+ role
 * Supports CSV format (PDF is future enhancement)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { runGapAnalysis } from '@/lib/gap-analysis-engine';

/**
 * Convert gap analysis to CSV format
 */
function generateCSV(data: Awaited<ReturnType<typeof runGapAnalysis>>): string {
  const lines: string[] = [];

  // Header
  lines.push('Framework,Control Code,Control Title,Compliance Status,Has Assessment,Has Evidence,Mapped Controls Count');

  // Gap rows
  for (const gap of data.gaps) {
    const row = [
      escapeCSV(gap.frameworkName),
      escapeCSV(gap.controlCode),
      escapeCSV(gap.controlTitle),
      gap.complianceStatus,
      gap.hasAssessment ? 'Yes' : 'No',
      gap.hasEvidence ? 'Yes' : 'No',
      gap.mappedControls.length.toString(),
    ];
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - ASSESSOR or higher
    if (!hasMinimumRole(session.user.role, 'ASSESSOR')) {
      return forbiddenError('Assessor role or higher required');
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const frameworksParam = searchParams.get('frameworks');
    const format = searchParams.get('format') || 'csv';

    if (!frameworksParam || frameworksParam.trim() === '') {
      return validationError('frameworks parameter is required');
    }

    const frameworkIds = frameworksParam.split(',').filter(Boolean);

    if (frameworkIds.length === 0) {
      return validationError('At least one framework ID is required');
    }

    if (frameworkIds.length > 10) {
      return validationError('Maximum 10 frameworks allowed');
    }

    // Validate format
    if (format !== 'csv' && format !== 'pdf') {
      return validationError('format must be csv or pdf');
    }

    // PDF support is future enhancement
    if (format === 'pdf') {
      return NextResponse.json(
        {
          error: 'PDF export not yet implemented',
          errorId: 'NOT_IMPLEMENTED',
        },
        { status: 501 }
      );
    }

    // Run gap analysis
    const result = await runGapAnalysis(session.user.organizationId, frameworkIds);

    // Generate CSV
    const csv = generateCSV(result);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `gap-analysis-${timestamp}.csv`;

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleApiError(error, 'exporting gap analysis');
  }
}
