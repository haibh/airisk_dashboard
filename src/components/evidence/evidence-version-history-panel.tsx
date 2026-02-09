'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Clock, User, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface EvidenceVersion {
  id: string;
  versionNumber: number;
  filename: string;
  originalName: string;
  fileSize: number;
  hashSha256: string;
  mimeType: string;
  changeNote: string | null;
  uploadedBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

interface EvidenceVersionHistoryPanelProps {
  evidenceId: string;
  currentVersion: number;
}

export function EvidenceVersionHistoryPanel({
  evidenceId,
  currentVersion,
}: EvidenceVersionHistoryPanelProps) {
  const t = useTranslations('evidence');
  const tCommon = useTranslations('common');

  const [versions, setVersions] = useState<EvidenceVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/evidence/${evidenceId}/versions`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch versions');
        }

        setVersions(data.versions || []);
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load versions');
        toast.error(err instanceof Error ? err.message : t('errors.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    if (evidenceId) {
      fetchVersions();
    }
  }, [evidenceId, t]);

  const handleDownloadVersion = async (versionId: string, filename: string) => {
    try {
      const response = await fetch(`/api/evidence/${evidenceId}/versions/${versionId}/download`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Download failed');
      }

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
    } catch (err) {
      console.error('Download error:', err);
      toast.error(err instanceof Error ? err.message : t('actions.downloadFailed'));
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">{t('versions.noVersions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">{t('versions.title')}</h3>

      <div className="space-y-3">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-4 rounded-lg border ${
              version.versionNumber === currentVersion
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/30'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Version header */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={version.versionNumber === currentVersion ? 'default' : 'outline'}
                  >
                    {t('versions.version')} {version.versionNumber}
                  </Badge>
                  {version.versionNumber === currentVersion && (
                    <Badge variant="secondary">{t('versions.current')}</Badge>
                  )}
                </div>

                {/* Filename */}
                <div className="space-y-1">
                  <p className="text-sm font-medium break-all">{version.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(version.fileSize)} • {version.mimeType}
                  </p>
                </div>

                {/* Change note */}
                {version.changeNote && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t('versions.changeNote')}:
                    </p>
                    <p className="text-sm text-muted-foreground">{version.changeNote}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>
                      {t('versions.uploadedBy')}: {version.uploadedBy.name || version.uploadedBy.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(version.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Download button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadVersion(version.id, version.originalName)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
