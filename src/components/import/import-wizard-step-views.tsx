/**
 * Import Wizard Step Views
 * Visual step content for the bulk import wizard: Upload, Preview, Result
 */

'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import { ImportPreviewTable } from './import-preview-table';

interface Assessment {
  id: string;
  title: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface DryRunResponse {
  dryRun: true;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  preview: any[];
}

export interface ImportResponse {
  dryRun: false;
  totalRows: number;
  imported: number;
  failed: number;
  errors: ValidationError[];
}

// --- Upload Step ---
interface UploadStepProps {
  file: File | null;
  assessmentId: string;
  assessments: Assessment[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onAssessmentChange: (value: string) => void;
  t: (key: string) => string;
}

export function ImportUploadStep({
  file, assessmentId, assessments,
  onFileSelect, onDragOver, onDrop, onAssessmentChange, t,
}: UploadStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          {t('selectAssessment')}
        </label>
        <Select value={assessmentId} onValueChange={onAssessmentChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('assessmentPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {assessments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx"
          onChange={onFileSelect}
          className="hidden"
        />
        {file ? (
          <div className="space-y-2">
            <FileSpreadsheet className="h-12 w-12 mx-auto text-primary" />
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="font-medium">{t('dragDrop')}</p>
            <p className="text-sm text-muted-foreground">{t('supportedFormats')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Preview Step ---
interface PreviewStepProps {
  previewData: DryRunResponse;
  t: (key: string) => string;
}

export function ImportPreviewStep({ previewData, t }: PreviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <p className="text-2xl font-bold">{previewData.totalRows}</p>
          <p className="text-sm text-muted-foreground">{t('preview.totalRows')}</p>
        </div>
        <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {previewData.validRows}
          </p>
          <p className="text-sm text-muted-foreground">{t('preview.validRows')}</p>
        </div>
        <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-950">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {previewData.invalidRows}
          </p>
          <p className="text-sm text-muted-foreground">{t('preview.invalidRows')}</p>
        </div>
      </div>

      <ImportPreviewTable rows={previewData.preview} errors={previewData.errors} />
    </div>
  );
}

// --- Result Step ---
interface ResultStepProps {
  importResult: ImportResponse;
  t: (key: string) => string;
}

export function ImportResultStep({ importResult, t }: ResultStepProps) {
  return (
    <div className="space-y-4 text-center py-8">
      <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
      <h3 className="text-2xl font-bold">{t('result.title')}</h3>
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {importResult.imported}
          </p>
          <p className="text-sm text-muted-foreground">{t('result.imported')}</p>
        </div>
        {importResult.failed > 0 && (
          <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-950">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {importResult.failed}
            </p>
            <p className="text-sm text-muted-foreground">{t('result.failed')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
