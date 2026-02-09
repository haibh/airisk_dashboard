/**
 * Bulk Import Wizard
 * Multi-step wizard for importing risks from CSV/Excel files
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImportPreviewTable } from './import-preview-table';

interface BulkImportWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Assessment {
  id: string;
  title: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface DryRunResponse {
  dryRun: true;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  preview: any[];
}

interface ImportResponse {
  dryRun: false;
  totalRows: number;
  imported: number;
  failed: number;
  errors: ValidationError[];
}

type Step = 'upload' | 'preview' | 'result';

export function BulkImportWizard({ open, onClose, onSuccess }: BulkImportWizardProps) {
  const t = useTranslations('import');
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<DryRunResponse | null>(null);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assessments on open
  useEffect(() => {
    if (open) {
      fetchAssessments();
    }
  }, [open]);

  async function fetchAssessments() {
    try {
      const response = await fetch('/api/assessments?pageSize=100');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const data = await response.json();
      setAssessments(data.assessments || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error(t('errors.loadAssessmentsFailed'));
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'xlsx') {
        setFile(selectedFile);
      } else {
        toast.error(t('errors.invalidFileFormat'));
      }
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'csv' || ext === 'xlsx') {
        setFile(droppedFile);
      } else {
        toast.error(t('errors.invalidFileFormat'));
      }
    }
  }

  async function handleValidate() {
    if (!file) {
      toast.error(t('errors.noFile'));
      return;
    }
    if (!assessmentId) {
      toast.error(t('errors.noAssessment'));
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assessmentId', assessmentId);
      formData.append('dryRun', 'true');

      const response = await fetch('/api/import/risks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('errors.uploadFailed'));
      }

      const data: DryRunResponse = await response.json();
      setPreviewData(data);
      setStep('preview');
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(error instanceof Error ? error.message : t('errors.uploadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!file || !assessmentId) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assessmentId', assessmentId);
      formData.append('dryRun', 'false');

      const response = await fetch('/api/import/risks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('errors.importFailed'));
      }

      const data: ImportResponse = await response.json();
      setImportResult(data);
      setStep('result');
      if (data.imported > 0) {
        toast.success(`${t('result.imported')} ${data.imported} ${t('result.risks')}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : t('errors.importFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep('upload');
    setFile(null);
    setAssessmentId('');
    setPreviewData(null);
    setImportResult(null);
    onClose();
  }

  function handleFinish() {
    handleClose();
    onSuccess();
  }

  const stepProgress = step === 'upload' ? 33 : step === 'preview' ? 66 : 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={step === 'upload' ? 'font-medium' : 'text-muted-foreground'}>
              1. {t('step1')}
            </span>
            <span className={step === 'preview' ? 'font-medium' : 'text-muted-foreground'}>
              2. {t('step2')}
            </span>
            <span className={step === 'result' ? 'font-medium' : 'text-muted-foreground'}>
              3. {t('step3')}
            </span>
          </div>
          <Progress value={stepProgress} />
        </div>

        {/* Step content */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('selectAssessment')}
              </label>
              <Select value={assessmentId} onValueChange={setAssessmentId}>
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
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
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
        )}

        {step === 'preview' && previewData && (
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
        )}

        {step === 'result' && importResult && (
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
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t('common.cancel', { ns: 'common' })}
              </Button>
              <Button onClick={handleValidate} disabled={!file || !assessmentId || loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('validating')}
                  </>
                ) : (
                  t('common.next', { ns: 'common' })
                )}
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                {t('common.back', { ns: 'common' })}
              </Button>
              <Button onClick={handleImport} disabled={loading || (previewData?.validRows ?? 0) === 0}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('importing')}
                  </>
                ) : (
                  t('step3')
                )}
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button onClick={handleFinish} className="ml-auto">
              {t('common.confirm', { ns: 'common' })}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
