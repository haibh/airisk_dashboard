/**
 * Report Template Manager
 * CRUD interface for managing custom report templates
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  dataSource: string;
  columns: string[];
  filters?: any;
  groupBy?: string;
  sortBy?: string;
  format: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

type DataSource = 'risks' | 'assessments' | 'compliance' | 'evidence' | 'ai-systems';
type OutputFormat = 'csv' | 'xlsx' | 'pdf';

export function ReportTemplateManager() {
  const t = useTranslations('reportTemplates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDataSource, setFormDataSource] = useState<DataSource>('risks');
  const [formColumns, setFormColumns] = useState('');
  const [formFormat, setFormFormat] = useState<OutputFormat>('csv');
  const [formGroupBy, setFormGroupBy] = useState('');
  const [formSortBy, setFormSortBy] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const response = await fetch('/api/report-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    resetForm();
    setEditingId(null);
    setShowDialog(true);
  }

  function handleEdit(template: ReportTemplate) {
    setFormName(template.name);
    setFormDataSource(template.dataSource as DataSource);
    setFormColumns(template.columns.join(', '));
    setFormFormat(template.format as OutputFormat);
    setFormGroupBy(template.groupBy || '');
    setFormSortBy(template.sortBy || '');
    setEditingId(template.id);
    setShowDialog(true);
  }

  async function handleDelete(id: string) {
    if (!confirm(t('actions.deleteConfirm'))) return;

    try {
      const response = await fetch(`/api/report-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      toast.success(t('actions.deleteSuccess'));
      fetchTemplates();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete template');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        name: formName,
        dataSource: formDataSource,
        columns: formColumns.split(',').map((c) => c.trim()).filter(Boolean),
        format: formFormat,
        groupBy: formGroupBy || undefined,
        sortBy: formSortBy || undefined,
      };

      const url = editingId ? `/api/report-templates/${editingId}` : '/api/report-templates';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Save failed');

      toast.success(editingId ? t('actions.updateSuccess') : t('actions.createSuccess'));
      setShowDialog(false);
      fetchTemplates();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save template');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormName('');
    setFormDataSource('risks');
    setFormColumns('');
    setFormFormat('csv');
    setFormGroupBy('');
    setFormSortBy('');
  }

  const dataSourceOptions: { value: DataSource; label: string }[] = [
    { value: 'risks', label: t('dataSources.risks') },
    { value: 'assessments', label: t('dataSources.assessments') },
    { value: 'compliance', label: t('dataSources.compliance') },
    { value: 'evidence', label: t('dataSources.evidence') },
    { value: 'ai-systems', label: t('dataSources.ai-systems') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createTemplate')}
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t('noTemplates')}</p>
            <Button onClick={handleCreate} variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              {t('createTemplate')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Data Source</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.columns.length} columns
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dataSourceOptions.find((o) => o.value === template.dataSource)?.label ||
                            template.dataSource}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs uppercase font-mono">{template.format}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {template.createdBy.name || template.createdBy.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(template)}
                            title={t('actions.edit')}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(template.id)}
                            title={t('actions.delete')}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t('actions.edit') : t('createTemplate')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('form.name')}</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t('form.namePlaceholder')}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dataSource">{t('form.dataSource')}</Label>
                <Select value={formDataSource} onValueChange={(v) => setFormDataSource(v as DataSource)}>
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
                <Select value={formFormat} onValueChange={(v) => setFormFormat(v as OutputFormat)}>
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
                value={formColumns}
                onChange={(e) => setFormColumns(e.target.value)}
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
                  value={formGroupBy}
                  onChange={(e) => setFormGroupBy(e.target.value)}
                  placeholder={t('form.groupByPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="sortBy">{t('form.sortBy')}</Label>
                <Input
                  id="sortBy"
                  value={formSortBy}
                  onChange={(e) => setFormSortBy(e.target.value)}
                  placeholder={t('form.sortByPlaceholder')}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
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
    </div>
  );
}
