# Insight Narrative UI Components

Data storytelling components for the AI Risk Dashboard. These components provide narrative-driven insights, anomaly detection alerts, and actionable intelligence.

## Components

### 1. `insight-card.tsx` (180 lines)
Individual insight card with narrative presentation.

**Features:**
- Priority badge (CRITICAL/HIGH/MEDIUM/LOW/INFO) with theme-adaptive colors
- Template-based icons (risk-spike, compliance-drop, control-gap, etc.)
- Narrative text display (main story/message)
- Metric snapshot with key numbers
- Relative timestamp ("2h ago")
- Acknowledge/View Details actions
- Acknowledged state with dimmed appearance

**Props:**
- `insight`: Insight object with narrative, priority, metrics
- `onAcknowledge`: Callback for acknowledging insight

### 2. `insight-feed.tsx` (196 lines)
Timeline feed displaying insights grouped by priority.

**Features:**
- Vertical list of insight cards
- Grouped by priority with color-coded borders
- Section headers with count badges
- "Generate New Insights" action button
- Auto-refresh every 5 minutes
- Show/hide acknowledged insights toggle
- Empty state for no active insights

**Props:**
- `insights`: Array of insight objects
- `onAcknowledge`: Acknowledge callback
- `onRefresh`: Refresh data callback
- `onGenerate`: Generate new insights callback

### 3. `anomaly-alert-banner.tsx` (105 lines)
Top-of-page alert for critical anomalies.

**Features:**
- Only shows for CRITICAL severity anomalies
- Red destructive Alert styling
- Shows anomaly count + first anomaly description
- "View All" button to scroll to insights feed
- Dismiss button (per-session state)
- Auto-hides after 30 seconds if not interacted with

**Props:**
- `anomalies`: Array of anomaly objects
- `onViewAll`: Callback to scroll to insights feed

### 4. `insight-dashboard-widget.tsx` (163 lines)
Main orchestration component with data fetching and state management.

**Features:**
- Fetches from `/api/insights/active` and `/api/insights/anomalies`
- Loading skeleton states
- Error handling with retry
- Anomaly banner at top (if critical anomalies)
- Stats cards (extracted to separate component)
- Main insights feed
- Generate insights action (POST to `/api/insights/generate`)
- Optimistic UI updates on acknowledge

**Usage:**
```tsx
import { InsightDashboardWidget } from '@/components/insights/insight-dashboard-widget';

export default function InsightsPage() {
  return (
    <div className="container py-6">
      <InsightDashboardWidget />
    </div>
  );
}
```

### 5. `insight-stats-cards.tsx` (101 lines)
Stats card grid extracted from dashboard widget.

**Features:**
- 4-card grid: Total Insights, Critical, Acknowledged Today, Anomalies
- Icon-based visual indicators
- Critical count with "Action Required" badge
- Responsive grid layout

**Props:**
- `insights`: Array of insight objects
- `anomalies`: Array of anomaly objects

## API Endpoints Used

### GET `/api/insights/active`
Fetch unacknowledged insights sorted by priority.
```typescript
Response: {
  insights: Insight[]
}
```

### POST `/api/insights/generate`
Trigger insight generation from current metrics.
```typescript
Response: {
  generated: number
}
```

### GET `/api/insights/anomalies`
Fetch recent anomaly events with severity.
```typescript
Response: {
  anomalies: Anomaly[]
}
```

### PATCH `/api/insights/[id]/acknowledge`
Acknowledge/dismiss an insight.
```typescript
Response: {
  success: boolean
}
```

## Type Definitions

```typescript
type InsightPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
type AnomalySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Insight {
  id: string;
  templateType: string;
  narrative: string;
  priority: InsightPriority;
  metrics?: Record<string, unknown>;
  isAcknowledged: boolean;
  acknowledgedAt?: string | null;
  createdAt: string;
}

interface Anomaly {
  id: string;
  metricName: string;
  description: string;
  severity: AnomalySeverity;
  detectedAt: string;
}
```

## Styling

All components use:
- Theme-adaptive colors via CSS variables
- Lucide React icons
- Shadcn/ui components (Card, Badge, Button, Alert, etc.)
- Tailwind CSS utility classes
- Responsive layouts

## Dependencies

- `@/components/ui/*` - Shadcn/ui components
- `lucide-react` - Icon library
- `@/lib/utils` - cn() utility for classnames
