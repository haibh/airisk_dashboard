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
  AI_SYSTEM_SCHEMA,
  ImportResult,
  ImportValidationResult,
  ParsedRow,
} from '@/lib/import-parser';

/**
 * POST /api/import/ai-systems
 * Upload CSV/Excel file for AI Systems import
 * Query param: confirm=true to execute import, otherwise just validate and preview
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check role - only RISK_MANAGER and ADMIN can import
    const allowedRoles = ['RISK_MANAGER', 'ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return forbiddenError('Only Risk Managers and Admins can import AI systems');
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
      rows = await parseCSV(content, AI_SYSTEM_SCHEMA);
    } else {
      const buffer = await file.arrayBuffer();
      rows = await parseExcel(buffer, AI_SYSTEM_SCHEMA);
    }

    if (rows.length === 0) {
      return validationError('File contains no data rows');
    }

    // Validate all rows
    const validationResults = validateBatch(rows, AI_SYSTEM_SCHEMA);
    const validRows = validationResults.filter(r => r.valid);
    const errorRows = validationResults.filter(r => !r.valid);

    // Check for duplicates with existing systems
    const existingSystemNames = await prisma.aISystem.findMany({
      where: { organizationId: session.user.organizationId },
      select: { name: true },
    });

    const existingNames = existingSystemNames.map(s => s.name.toLowerCase());
    const duplicateErrors = detectDuplicates(rows, existingNames);

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

          const aiSystem = await tx.aISystem.create({
            data: {
              name: String(data.name),
              description: data.description ? String(data.description) : null,
              systemType: String(data.systemType) as any,
              dataClassification: String(data.dataClassification) as any,
              lifecycleStatus: String(data.lifecycleStatus) as any,
              riskTier: data.riskTier ? (String(data.riskTier) as any) : null,
              purpose: data.purpose ? String(data.purpose) : null,
              dataInputs: data.dataInputs ? String(data.dataInputs) : null,
              dataOutputs: data.dataOutputs ? String(data.dataOutputs) : null,
              thirdPartyAPIs: Array.isArray(data.thirdPartyAPIs) ? data.thirdPartyAPIs as string[] : [],
              baseModels: Array.isArray(data.baseModels) ? data.baseModels as string[] : [],
              trainingDataSources: Array.isArray(data.trainingDataSources)
                ? data.trainingDataSources as string[]
                : [],
              organizationId: session.user.organizationId,
              ownerId: session.user.id,
            },
          });

          result.createdIds.push(aiSystem.id);
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
    return handleApiError(error, 'importing AI systems');
  }
}
