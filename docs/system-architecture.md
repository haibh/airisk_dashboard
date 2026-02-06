# AIRisk Dashboard - System Architecture

**Version:** 3.1 | **Date:** 2026-02-06 | **Status:** MVP4 (Phase 14.5 + Phase 15)

---

## Technology Stack

```
Frontend: React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui
State: Zustand 5.0 (client, 4 stores), API routes (server)
Backend: Next.js 16 App Router + NextAuth.js 4.24 (JWT, 24h session)
Database: PostgreSQL 15+ with Prisma ORM 5.22 (20 models, 11 enums)
Internationalization: next-intl 4.8 (EN/VI)
Testing: Vitest 4.0 (262+ tests) + Playwright 1.58 (E2E)
Caching: Redis 5.9 (ioredis) + multi-layer LRU cache
Validation: Zod 4.3 (input schemas, API validation)
```

---

## High-Level Architecture

```
┌──────────────────────────────────┐
│   Browser (React 19 + i18n)      │
└───────────────┬──────────────────┘
                │ HTTPS/TLS 1.3
┌───────────────▼──────────────────┐
│   Next.js 16 App Router          │
│  ├─ UI Routes (SSR, 29 pages)    │
│  ├─ API Routes (REST, 53 routes) │
│  └─ Middleware (Auth + i18n)     │
└───────────────┬──────────────────┘
                │ Prisma ORM 5.22
┌───────────────▼──────────────────┐
│   PostgreSQL 15+                 │
│   (20 models + 11 enums)         │
│   (Connection pooling via Redis) │
└──────────────────────────────────┘
```

---

## Request Flow

1. **Browser → Middleware.ts** - Locale detection, auth check, CORS
2. **Middleware → Route Handler** - UI page or API endpoint
3. **Route Handler** - RBAC check, validation, business logic
4. **Route Handler → Database** - Prisma query with orgId filter (multi-tenant)
5. **Response → Browser** - Standard JSON or HTML

**API Response Format:**
```json
{
  "success": true,
  "data": { /* response */ },
  "pagination": { "total": 100, "page": 1, "pageSize": 10 }
}
```

---

## Authentication & Authorization

### JWT Strategy
- **Algorithm:** HS256
- **Lifespan:** 24 hours
- **Refresh:** Secure HttpOnly cookie
- **Idle Timeout:** 30 minutes

### RBAC Hierarchy (5 Roles)
| Role | Permissions |
|------|------------|
| Admin | Full access to all resources |
| Risk Manager | Manage AI systems, assessments, risks |
| Assessor | Create/edit assessments, add risks |
| Auditor | View-only access to reports |
| Viewer | View dashboard only |

### Authorization Checks
- Middleware: Protects `/[locale]/(dashboard)/*` routes
- API Routes: `getServerSession()` + `hasMinimumRole()` checks
- Database: Filter by `organizationId` (multi-tenant isolation)

---

## API Routes & Endpoints

```
/api/
├── /auth/[...nextauth]/       # NextAuth handlers
├── /ai-systems/               # CRUD: GET, POST, PUT, DELETE
├── /assessments/              # CRUD + /[id]/risks
├── /risks/[id]/               # Risk operations
├── /frameworks/               # Get frameworks + controls + mappings
├── /dashboard/                # /stats, /risk-heatmap, /compliance, /activity
├── /reports/                  # /risk-register, /assessment-summary, /compliance
├── /organizations/            # GET, PUT org profile
├── /users/                    # CRUD users with pagination
├── /invitations/              # CRUD invitations + /[id]/accept (public)
├── /api-keys/                 # CRUD API keys (max 10/org)
├── /webhooks/                 # CRUD webhooks + /[id]/test + /[id]/deliveries
├── /notifications/            # GET list + /unread-count + /mark-read
└── /audit-logs/               # GET paginated + filters + /export (CSV)
```

**Standards:**
- All endpoints support pagination (page, pageSize)
- Filtering by organizationId enforced
- Standard error format with HTTP status codes

---

## Database Schema (20+ Models)

### Core Models

| Entity | Purpose |
|--------|---------|
| **Organization** | Root tenant entity |
| **User** | System users (5 roles, isActive, lastLoginAt, 30min idle timeout) |
| **AISystem** | AI inventory (name, type, status, classification) |
| **Framework** | 23 compliance frameworks (1,323 total controls) - AI Risk (4), AI Management (4), Security (7), Compliance (7), AI Control (1) |
| **Control** | 1,323 framework-specific controls with 172 cross-framework mappings |
| **Mapping** | Cross-framework control relationships (HIGH/MEDIUM/LOW confidence) |
| **Assessment** | Risk assessment snapshots (DRAFT, IN_PROGRESS, UNDER_REVIEW, APPROVED) |
| **Risk** | Individual risks (likelihood 1-5, impact 1-5, scores) |
| **Evidence** | Evidence artifact metadata (SHA-256 hash) |
| **EvidenceLink** | Links evidence to risks/controls/assessments |
| **Task** | Remediation tasks (treatment workflow) |
| **AuditLog** | Immutable action logs (userId, action, entityType, timestamp) |
| **Invitation** | User invitations (email, role, token, status: PENDING/ACCEPTED/EXPIRED) |
| **APIKey** | SHA-256 hashed API keys (prefix-based, permissions: READ/WRITE/ADMIN) |
| **Webhook** | Webhook endpoints (URL, events, secret, active status, SSRF protected) |
| **WebhookDelivery** | Delivery logs (status: PENDING/SUCCESS/FAILED, response code, retry count) |
| **Notification** | User notifications (7 types: ASSESSMENT_APPROVED, RISK_ESCALATED, etc.)
| **SavedFilter** | Per-user dashboard filters (search, sort, date range)
| **ScheduledJob** | Cron-based tasks (execution logs, retry tracking) |

### Key Relationships
- Organization 1:N User, AISystem, Assessment
- AISystem 1:N Assessment
- Framework 1:N Control, Assessment
- Control N:M Control (via Mapping)
- Assessment 1:N Risk
- Evidence N:M entities (via EvidenceLink)

### Performance Indexes
```sql
idx_aiSystem_orgId, idx_assessment_aiSystemId, idx_risk_assessmentId,
idx_control_frameworkId, idx_user_orgId, idx_auditLog_timestamp
```

---

## Component Architecture

### Directory Structure (59 Files, 8.3K LOC)
```
src/components/
├── layout/              # Header, Sidebar (with notification dropdown, user menu)
├── ui/                  # Shadcn/ui wrappers (23 components: table, switch, checkbox, alert-dialog, scroll-area, dialog, tabs, textarea, popover, etc.)
├── forms/               # AI System, Assessment, User, Webhook, Evidence forms
├── tables/              # Data table with pagination, sorting, filtering
├── charts/              # Recharts: risk heatmap, compliance scorecard
├── risk-assessment/     # 5-step wizard, risk entry form, matrix visualization
├── frameworks/          # Framework control tree, controls table, mapping visualization
├── evidence/            # Evidence upload, approval workflow, versioning
├── gap-analysis/        # Gap analysis visualization, CSV export
├── settings/            # Organization profile, user management, API keys, webhooks, scheduled jobs
├── notifications/       # Notification dropdown, list item, unread badge
├── audit-log/           # Filter toolbar, viewer table, detail diff viewer
├── search/              # Global multi-entity search interface
├── ai-systems/          # AI system CRUD forms, list view
└── providers/           # NextAuth, Theme, Zustand providers
```

### Hierarchy
```
App → SessionProvider → ThemeProvider → Layout
  → Sidebar (navigation)
  → Header (user menu)
  → Main content (page-specific components)
```

---

## Risk Scoring Engine

### Calculation Formula
```
Inherent Risk = Likelihood (1-5) × Impact (1-5) = 1-25
Residual Risk = Inherent × (1 - ControlEffectiveness/100)
```

### Risk Levels & Actions
| Level | Score | Action |
|-------|-------|--------|
| Low | 1-4 | Accept or monitor |
| Medium | 5-9 | Mitigate within 90 days |
| High | 10-16 | Mitigate within 30 days |
| Critical | 17-25 | Immediate action required |

### 8 Risk Categories
Bias/Fairness, Privacy, Security, Reliability, Transparency, Accountability, Safety, Other

---

## Data Flow: Risk Assessment

```
1. Create Assessment (Step 1-2)
   ↓
2. Select Framework - any of 23 supported frameworks (Step 3)
   ↓
3. Identify & Score Risks (Step 4)
   - For each risk: category, likelihood, impact
   - Calculate inherent = L × I
   - Set control effectiveness
   - Calculate residual = inherent × (1-E%)
   ↓
4. Save Assessment (DRAFT)
   ↓
5. Review & Submit (APPROVED, UNDER_REVIEW, IN_PROGRESS)
```

---

## Dashboard Architecture (Phase 14.5 - Feb 2026)

**4-Tab Interface:**
1. **Executive Brief** - KPI summary, top risks, compliance overview
2. **Detailed Analytics** - Comprehensive charts (heatmap, compliance radar, treemap)
3. **Operations** - System health, risk alerts, assessment progress
4. **AI Risk** - Model registry, risk cards, lifecycle tracking, cross-framework mapping

**Widget System (NEW):**
- **Simple Mode** (6 consolidated widgets): Risk Pulse Strip, Unified Risk View, Compliance Status, Next-Best Actions, Activity Feed, Model Registry
- **Advanced Mode** (15 individual widgets): All metrics + framework-specific visualizations (23 frameworks)
- **Customization**: Drag-and-drop reordering via dnd-kit, widget visibility toggles, view mode persistence (localStorage via use-dashboard-widget-config)

## Dashboard Data Flow

```
User opens Dashboard
    ↓
[Select view mode: Simple | Advanced]
    ↓
[Parallel API calls via useDashboardData hook]
├── GET /api/dashboard/stats           (KPI counts)
├── GET /api/dashboard/risk-heatmap    (risk distribution)
├── GET /api/dashboard/compliance      (framework scores - 23 frameworks)
└── GET /api/dashboard/activity        (recent actions)
    ↓
[PostgreSQL aggregations]
├── COUNT(*) risks by status/level
├── SUM(score) by category
├── Compliance % per 23 frameworks
└── Recent activities
    ↓
[Render in dnd-kit sortable container]
├── Dashboard-widget-wrapper components (minimize/close controls)
├── Portal-based tooltips (escape CSS transforms)
├── Settings panel (mode switch, visibility toggles)
└── Simple or Advanced mode layout
```

---

## Security Implementation

### Authentication
- NextAuth.js + JWT + bcrypt password hashing
- Session stored in secure HttpOnly cookie
- Token expiration + automatic renewal

### Authorization
- RBAC: 5-role hierarchy
- Multi-tenant isolation via organizationId filter
- Protected middleware on dashboard routes

### Data Protection
- TLS 1.3 enforced
- PostgreSQL at-rest encryption (cloud provider)
- Sensitive data excluded from logs
- No API keys/secrets in repository

### Encryption
- Passwords: bcrypt (salt rounds = 10)
- Tokens: JWT HS256
- Evidence: SHA-256 hash verification

---

## Scalability Architecture

### Horizontal Scaling
```
Load Balancer
    ├─ App Instance 1 (Node.js)
    ├─ App Instance 2 (Node.js)
    └─ App Instance 3 (Node.js)
        ↓
Shared Resources:
├─ PostgreSQL (managed, read replicas)
├─ Redis Cache (sessions, tokens)
└─ S3/Blob Storage (evidence files)
```

### Database Optimization
- Connection pooling (PgBouncer)
- Indexed foreign keys (orgId, aiSystemId, etc.)
- Read replicas for reporting
- Query caching via Redis

### Caching Strategy
- HTTP Cache Headers: max-age=3600 (frameworks, controls)
- Redis: Sessions (24h), Tokens (7d), Query results (1h)
- CDN: Static assets (CSS/JS 1 week, images 1 month)

---

## Testing Infrastructure

### Test Strategy (Phase 7)

**Unit Tests (Vitest)**
- Risk scoring calculator
- Utility functions
- Auth helpers

**Integration Tests (Vitest + Mocks)**
- 30+ API endpoint tests
- Mock Prisma client
- Session fixtures

**E2E Tests (Playwright)**
1. auth-login-flow.spec.ts (credentials, validation, errors)
2. auth-unauthorized-access-redirect.spec.ts (auth checks)
3. dashboard-page-load.spec.ts (component rendering, data)

**Performance Benchmarks**
- Page load: < 3s target
- API response P95: < 500ms target
- Validates CRUD endpoints

**Coverage:** 95%+ API, critical paths covered

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- Skip link to #main-content
- Focus indicators (focus-visible)
- Semantic HTML hierarchy

### Color & Contrast
- 4.5:1 ratio for normal text
- 3:1 ratio for UI components
- Tailwind + Shadcn/ui defaults WCAG AA

### Screen Reader Support
- ARIA labels on icon buttons
- Semantic elements: `<header>`, `<main>`, `<nav>`, `<button>`
- Radix UI primitives with built-in a11y

### Tested Roles
- All 5 roles (admin, risk_manager, assessor, auditor, viewer)

---

## Deployment Architecture

### Environments
**Development:** Node.js 18+, PostgreSQL, .env.local, localhost:3000

**Production:**
- Containerized (Docker)
- Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- TLS/SSL certificate
- Load balancer (ALB, Azure LB)
- CDN for static assets
- Auto-scaling groups

### CI/CD
- GitHub Actions workflow
- Automated testing on PR
- Docker image build
- Cloud deployment
- HTML report + traces

---

## Error Handling

### Global Error Handler
All endpoints return standard format:
```json
{
  "success": false,
  "error": "User-friendly message",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 403: Forbidden (no role permission)
- 404: Not found
- 500: Internal server error

---

## Monitoring & Observability

### Logging
- All API requests (method, path, status, duration)
- Auth events (login, logout, role changes)
- Data mutations (create, update, delete)
- Errors with stack traces
- No sensitive data in logs

### Health Check
```
GET /health
Response: { database: ok, redis: ok, application: ok }
```

### Metrics
- API response times (p50, p95, p99)
- Request/error rates
- Database performance
- Memory/CPU usage
- Active assessments, risks by severity

---

## i18n Implementation

### Locales
- **English (en)** - Default
- **Vietnamese (vi)** - Regional support

### Structure
- Messages in `src/i18n/messages/{locale}.json`
- Namespaces: common, auth, dashboard, assessment, frameworks
- Middleware applies locale based on URL: `/{locale}/*`
- `useTranslations()` hook in components

---

## File Upload & Evidence (MVP2)

**Planned for Phase 8:**
- File upload with SHA-256 hashing
- Evidence versioning
- Approval workflow
- S3/Blob storage integration

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page load | < 3s | ✅ Verified |
| API response P95 | < 500ms | ✅ Verified |
| Bundle size | < 500KB gzip | ⏳ Optimization pending |
| Test coverage | > 80% | ✅ ~95% |

---

## Multi-Tenant Features (MVP4 Complete)

### Phase 11: Organization & User Management
- Organization profile management (name, industry, address, settings)
- User CRUD with pagination, filtering, role management
- User invitation system (email-based, token validation, expiry)
- User profile editing, password change
- Active/inactive user tracking with last login timestamp

### Phase 12: API Keys & Webhooks
- API key generation with SHA-256 hashing, prefix-based identification
- Key permission levels (READ, WRITE, ADMIN), max 10 keys per org
- Webhook CRUD with SSRF protection, secret signing (HMAC-SHA256)
- Webhook event dispatcher (ai_system.created/updated/deleted, assessment.*)
- Webhook delivery worker with retry logic, delivery logs
- Test webhook functionality

### Phase 13: Notifications, Audit Log & Polish
- Notification service (7 types: ASSESSMENT_APPROVED, RISK_ESCALATED, etc.)
- Real-time notification dropdown with 60s polling, unread count badge
- Audit log viewer with advanced filters (user, action, entity, date range)
- Audit log CSV export for compliance reporting
- Notification detail diff viewer for change tracking

### Security Enhancements
- API key authentication middleware with SHA-256 validation
- Webhook signature verification (HMAC-SHA256)
- SSRF protection for webhook URLs (block private IPs, localhost)
- User session tracking (isActive check, lastLoginAt updates)

---

## Future Roadmap

**MVP5:** Evidence management, Redis caching, rate limiting
**MVP6:** Gap analysis, scheduled reports, workflow automation
**MVP7:** Mobile app, real-time collaboration, SSO integrations

---

**Architecture Version:** 3.0 | **Last Updated:** 2026-02-04 | **Maintained By:** docs-manager agent
