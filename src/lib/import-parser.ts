import Papa from 'papaparse';
import * as ExcelJS from 'exceljs';
import { z } from 'zod';
import {
  AISystemType,
  DataClassification,
  LifecycleStatus,
  RiskTier,
  AssessmentStatus,
  RiskCategory
} from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ImportSchema {
  entityType: 'ai-system' | 'assessment';
  columns: ColumnDefinition[];
  requiredFields: string[];
}

export interface ColumnDefinition {
  field: string;
  label: string;
  type: 'string' | 'enum' | 'date' | 'number' | 'array';
  required: boolean;
  enumValues?: string[];
  arrayDelimiter?: string;
  validation?: z.ZodType;
}

export interface ParsedRow {
  [key: string]: unknown;
}

export interface ImportValidationResult {
  valid: boolean;
  row: number;
  errors: string[];
  data?: Record<string, unknown>;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportValidationResult[];
  createdIds: string[];
}

// ============================================================================
// SCHEMAS
// ============================================================================

export const AI_SYSTEM_SCHEMA: ImportSchema = {
  entityType: 'ai-system',
  columns: [
    { field: 'name', label: 'Name', type: 'string', required: true },
    { field: 'description', label: 'Description', type: 'string', required: false },
    {
      field: 'systemType',
      label: 'System Type',
      type: 'enum',
      required: true,
      enumValues: Object.values(AISystemType)
    },
    {
      field: 'dataClassification',
      label: 'Data Classification',
      type: 'enum',
      required: true,
      enumValues: Object.values(DataClassification)
    },
    {
      field: 'lifecycleStatus',
      label: 'Lifecycle Status',
      type: 'enum',
      required: true,
      enumValues: Object.values(LifecycleStatus)
    },
    {
      field: 'riskTier',
      label: 'Risk Tier',
      type: 'enum',
      required: false,
      enumValues: Object.values(RiskTier)
    },
    { field: 'purpose', label: 'Purpose', type: 'string', required: false },
    { field: 'dataInputs', label: 'Data Inputs', type: 'string', required: false },
    { field: 'dataOutputs', label: 'Data Outputs', type: 'string', required: false },
    {
      field: 'thirdPartyAPIs',
      label: 'Third Party APIs',
      type: 'array',
      required: false,
      arrayDelimiter: ';'
    },
    {
      field: 'baseModels',
      label: 'Base Models',
      type: 'array',
      required: false,
      arrayDelimiter: ';'
    },
    {
      field: 'trainingDataSources',
      label: 'Training Data Sources',
      type: 'array',
      required: false,
      arrayDelimiter: ';'
    },
  ],
  requiredFields: ['name', 'systemType', 'dataClassification', 'lifecycleStatus'],
};

export const ASSESSMENT_SCHEMA: ImportSchema = {
  entityType: 'assessment',
  columns: [
    { field: 'title', label: 'Title', type: 'string', required: true },
    { field: 'description', label: 'Description', type: 'string', required: false },
    { field: 'aiSystemName', label: 'AI System Name', type: 'string', required: true },
    { field: 'frameworkName', label: 'Framework', type: 'string', required: true },
    {
      field: 'status',
      label: 'Status',
      type: 'enum',
      required: true,
      enumValues: Object.values(AssessmentStatus)
    },
    { field: 'assessmentDate', label: 'Assessment Date', type: 'date', required: true },
    { field: 'nextReviewDate', label: 'Next Review Date', type: 'date', required: false },
    { field: 'riskTitle', label: 'Risk Title', type: 'string', required: false },
    { field: 'riskDescription', label: 'Risk Description', type: 'string', required: false },
    {
      field: 'riskCategory',
      label: 'Risk Category',
      type: 'enum',
      required: false,
      enumValues: Object.values(RiskCategory)
    },
    { field: 'likelihood', label: 'Likelihood (1-5)', type: 'number', required: false },
    { field: 'impact', label: 'Impact (1-5)', type: 'number', required: false },
  ],
  requiredFields: ['title', 'aiSystemName', 'frameworkName', 'status', 'assessmentDate'],
};

// ============================================================================
// PARSERS
// ============================================================================

/**
 * Parse CSV content
 */
export async function parseCSV(
  content: string,
  schema: ImportSchema
): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Map column labels to field names
        const column = schema.columns.find(
          col => col.label.toLowerCase() === header.toLowerCase().trim()
        );
        return column?.field || header;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data as ParsedRow[]);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

/**
 * Parse Excel file
 */
export async function parseExcel(
  buffer: ArrayBuffer,
  schema: ImportSchema
): Promise<ParsedRow[]> {
  const workbook = new ExcelJS.Workbook();
  // ExcelJS accepts Buffer - cast to any to bypass type check
  await workbook.xlsx.load(Buffer.from(buffer) as any);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('Excel file has no worksheets');
  }

  const rows: ParsedRow[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Parse header row
      row.eachCell((cell) => {
        const headerValue = cell.value?.toString() || '';
        const column = schema.columns.find(
          col => col.label.toLowerCase() === headerValue.toLowerCase().trim()
        );
        headers.push(column?.field || headerValue);
      });
    } else {
      // Parse data rows
      const rowData: ParsedRow = {};
      row.eachCell((cell, colNumber) => {
        const field = headers[colNumber - 1];
        if (field) {
          rowData[field] = cell.value;
        }
      });
      if (Object.keys(rowData).length > 0) {
        rows.push(rowData);
      }
    }
  });

  return rows;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a single row against schema
 */
export function validateRow(
  row: ParsedRow,
  schema: ImportSchema,
  rowNum: number
): ImportValidationResult {
  const errors: string[] = [];
  const validatedData: Record<string, unknown> = {};

  for (const column of schema.columns) {
    const value = row[column.field];

    // Check required fields
    if (column.required && (value === undefined || value === null || value === '')) {
      errors.push(`Missing required field: ${column.label}`);
      continue;
    }

    // Skip validation if field is optional and empty
    if (!value) {
      continue;
    }

    // Type-specific validation
    try {
      switch (column.type) {
        case 'string':
          validatedData[column.field] = String(value);
          break;

        case 'number': {
          const num = Number(value);
          if (isNaN(num)) {
            errors.push(`${column.label} must be a number`);
          } else {
            validatedData[column.field] = num;
          }
          break;
        }

        case 'date': {
          const date = new Date(String(value));
          if (isNaN(date.getTime())) {
            errors.push(`${column.label} must be a valid date`);
          } else {
            validatedData[column.field] = date.toISOString();
          }
          break;
        }

        case 'enum': {
          const strValue = String(value).toUpperCase();
          if (column.enumValues && !column.enumValues.includes(strValue)) {
            errors.push(
              `${column.label} must be one of: ${column.enumValues.join(', ')}`
            );
          } else {
            validatedData[column.field] = strValue;
          }
          break;
        }

        case 'array': {
          const delimiter = column.arrayDelimiter || ',';
          const arrayValue = String(value)
            .split(delimiter)
            .map(v => v.trim())
            .filter(v => v.length > 0);
          validatedData[column.field] = arrayValue;
          break;
        }
      }
    } catch (error) {
      errors.push(`Invalid value for ${column.label}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    valid: errors.length === 0,
    row: rowNum,
    errors,
    data: errors.length === 0 ? validatedData : undefined,
  };
}

/**
 * Detect duplicate entries based on unique fields
 */
export function detectDuplicates(
  rows: ParsedRow[],
  existingData: string[]
): string[] {
  const duplicates: string[] = [];
  const seen = new Set<string>(existingData);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const key = String(row.name || row.title || `row-${i}`).toLowerCase();

    if (seen.has(key)) {
      duplicates.push(`Row ${i + 2}: Duplicate entry "${key}"`);
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

/**
 * Validate all rows in a batch
 */
export function validateBatch(
  rows: ParsedRow[],
  schema: ImportSchema
): ImportValidationResult[] {
  return rows.map((row, index) => validateRow(row, schema, index + 2)); // +2 because row 1 is headers, Excel is 1-indexed
}

/**
 * Get preview of first N rows
 */
export function getPreview(rows: ParsedRow[], limit = 10): ParsedRow[] {
  return rows.slice(0, limit);
}
