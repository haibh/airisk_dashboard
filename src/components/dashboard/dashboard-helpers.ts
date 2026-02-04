export function formatTrend(value: number): string {
  const absValue = Math.abs(value);
  return `${value >= 0 ? '+' : '-'}${absValue.toFixed(1)}%`;
}

export function getTrendDirection(value: number, inverse = false): 'up' | 'down' {
  const isPositive = value >= 0;
  return inverse ? (isPositive ? 'down' : 'up') : (isPositive ? 'up' : 'down');
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export function getActivityStatus(action: string): 'success' | 'warning' | 'info' {
  const successActions = ['CREATE', 'APPROVE', 'SUBMIT'];
  const warningActions = ['DELETE'];

  if (successActions.includes(action)) return 'success';
  if (warningActions.includes(action)) return 'warning';
  return 'info';
}
