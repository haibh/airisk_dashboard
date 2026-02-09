/**
 * Report Template Form Dialog
 * Create/edit form for report templates in a dialog
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

type DataSource = 'risks' | 'assessments' | 'compliance' | 'evidence' | 'ai-systems';
type OutputFormat = 'csv' | 'xlsx' | 'pdf';

export interface ReportTemplateFormState {
  name: string;
  dataSource: DataSource;
  columns: string;
  format: OutputFormat;
  groupBy: string;
  sortBy: string;
}

interface ReportTemplateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  submitting: boolean;
  form: ReportTemplateFormState;
  onFormChange: (field: keyof ReportTemplateFormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  dataSourceOptions: { value: DataSource; label: string }[];
  t: (key: string) => string;
}

export function ReportTemplateFormDialog({
  open,
  onOpenChange,
  editing,
  submitting,
  form,
  onFormChange,
  onSubmit,
  dataSourceOptions,
  t,
}: ReportTemplateFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? t('actions.edit') : t('createTemplate')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{t('form.name')}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder={t('form.namePlaceholder')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataSource">{t('form.dataSource')}</Label>
              <Select value={form.dataSource} onValueChange={(v) => onFormChange('dataSource', v)}>
                <SelectTrigger id="dataSource">
                  <SelectValue placeholder={t('form.dataSourcePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {dataSourceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="format">{t('form.format')}</Label>
              <Select value={form.format} onValueChange={(v) => onFormChange('format', v)}>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">XLSX</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="columns">{t('form.columns')}</Label>
            <Textarea
              id="columns"
              value={form.columns}
              onChange={(e) => onFormChange('columns', e.target.value)}
              placeholder={t('form.columnsPlaceholder')}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="groupBy">{t('form.groupBy')}</Label>
              <Input
                id="groupBy"
                value={form.groupBy}
                onChange={(e) => onFormChange('groupBy', e.target.value)}
                placeholder={t('form.groupByPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="sortBy">{t('form.sortBy')}</Label>
              <Input
                id="sortBy"
                value={form.sortBy}
                onChange={(e) => onFormChange('sortBy', e.target.value)}
                placeholder={t('form.sortByPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Template'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
