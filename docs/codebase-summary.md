# AIRisk Dashboard - Codebase Summary

**Generated:** 2026-02-09
**Status:** MVP5 Complete (Phase 18) + MVP6 Enterprise Features (In Progress)
**Total Files:** 483 files (src/, prisma/, tests/, docs/, etc.)
**Total Lines:** ~64,678 LOC (source) + 24,000+ LOC (seeds, tests)
**Total Tokens:** 595,053 tokens (595K)
**Latest:** Phase 16-18 (evidence versions, tasks, bulk import, reports, file storage, scheduled reports, SSO/SAML, SCIM 2.0, session tracking, IP allowlist) + Docker/CI-CD

---

## Executive Overview

AIRisk Dashboard is a comprehensive AI Risk Management Intelligence Platform built with:
- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Next.js 16 App Router
- **Database:** PostgreSQL 15+ with Prisma ORM (42 models, 15 enums)
- **Authentication:** NextAuth.js with JWT (24h session, 30min idle)
- **Internationalization:** next-intl (EN/VI)
- **State Management:** Zustand (4 stores)
- **UI Components:** Shadcn/ui (23 wrappers) + Radix UI
- **Testing:** Vitest 4.0+ (1,080 passing across 55 files) + Playwright 1.58 (28 E2E, 26 passing)
- **Visualizations:** Recharts, React Flow (~45KB gzip)
- **Drag & Drop:** dnd-kit with rectSortingStrategy
- **Slider:** @radix-ui/react-slider for ROI inputs

The platform enables organizations to manage AI system risks end-to-end through comprehensive dashboards, risk assessments, framework mapping, and compliance tracking.

---

## Project Structure

### Root Configuration Files
- **next.config.ts** - Next.js configuration with i18n routing
- **tsconfig.json** - TypeScript strict mode configuration
- **tailwind.config.ts** - Tailwind CSS theme and component configuration
- **components.json** - Shadcn/ui components registry
- **package.json** - Dependencies and build scripts
- **postcss.config.mjs** - PostCSS plugins for Tailwind
- **.env.example** - Environment variables template
- **Dockerfile** (109L) - 3-stage build: deps → builder → runner (421MB)
- **docker-compose.yml** (127L) - Base stack: app + postgres + redis + minio
- **docker-compose.dev.yml** (52L) - Dev overrides: hot-reload + auto-seed
- **docker-compose.prod.yml** (137L) - Prod overrides: nginx + limits
- **Makefile** (116L) - 21 targets: dev, prod, build, logs, clean, backup, ssl
- **.dockerignore** - Build context exclusions
- **.env.docker.example** - Docker environment template

### Directory Structure

```
AIRisk_Dashboard/
├── .claude/                    # Claude Code configuration
│   ├── rules/                  # Development and workflow rules
│   └── skills/                 # Custom Python scripts for AI assistance
├── docker/                     # Docker configuration
│   └── nginx/
│       └── nginx-reverse-proxy.conf  # 130L: SSL, gzip, rate limit, caching
├── scripts/                    # Automation scripts
│   ├── docker-entrypoint-startup.sh       # Container startup automation
│   ├── wait-for-postgres-database-ready.sh # DB readiness check
│   └── postgres-backup-with-rotation.sh   # Backup with 7-day rotation
├── prisma/                     # Database schema and seeding
│   ├── schema.prisma           # Complete data model (20 models, 11 enums)
│   ├── seed.ts                 # User and organization seeding
│   ├── seed-frameworks.ts      # NIST AI RMF + ISO 42001 data
│   ├── seed-cis-controls.ts    # CIS Controls v8.1
│   ├── seed-csa-aicm.ts        # CSA AICM framework
│   ├── seed-nist-csf.ts        # NIST Cybersecurity Framework
│   ├── seed-pci-dss.ts         # PCI DSS v4.0.1
│   ├── seed-iso-27001.ts       # ISO 27001:2022
│   └── seed-scf.ts             # Secure Controls Framework v2025.4
├── src/
│   ├── app/                    # Next.js app router structure
│   │   ├── [locale]/
│   │   │   ├── (auth)/         # Authentication pages (theme-adaptive)
│   │   │   │   └── login/      # Unified adaptive UI with theme toggle (Feb 2026)
│   │   │   ├── (dashboard)/    # Protected dashboard routes
│   │   │   │   ├── dashboard/  # 4-tab unified: Executive Brief | Detailed Analytics | Operations | AI Risk
│   │   │   │   ├── ai-systems/
│   │   │   │   ├── risk-assessment/
│   │   │   │   ├── frameworks/
│   │   │   │   └── [DELETED] technical-view/ (merged into dashboard tabs)
│   │   │   └── layout.tsx
│   │   └── api/                # REST API endpoints
│   │       ├── auth/
│   │       ├── ai-systems/
│   │       ├── assessments/
│   │       ├── frameworks/
│   │       ├── dashboard/
│   │       └── reports/
│   ├── components/             # 174 files across 27 directories (~26,900 LOC)
│   │   ├── dashboard/          # 31 files (4 views, 15 widgets, drag-drop controls)
│   │   ├── settings/           # 17 files (users, org, SSO, SCIM, audit, API keys)
│   │   ├── evidence/           # 6 files (upload, versions, quota, approval)
│   │   ├── tasks/              # 5 files (list, detail, create, comments, NEW)
│   │   ├── charts/             # 6 files (Sankey, burndown, velocity, matrix, etc.)
│   │   ├── gap-analysis/       # 5 files (framework mapping, pairwise, visualization)
│   │   ├── roi-calculator/     # 5 files (scenarios, payback, analysis)
│   │   ├── supply-chain/       # 8 files (vendor graph, risk heatmap)
│   │   ├── regulatory-tracker/ # 6 files (feed, impact, controls)
│   │   ├── benchmarking/       # 4 files (trends, percentiles, peers)
│   │   ├── ai-risk-view/       # 7 files (radar, treemap, registry, lifecycle)
│   │   ├── insights/           # 5 files (feed, anomaly, stats)
│   │   ├── landing/            # 3 files (hero, sections, content)
│   │   ├── auth/               # 2 files (layout, providers)
│   │   ├── forms, tables, ui/  # Input components, data tables, shadcn wrappers
│   │   └── [other dirs]/       # Notifications, audit-log, search, layout, providers
│   ├── lib/                    # 51 files, 7,259 LOC (11 categories)
│   │   ├── Core (7): db, redis-client, logger, storage-service, notification-service, utils
│   │   ├── Auth & Security (8): auth-helpers, sso-jit-provisioning, scim-user-sync, saml-jackson, ip-allowlist-checker, api-key-*
│   │   ├── Caching (4): cache-service, cache-advanced, cache-invalidation, cache-warming
│   │   ├── Validation (2): api-validation-schemas (Zod v4), api-error-handler
│   │   ├── Risk Calculators (5): risk-scoring, risk-velocity-batch, supply-chain-risk, regulatory-impact, roi-rosi
│   │   ├── Analytics (5): gap-analysis-engine, global-search, control-mapping-transformer, compliance-chain, anomaly-detector
│   │   ├── Reports (6): scheduled-job-*, email-smtp, report-*-generator (PDF/Excel), file-manager
│   │   ├── Import/Export (2): bulk-import-service, export-generator
│   │   ├── Webhooks (3): webhook-event-dispatcher, webhook-delivery-worker, webhook-signature-generator
│   │   ├── Enterprise (6): file-virus-scanner, organization-storage-quota, active-session-tracker, rate-limiter, import-parser, insight-generator
│   │   └── Advanced Analytics (3): benchmarking-differential-privacy, burndown-calculator, audit-log-export-csv
│   ├── store/                  # Zustand state management
│   ├── types/                  # TypeScript type definitions
│   ├── i18n/                   # Internationalization
│   │   ├── messages/
│   │   │   ├── en.json
│   │   │   └── vi.json
│   │   └── request.ts
│   └── middleware.ts           # Next.js middleware (auth, i18n)
├── docs/
│   ├── product_requirement_documents.md    # Complete PRD
│   └── codebase-summary.md                 # This file
├── plans/
│   ├── 2026-02-03-mvp1-implementation/
│   │   └── plan.md             # Implementation plan & progress
│   ├── reports/                # Agent execution reports
│   └── templates/              # Documentation templates
└── node_modules/               # Dependencies

```

---

## Core Modules & Features

### 1. Authentication & Authorization (NFR-SEC-01)
**Status:** ✅ Completed (Phase 2 + Feb 2026 Theme Unification)

**Implementation:**
- NextAuth.js with JWT strategy
- Role-based access control (RBAC)
- Login page with unified adaptive UI (theme-aware, toggles light/dark)
- Auth layout: theme toggle button (Sun/Moon), semantic HTML structure
- Protected API routes via middleware
- Seed script with 5 test users

**Feb 2026 Theme Consolidation:**
- Migrated from hardcoded dark theme to CSS variable tokens (`hsl(var(--xxx))`)
- Adaptive styling: `auth-adaptive-bg` (light pastels / dark gradient)
- Standard shadcn Card/Input/Label without custom color overrides
- Full dark/light toggle support via `next-themes`
- Mouse-glow spotlight effect on dark backgrounds
- Particle animation background

**Key Files:**
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth-helpers.ts`
- `src/middleware.ts`
- `src/app/[locale]/(auth)/layout.tsx` (theme toggle, adaptive styling)
- `src/app/[locale]/(auth)/login/page.tsx` (unified adaptive UI)
- `src/app/globals.css` (CSS variables, adaptive utilities, animations)
- `prisma/seed.ts`

**Roles & Permissions:**
| Role | Dashboard | AI Systems | Assessments | Evidence |
|------|-----------|-----------|-------------|----------|
| Admin | Full | Full | Full | Full |
| Risk Manager | View | Full | Full | Full |
| Assessor | View | View | Create/Edit | Create |
| Auditor | View | View | View | View |
| Viewer | View | View | View | View |

---

### 1.1 Theme System & Landing Page (Phase 14, Feb 2026)
**Status:** ✅ Completed

- Unified CSS variable tokens (`hsl(var(--xxx))`) with light/dark toggle via `next-themes`
- Landing page: hero + stats + frameworks grid + capabilities (modularized)
- Theme toggle (Sun/Moon) in auth layout, adaptive styling on all pages
- Animations: `ai-scene-*` prefix (float, pulse, dash-flow, logo-bob, shape-morph)
- i18n: ~1,027 LOC per locale (EN/VI), 28 namespaces

---

### 2. AI System Registry (FR-INV)
**Status:** ✅ Completed (Phase 3)

**Features Implemented:**
- ✅ FR-INV-01: System CRUD operations
- ✅ FR-INV-02: Data classification tagging
- ✅ FR-INV-03: Lifecycle tracking (Development, Pilot, Production, Retired)
- ✅ FR-INV-04: Owner/stakeholder assignment

**API Endpoints:**
```
GET    /api/ai-systems              # List with pagination & filtering
POST   /api/ai-systems              # Create new system
GET    /api/ai-systems/[id]         # Get single system
PUT    /api/ai-systems/[id]         # Update system
DELETE /api/ai-systems/[id]         # Soft delete (sets status RETIRED)
```

**Key Files:**
- `src/app/api/ai-systems/route.ts`
- `src/app/api/ai-systems/[id]/route.ts`
- `src/app/[locale]/(dashboard)/ai-systems/page.tsx`
- `src/components/ai-systems/ai-system-form.tsx`

**Database Entity:**
```prisma
model AISystem {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  description     String?
  type            AISystemType    # GenAI, ML, RPA
  dataClassification String        # Public, Confidential, Restricted
  status          SystemStatus    # Development, Pilot, Production, Retired
  owner           String?
  technicalOwner  String?
  riskOwner       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### 3. Framework Knowledge Base (FR-MAP)
**Status:** ✅ Completed (Phase 4, expanded Phases 10-14: now 23 frameworks)

**Framework Portfolio (1,323 total controls, 172 cross-framework mappings):**

**AI Risk (4 frameworks):**
1. **NIST AI RMF 1.0** — 4 Functions, 19 Categories, 72+ Subcategories
2. **ISO/IEC 42001:2023** — 9 Domains, 38 Controls
3. **OWASP LLM Top 10 v2025** — 10 vulnerability classes
4. **MITRE ATLAS** — 8 tactics, 48 techniques

**AI Management (4 frameworks):**
5. **Microsoft Responsible AI** — 7 principles
6. **OECD AI Principles** — 5 principles
7. **Singapore AI Governance** — 5 pillars
8. **CSA AI Controls Matrix 1.0** — 18 Domains, 51 Controls

**Security & Compliance (15 frameworks):**
9. **NIST CSF 2.0** — 6 Functions, 22 Categories
10. **ISO 27001:2022** — 4 Themes, 93 Controls
11. **CIS Controls v8.1** — 18 Controls, 153 Safeguards
12. **NIST 800-53 Rev.5** — 6 Categories, 282+ Controls
13. **COBIT 2019** — 5 Domains, 40+ Processes
14. **ITIL v4** — 4 Dimensions, 34 Practices
15. **PCI DSS v4.0.1** — 12 Requirements, 58 Sub-requirements
16. **SCF v2025.4** — 21 Domains, ~90 Controls
17. **EU AI Act** — 6 Risk Levels, 4 Regulatory tiers
18. **NIS2 Directive** — 10 Areas, 39 Measures
19. **DORA** — 3 Pillars, 8 domains
20. **CMMC 2.0** — 3 Maturity Levels, 110+ practices
21. **HIPAA** — 5 Standards, 65+ Rules
22. **SOC 2** — 5 Trust Service Categories
23. **Google SAIF** — 4 Dimensions, 18 Safeguards

**API Endpoints:**
```
GET    /api/frameworks              # List frameworks
GET    /api/frameworks/[id]         # Get framework detail
GET    /api/frameworks/[id]/controls # Get controls for framework
GET    /api/frameworks/mappings     # Get control mappings
```

**Key Files:**
- `prisma/seed-frameworks.ts`
- `src/app/api/frameworks/route.ts`
- `src/components/frameworks/framework-control-tree.tsx`

**Database Entities:**
```prisma
model Framework {
  id              String @id @default(cuid())
  name            String
  version         String
  effectiveDate   DateTime
  description     String?
  controls        Control[]
  isActive        Boolean @default(true)
}

model Control {
  id              String @id @default(cuid())
  frameworkId     String
  code            String
  title           String
  description     String?
  mappings        Mapping[]
}

model Mapping {
  id              String @id @default(cuid())
  sourceControlId String
  targetControlId String
  confidence      ConfidenceLevel  # HIGH, MEDIUM, LOW
  rationale       String?
}
```

---

### 4. Risk Assessment Engine (FR-RISK)
**Status:** ✅ Completed (Phase 5)

**Features Implemented:**
- ✅ FR-RISK-01: Risk identification wizard (5 steps)
- ✅ FR-RISK-02: 5×5 impact × likelihood matrix
- ✅ FR-RISK-03: 8 risk categories (Bias, Privacy, Security, Reliability, Transparency, Accountability, Safety, Other)
- ✅ FR-RISK-04: Framework assessment templates
- ✅ FR-RISK-05: Inherent & residual risk scoring

**Risk Scoring Formula:**
```
Inherent Risk = Likelihood × Impact (1-5 scale)
Residual Risk = Inherent Risk × (1 - ControlEffectiveness/100)

Risk Levels:
- Low (1-4): Accept or monitor
- Medium (5-9): Mitigate within 90 days
- High (10-16): Mitigate within 30 days
- Critical (17-25): Immediate action required
```

**API Endpoints:**
```
GET    /api/assessments             # List assessments
POST   /api/assessments             # Create assessment
GET    /api/assessments/[id]        # Get assessment with risks
PUT    /api/assessments/[id]        # Update assessment
GET    /api/assessments/[id]/risks  # Get risks for assessment
POST   /api/assessments/[id]/risks  # Add risk to assessment
GET    /api/risks/[id]              # Get single risk
PUT    /api/risks/[id]              # Update risk
DELETE /api/risks/[id]              # Delete risk
```

**Key Files:**
- `src/app/api/assessments/route.ts`
- `src/lib/risk-scoring-calculator.ts`
- `src/components/risk-assessment/assessment-creation-wizard.tsx`
- `src/components/risk-assessment/risk-matrix-visualization.tsx`

**Database Entities:**
```prisma
model Assessment {
  id              String @id @default(cuid())
  aiSystemId      String
  frameworkId     String
  title           String
  description     String?
  status          AssessmentStatus
  risks           Risk[]
  createdBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Risk {
  id              String @id @default(cuid())
  assessmentId    String
  category        RiskCategory
  title           String
  description     String?
  likelihood      Int        # 1-5
  impact          Int        # 1-5
  inherentScore   Int        # Likelihood × Impact
  residualScore   Int        # Inherent × (1 - effectiveness/100)
  controlEffectiveness Int?  # 0-100
  status          RiskStatus
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

### 4.1-4.4 Advanced Risk Analytics (Phase 21 - Feb 6, 2026)
**Status:** ✅ Completed (4 features, 28 components)

1. **Supply Chain Risk Mapping** — React Flow vendor graph, risk propagation paths (8 components)
2. **Regulatory Change Tracker** — Timeline view, impact assessment, framework annotations (6 components)
3. **Peer Benchmarking** — Cross-org comparison, differential privacy, percentile rankings (4 components)
4. **ROI Calculator** — ALE/ROSI formulas, scenario builder, cost-benefit analysis (5 components)

**Database Models:** Vendor, VendorRiskPath, RegulatoryChange, FrameworkChange, ChangeImpact, BenchmarkSnapshot, BenchmarkResult, RiskCostProfile, MitigationInvestment, ROSICalculation (10 new models)

---

### 5. Dashboard & Reporting (FR-DASH)
**Status:** ✅ Completed (Phase 6 + Phase 14 Consolidation + Phase 14.5 Widget System - Feb 6, 2026)

**Features Implemented:**
- ✅ FR-DASH-01: Executive summary dashboard (Tab 1)
- ✅ FR-DASH-02: Framework compliance scorecard (Tab 2)
- ✅ FR-DASH-03: Drill-down navigation
- ✅ FR-DASH-04: Report export (PDF/CSV)
- ✅ FR-DASH-05: Operations center (Tab 3 - formerly separate page)
- ✅ FR-DASH-06: AI Risk specialist view (Tab 4 - formerly separate page)
- ✅ FR-DASH-07: Customizable widget dashboard (NEW Phase 14.5)

**Dashboard Widget System (Phase 14.5 - Feb 5-6, 2026):**
- **Two view modes** with localStorage persistence via `use-dashboard-widget-config` hook
  - **Simple Mode:** 6 consolidated widgets optimized for executives
    1. Risk Pulse Strip (stat-cards + risk-score + framework-rag combined)
    2. Unified Risk View (heatmap + top-risks + alerts with internal tabs)
    3. Compliance Status (compliance-overview + compliance-radar + framework-bars)
    4. Next-Best Actions (action-queue + assessment-progress)
    5. Activity Feed (recent activities)
    6. AI Model Registry (deployed models)
  - **Advanced Mode:** 15 individual widgets for deep analysis
    1-4. Executive view widgets (stat-cards, risk-score, compliance-overview, framework-rag)
    5-8. Risk analysis widgets (heatmap, top-risks, risk-alerts, compliance-radar)
    9-12. Framework widgets (framework-bars, framework-treemap, cross-framework-mapping, control-coverage)
    13-15. Operational widgets (assessment-progress, activity-feed, ai-model-registry)

- **Drag-and-drop reordering** via dnd-kit with rectSortingStrategy
  - 4 new components: `dashboard-sortable-container.tsx`, `dashboard-widget-wrapper.tsx`, `dashboard-widget-settings-panel.tsx`, `sortable-widget.tsx`
  - Widget visibility toggle per widget
  - Widget minimize/close controls
  - Settings panel for mode switching and widget management

- **UX Improvements (Feb 6):**
  - Heatmap: CSS Grid layout with Portal-based tooltips to escape dnd-kit transforms
  - Drilldown modal: Explicit opaque backgrounds instead of CSS variable
  - Header: Slimmed from h-16 to h-12, removed duplicate title

**Dashboard Consolidation (Phase 14, Commit 200d3ac):**
- Merged `/dashboard` (Executive Brief + Detailed Analytics) with `/technical-view` (Operations + AI Risk)
- Unified 4-tab interface in single `/dashboard` page (~85 LOC)
- Removed `/technical-view` route entirely
- Component organization retained for reusability (`ops-center/`, `ai-risk-view/` directories)
- Extracted `useDashboardData` hook for parallel API fetching
- Extracted dashboard types to `src/types/dashboard.ts`
- Sidebar: single Dashboard nav entry

**API Endpoints:**
```
GET    /api/dashboard/stats          # Dashboard statistics
GET    /api/dashboard/risk-heatmap   # Risk distribution data
GET    /api/dashboard/compliance     # Framework compliance scores
GET    /api/dashboard/activity       # Recent activity feed
GET    /api/reports/risk-register    # Risk register export
GET    /api/reports/assessment-summary # Assessment summary export
GET    /api/reports/compliance       # Compliance report
```

**Key Files:**
- `src/app/api/dashboard/*.ts`
- `src/app/api/reports/*.ts`
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` (4-tab tabbed interface, ~85 LOC)
- `src/components/dashboard/operations-view.tsx` (extracted, 35 LOC)
- `src/components/dashboard/ai-risk-view-panel.tsx` (extracted, 74 LOC)
- `src/components/dashboard/dashboard-sortable-container.tsx` (dnd-kit container, NEW)
- `src/components/dashboard/dashboard-widget-wrapper.tsx` (widget controls, NEW)
- `src/components/dashboard/dashboard-widget-settings-panel.tsx` (settings UI, NEW)
- `src/components/dashboard/sortable-widget.tsx` (dnd-kit wrapper, NEW)
- `src/components/dashboard/risk-pulse-strip.tsx` (consolidated, NEW)
- `src/components/dashboard/unified-risk-view.tsx` (consolidated, NEW)
- `src/components/dashboard/compliance-status-card.tsx` (consolidated, NEW)
- `src/components/dashboard/next-best-actions-card.tsx` (consolidated, NEW)
- `src/hooks/use-dashboard-data.ts` (parallel API fetching)
- `src/hooks/use-dashboard-widget-config.ts` (widget state management, NEW)
- `src/types/dashboard.ts` (extracted types)
- `src/components/layout/sidebar.tsx` (single Dashboard entry)

---

### 5.1-5.5 Dashboard Enhancements (Phase 21 - Feb 6, 2026)
**Status:** ✅ Completed (5 features, 18 components)

1. **Burndown Charts** — Sprint tracking, velocity metrics, Recharts visualizations
2. **Framework Control Overlap** — React Flow Sankey (172 mappings × 23 frameworks), coverage matrix
3. **Bento Grid Layouts** — 3 presets (Executive/Analyst/Auditor), drag-drop reordering via dnd-kit
4. **Data Storytelling & Insights** — Z-score anomalies, narrative templates, executive summaries
5. **Compliance Chain Graph** — Requirement→Control→Evidence visualization, coverage donut

**Database Models:** InsightTemplate, GeneratedInsight, AnomalyEvent, DashboardLayout, ComplianceChain (5 new models)

---

### 6. Testing & Quality Assurance
**Status:** ✅ 1,080 unit tests across 55 files (100% passing) + 28 E2E tests (26 passing)

- **Vitest 4.0** — Unit & integration tests with auto-mocked Prisma
- **Playwright 1.58** — E2E tests with trace recording
- **Coverage** — API routes (`src/app/api/**`) and lib functions (`src/lib/**`)
- **Test Setup** — `tests/setup.ts` auto-mocks: prisma, auth-helpers, cache, redis, logger, notifications, webhooks, services
- **Execution** — `npm run test`, `npm run test:e2e`, `npm run test:coverage`

---

### 7. Accessibility (WCAG 2.1 AA - Phase 7)
**Status:** ✅ Completed (Phase 7)

**Keyboard Navigation:**
- Skip link implementation in dashboard layout
- Focus management with tabindex handling
- Focus-visible indicators in CSS

**Implementation Details:**
- Location: `src/app/[locale]/(dashboard)/layout.tsx`
- Skip link anchors to `#main-content`
- CSS styling: `.skip-link` and `.skip-link:focus-visible` in `globals.css`
- Main content marked with `tabIndex={-1}` for programmatic focus

**Best Practices:**
- Semantic HTML structure (header, nav, main, footer)
- ARIA labels on icon-only buttons
- Radix UI primitives with built-in a11y support
- Color contrast ratios: 4.5:1 for normal text (WCAG AA)
- Screen reader support via Shadcn/ui components

**RBAC Roles Verified:**
All 5 roles tested and seeded with proper permissions:
- Admin: Full access
- Risk Manager: Management access
- Assessor: Create/edit assessments
- Auditor: View-only
- Viewer: Dashboard view-only

---

### 8. Evidence Management & Gap Analysis
**Status:** ✅ Completed (Phase 8+)

**Evidence Features:**
- File upload with SHA-256 hashing
- Multi-entity linking (risks, controls, assessments)
- Approval workflow with status tracking
- Evidence artifact metadata storage
- Supports multiple evidence types

**Gap Analysis:**
- Framework-to-framework gap identification
- Control coverage analysis
- CSV export of gaps
- Visualization with impact scoring

---

### 9. Internationalization (NFR-I18N)
**Status:** ✅ Completed (Phase 1)

**Implementation:**
- next-intl v4 framework for i18n
- English (EN) & Vietnamese (VI) support
- Namespace-based translations
- Locale routing middleware with dynamic detection

**Key Files:**
- `src/i18n/messages/en.json` (1000+ keys)
- `src/i18n/messages/vi.json` (1000+ keys)
- `src/i18n/request.ts` (locale detection)
- `src/middleware.ts` (i18n routing)

**Translation Namespaces:**
- `common`: Global UI terms
- `auth`: Authentication pages
- `dashboard`: Dashboard module
- `assessment`: Risk assessment module
- `frameworks`: Framework browsing
- `organizations`: Multi-tenant admin
- `webhooks`: Integration setup
- `audit`: Audit log viewer

---

## API Response Standards

All API endpoints follow this response format:

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": { /* response body */ },
  "message": "Operation successful"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": { /* array of items */ },
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

---

## Database Schema Overview

### 42 Core Models + 15 Enums (Phases 1-18)

**Core Models (1-22) — MVP1-4:**
1. **Organization** - Root tenant
2. **User** - System users (5 roles, active/inactive, lastLoginAt)
3. **Account** - OAuth provider accounts
4. **Session** - NextAuth sessions
5. **VerificationToken** - Email verification tokens
6. **AISystem** - AI systems under assessment
7. **Framework** - Compliance frameworks (23 total)
8. **Control** - Framework controls (1,323 total, 172 mappings)
9. **ControlMapping** - Cross-framework relationships
10. **RiskAssessment** - Risk assessment snapshots
11. **Risk** - Individual risks (5×5 matrix)
12. **RiskScoreHistory** - Historical risk score tracking
13. **RiskControl** - Risk-to-control relationships
14. **Evidence** - Evidence artifacts (SHA-256 hash)
15. **EvidenceLink** - Evidence to entity links (polymorphic)
16. **Task** - Remediation tasks (treatment workflow)
17. **AuditLog** - Immutable action logs (detailed change tracking)
18. **ScheduledJob** - Cron-based scheduled tasks
19. **SavedFilter** - Per-user dashboard filters
20. **Invitation** - User invitations (token-based, expiry)
21. **APIKey** - API keys (SHA-256 hashed, permissions)
22. **Webhook** - Webhook endpoints (SSRF protected)

**Enterprise Features (23-42) — Phases 12-18:**
23. **WebhookDelivery** - Delivery logs with retry tracking (Phase 12)
24. **Notification** - User notifications (7 types) (Phase 13)
25. **Vendor** - Vendor registry for supply chain (Phase 21)
26. **VendorRiskPath** - Risk propagation paths (Phase 21)
27. **RegulatoryChange** - Regulatory change events (Phase 21)
28. **FrameworkChange** - Framework version changes (Phase 21)
29. **ChangeImpact** - Impact assessment on controls (Phase 21)
30. **BenchmarkSnapshot** - Point-in-time org metrics (Phase 21)
31. **BenchmarkResult** - Anonymized peer comparison (Phase 21)
32. **RiskCostProfile** - Cost parameters per risk (Phase 21)
33. **MitigationInvestment** - Mitigation cost tracking (Phase 21)
34. **ROSICalculation** - ROSI metrics and scenarios (Phase 21)
35. **InsightTemplate** - Narrative insight templates (Phase 21)
36. **GeneratedInsight** - AI-generated insights (Phase 21)
37. **AnomalyEvent** - Z-score anomalies (Phase 21)
38. **DashboardLayout** - User layout preferences (Phase 21)
39. **ComplianceChain** - Requirement→Control→Evidence chain (Phase 21)
40. **EvidenceVersion** - Evidence versioning with checksums (Phase 16)
41. **ReportTemplate** - Custom report templates (Phase 17)
42. **ImportJob** - Bulk import tracking and status (Phase 18)

**Enums (15):**
UserRole, AISystemType, DataClassification, LifecycleStatus, AssessmentStatus, RiskCategory, TreatmentStatus, TaskPriority, TaskStatus, EvidenceStatus, NotificationType, RiskLevel, VendorRiskLevel, InsightCategory, ComplianceChainType

### Key Features
- ✅ Row-Level Security (RLS) support via Prisma
- ✅ Soft deletes for audit compliance
- ✅ Timestamp tracking (createdAt, updatedAt)
- ✅ Organization-level data isolation

---

## Security & Performance

**Security:** NextAuth.js JWT (24h session, 30min idle), RBAC (5 roles), organizational data isolation, encrypted at-rest via PostgreSQL, TLS 1.3, audit logging, rate-limiting (role-based tiers), SSRF-protected webhooks, XSS sanitization, CSV injection prevention.

**Performance:** Pagination (all list endpoints), database-level filtering, Redis caching with stale-while-revalidate, response compression, bundle optimization (dynamic imports), query selection via Prisma select().

---

## Development Workflow

### Build & Deploy
```bash
# Development
npm run dev                   # Start Next.js dev server (port 3000)
npm run db:generate         # Generate Prisma client
npm run db:push             # Push schema to database
npm run db:migrate          # Run migrations (dev)
npm run db:seed             # Seed initial data
npm run db:studio           # Open Prisma Studio GUI

# Testing
npm run test                # Run tests in watch mode (Vitest)
npm run test:run            # Run tests once
npm run test:coverage       # Coverage report
npm run test:e2e            # E2E tests (Playwright, headless)
npm run test:e2e:headed     # E2E tests with visible browser

# Code Quality
npm run lint                # ESLint check
npm run type-check          # TypeScript check without emit

# Production
npm run build               # Build Next.js application
npm run start               # Start production server
npm run analyze             # Analyze bundle size
```

### Key Technologies Used
- **React 19** - UI framework
- **Next.js 16** - Full-stack framework (App Router)
- **TypeScript 5.9** - Type safety
- **Tailwind CSS v4** - Styling (PostCSS)
- **Shadcn/ui** - Component library (23 wrappers)
- **Prisma 5.22** - ORM
- **PostgreSQL 15+** - Database
- **NextAuth.js 4.24** - Authentication (JWT)
- **Zustand 5.0** - State management (4 stores)
- **next-intl 4.8** - Internationalization
- **Zod 4.3** - Schema validation
- **Vitest 4.0** - Unit/integration testing
- **Playwright 1.58** - E2E testing

---

## Completion Status

**MVP5 + Phase 21 ✅ Complete**
- Core: Auth, RBAC, AI inventory, risk assessment, 4-tab dashboard consolidation
- 23 frameworks (1,323 controls, 172 mappings), evidence management, gap analysis
- Advanced: Supply chain mapping, regulatory tracker, benchmarking, ROI calculator, burndown charts, Sankey overlap, bento grid layouts, insights/anomalies, compliance chain graph
- Infrastructure: 42 models, 15 enums, 1,080 tests, WCAG 2.1 AA, Docker/CI-CD

**Phase 16-18 ✅ Complete**
- Backend: Evidence versioning (SHA-256), virus scanning (ClamAV), storage quotas, bulk import (CSV/Excel), scheduled reports (PDF/Excel), task management (CRUD + comments), cron jobs
- Frontend: Evidence versions panel, storage quota widget, task management page, bulk import wizard, report template manager, +158 i18n keys

**MVP6 (In Progress)**
- Enterprise SSO/SAML (saml-jackson integration), SCIM 2.0 IdP sync, session tracking, IP allowlist enforcement
- Docker setup, GitHub Actions CI/CD, security hardening

---

## Git Repository Information

**Repository Status:** Development
**Main Branch:** main
**Current Tags:** v0.1.0-alpha
**Last Commit:** 2026-02-03 14:30 UTC

---


## Build & Quality Status
- **Tests:** 1,080/1,080 passing (100% across 55 files)
- **E2E:** 26/28 passing (2 flaky connection tests)
- **TypeScript:** 0 errors (strict mode)
- **Build:** Production build successful
- **Security:** XSS + CSV injection prevention implemented (Phase 15)

---

## Developer Quick Start
- PostgreSQL required, copy `.env.example` → `.env.local`
- `npm run dev` (port 3000), `npm run db:seed` after migration
- API pattern: `getServerSession()` → RBAC check → Zod validation → Prisma query (+ orgId filter)
- Zod v4 pattern: `z.record(z.string(), z.unknown())` requires 2 args (key + value schemas)
- Test mocks: auto-setup in `tests/setup.ts`, use `vi.mocked()` for assertions
- i18n: `useTranslations('namespace')`, EN/VI via `next-intl`

---

**Generated:** 2026-02-09 | **Test Status:** 1,080/1,080 ✅ | **Components:** 174 files | **Models:** 42+ | **API Routes:** 97 files | **Frameworks:** 23 with 1,323 controls | **Seed Files:** 24 (~7,293 LOC)
