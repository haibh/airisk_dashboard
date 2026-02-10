# AIRisk Dashboard - System Architecture

**Version:** 3.5 | **Date:** 2026-02-09 | **Status:** MVP5 (Phases 16-18 + Security Hardening Complete)

---

## Technology Stack

```
Frontend: React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui
State: Zustand 5.0 (client, 4 stores), API routes (server)
Backend: Next.js 16 App Router + NextAuth.js 4.24 (JWT, 24h session)
Database: PostgreSQL 15+ with Prisma ORM 5.22 (42 models, 15 enums)
Internationalization: next-intl 4.8 (EN/VI)
Testing: Vitest 4.0 (1,080 tests, 55 files, 100% passing) + Playwright 1.58 (28 E2E, 26 passing)
Caching: Redis 5.9 (ioredis) + multi-layer LRU cache
Validation: Zod 4.3 (input schemas, API validation)
Security: ClamAV virus scanning, HMAC-SHA256 webhook signing, timing-safe auth
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
│  ├─ API Routes (REST, 97 route files) │
│  └─ Middleware (Auth + i18n)     │
└───────────────┬──────────────────┘
                │ Prisma ORM 5.22
┌───────────────▼──────────────────┐
│   PostgreSQL 15+                 │
│   (42 models + 15 enums)         │
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
├── /reports/                  # /risk-register, /assessment-summary, /compliance (Phase 21)
├── /organizations/            # GET, PUT org profile
├── /users/                    # CRUD users with pagination
├── /invitations/              # CRUD invitations + /[id]/accept (public)
├── /api-keys/                 # CRUD API keys (max 10/org)
├── /webhooks/                 # CRUD webhooks + /[id]/test + /[id]/deliveries
├── /notifications/            # GET list + /unread-count + /mark-read
├── /audit-logs/               # GET paginated + filters + /export (CSV)
├── /evidence/                 # File operations
│   ├── /[id]/versions         # NEW Phase 16: GET version history, POST new version
│   └── /storage-usage         # NEW Phase 16: GET org quota and usage
├── /cron/                     # NEW Phase 17: POST trigger job execution
├── /report-templates/         # NEW Phase 17: GET/POST templates, /[id] GET/PUT/DELETE
├── /import/                   # NEW Phase 18: Bulk operations
│   ├── /risks                 # POST bulk import with validation
│   └── /status/[jobId]        # GET import progress
├── /tasks/                    # NEW Phase 18: Task management
│   ├── /                      # GET list, POST create
│   ├── /[id]                  # GET, PUT, DELETE
│   └── /[id]/comments         # GET list, POST comment
├── /supply-chain/             # Phase 21: /vendors (CRUD), /risk-paths
├── /regulatory/               # Phase 21: /changes (CRUD), /impacts
├── /benchmarking/             # Phase 21: /snapshots (CRUD), /comparison, /percentiles
└── /roi/                      # Phase 21: POST /calculate, /scenarios (CRUD)
```

**Standards:**
- All endpoints support pagination (page, pageSize)
- Filtering by organizationId enforced
- Standard error format with HTTP status codes

---

## Database Schema (42 Models + 15 Enums)

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
| **RiskScoreHistory** | Historical risk scoring for trend analysis |
| **Evidence** | Evidence artifact metadata (SHA-256 hash) |
| **EvidenceLink** | Links evidence to risks/controls/assessments |
| **Task** | Remediation tasks (treatment workflow) |
| **AuditLog** | Immutable action logs (userId, action, entityType, timestamp) |
| **Invitation** | User invitations (email, role, token, status: PENDING/ACCEPTED/EXPIRED) |
| **APIKey** | SHA-256 hashed API keys (prefix-based, permissions: READ/WRITE/ADMIN) |
| **Webhook** | Webhook endpoints (URL, events, secret, active status, SSRF protected) |
| **WebhookDelivery** | Delivery logs (status: PENDING/SUCCESS/FAILED, response code, retry count) |
| **Notification** | User notifications (7 types: ASSESSMENT_APPROVED, RISK_ESCALATED, etc.) |
| **SavedFilter** | Per-user dashboard filters (search, sort, date range) |
| **ScheduledJob** | Cron-based tasks (execution logs, retry tracking) (Phase 17) |
| **EvidenceVersion** | Evidence file versions with history tracking and checksums (Phase 16) |
| **ReportTemplate** | Custom report templates with Handlebars/Markdown (Phase 17) |
| **Task** | Remediation tasks (assignment, status, deadlines) (Phase 18) |
| **TaskComment** | Task discussion threads and activity tracking (Phase 18) |
| **ImportJob** | Bulk import tracking with progress and error logs (Phase 18) |
| **Vendor** | Vendor registry with risk profiles (Phase 21) |
| **VendorRiskPath** | Risk propagation paths through supply chain (Phase 21) |
| **RegulatoryChange** | Regulatory change events with effective dates (Phase 21) |
| **FrameworkChange** | Framework version changes and updates (Phase 21) |
| **ChangeImpact** | Impact assessment on controls/assessments (Phase 21) |
| **BenchmarkSnapshot** | Point-in-time org metrics for comparison (Phase 21) |
| **BenchmarkResult** | Anonymized peer comparison results (Phase 21) |
| **RiskCostProfile** | Cost parameters per risk (frequency, loss value) (Phase 21) |
| **MitigationInvestment** | Mitigation strategy cost tracking (Phase 21) |
| **ROSICalculation** | ROSI metrics and scenario calculations (Phase 21) |
| **InsightTemplate** | Narrative insight templates and rules (Phase 21) |
| **GeneratedInsight** | AI-generated insights from data analysis (Phase 21) |
| **AnomalyEvent** | Z-score anomalies and statistical outliers (Phase 21) |
| **DashboardLayout** | User dashboard layout preferences and widget order (Phase 21) |
| **ComplianceChain** | Requirement→Control→Evidence traceability chain (Phase 21) |

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

### Directory Structure (100+ Files, 15K+ LOC)
```
src/components/
├── layout/              # Header, Sidebar (with notification dropdown, user menu)
├── ui/                  # Shadcn/ui wrappers (23 components: table, switch, checkbox, alert-dialog, scroll-area, dialog, tabs, textarea, popover, etc.)
├── forms/               # AI System, Assessment, User, Webhook, Evidence forms
├── tables/              # Data table with pagination, sorting, filtering
├── charts/              # Recharts: risk heatmap, compliance scorecard, burndown, velocity
├── risk-assessment/     # 5-step wizard, risk entry form, matrix visualization
├── frameworks/          # Framework control tree, controls table, mapping visualization
├── evidence/            # Evidence upload, approval workflow, versioning
├── gap-analysis/        # Gap analysis visualization, CSV export
├── settings/            # Organization profile, user management, API keys, webhooks, scheduled jobs
├── notifications/       # Notification dropdown, list item, unread badge
├── audit-log/           # Filter toolbar, viewer table, detail diff viewer
├── search/              # Global multi-entity search interface
├── ai-systems/          # AI system CRUD forms, list view
├── dashboard/           # 26+ files: 4 views + 15+ widgets + dnd-kit components (Phase 14.5)
├── ops-center/          # System health, risk alerts, assessment progress (NEW Phase 21)
├── ai-risk-view/        # Model registry, risk cards, lifecycle tracking (NEW Phase 21)
├── supply-chain/        # NEW Phase 21: Vendor graph, registry, risk visualization
├── regulatory-tracker/  # NEW Phase 21: Timeline, impact assessment, change list
├── benchmarking/        # NEW Phase 21: Peer comparison, percentile ranking, metrics
├── roi-calculator/      # NEW Phase 21: ALE/ROSI calculator, scenario builder, comparison
├── insights/            # NEW Phase 21: Narrative insights, anomaly indicators, trends
├── compliance-graph/    # NEW Phase 21: Chain diagram, coverage donut, filter panel
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

## Advanced Features Architecture (Phase 21 - Complete)

| Feature | Purpose | Key Components |
|---------|---------|-----------------|
| **Risk Supply Chain** | Vendor graph + risk cascade | Vendor, VendorRiskPath models; React Flow visualization |
| **Regulatory Tracker** | Change timeline + impact assessment | RegulatoryChange, FrameworkChange, ChangeImpact models; timeline viz |
| **Benchmarking** | Peer comparison (Laplace noise, ε=0.5) | BenchmarkSnapshot, BenchmarkResult; differential privacy aggregation |
| **ROI Calculator** | ALE/ROSI modeling (scenarios, cost analysis) | RiskCostProfile, MitigationInvestment, ROSICalculation models |
| **Anomaly Detection** | Z-score analysis (|Z|>2.5) + narratives | Z-score engine, InsightTemplate, GeneratedInsight, AnomalyEvent models |
| **Burndown Charts** | Sprint task velocity + framework overlap | Recharts sprint viz; Sankey diagram (framework → controls) |
| **Dashboard Layouts** | 3 presets (Executive/Analyst/Auditor) + dnd-kit reordering | DashboardLayout model; localStorage + DB persistence |
| **Compliance Chain** | Requirement→Control→Evidence traceability | ComplianceChain model; React Flow chain diagram |

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

### Docker Containerization (Feb 2026)

**3-Stage Dockerfile (421MB image):** deps (all) → builder (Next.js + Prisma) → runner (Alpine, prod only)

**Docker Compose Stack:**
- Base: App + PostgreSQL + Redis + MinIO
- Dev: Source mount, hot-reload, auto-seed
- Prod: Nginx reverse proxy (SSL/TLS, gzip, rate limit 100 req/min, 1-year asset cache)

**Health Check:** IPv4 `127.0.0.1:3000/api/health` (30s interval, returns services status)

**Resource Limits (Prod):** 1GB memory, 1.5 CPU cores, JSON log rotation (10MB/file, 3 files)

**Makefile (21 targets):** `dev`, `prod`, `build`, `logs`, `clean`, `backup`, `ssl-self-signed`, etc.

**Critical Fixes:**
- Keep devDeps in deps stage (Prisma/TypeScript build requirement)
- Alpine binary target: `linux-musl-openssl-3.0.x`
- IPv4 health checks for Alpine networking
- Automated entrypoint: Prisma generate + migrate + seed
- Wait scripts for database readiness

**Files:** Dockerfile, docker-compose.{base,dev,prod}, Makefile, .dockerignore, nginx-reverse-proxy.conf, startup/backup scripts

### Environments
**Development:** Node.js 18+, PostgreSQL, .env.local, localhost:3000
**Docker Dev:** `make dev` (source mount, hot-reload, auto-seed, debug ports)
**Docker Prod:** `make prod` (nginx, SSL, resource limits, log rotation)

**Production (Cloud):**
- Containerized (Docker 421MB image)
- Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- TLS/SSL certificate (nginx termination)
- Load balancer (ALB, Azure LB)
- CDN for static assets
- Auto-scaling groups

### CI/CD
- GitHub Actions workflow (.github/workflows/ci.yml, deploy.yml)
- Automated testing on PR (1,080 tests)
- Docker image build + push (docker-build job)
- Trivy security scan (security-scan job)
- Cloud deployment automation
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

| Phase | Feature | Key Details |
|-------|---------|-------------|
| **P11** | Org & User Mgmt | Org profile, user CRUD, email invitations (token-based), profile editing, login tracking |
| **P12** | API Keys & Webhooks | SHA-256 hashing, max 10/org, SSRF protection, HMAC-SHA256 signing, event dispatcher, retry logic |
| **P13** | Notifications & Audit | 7 notification types, 60s polling, audit log + filters + CSV export, diff viewer |
| **Security** | Auth & Validation | API key middleware (SHA-256), webhook verification (HMAC-SHA256), SSRF blocking, session tracking |

---

## MVP5 Backend Implementation (Phases 16-18 — Complete)

| Phase | Feature | Architecture | Key Details |
|-------|---------|--------------|------------|
| **P16** | File Storage & Evidence | Evidence → Virus Scan (ClamAV) → S3/Blob → Quota Mgmt | Version history, org quotas (10GB), bulk upload, signed URLs |
| **P17** | Scheduled Reports & Cron | Cron → Queue → Generators (PDF/Excel) → Email (SMTP) → S3 | Templates (Handlebars), 7-day signed URLs, 90-day cleanup |
| **P18** | Bulk Import & Tasks | CSV/Excel → Zod validation → Conflict detection → Tasks | Streaming import, duplicate detection, conflict resolution, comments |

---

## Future Roadmap

**MVP6 (Phase 19+):** Enterprise SSO/SAML, mobile app, real-time collaboration, advanced SIEM analytics, machine learning anomaly detection
**MVP7+ (Phase 25+):** Multi-region deployment, managed SaaS hosting, partner marketplace, custom integrations

---

**Architecture Version:** 3.5 | **Last Updated:** 2026-02-09 | **Maintained By:** docs-manager agent
**Test Coverage:** 1,080/1,080 passing (100%) | **Security:** All CRITICAL + HIGH resolved
