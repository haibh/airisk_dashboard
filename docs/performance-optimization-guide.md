# AIRisk Dashboard - Performance Optimization Guide

**Version:** 1.0
**Date:** 2026-02-03
**Status:** Phase 7 - In Progress
**Target Metrics:** NFR-PERF-01 through NFR-PERF-04

---

## Executive Summary

This document outlines the current performance status, identified bottlenecks, and optimization strategies for the AIRisk Dashboard MVP 1. The platform is currently at 95% feature completion with performance optimization scheduled for Phase 7.

**Current Performance Targets:**
- Page Load Time: < 3 seconds (initial), < 1.5s (navigation)
- API Response Time: < 500ms (95th percentile)
- Dashboard Rendering: < 2 seconds (with 1000+ data points)
- Search Response: < 1 second

---

## Performance Assessment

### Current Status (Phase 6)

| Metric | Target | Current | Status | Priority |
|--------|--------|---------|--------|----------|
| Initial Page Load | < 3 seconds | ⏳ Not measured | 🟡 Pending | High |
| API Response (p95) | < 500ms | ⏳ Not measured | 🟡 Pending | High |
| Dashboard Render | < 2 seconds | ⏳ Not measured | 🟡 Pending | High |
| Search Response | < 1 second | ⏳ Not measured | 🟡 Pending | High |
| Bundle Size (gzip) | < 500KB | ⏳ Not measured | 🟡 Pending | Medium |

---

## Database Performance Optimization

### 1. Index Strategy

**Current Index Status:** ⏳ Partial (foreign keys only)

**Required Indexes (Priority Order):**

#### High Priority (Performance Critical)
```sql
-- List endpoint filtering
CREATE INDEX idx_ai_systems_org_status ON ai_systems(organizationId, lifecycleStatus);
CREATE INDEX idx_risk_assessments_system ON risk_assessments(aiSystemId);
CREATE INDEX idx_risk_assessments_framework ON risk_assessments(frameworkId);
CREATE INDEX idx_risks_assessment ON risks(assessmentId);

-- Search optimization
CREATE INDEX idx_ai_systems_name_tsvector ON ai_systems USING GIN(
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- Dashboard queries
CREATE INDEX idx_risks_assessment_level ON risks(assessmentId, riskLevel);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
```

#### Medium Priority (Query Optimization)
```sql
-- Framework browsing
CREATE INDEX idx_controls_framework ON controls(frameworkId);
CREATE INDEX idx_mappings_source_target ON mappings(sourceControlId, targetControlId);

-- Pagination
CREATE INDEX idx_ai_systems_created ON ai_systems(organizationId, createdAt DESC);
CREATE INDEX idx_assessments_created ON risk_assessments(aiSystemId, createdAt DESC);

-- Filtering
CREATE INDEX idx_evidence_links_entity ON evidence_links(entityType, entityId);
CREATE INDEX idx_tasks_assignee_status ON tasks(assigneeId, status);
```

#### Low Priority (Optional Optimization)
```sql
-- User activity
CREATE INDEX idx_users_org_role ON users(organizationId, role);

-- Archive queries
CREATE INDEX idx_assessments_status ON risk_assessments(status);
```

**Implementation:**
```bash
# Apply indexes (use Prisma migrations)
npx prisma migrate dev --name add_performance_indexes
```

### 2. Query Optimization

**N+1 Problem Analysis:**

```typescript
// ❌ BAD: N+1 query problem
const assessments = await prisma.riskAssessment.findMany();
for (const assessment of assessments) {
  const risks = await prisma.risk.findMany({
    where: { assessmentId: assessment.id }
  }); // 1 + N queries!
}

// ✅ GOOD: Use Prisma include/select
const assessments = await prisma.riskAssessment.findMany({
  include: { risks: true }
  // Single query with JOIN
});

// ✅ BETTER: Selective field loading
const assessments = await prisma.riskAssessment.findMany({
  select: {
    id: true,
    title: true,
    status: true,
    risks: {
      select: {
        id: true,
        title: true,
        riskLevel: true
      }
    }
  }
});
```

**Critical API Routes to Optimize:**

1. **GET /api/dashboard/stats**
   - Current: Multiple queries
   - Optimized: Single aggregated query
   - Expected improvement: 3x faster

2. **GET /api/dashboard/risk-heatmap**
   - Current: Queries with filtering in memory
   - Optimized: Database-level aggregation
   - Expected improvement: 5x faster

3. **GET /api/assessments** (list with pagination)
   - Current: No indexing on filters
   - Optimized: Composite indexes
   - Expected improvement: 10x faster (large datasets)

4. **GET /api/ai-systems** (search)
   - Current: LIKE queries without full-text search
   - Optimized: PostgreSQL full-text search
   - Expected improvement: 100x faster

### 3. Connection Pooling

**Current Status:** ⏳ Not configured

**Recommended Setup:**

```env
# .env.local
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=5"

# Or use PgBouncer for connection pooling
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/db"
```

**Prisma Configuration:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## API Performance Optimization

### 1. Caching Strategy

**Response Caching (HTTP Level):**

```typescript
// Cache static framework data (rarely changes)
export const GET = async (req: NextRequest) => {
  const response = new Response(JSON.stringify(frameworks));
  response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour
  return response;
};

// Cache dashboard stats (refresh every 5 minutes)
export const GET = async (req: NextRequest) => {
  const response = new Response(JSON.stringify(stats));
  response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  return response;
};

// No cache for frequently updated data
export const GET = async (req: NextRequest) => {
  const response = new Response(JSON.stringify(assessments));
  response.headers.set('Cache-Control', 'no-cache, must-revalidate');
  return response;
};
```

**Caching Recommendations by Endpoint:**

| Endpoint | Cache Duration | Rationale |
|----------|---|---|
| `/frameworks` | 1 hour | Rarely changes |
| `/frameworks/[id]/controls` | 1 hour | Stable reference data |
| `/dashboard/stats` | 5 minutes | Summary data |
| `/dashboard/risk-heatmap` | 5 minutes | Summary data |
| `/dashboard/compliance` | 5 minutes | Summary data |
| `/ai-systems` | No cache | Frequently updated |
| `/assessments` | No cache | Frequently updated |
| `/risks/[id]` | No cache | Frequently updated |
| `/reports/*` | No cache | Generated fresh |

### 2. Pagination Best Practices

**Current Implementation:** ✅ Implemented

```typescript
// Good pagination with limits
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const pageSize = Math.min(
  parseInt(req.nextUrl.searchParams.get('pageSize') || DEFAULT_PAGE_SIZE),
  MAX_PAGE_SIZE
);

const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
const skip = (page - 1) * pageSize;

const data = await prisma.aiSystem.findMany({
  skip,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

**Recommendations:**
- Default page size: 10-25 items (not 50+)
- Maximum page size: 100 items
- Always include total count for UI pagination
- Use cursor-based pagination for large datasets (future)

### 3. Response Compression

**Current Status:** ✅ Next.js built-in gzip

```javascript
// next.config.ts - automatic gzip compression enabled
export default {
  compress: true // Enabled by default in production
};
```

**Current Bundle Analysis:** ⏳ Pending

```bash
# Analyze bundle size
npm run build
# Check .next/static/chunks/ directory
```

**Expected Bundle Sizes (gzip):**
- React + TypeScript: ~150KB
- Next.js framework: ~100KB
- UI Components (Shadcn): ~80KB
- Application code: ~70KB
- **Total Target: < 400KB gzip**

---

## Frontend Performance Optimization

### 1. Code Splitting

**Current Status:** ⏳ Not configured

**Recommended Strategy:**

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const RiskMatrix = dynamic(() => import('@/components/risk-assessment/risk-matrix-visualization'), {
  loading: () => <Skeleton height="400px" />,
  ssr: false // Reduce server bundle
});

const DashboardPage = () => {
  return (
    <>
      <StatsCards /> {/* Always load */}
      <RiskMatrix /> {/* Lazy load */}
    </>
  );
};
```

**Routes for Code Splitting:**
- Dashboard: Minimal core, lazy load charts
- Assessments: Wizard components lazy load per step
- Frameworks: Tree view components lazy load
- Reports: Export components lazy load

### 2. Image Optimization

**Current Status:** ⏳ Not needed for MVP (no images)

**Recommendations for Future:**
```typescript
// Use Next.js Image component
import Image from 'next/image';

export const ChartPlaceholder = () => {
  return (
    <Image
      src="/chart-placeholder.png"
      alt="Chart"
      width={800}
      height={400}
      priority={false}
    />
  );
};
```

### 3. React Performance

**Key Optimizations:**

```typescript
// 1. Memoize expensive components
import { memo } from 'react';

const RiskCard = memo(({ risk }: Props) => {
  return (/* large component */);
});

// 2. Use useCallback for event handlers
const handleRiskUpdate = useCallback((id: string, data: Risk) => {
  updateRisk(id, data);
}, [updateRisk]);

// 3. Use useMemo for computed values
const criticalRisks = useMemo(() => {
  return risks.filter(r => r.riskLevel === 'CRITICAL');
}, [risks]);

// 4. Split large lists with virtualization
import { FixedSizeList } from 'react-window';

const RiskList = ({ risks }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={risks.length}
      itemSize={60}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <RiskCard risk={risks[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};
```

---

## Monitoring & Measurement

### 1. Performance Monitoring Setup

**Recommended Tools:**
- Google Lighthouse (free, built-in)
- Web Vitals (Next.js integration)
- Sentry (error tracking)

**Implementation:**
```typescript
// pages/_app.tsx
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. API Performance Monitoring

**Simple logging approach:**

```typescript
// lib/api-middleware.ts
export const withPerformanceTracking = (handler: NextApiHandler) => {
  return async (req: NextRequest, res: NextResponse) => {
    const startTime = performance.now();
    const response = await handler(req, res);
    const duration = performance.now() - startTime;

    console.log(`[API] ${req.method} ${req.nextUrl.pathname} - ${duration.toFixed(2)}ms`);

    response.headers.set('X-Response-Time', `${duration}ms`);
    return response;
  };
};
```

### 3. Database Query Monitoring

**Prisma Logging:**
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    { emit: 'stdout', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' }
  ]
});
```

---

## Implementation Roadmap (Phase 7)

### Week 1: Database Optimization
- [ ] Create performance indexes
- [ ] Measure query execution times
- [ ] Identify N+1 query problems
- [ ] Optimize critical API endpoints

### Week 2: API Caching
- [ ] Implement Cache-Control headers
- [ ] Configure CDN caching (if applicable)
- [ ] Setup connection pooling
- [ ] Measure API response times

### Week 3: Frontend Optimization
- [ ] Implement code splitting
- [ ] Measure bundle size
- [ ] Setup performance monitoring
- [ ] Run Lighthouse audit

### Week 4: Testing & Validation
- [ ] Load testing (k6 or similar)
- [ ] Stress testing database
- [ ] Measure all performance metrics
- [ ] Document results

---

## Performance Testing

### Load Testing Script (k6)

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.1']
  }
};

export default function () {
  // Test dashboard endpoint
  let res = http.get('http://localhost:3000/api/dashboard/stats');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'duration < 500ms': (r) => r.timings.duration < 500,
  });

  // Test AI systems list
  res = http.get('http://localhost:3000/api/ai-systems?pageSize=20');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'duration < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

**Run tests:**
```bash
npm install -g k6
k6 run k6-load-test.js
```

---

## Checklist for Phase 7

- [ ] Database indexes created
- [ ] N+1 queries eliminated
- [ ] Connection pooling configured
- [ ] API response caching implemented
- [ ] Code splitting configured
- [ ] Bundle size < 400KB gzip
- [ ] Lighthouse score > 80
- [ ] API p95 response time < 500ms
- [ ] Page load time < 3 seconds
- [ ] Dashboard render time < 2 seconds
- [ ] Search response time < 1 second
- [ ] Load test passed (10 concurrent users)
- [ ] Monitoring setup complete
- [ ] All metrics documented

---

## Performance Targets Summary

| Metric | Target | Phase 7 Goal |
|--------|--------|---|
| Initial Page Load | < 3 seconds | ✅ Target |
| Subsequent Navigation | < 1.5 seconds | ✅ Target |
| API Response (p95) | < 500ms | ✅ Target |
| Dashboard Render | < 2 seconds | ✅ Target |
| Search Response | < 1 second | ✅ Target |
| Bundle Size (gzip) | < 500KB | ✅ Target |
| Lighthouse Score | > 80 | ✅ Target |

---

**Performance Guide Version:** 1.0
**Last Updated:** 2026-02-03
**Maintained By:** docs-manager agent
