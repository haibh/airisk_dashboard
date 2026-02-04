import { getServerSession } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import { hasMinimumRole } from '@/lib/auth-helpers';
import { AuditLogFilterToolbar } from '@/components/settings/audit-log-filter-toolbar';
import { AuditLogViewerTable } from '@/components/settings/audit-log-viewer-table';
import { useTranslations } from 'next-intl';

export default async function AuditLogPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Check role - AUDITOR or ADMIN only
  if (!hasMinimumRole(session.user.role, 'AUDITOR')) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
        <p className="text-muted-foreground">
          View and export organization audit logs
        </p>
      </div>

      <AuditLogFilterToolbar />
      <AuditLogViewerTable />
    </div>
  );
}
