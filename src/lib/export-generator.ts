import Papa from 'papaparse';
import * as ExcelJS from 'exceljs';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ExportColumn {
  field: string;
  label: string;
  width?: number;
  formatter?: (value: unknown) => string;
}

export type ExportFormat = 'csv' | 'xlsx';

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

export const AI_SYSTEM_EXPORT_COLUMNS: ExportColumn[] = [
  { field: 'name', label: 'Name', width: 30 },
  { field: 'description', label: 'Description', width: 50 },
  { field: 'systemType', label: 'System Type', width: 15 },
  { field: 'dataClassification', label: 'Data Classification', width: 20 },
  { field: 'lifecycleStatus', label: 'Lifecycle Status', width: 20 },
  { field: 'riskTier', label: 'Risk Tier', width: 15 },
  { field: 'purpose', label: 'Purpose', width: 40 },
  { field: 'dataInputs', label: 'Data Inputs', width: 40 },
  { field: 'dataOutputs', label: 'Data Outputs', width: 40 },
  {
    field: 'thirdPartyAPIs',
    label: 'Third Party APIs',
    width: 40,
    formatter: (value) => (Array.isArray(value) ? value.join('; ') : '')
  },
  {
    field: 'baseModels',
    label: 'Base Models',
    width: 40,
    formatter: (value) => (Array.isArray(value) ? value.join('; ') : '')
  },
  {
    field: 'trainingDataSources',
    label: 'Training Data Sources',
    width: 40,
    formatter: (value) => (Array.isArray(value) ? value.join('; ') : '')
  },
  {
    field: 'owner',
    label: 'Owner',
    width: 30,
    formatter: (value) => {
      if (value && typeof value === 'object' && 'name' in value) {
        return String(value.name || '');
      }
      return '';
    }
  },
  {
    field: 'createdAt',
    label: 'Created At',
    width: 20,
    formatter: (value) => (value ? new Date(String(value)).toISOString().split('T')[0] : '')
  },
  {
    field: 'updatedAt',
    label: 'Updated At',
    width: 20,
    formatter: (value) => (value ? new Date(String(value)).toISOString().split('T')[0] : '')
  },
];

export const ASSESSMENT_EXPORT_COLUMNS: ExportColumn[] = [
  { field: 'title', label: 'Title', width: 30 },
  { field: 'description', label: 'Description', width: 50 },
  {
    field: 'aiSystem',
    label: 'AI System',
    width: 30,
    formatter: (value) => {
      if (value && typeof value === 'object' && 'name' in value) {
        return String(value.name || '');
      }
      return '';
    }
  },
  {
    field: 'framework',
    label: 'Framework',
    width: 25,
    formatter: (value) => {
      if (value && typeof value === 'object' && 'name' in value) {
        return String(value.name || '');
      }
      return '';
    }
  },
  { field: 'status', label: 'Status', width: 15 },
  {
    field: 'assessmentDate',
    label: 'Assessment Date',
    width: 20,
    formatter: (value) => (value ? new Date(String(value)).toISOString().split('T')[0] : '')
  },
  {
    field: 'nextReviewDate',
    label: 'Next Review Date',
    width: 20,
    formatter: (value) => (value ? new Date(String(value)).toISOString().split('T')[0] : '')
  },
  {
    field: 'completedAt',
    label: 'Completed At',
    width: 20,
    formatter: (value) => (value ? new Date(String(value)).toISOString().split('T')[0] : '')
  },
  {
    field: 'createdBy',
    label: 'Created By',
    width: 30,
    formatter: (value) => {
      if (value && typeof value === 'object' && 'name' in value) {
        return String(value.name || '');
      }
      return '';
    }
  },
  {
    field: 'createdAt',
    label: 'Created At',
    width: 20,
    formatter: (value) => (value ? new Date(String(value)).toISOString().split('T')[0] : '')
  },
];

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate CSV content from data
 */
export async function generateCSV(
  data: unknown[],
  columns: ExportColumn[]
): Promise<string> {
  const rows = data.map(item => {
    const row: Record<string, string> = {};

    for (const column of columns) {
      const value = (item as Record<string, unknown>)[column.field];
      const formatted = column.formatter
        ? column.formatter(value)
        : formatValue(value);
      row[column.label] = formatted;
    }

    return row;
  });

  return Papa.unparse(rows, {
    quotes: true,
    header: true,
  });
}

/**
 * Generate Excel buffer from data
 */
export async function generateExcel(
  data: unknown[],
  columns: ExportColumn[],
  sheetName = 'Export'
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Set up columns
  worksheet.columns = columns.map(column => ({
    header: column.label,
    key: column.field,
    width: column.width || 15,
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  for (const item of data) {
    const row: Record<string, string> = {};

    for (const column of columns) {
      const value = (item as Record<string, unknown>)[column.field];
      const formatted = column.formatter
        ? column.formatter(value)
        : formatValue(value);
      row[column.field] = formatted;
    }

    worksheet.addRow(row);
  }

  // Auto-filter
  worksheet.autoFilter = {
    from: 'A1',
    to: `${String.fromCharCode(64 + columns.length)}1`,
  };

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Stream CSV content for large datasets
 * Returns a ReadableStream for efficient memory usage
 */
export function streamCSV(
  data: AsyncIterable<unknown>,
  columns: ExportColumn[]
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  // Generate header row
  const headers = columns.map(col => `"${col.label}"`).join(',') + '\n';

  return new ReadableStream({
    async start(controller) {
      // Send headers
      controller.enqueue(encoder.encode(headers));

      // Stream data rows
      for await (const item of data) {
        const values = columns.map(column => {
          const value = (item as Record<string, unknown>)[column.field];
          const formatted = column.formatter
            ? column.formatter(value)
            : formatValue(value);
          return `"${String(formatted).replace(/"/g, '""')}"`;
        });

        const row = values.join(',') + '\n';
        controller.enqueue(encoder.encode(row));
      }

      controller.close();
    },
  });
}

/**
 * Stream Excel content for large datasets
 * Uses ExcelJS streaming for efficient memory usage
 */
export async function* streamExcel(
  data: AsyncIterable<unknown>,
  columns: ExportColumn[]
): AsyncGenerator<Buffer> {
  const { PassThrough } = await import('stream');
  const passThrough = new PassThrough();

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    useStyles: true,
    useSharedStrings: true,
    stream: passThrough,
  });

  const worksheet = workbook.addWorksheet('Export');

  // Set up columns
  worksheet.columns = columns.map(column => ({
    header: column.label,
    key: column.field,
    width: column.width || 15,
  }));

  // Add data rows
  for await (const item of data) {
    const row: Record<string, string> = {};

    for (const column of columns) {
      const value = (item as Record<string, unknown>)[column.field];
      const formatted = column.formatter
        ? column.formatter(value)
        : formatValue(value);
      row[column.field] = formatted;
    }

    worksheet.addRow(row).commit();
  }

  worksheet.commit();
  await workbook.commit();

  // Yield buffered data from the passthrough stream
  for await (const chunk of passThrough) {
    yield chunk as Buffer;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Sanitize a string to prevent CSV injection attacks
 * Prefixes dangerous characters with a single quote to neutralize formulas
 */
function sanitizeCsvValue(value: string): string {
  // CSV injection: formulas starting with =, +, -, @, tab, or carriage return
  // can execute arbitrary code in spreadsheet applications
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r', '\n'];
  if (dangerousChars.some((char) => value.startsWith(char))) {
    return `'${value}`; // Prefix with single quote to neutralize
  }
  return value;
}

/**
 * Format a value for export
 * Includes CSV injection protection for string values
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    const joined = value.join('; ');
    return sanitizeCsvValue(joined);
  }

  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'object') {
    const json = JSON.stringify(value);
    return sanitizeCsvValue(json);
  }

  const stringValue = String(value);
  return sanitizeCsvValue(stringValue);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  prefix: string,
  format: ExportFormat
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}.${format}`;
}

/**
 * Get MIME type for export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}
