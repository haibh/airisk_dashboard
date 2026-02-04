'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface EvidenceApprovalPanelProps {
  evidenceId: string;
  currentStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  filename: string;
  onApprove: (evidenceId: string) => Promise<void>;
  onReject: (evidenceId: string, reason: string) => Promise<void>;
  canApprove: boolean;
}

export function EvidenceApprovalPanel({
  evidenceId,
  currentStatus,
  filename,
  onApprove,
  onReject,
  canApprove,
}: EvidenceApprovalPanelProps) {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode }> = {
      SUBMITTED: {
        color: 'bg-blue-500/10 text-blue-500',
        icon: <AlertCircle className="h-3 w-3" />,
      },
      UNDER_REVIEW: {
        color: 'bg-yellow-500/10 text-yellow-500',
        icon: <AlertCircle className="h-3 w-3" />,
      },
      APPROVED: {
        color: 'bg-green-500/10 text-green-500',
        icon: <CheckCircle className="h-3 w-3" />,
      },
      REJECTED: {
        color: 'bg-red-500/10 text-red-500',
        icon: <XCircle className="h-3 w-3" />,
      },
      EXPIRED: {
        color: 'bg-gray-500/10 text-gray-500',
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config = configs[status] || configs.SUBMITTED;

    return (
      <Badge className={`${config.color} flex items-center gap-1 w-fit`}>
        {config.icon}
        {t(`status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const handleApproveConfirm = async () => {
    setIsProcessing(true);
    try {
      await onApprove(evidenceId);
      toast.success(t('approval.approveSuccess'));
      setShowApproveDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('approval.approveFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      toast.error(t('approval.reasonRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(evidenceId, rejectionReason);
      toast.success(t('approval.rejectSuccess'));
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('approval.rejectFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold">{t('approval.title')}</h3>
            <p className="text-xs text-muted-foreground">{filename}</p>
          </div>
          {getStatusBadge(currentStatus)}
        </div>

        {canApprove && currentStatus === 'SUBMITTED' && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => setShowApproveDialog(true)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('actions.approve')}
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('actions.reject')}
            </Button>
          </div>
        )}

        {!canApprove && currentStatus === 'SUBMITTED' && (
          <p className="text-sm text-muted-foreground">
            {t('approval.insufficientPermissions')}
          </p>
        )}

        {currentStatus === 'APPROVED' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>{t('approval.approved')}</span>
          </div>
        )}

        {currentStatus === 'REJECTED' && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <XCircle className="h-4 w-4" />
            <span>{t('approval.rejected')}</span>
          </div>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              {t('approval.confirmApprove')}
            </DialogTitle>
            <DialogDescription>
              {t('approval.confirmApproveDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t('approval.filename')}: <span className="font-medium text-foreground">{filename}</span>
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? t('approval.processing') : t('actions.approve')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              {t('approval.confirmReject')}
            </DialogTitle>
            <DialogDescription>
              {t('approval.confirmRejectDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t('approval.filename')}: <span className="font-medium text-foreground">{filename}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionReason">{t('approval.rejectionReason')} *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('approval.rejectionReasonPlaceholder')}
                rows={4}
                disabled={isProcessing}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}
              disabled={isProcessing}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={isProcessing || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? t('approval.processing') : t('actions.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
