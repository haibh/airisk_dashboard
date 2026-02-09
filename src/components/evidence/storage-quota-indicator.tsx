'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { HardDrive, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { hasMinimumRole } from '@/lib/auth-helpers';

interface StorageUsageData {
  usedBytes: number;
  maxBytes: number;
  percentage: number;
  formattedUsed: string;
  formattedMax: string;
}

export function StorageQuotaIndicator() {
  const t = useTranslations('evidence.storage');
  const tCommon = useTranslations('common');
  const { data: session } = useSession();

  const [storageData, setStorageData] = useState<StorageUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Only show for admins
  const canViewStorage = session?.user?.role && hasMinimumRole(session.user.role, 'ADMIN');

  useEffect(() => {
    const fetchStorageUsage = async () => {
      if (!canViewStorage) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/evidence/storage-usage');
        const data = await response.json();

        if (response.ok && data.success) {
          setStorageData(data.data);
        }
      } catch (error) {
        console.error('Error fetching storage usage:', error);
        // Silently fail - storage indicator is non-critical
      } finally {
        setIsLoading(false);
      }
    };

    fetchStorageUsage();
  }, [canViewStorage]);

  // Don't render anything for non-admins
  if (!canViewStorage || isLoading || !storageData) {
    return null;
  }

  const getColorClass = (percentage: number): string => {
    if (percentage >= 80) return 'text-red-600 dark:text-red-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getIcon = (percentage: number) => {
    if (percentage >= 95) return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (percentage >= 80) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <HardDrive className="h-5 w-5 text-muted-foreground" />;
  };

  const getWarningMessage = (percentage: number): string | null => {
    if (percentage >= 95) return t('full');
    if (percentage >= 80) return t('warning');
    return null;
  };

  const warningMessage = getWarningMessage(storageData.percentage);

  return (
    <Card className="border-l-4" style={{ borderLeftColor: storageData.percentage >= 80 ? '#dc2626' : storageData.percentage >= 60 ? '#ca8a04' : '#16a34a' }}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(storageData.percentage)}
              <h3 className="text-sm font-semibold">{t('title')}</h3>
            </div>
            <span className={`text-sm font-bold ${getColorClass(storageData.percentage)}`}>
              {storageData.percentage.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress
              value={storageData.percentage}
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {storageData.formattedUsed} {t('used')}
              </span>
              <span>
                {t('of')} {storageData.formattedMax}
              </span>
            </div>
          </div>

          {/* Warning message */}
          {warningMessage && (
            <div className={`flex items-center gap-2 p-2 rounded-md ${
              storageData.percentage >= 95
                ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                : 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs font-medium">{warningMessage}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
