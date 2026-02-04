'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
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
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AuditLogDetailDiff } from './audit-log-detail-diff';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export function AuditLogViewerTable() {
  const t = useTranslations('settings.auditLog');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/audit-logs?page=${page}&pageSize=${pageSize}`
      );
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRowExpansion = (logId: string) => {
    setExpandedRow(expandedRow === logId ? null : logId);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'default';
      case 'UPDATE':
        return 'secondary';
      case 'DELETE':
        return 'destructive';
      case 'LOGIN':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading audit logs...</p>
      </div>
    );
  }

  if (!isLoading && logs.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8">
        <p className="text-center text-muted-foreground">{t('noLogs')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>{t('timestamp')}</TableHead>
              <TableHead>{t('user')}</TableHead>
              <TableHead>{t('action')}</TableHead>
              <TableHead>{t('entityType')}</TableHead>
              <TableHead>{t('entityId')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <>
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRowExpansion(log.id)}
                >
                  <TableCell>
                    {expandedRow === log.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {log.user.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.entityType}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.entityId.slice(0, 8)}...
                  </TableCell>
                </TableRow>

                {expandedRow === log.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/30">
                      <AuditLogDetailDiff
                        oldValues={log.oldValues}
                        newValues={log.newValues}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
