'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Evidence {
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

interface EvidenceListTableProps {
  evidence: Evidence[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: string) => void;
  onViewDetail: (evidence: Evidence) => void;
  onDownload: (evidenceId: string) => void;
  onApprove?: (evidenceId: string) => void;
  onReject?: (evidenceId: string) => void;
}

export function EvidenceListTable({
  evidence,
  total,
  page,
  pageSize,
  onPageChange,
  onStatusFilter,
  onViewDetail,
  onDownload,
  onApprove,
  onReject,
}: EvidenceListTableProps) {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const totalPages = Math.ceil(total / pageSize);
  const canApprove = session?.user?.role && hasMinimumRole(session.user.role, 'RISK_MANAGER');

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onStatusFilter(status === 'ALL' ? '' : status);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      SUBMITTED: 'secondary',
      UNDER_REVIEW: 'default',
      APPROVED: 'outline',
      REJECTED: 'destructive',
      EXPIRED: 'destructive',
    };

    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
      UNDER_REVIEW: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
      APPROVED: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
      EXPIRED: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
    };

    return (
      <Badge variant={variants[status] || 'default'} className={colors[status]}>
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileTypeIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('table.filterByStatus')}:</span>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{tCommon('all')}</SelectItem>
              <SelectItem value="SUBMITTED">{t('status.submitted')}</SelectItem>
              <SelectItem value="UNDER_REVIEW">{t('status.underReview')}</SelectItem>
              <SelectItem value="APPROVED">{t('status.approved')}</SelectItem>
              <SelectItem value="REJECTED">{t('status.rejected')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 text-sm text-muted-foreground text-right">
          {t('table.totalResults')}: {total}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">{t('table.type')}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('filename')}
              >
                {t('table.filename')} {sortColumn === 'filename' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>{t('table.size')}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('reviewStatus')}
              >
                {t('table.status')} {sortColumn === 'reviewStatus' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>{t('table.uploadedBy')}</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('createdAt')}
              >
                {t('table.uploadDate')} {sortColumn === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evidence.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t('table.noData')}
                </TableCell>
              </TableRow>
            ) : (
              evidence.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-2xl">
                    {getFileTypeIcon(item.mimeType)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.originalName}</span>
                      {item.links && item.links.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t('table.linkedTo')}: {item.links[0].entityType}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.reviewStatus)}</TableCell>
                  <TableCell className="text-sm">
                    {item.uploadedBy.name || item.uploadedBy.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetail(item)}
                        title={t('actions.view')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(item.id)}
                        title={t('actions.download')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canApprove && item.reviewStatus === 'SUBMITTED' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onApprove?.(item.id)}
                            title={t('actions.approve')}
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onReject?.(item.id)}
                            title={t('actions.reject')}
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('table.showing')} {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} {t('table.of')} {total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              {tCommon('previous')}
            </Button>
            <div className="text-sm">
              {t('table.page')} {page} {t('table.of')} {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              {tCommon('next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
