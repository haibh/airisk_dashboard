/**
 * Report Template Manager
 * CRUD interface for managing custom report templates
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReportTemplateFormDialog, type ReportTemplateFormState } from './report-template-form-dialog';

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

const INITIAL_FORM: ReportTemplateFormState = {
  name: '', dataSource: 'risks', columns: '', format: 'csv', groupBy: '', sortBy: '',
};

export function ReportTemplateManager() {
  const t = useTranslations('reportTemplates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ReportTemplateFormState>(INITIAL_FORM);

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
      toast.error(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowDialog(true);
  }

  function handleEdit(template: ReportTemplate) {
    setForm({
      name: template.name,
      dataSource: template.dataSource as DataSource,
      columns: template.columns.join(', '),
      format: template.format as 'csv' | 'xlsx' | 'pdf',
      groupBy: template.groupBy || '',
      sortBy: template.sortBy || '',
    });
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
      toast.error(t('errors.deleteFailed'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const body = {
        name: form.name,
        dataSource: form.dataSource,
        columns: form.columns.split(',').map((c) => c.trim()).filter(Boolean),
        format: form.format,
        groupBy: form.groupBy || undefined,
        sortBy: form.sortBy || undefined,
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
      toast.error(t('errors.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleFormChange(field: keyof ReportTemplateFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
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

      <ReportTemplateFormDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editing={!!editingId}
        submitting={submitting}
        form={form}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        dataSourceOptions={dataSourceOptions}
        t={t}
      />
    </div>
  );
}
