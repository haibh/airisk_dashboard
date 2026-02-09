/**
 * POST /api/import/risks
 * Bulk import risks from CSV/Excel file
 * Requires RISK_MANAGER+ role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { parseExcelFile, parseCsvFile, validateAndImportRisks } from '@/lib/bulk-import-service';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();

    if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
      return forbiddenError('Risk Manager role required for bulk import');
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const assessmentId = formData.get('assessmentId') as string | null;
    const dryRun = formData.get('dryRun') === 'true';

    if (!file) {
      return validationError('File is required');
    }

    if (!assessmentId) {
      return validationError('assessmentId is required');
    }

    // Verify assessment exists and belongs to user's org
    const assessment = await prisma.riskAssessment.findUnique({
      where: { id: assessmentId },
      select: { organizationId: true },
    });

    if (!assessment) {
      return validationError('Assessment not found');
    }

    if (assessment.organizationId !== session.user.organizationId) {
      return forbiddenError('Assessment does not belong to your organization');
    }

    // Parse file based on type
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: Record<string, unknown>[];

    try {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        rows = await parseCsvFile(buffer);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx')
      ) {
        rows = await parseExcelFile(buffer);
      } else {
        return validationError('Unsupported file type. Please upload CSV or XLSX file.');
      }
    } catch (error) {
      return validationError(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (rows.length === 0) {
      return validationError('No data rows found in file');
    }

    // Validate and import
    const result = await validateAndImportRisks(rows, session.user.organizationId, assessmentId, dryRun);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, 'importing risks');
  }
}
