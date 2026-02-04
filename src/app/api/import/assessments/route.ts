import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
} from '@/lib/api-error-handler';
import {
  parseCSV,
  parseExcel,
  validateBatch,
  detectDuplicates,
  getPreview,
  ASSESSMENT_SCHEMA,
  ImportResult,
  ParsedRow,
} from '@/lib/import-parser';

/**
 * POST /api/import/assessments
 * Upload CSV/Excel file for Risk Assessments import
 * Query param: confirm=true to execute import, otherwise just validate and preview
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - only ASSESSOR, RISK_MANAGER and ADMIN can import
    const allowedRoles = ['ASSESSOR', 'RISK_MANAGER', 'ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return forbiddenError('Only Assessors, Risk Managers and Admins can import assessments');
    }

    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm') === 'true';

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return validationError('No file uploaded');
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      return validationError('Invalid file type. Only CSV and Excel files are supported');
    }

    // Read file content
    let rows: ParsedRow[] = [];

    if (fileExtension === 'csv') {
      const content = await file.text();
      rows = await parseCSV(content, ASSESSMENT_SCHEMA);
    } else {
      const buffer = await file.arrayBuffer();
      rows = await parseExcel(buffer, ASSESSMENT_SCHEMA);
    }

    if (rows.length === 0) {
      return validationError('File contains no data rows');
    }

    // Validate all rows
    const validationResults = validateBatch(rows, ASSESSMENT_SCHEMA);
    const validRows = validationResults.filter(r => r.valid);
    const errorRows = validationResults.filter(r => !r.valid);

    // Check for duplicates with existing assessments
    const existingAssessmentTitles = await prisma.riskAssessment.findMany({
      where: { organizationId: session.user.organizationId },
      select: { title: true },
    });

    const existingTitles = existingAssessmentTitles.map(a => a.title.toLowerCase());
    const duplicateErrors = detectDuplicates(rows, existingTitles);

    // If not confirming, return preview and validation results
    if (!confirm) {
      return NextResponse.json({
        valid: errorRows.length === 0 && duplicateErrors.length === 0,
        totalRows: rows.length,
        validRows: validRows.length,
        errorRows: errorRows.length,
        preview: getPreview(rows, 10),
        errors: errorRows,
        duplicates: duplicateErrors,
      });
    }

    // Execute import
    if (errorRows.length > 0 || duplicateErrors.length > 0) {
      return validationError('Cannot import: file contains validation errors or duplicates');
    }

    const result: ImportResult = {
      success: true,
      totalRows: rows.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdIds: [],
    };

    // Use transaction for bulk insert
    await prisma.$transaction(async (tx) => {
      for (const validationResult of validationResults) {
        if (!validationResult.valid || !validationResult.data) {
          continue;
        }

        try {
          const data = validationResult.data;

          // Look up AI System by name
          const aiSystem = await tx.aISystem.findFirst({
            where: {
              name: String(data.aiSystemName),
              organizationId: session.user.organizationId,
            },
          });

          if (!aiSystem) {
            result.errorCount++;
            result.errors.push({
              valid: false,
              row: validationResult.row,
              errors: [`AI System not found: ${data.aiSystemName}`],
            });
            continue;
          }

          // Look up Framework by name
          const framework = await tx.framework.findFirst({
            where: {
              name: { contains: String(data.frameworkName), mode: 'insensitive' },
              isActive: true,
            },
          });

          if (!framework) {
            result.errorCount++;
            result.errors.push({
              valid: false,
              row: validationResult.row,
              errors: [`Framework not found: ${data.frameworkName}`],
            });
            continue;
          }

          // Create assessment
          const assessment = await tx.riskAssessment.create({
            data: {
              title: String(data.title),
              description: data.description ? String(data.description) : null,
              status: String(data.status) as any,
              assessmentDate: new Date(String(data.assessmentDate)),
              nextReviewDate: data.nextReviewDate ? new Date(String(data.nextReviewDate)) : null,
              organizationId: session.user.organizationId,
              aiSystemId: aiSystem.id,
              frameworkId: framework.id,
              createdById: session.user.id,
            },
          });

          // If risk data is provided, create associated risk
          if (data.riskTitle && data.likelihood && data.impact) {
            const likelihood = Number(data.likelihood);
            const impact = Number(data.impact);
            const inherentScore = likelihood * impact;

            await tx.risk.create({
              data: {
                title: String(data.riskTitle),
                description: data.riskDescription ? String(data.riskDescription) : null,
                category: data.riskCategory ? (String(data.riskCategory) as any) : 'OTHER',
                likelihood,
                impact,
                inherentScore,
                controlEffectiveness: 0,
                residualScore: inherentScore,
                assessmentId: assessment.id,
              },
            });
          }

          result.createdIds.push(assessment.id);
          result.successCount++;
        } catch (error) {
          result.errorCount++;
          result.errors.push({
            valid: false,
            row: validationResult.row,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          });
        }
      }
    });

    result.success = result.errorCount === 0;

    return NextResponse.json(result, { status: result.success ? 201 : 207 });
  } catch (error) {
    return handleApiError(error, 'importing assessments');
  }
}
