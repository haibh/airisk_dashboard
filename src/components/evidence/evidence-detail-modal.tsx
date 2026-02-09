'use client';

import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { FileText, Download, Calendar, User, Hash, HardDrive, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EvidenceVersionHistoryPanel } from './evidence-version-history-panel';

interface Evidence {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  hashSha256: string;
  description: string | null;
  reviewStatus: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  validUntil: string | null;
  versionNumber?: number;
  createdAt: string;
  updatedAt: string;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  links?: Array<{
    id: string;
    entityType: string;
    aiSystem?: { id: string; name: string } | null;
    assessment?: { id: string; title: string } | null;
    risk?: { id: string; title: string } | null;
    control?: { id: string; title: string } | null;
  }>;
}

interface EvidenceDetailModalProps {
  evidence: Evidence | null;
  open: boolean;
  onClose: () => void;
  onDownload: (evidenceId: string) => void;
  onApprove?: (evidenceId: string) => void;
  onReject?: (evidenceId: string) => void;
}

export function EvidenceDetailModal({
  evidence,
  open,
  onClose,
  onDownload,
  onApprove,
  onReject,
}: EvidenceDetailModalProps) {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();

  if (!evidence) return null;

  const canApprove = session?.user?.role && hasMinimumRole(session.user.role, 'RISK_MANAGER');
  const showApprovalActions = canApprove && evidence.reviewStatus === 'SUBMITTED';

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-500/10 text-blue-500',
      UNDER_REVIEW: 'bg-yellow-500/10 text-yellow-500',
      APPROVED: 'bg-green-500/10 text-green-500',
      REJECTED: 'bg-red-500/10 text-red-500',
      EXPIRED: 'bg-gray-500/10 text-gray-500',
    };

    return (
      <Badge className={colors[status]}>
        {t(`status.${status.toLowerCase()}`)}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLinkedEntityName = (link: NonNullable<Evidence['links']>[number]) => {
    if (!link) return null;

    if (link.aiSystem) return link.aiSystem.name;
    if (link.assessment) return link.assessment.title;
    if (link.risk) return link.risk.title;
    if (link.control) return link.control.title;

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('detail.title')}
          </DialogTitle>
          <DialogDescription>
            {t('detail.description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              {t('versions.detailsTab')}
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex-1">
              {t('versions.tab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
          {/* File Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('detail.fileInfo')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('table.filename')}</p>
                <p className="text-sm font-medium break-all">{evidence.originalName}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('detail.fileType')}</p>
                <p className="text-sm">{evidence.mimeType}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {t('table.size')}
                </p>
                <p className="text-sm">{formatFileSize(evidence.fileSize)}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {t('detail.hash')}
                </p>
                <p className="text-xs font-mono break-all">
                  {evidence.hashSha256.substring(0, 16)}...
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status and Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('detail.statusInfo')}</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{t('table.status')}</p>
                {getStatusBadge(evidence.reviewStatus)}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {t('table.uploadedBy')}
                </p>
                <p className="text-sm">{evidence.uploadedBy.name || evidence.uploadedBy.email}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {t('table.uploadDate')}
                </p>
                <p className="text-sm">{formatDate(evidence.createdAt)}</p>
              </div>

              {evidence.validUntil && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('form.validUntil')}
                  </p>
                  <p className="text-sm">{formatDate(evidence.validUntil)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {evidence.description && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{t('form.description')}</h3>
                <p className="text-sm text-muted-foreground">{evidence.description}</p>
              </div>
            </>
          )}

          {/* Linked Entities */}
          {evidence.links && evidence.links.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">{t('detail.linkedEntities')}</h3>
                <div className="space-y-2">
                  {evidence.links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {t(`entityTypes.${link.entityType.toLowerCase().replace('_', '')}`)}
                        </p>
                        <p className="text-sm font-medium">
                          {getLinkedEntityName(link) || t('detail.unnamed')}
                        </p>
                      </div>
                      <Badge variant="outline">{link.entityType}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          </TabsContent>

          <TabsContent value="versions" className="mt-6">
            <EvidenceVersionHistoryPanel
              evidenceId={evidence.id}
              currentVersion={evidence.versionNumber || 1}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            {showApprovalActions && (
              <>
                <Button
                  variant="outline"
                  className="flex-1 text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  onClick={() => {
                    onApprove?.(evidence.id);
                    onClose();
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('actions.approve')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => {
                    onReject?.(evidence.id);
                    onClose();
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('actions.reject')}
                </Button>
              </>
            )}
          </div>
          <Button
            variant="default"
            onClick={() => onDownload(evidence.id)}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('actions.download')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
