'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EvidenceUploadForm } from '@/components/evidence/evidence-upload-form';
import { EvidenceListTable, type Evidence } from '@/components/evidence/evidence-list-table';
import { EvidenceDetailModal } from '@/components/evidence/evidence-detail-modal';
import { toast } from 'sonner';

export default function EvidencePage() {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch evidence list
  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/evidence?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch evidence');
      }

      setEvidence(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast.error(error instanceof Error ? error.message : t('errors.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Load evidence on mount and when filters change
  useEffect(() => {
    fetchEvidence();
  }, [page, statusFilter]);

  // Handle upload success
  const handleUploadSuccess = () => {
    setShowUploadDialog(false);
    fetchEvidence(); // Refresh list
  };

  // Handle view detail
  const handleViewDetail = (item: Evidence) => {
    setSelectedEvidence(item);
    setShowDetailModal(true);
  };

  // Handle download
  const handleDownload = async (evidenceId: string) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/download`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : 'evidence-file';

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t('actions.downloadSuccess'));
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : t('actions.downloadFailed'));
    }
  };

  // Handle approve
  const handleApprove = async (evidenceId: string) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Approval failed');
      }

      toast.success(t('approval.approveSuccess'));
      fetchEvidence(); // Refresh list
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(error instanceof Error ? error.message : t('approval.approveFailed'));
    }
  };

  // Handle reject
  const handleReject = async (evidenceId: string) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: 'Does not meet requirements' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      toast.success(t('approval.rejectSuccess'));
      fetchEvidence(); // Refresh list
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error(error instanceof Error ? error.message : t('approval.rejectFailed'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4 mr-2" />
          {t('upload')}
        </Button>
      </div>

      {/* Evidence List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('list.title')}</CardTitle>
          <CardDescription>{t('list.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
              </div>
            </div>
          ) : (
            <EvidenceListTable
              evidence={evidence}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onStatusFilter={setStatusFilter}
              onViewDetail={handleViewDetail}
              onDownload={handleDownload}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t('upload')}
            </DialogTitle>
            <DialogDescription>{t('uploadDescription')}</DialogDescription>
          </DialogHeader>
          <EvidenceUploadForm
            onSuccess={handleUploadSuccess}
            onCancel={() => setShowUploadDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <EvidenceDetailModal
        evidence={selectedEvidence}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEvidence(null);
        }}
        onDownload={handleDownload}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
