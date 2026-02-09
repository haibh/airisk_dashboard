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

/**
 * Generate compliance report Excel workbook
 */
export async function generateComplianceExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIRM-IP';
  workbook.created = new Date();

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow(['AIRM-IP Compliance Report']);
  summarySheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
  summarySheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  summarySheet.addRow([]);

  // Key metrics
  summarySheet.addRow(['Key Metrics']);
  applyHeaderStyle(summarySheet.getRow(4));
  summarySheet.addRow(['Total Frameworks', data.totalFrameworks || 0]);
  summarySheet.addRow(['Total Controls', data.totalControls || 0]);
  summarySheet.addRow(['Implemented Controls', data.implementedControls || 0]);
  summarySheet.addRow(['Average Coverage', `${(data.averageCoverage || 0).toFixed(1)}%`]);
  summarySheet.addRow(['Critical Risks', data.criticalRisks || 0]);
  summarySheet.addRow(['High Risks', data.highRisks || 0]);

  autoFitColumns(summarySheet);

  // Per-framework sheets
  if (data.frameworks && Array.isArray(data.frameworks)) {
    data.frameworks.forEach((framework: any) => {
      const sheet = workbook.addWorksheet(
        framework.name.substring(0, 31) // Excel sheet name limit
      );

      // Header
      sheet.addRow(['Framework', framework.name]);
      sheet.addRow(['Total Controls', framework.totalControls || 0]);
      sheet.addRow(['Implemented', framework.implementedControls || 0]);
      sheet.addRow(['Coverage', `${(framework.coverage || 0).toFixed(1)}%`]);
      sheet.addRow([]);

      // Controls table
      const headerRow = sheet.addRow([
        'Control ID',
        'Title',
        'Status',
        'Implementation Date',
        'Owner',
      ]);
      applyHeaderStyle(headerRow);

      if (framework.controls && Array.isArray(framework.controls)) {
        const startRow = sheet.rowCount + 1;
        framework.controls.forEach((control: any) => {
          sheet.addRow([
            control.controlId || '',
            control.title || '',
            control.status || 'NOT_IMPLEMENTED',
            control.implementedAt
              ? new Date(control.implementedAt).toLocaleDateString()
              : '',
            control.owner || '',
          ]);
        });
        const endRow = sheet.rowCount;
        applyAlternatingRows(sheet, startRow, endRow);
      }

      autoFitColumns(sheet);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate risk register Excel workbook
 */
export async function generateRiskRegisterExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIRM-IP';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Risk Register');

  // Title
  sheet.addRow(['AIRM-IP Risk Register']);
  sheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
  sheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  sheet.addRow([]);

  // Header row
  const headerRow = sheet.addRow([
    'Risk ID',
    'Title',
    'Category',
    'Likelihood',
    'Impact',
    'Inherent Score',
    'Residual Score',
    'Severity',
    'Treatment Status',
    'AI System',
    'Framework',
  ]);
  applyHeaderStyle(headerRow);

  // Data rows
  if (data.risks && Array.isArray(data.risks)) {
    const startRow = sheet.rowCount + 1;

    data.risks.forEach((risk: any) => {
      const row = sheet.addRow([
        risk.id || '',
        risk.title || '',
        risk.category || '',
        risk.likelihood || 0,
        risk.impact || 0,
        risk.inherentScore || 0,
        risk.residualScore || 0,
        risk.severity || '',
        risk.treatmentStatus || '',
        risk.aiSystemName || '',
        risk.frameworkName || '',
      ]);

      // Conditional formatting based on severity
      const severityCell = row.getCell(8);
      switch (risk.severity) {
        case 'CRITICAL':
          severityCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFDC2626' },
          };
          severityCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          break;
        case 'HIGH':
          severityCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEA580C' },
          };
          severityCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          break;
        case 'MEDIUM':
          severityCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFBBF24' },
          };
          break;
      }
    });

    const endRow = sheet.rowCount;
    applyAlternatingRows(sheet, startRow, endRow);
  }

  // Add auto-filter
  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: sheet.rowCount, column: 11 },
  };

  autoFitColumns(sheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate assessment report Excel workbook
 */
export async function generateAssessmentExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIRM-IP';
  workbook.created = new Date();

  // Overview sheet
  const overviewSheet = workbook.addWorksheet('Overview');
  overviewSheet.addRow(['AIRM-IP Assessment Report']);
  overviewSheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
  overviewSheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  overviewSheet.addRow([]);

  overviewSheet.addRow(['Assessment Details']);
  applyHeaderStyle(overviewSheet.getRow(4));
  overviewSheet.addRow(['Assessment ID', data.id || '']);
  overviewSheet.addRow(['Framework', data.frameworkName || '']);
  overviewSheet.addRow(['AI System', data.aiSystemName || '']);
  overviewSheet.addRow(['Status', data.status || '']);
  overviewSheet.addRow(['Completed At', data.completedAt || '']);
  overviewSheet.addRow(['Overall Risk Score', data.overallRiskScore || 0]);

  autoFitColumns(overviewSheet);

  // Risk matrix sheet
  const matrixSheet = workbook.addWorksheet('Risk Matrix');
  const matrixHeader = matrixSheet.addRow([
    'Risk ID',
    'Title',
    'Likelihood',
    'Impact',
    'Score',
    'Severity',
  ]);
  applyHeaderStyle(matrixHeader);

  if (data.risks && Array.isArray(data.risks)) {
    const startRow = matrixSheet.rowCount + 1;
    data.risks.forEach((risk: any) => {
      matrixSheet.addRow([
        risk.id || '',
        risk.title || '',
        risk.likelihood || 0,
        risk.impact || 0,
        risk.inherentScore || 0,
        risk.severity || '',
      ]);
    });
    applyAlternatingRows(matrixSheet, startRow, matrixSheet.rowCount);
  }

  autoFitColumns(matrixSheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate activity log Excel workbook
 */
export async function generateActivityLogExcel(data: any): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIRM-IP';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Activity Log');

  // Title
  sheet.addRow(['AIRM-IP Activity Log']);
  sheet.getRow(1).font = { size: 16, bold: true, color: { argb: 'FF1E40AF' } };
  sheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  sheet.addRow([]);

  // Header row
  const headerRow = sheet.addRow([
    'Timestamp',
    'User',
    'Action',
    'Entity Type',
    'Entity ID',
    'IP Address',
    'Details',
  ]);
  applyHeaderStyle(headerRow);

  // Data rows
  if (data.logs && Array.isArray(data.logs)) {
    const startRow = sheet.rowCount + 1;

    data.logs.forEach((log: any) => {
      sheet.addRow([
        new Date(log.timestamp).toLocaleString(),
        log.userName || '',
        log.action || '',
        log.entityType || '',
        log.entityId || '',
        log.ipAddress || '',
        JSON.stringify(log.details || {}),
      ]);
    });

    const endRow = sheet.rowCount;
    applyAlternatingRows(sheet, startRow, endRow);
  }

  // Add auto-filter
  sheet.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: sheet.rowCount, column: 7 },
  };

  autoFitColumns(sheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
