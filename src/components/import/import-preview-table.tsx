/**
 * Import Preview Table
 * Displays parsed CSV/Excel rows with validation status
 */

'use client';

import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportPreviewTableProps {
  rows: any[];
  errors: ValidationError[];
}

export function ImportPreviewTable({ rows, errors }: ImportPreviewTableProps) {
  const t = useTranslations('import.preview');

  // Group errors by row number
  const errorsByRow = errors.reduce((acc, error) => {
    if (!acc[error.row]) {
      acc[error.row] = [];
    }
    acc[error.row].push(error);
    return acc;
  }, {} as Record<number, ValidationError[]>);

  function getRowErrors(rowIndex: number): ValidationError[] {
    return errorsByRow[rowIndex] || [];
  }

  function isRowValid(rowIndex: number): boolean {
    return !errorsByRow[rowIndex];
  }

  return (
    <div className="border rounded-lg overflow-auto max-h-96">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">{t('row')}</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-24">Likelihood</TableHead>
            <TableHead className="w-24">Impact</TableHead>
            <TableHead className="w-32">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const rowNum = index + 1;
            const valid = isRowValid(rowNum);
            const rowErrors = getRowErrors(rowNum);

            return (
              <TableRow
                key={index}
                className={valid ? '' : 'bg-red-50 dark:bg-red-950/20'}
              >
                <TableCell className="font-mono text-sm">{rowNum}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">{row.title || '-'}</div>
                  {rowErrors.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {rowErrors.map((err, i) => (
                        <div key={i} className="text-xs text-red-600 dark:text-red-400">
                          <span className="font-medium">{err.field}:</span> {err.message}
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs px-2 py-1 rounded bg-muted">
                    {row.category || '-'}
                  </span>
                </TableCell>
                <TableCell>{row.likelihood || '-'}</TableCell>
                <TableCell>{row.impact || '-'}</TableCell>
                <TableCell>
                  {valid ? (
                    <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Invalid
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No rows to preview
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
