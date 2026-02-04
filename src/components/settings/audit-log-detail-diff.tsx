'use client';

import { useTranslations } from 'next-intl';

interface AuditLogDetailDiffProps {
  oldValues: any;
  newValues: any;
}

export function AuditLogDetailDiff({
  oldValues,
  newValues,
}: AuditLogDetailDiffProps) {
  const t = useTranslations('settings.auditLog');

  // Handle null values
  const hasOldValues = oldValues && Object.keys(oldValues).length > 0;
  const hasNewValues = newValues && Object.keys(newValues).length > 0;

  if (!hasOldValues && !hasNewValues) {
    return (
      <div className="py-4">
        <p className="text-sm text-muted-foreground">No detailed changes</p>
      </div>
    );
  }

  // Get all unique keys from both objects
  const allKeys = new Set([
    ...(hasOldValues ? Object.keys(oldValues) : []),
    ...(hasNewValues ? Object.keys(newValues) : []),
  ]);

  return (
    <div className="py-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Old Values Column */}
        <div>
          <h4 className="text-sm font-semibold mb-2">{t('oldValues')}</h4>
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 space-y-2">
            {hasOldValues ? (
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(oldValues, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">None</p>
            )}
          </div>
        </div>

        {/* New Values Column */}
        <div>
          <h4 className="text-sm font-semibold mb-2">{t('newValues')}</h4>
          <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3 space-y-2">
            {hasNewValues ? (
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(newValues, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-muted-foreground">None</p>
            )}
          </div>
        </div>
      </div>

      {/* Changed Fields Summary */}
      {hasOldValues && hasNewValues && (
        <div className="pt-2 border-t">
          <h4 className="text-sm font-semibold mb-2">Changed Fields</h4>
          <div className="space-y-1">
            {Array.from(allKeys).map((key) => {
              const oldValue = oldValues[key];
              const newValue = newValues[key];
              const hasChanged =
                JSON.stringify(oldValue) !== JSON.stringify(newValue);

              if (!hasChanged && oldValue === undefined && newValue === undefined) {
                return null;
              }

              return (
                <div key={key} className="flex items-start gap-2 text-xs">
                  <span className="font-medium min-w-[120px]">{key}:</span>
                  {hasChanged ? (
                    <span className="flex-1">
                      <span className="text-red-600 dark:text-red-400 line-through">
                        {oldValue !== undefined
                          ? JSON.stringify(oldValue)
                          : 'undefined'}
                      </span>
                      {' → '}
                      <span className="text-green-600 dark:text-green-400">
                        {newValue !== undefined
                          ? JSON.stringify(newValue)
                          : 'undefined'}
                      </span>
                    </span>
                  ) : oldValue === undefined ? (
                    <span className="flex-1 text-green-600 dark:text-green-400">
                      Added: {JSON.stringify(newValue)}
                    </span>
                  ) : newValue === undefined ? (
                    <span className="flex-1 text-red-600 dark:text-red-400">
                      Removed: {JSON.stringify(oldValue)}
                    </span>
                  ) : (
                    <span className="flex-1 text-muted-foreground">
                      Unchanged
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
