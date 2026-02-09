import ExcelJS from 'exceljs';

/**
 * Apply header row styling (bold, blue background, white text)
 */
function applyHeaderStyle(row: ExcelJS.Row): void {
  row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  row.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  row.alignment = { vertical: 'middle', horizontal: 'center' };
  row.height = 25;
}

/**
 * Apply alternating row colors for better readability
 */
function applyAlternatingRows(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number
): void {
  for (let i = startRow; i <= endRow; i++) {
    if (i % 2 === 0) {
      sheet.getRow(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' },
      };
    }
  }
}

/**
 * Auto-fit column widths based on content
 */
function autoFitColumns(sheet: ExcelJS.Worksheet): void {
  sheet.columns.forEach((column) => {
    if (!column.values) return;
    let maxLength = 0;
    column.values.forEach((value) => {
      const length = value ? String(value).length : 0;
      if (length > maxLength) maxLength = length;
    });
    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
  });
}

interface AuditLogRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  oldValues?: unknown;
  newValues?: unknown;
  user: {
    name: string | null;
    email: string;
  };
}

/**
 * Generate audit log export as CSV
 * @param logs - Array of audit log records with user info
 * @param organizationName - Organization name for header
 * @returns Buffer containing CSV data
 */
export async function generateAuditLogCSV(
  logs: AuditLogRecord[],
  organizationName: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIRM-IP';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Audit Log');

  // Title
  sheet.addRow(['AIRM-IP Audit Log Export']);
  sheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
  sheet.addRow([`Organization: ${organizationName}`]);
  sheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  sheet.addRow([]);

  // Header row
  const headerRow = sheet.addRow([
    'Date',
    'User',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'Details',
  ]);
  applyHeaderStyle(headerRow);

  // Data rows
  const startRow = sheet.rowCount + 1;

  logs.forEach((log) => {
    let details = '';
    try {
      if (log.newValues && typeof log.newValues === 'object') {
        const keys = Object.keys(log.newValues).slice(0, 3); // First 3 fields only
        details = keys.map((k) => `${k}:${(log.newValues as Record<string, unknown>)[k]}`).join(', ');
      }
    } catch {
      details = '';
    }

    sheet.addRow([
      new Date(log.createdAt).toLocaleString(),
      log.user.name || log.user.email,
      log.action,
      log.entityType,
      log.entityId,
      log.ipAddress || '',
      details,
    ]);
  });

  const endRow = sheet.rowCount;
  applyAlternatingRows(sheet, startRow, endRow);

  // Add auto-filter
  if (logs.length > 0) {
    sheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: endRow, column: 7 },
    };
  }

  autoFitColumns(sheet);

  // Export as CSV
  const buffer = await workbook.csv.writeBuffer();
  return Buffer.from(buffer);
}
