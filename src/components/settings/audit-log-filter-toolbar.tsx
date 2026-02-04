'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Search, RotateCcw } from 'lucide-react';

interface AuditLogFilters {
  entityType?: string;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface AuditLogFilterToolbarProps {
  onFilterChange?: (filters: AuditLogFilters) => void;
  onExport?: () => void;
}

const ENTITY_TYPES = [
  'AISystem',
  'Assessment',
  'Risk',
  'User',
  'Organization',
  'Invitation',
  'APIKey',
  'Webhook',
];

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'INVITE', 'REVOKE'];

export function AuditLogFilterToolbar({
  onFilterChange,
  onExport,
}: AuditLogFilterToolbarProps) {
  const t = useTranslations('settings.auditLog');
  const [filters, setFilters] = useState<AuditLogFilters>({});

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleReset = () => {
    setFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      // Build query string from filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const queryString = params.toString();
      const url = `/api/audit-logs/export${queryString ? `?${queryString}` : ''}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entity Type */}
        <div className="space-y-2">
          <Label htmlFor="entityType">{t('entityType')}</Label>
          <Select
            value={filters.entityType || ''}
            onValueChange={(value) => handleFilterChange('entityType', value)}
          >
            <SelectTrigger id="entityType">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div className="space-y-2">
          <Label htmlFor="action">{t('action')}</Label>
          <Select
            value={filters.action || ''}
            onValueChange={(value) => handleFilterChange('action', value)}
          >
            <SelectTrigger id="action">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              {ACTIONS.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label htmlFor="dateFrom">{t('dateRange')} (From)</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label htmlFor="dateTo">{t('dateRange')} (To)</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>

      {/* Search by Entity ID */}
      <div className="space-y-2">
        <Label htmlFor="search">{t('search')}</Label>
        <div className="flex gap-2">
          <Input
            id="search"
            placeholder="Search by entity ID..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('reset')}
        </Button>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          {t('export')}
        </Button>
      </div>
    </div>
  );
}
