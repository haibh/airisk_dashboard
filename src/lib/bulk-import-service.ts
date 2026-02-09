/**
 * Bulk import service for CSV/Excel file parsing and validation
 * Handles risk and AI system imports with detailed error reporting
 */

import ExcelJS from 'exceljs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { RiskCategory, LifecycleStatus, DataClassification } from '@prisma/client';

export interface ImportRow {
  rowNumber: number;
  data: Record<string, unknown>;
  errors: string[];
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: ImportRow[];
}

// Risk import schema
const riskImportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  category: z.nativeEnum(RiskCategory, { message: 'Invalid risk category' }),
  likelihood: z.coerce.number().int().min(1, 'Likelihood must be 1-5').max(5, 'Likelihood must be 1-5'),
  impact: z.coerce.number().int().min(1, 'Impact must be 1-5').max(5, 'Impact must be 1-5'),
  controlEffectiveness: z.coerce.number().min(0).max(100).optional().default(0),
  treatmentPlan: z.string().optional().nullable(),
});

type RiskImportInput = z.infer<typeof riskImportSchema>;

// AI System import schema (using AISystemType enum from Prisma)
import { AISystemType } from '@prisma/client';

const aiSystemImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().default(''),
  systemType: z.nativeEnum(AISystemType).optional().default(AISystemType.OTHER),
  status: z.nativeEnum(LifecycleStatus).optional().default(LifecycleStatus.DEVELOPMENT),
  dataClassification: z.nativeEnum(DataClassification).optional().default(DataClassification.INTERNAL),
  purpose: z.string().optional().nullable(),
});

type AISystemImportInput = z.infer<typeof aiSystemImportSchema>;

/**
 * Parse Excel file from buffer
 */
export async function parseExcelFile(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('No worksheet found in Excel file');

  const headers: string[] = [];
  const rows: Record<string, unknown>[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Header row
      row.eachCell((cell) => headers.push(String(cell.value || '').trim()));
      return;
    }

    const rowData: Record<string, unknown> = {};
    row.eachCell((cell, colNumber) => {
      if (headers[colNumber - 1]) {
        rowData[headers[colNumber - 1]] = cell.value;
      }
    });

    // Only add rows with at least one non-empty value
    if (Object.values(rowData).some((v) => v !== null && v !== undefined && v !== '')) {
      rows.push(rowData);
    }
  });

  return rows;
}

/**
 * Parse CSV file from buffer
 */
export async function parseCsvFile(buffer: Buffer): Promise<Record<string, unknown>[]> {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n').filter((l) => l.trim());

  if (lines.length < 2) {
    throw new Error('CSV must have header row and at least one data row');
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, unknown> = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    // Only add rows with at least one non-empty value
    if (Object.values(row).some((v) => v !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Validate and import risks from parsed rows
 */
export async function validateAndImportRisks(
  rows: Record<string, unknown>[],
  orgId: string,
  assessmentId: string,
  dryRun: boolean
): Promise<ImportResult> {
  const errors: ImportRow[] = [];
  const validRows: RiskImportInput[] = [];

  // Validate all rows
  rows.forEach((row, index) => {
    const result = riskImportSchema.safeParse(row);
    if (!result.success) {
      errors.push({
        rowNumber: index + 2, // +2 because Excel is 1-indexed and we have a header
        data: row,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    } else {
      validRows.push(result.data);
    }
  });

  if (dryRun) {
    return {
      total: rows.length,
      imported: 0,
      skipped: errors.length,
      errors,
    };
  }

  // Import valid rows in chunks
  let imported = 0;
  const chunkSize = 100;

  for (let i = 0; i < validRows.length; i += chunkSize) {
    const chunk = validRows.slice(i, i + chunkSize);

    await prisma.$transaction(async (tx) => {
      for (const risk of chunk) {
        const inherentScore = risk.likelihood * risk.impact;
        const residualScore = inherentScore * (1 - risk.controlEffectiveness / 100);

        await tx.risk.create({
          data: {
            title: risk.title,
            description: risk.description || null,
            category: risk.category,
            likelihood: risk.likelihood,
            impact: risk.impact,
            inherentScore,
            controlEffectiveness: risk.controlEffectiveness,
            residualScore,
            treatmentPlan: risk.treatmentPlan || null,
            assessmentId,
          },
        });
        imported++;
      }
    });
  }

  return {
    total: rows.length,
    imported,
    skipped: errors.length,
    errors,
  };
}

/**
 * Validate and import AI systems from parsed rows
 */
export async function validateAndImportAISystems(
  rows: Record<string, unknown>[],
  orgId: string,
  ownerId: string,
  dryRun: boolean
): Promise<ImportResult> {
  const errors: ImportRow[] = [];
  const validRows: AISystemImportInput[] = [];

  // Validate all rows
  rows.forEach((row, index) => {
    const result = aiSystemImportSchema.safeParse(row);
    if (!result.success) {
      errors.push({
        rowNumber: index + 2,
        data: row,
        errors: result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`),
      });
    } else {
      validRows.push(result.data);
    }
  });

  if (dryRun) {
    return {
      total: rows.length,
      imported: 0,
      skipped: errors.length,
      errors,
    };
  }

  // Import valid rows in chunks
  let imported = 0;
  const chunkSize = 100;

  for (let i = 0; i < validRows.length; i += chunkSize) {
    const chunk = validRows.slice(i, i + chunkSize);

    await prisma.$transaction(async (tx) => {
      for (const system of chunk) {
        await tx.aISystem.create({
          data: {
            name: system.name,
            description: system.description || null,
            systemType: system.systemType as AISystemType,
            lifecycleStatus: system.status,
            dataClassification: system.dataClassification,
            purpose: system.purpose || null,
            organizationId: orgId,
            ownerId,
          },
        });
        imported++;
      }
    });
  }

  return {
    total: rows.length,
    imported,
    skipped: errors.length,
    errors,
  };
}

/**
 * Generate import template Excel file
 */
export async function generateImportTemplate(entityType: 'risks' | 'ai-systems'): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Import Data');
  const notesSheet = workbook.addWorksheet('Validation Notes');

  if (entityType === 'risks') {
    // Risk template headers
    sheet.columns = [
      { header: 'title', key: 'title', width: 30 },
      { header: 'description', key: 'description', width: 40 },
      { header: 'category', key: 'category', width: 20 },
      { header: 'likelihood', key: 'likelihood', width: 12 },
      { header: 'impact', key: 'impact', width: 12 },
      { header: 'controlEffectiveness', key: 'controlEffectiveness', width: 20 },
      { header: 'treatmentPlan', key: 'treatmentPlan', width: 40 },
    ];

    // Example row
    sheet.addRow({
      title: 'Bias in model predictions',
      description: 'Model shows demographic bias in loan approval decisions',
      category: 'BIAS_FAIRNESS',
      likelihood: 4,
      impact: 5,
      controlEffectiveness: 30,
      treatmentPlan: 'Implement fairness constraints and regular bias testing',
    });

    // Validation notes
    notesSheet.addRow(['Field', 'Type', 'Required', 'Valid Values']);
    notesSheet.addRow(['title', 'Text', 'Yes', 'Any text']);
    notesSheet.addRow(['description', 'Text', 'No', 'Any text']);
    notesSheet.addRow([
      'category',
      'Enum',
      'Yes',
      'BIAS_FAIRNESS, PRIVACY, SECURITY, RELIABILITY, TRANSPARENCY, ACCOUNTABILITY, SAFETY, OTHER',
    ]);
    notesSheet.addRow(['likelihood', 'Number', 'Yes', '1-5']);
    notesSheet.addRow(['impact', 'Number', 'Yes', '1-5']);
    notesSheet.addRow(['controlEffectiveness', 'Number', 'No', '0-100 (percentage)']);
    notesSheet.addRow(['treatmentPlan', 'Text', 'No', 'Any text']);
  } else {
    // AI System template headers
    sheet.columns = [
      { header: 'name', key: 'name', width: 30 },
      { header: 'description', key: 'description', width: 40 },
      { header: 'systemType', key: 'systemType', width: 20 },
      { header: 'status', key: 'status', width: 15 },
      { header: 'dataClassification', key: 'dataClassification', width: 20 },
      { header: 'purpose', key: 'purpose', width: 40 },
    ];

    // Example row
    sheet.addRow({
      name: 'Customer Service Chatbot',
      description: 'AI-powered chatbot for customer support',
      systemType: 'NLP',
      status: 'PRODUCTION',
      dataClassification: 'CONFIDENTIAL',
      purpose: 'Automate tier-1 customer support inquiries',
    });

    // Validation notes
    notesSheet.addRow(['Field', 'Type', 'Required', 'Valid Values']);
    notesSheet.addRow(['name', 'Text', 'Yes', 'Any text']);
    notesSheet.addRow(['description', 'Text', 'No', 'Any text']);
    notesSheet.addRow(['systemType', 'Text', 'No', 'Any text (e.g., NLP, COMPUTER_VISION)']);
    notesSheet.addRow(['status', 'Enum', 'No', 'DEVELOPMENT, PILOT, PRODUCTION, RETIRED (default: DEVELOPMENT)']);
    notesSheet.addRow([
      'dataClassification',
      'Enum',
      'No',
      'PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED (default: INTERNAL)',
    ]);
    notesSheet.addRow(['purpose', 'Text', 'No', 'Any text']);
  }

  return (await workbook.xlsx.writeBuffer()) as any as Buffer;
}
