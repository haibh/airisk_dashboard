# AIRisk Dashboard - Codebase Summary

**Generated:** 2026-02-06
**Codebase Status:** MVP4.5 Phase 15 (Dashboard Widgets & Security Hardening) + Phase 21 (Dashboard Features & UI/UX Upgrade) - Complete
**Total Files:** 350+ files (including tests, migrations, seeds)
**Total Lines:** ~65,000+ lines of TypeScript/TSX/SQL
**Codebase Size:** 480,000+ tokens, 1,900,000+ chars

---

## Executive Overview

AIRisk Dashboard is a comprehensive AI Risk Management Intelligence Platform built with:
- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Next.js 16 App Router
- **Database:** PostgreSQL 15+ with Prisma ORM (36 models, 15 enums)
- **Authentication:** NextAuth.js with JWT (24h session, 30min idle)
- **Internationalization:** next-intl (EN/VI)
- **State Management:** Zustand (4 stores)
- **UI Components:** Shadcn/ui (23 wrappers) + Radix UI
- **Testing:** Vitest 4.0+ (375 passing) + Playwright 1.58
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

### Directory Structure

```
AIRisk_Dashboard/
├── .claude/                    # Claude Code configuration
│   ├── rules/                  # Development and workflow rules
│   └── skills/                 # Custom Python scripts for AI assistance
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
│   ├── components/             # 112+ files, 12K+ LOC (16 directories)
│   │   ├── layout/             # Header, Sidebar, notification dropdown (4 files)
│   │   ├── ui/                 # Shadcn/ui wrappers (23 components)
│   │   ├── forms/              # Form components with Zod validation
│   │   ├── tables/             # Data tables with pagination
│   │   ├── charts/             # Risk heatmap, compliance scorecard
│   │   ├── risk-assessment/    # 5-step wizard, matrix visualization
│   │   ├── frameworks/         # Framework tree, controls table
│   │   ├── settings/           # Organization, users, API keys, webhooks (15 files)
│   │   ├── evidence/           # Evidence upload, approval workflow
│   │   ├── dashboard/          # 26 files: 4 main views + 15 widgets + 4 drag-drop + consolidated widgets
│   │   │   ├── executive-brief-view.tsx
│   │   │   ├── detailed-analytics-view.tsx
│   │   │   ├── operations-view.tsx
│   │   │   ├── ai-risk-view-panel.tsx
│   │   │   ├── dashboard-sortable-container.tsx    # dnd-kit container (NEW Feb 6)
│   │   │   ├── dashboard-widget-wrapper.tsx         # Widget wrapper with controls (NEW Feb 6)
│   │   │   ├── dashboard-widget-settings-panel.tsx # Settings panel (NEW Feb 6)
│   │   │   ├── sortable-widget.tsx                  # dnd-kit useSortable wrapper (NEW Feb 6)
│   │   │   ├── risk-pulse-strip.tsx                 # Consolidated widget (NEW Feb 5)
│   │   │   ├── unified-risk-view.tsx                # Consolidated widget (NEW Feb 5)
│   │   │   ├── compliance-status-card.tsx           # Consolidated widget (NEW Feb 5)
│   │   │   ├── next-best-actions-card.tsx           # Consolidated widget (NEW Feb 5)
│   │   │   └── 11 individual widgets (stat-cards, risk-score, heatmap, etc.)
│   │   ├── ops-center/         # 6 files: system-health-indicators, risk-alerts-panel, etc.
│   │   ├── ai-risk-view/      # 7 files: model-registry-panel, risk-card-panel, treemap-panel, etc.
│   │   ├── landing/            # Landing page (3 files: main + content sections)
│   │   ├── gap-analysis/       # Gap analysis engine and visualization
│   │   ├── notifications/      # Notification dropdown, list
│   │   ├── audit-log/          # Audit log viewer with filters
│   │   ├── search/             # Global multi-entity search
│   │   └── providers/          # NextAuth, Theme providers
│   ├── lib/                    # 28 files, 6.2K LOC
│   │   ├── auth-helpers.ts     # RBAC, role checking, hasMinimumRole()
│   │   ├── db.ts               # Prisma client initialization
│   │   ├── risk-scoring-calculator.ts # Inherent/residual risk math
│   │   ├── cache-service.ts    # Multi-layer caching (LRU + Redis)
│   │   ├── cache-invalidation.ts # Domain-specific cache invalidation
│   │   ├── cache-advanced.ts   # Stale-while-revalidate, warming
│   │   ├── webhooks/           # Webhook dispatch, signature, delivery worker
│   │   ├── scheduled-job-*.ts  # Cron runner, handlers, queue
│   │   ├── rate-limiter.ts     # Sliding window, role-based tiers
│   │   ├── logger*.ts          # Structured logging
│   │   ├── api-error-handler.ts # Error middleware
│   │   ├── api-validation-schemas.ts # Zod schemas
│   │   ├── api-key-*.ts        # API key generation, authentication
│   │   ├── storage-service.ts  # S3/Blob integration
│   │   ├── gap-analysis-engine.ts # Gap analysis logic
│   │   ├── global-search-service.ts # Multi-entity search
│   │   ├── import-parser.ts    # CSV/Excel import
│   │   ├── export-generator.ts # CSV/Excel export with streaming
│   │   └── utils.ts            # General utilities
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

### 1.1 Landing Page & Theme System (Feb 2026)
**Status:** ✅ Completed (Commit ea1905a - Theme Unification)

**Theme System Implementation (Phase 14):**
- Unified CSS variable token system across all pages (`hsl(var(--xxx))`)
- Support for light/dark mode toggle via `next-themes`
- Adaptive styling on all pages: auth, landing, dashboard
- Removed hardcoded color classes, migrated to semantic tokens
- Animation prefix standardization: `ai-scene-*` (float, pulse, dash-flow, logo-bob, shape-morph)
- SVG backgrounds use `currentColor` for true theme support
- Theme toggle button (Sun/Moon) added to auth layout

**Landing Page Features (Phase 14):**
- Full-screen adaptive gradient background (`landing-gradient`)
- Content sections: hero + stats bar + frameworks grid + capabilities + methodology + architecture
- Modularized components: `landing-page.tsx` + `landing-page-content-sections.tsx`
- Interactive AI scene with parallax effects and shape-morphing logo
- CTA buttons with adaptive styling, mouse-tracking parallax
- i18n expanded: `landing.stats.*`, `landing.supportedFrameworks.*`, `landing.capabilities.*`, `landing.methodology.*`, `landing.architecture.*`

**Key Files:**
- `src/components/landing/landing-page.tsx` (main, modular structure)
- `src/components/landing/landing-page-content-sections.tsx` (new, content organization)
- `src/app/globals.css` (CSS variables, adaptive utilities, animation keyframes)
- `src/i18n/messages/en.json` (landing namespace expansion)
- `src/i18n/messages/vi.json` (landing namespace expansion)

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

### 4.1 Risk Supply Chain Mapping (FR-SUPCHAIN)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- Interactive vendor risk propagation graph using React Flow
- Vendor registry with risk scoring
- Bidirectional vendor risk path tracking
- Risk cascade visualization
- Vendor search and filtering

**Database Models:**
- `Vendor` — Vendor entity with risk profile
- `VendorRiskPath` — Risk propagation paths

**Key Files:**
- `src/components/supply-chain/` — Vendor graph, registry, risk visualization
- `src/app/[locale]/(dashboard)/supply-chain/` — Page route
- `prisma/migrations/` — Vendor schema

**API Endpoints:**
```
GET    /api/supply-chain/vendors          # List vendors
POST   /api/supply-chain/vendors          # Create vendor
GET    /api/supply-chain/vendors/[id]     # Get vendor
PUT    /api/supply-chain/vendors/[id]     # Update vendor
GET    /api/supply-chain/risk-paths       # Get propagation paths
```

---

### 4.2 Regulatory Change Tracker (FR-REGTRACK)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- Timeline view of regulatory changes
- Impact assessment on controls and frameworks
- Framework change annotations
- Change impact propagation
- Historical tracking and version control

**Database Models:**
- `RegulatoryChange` — Change event and metadata
- `FrameworkChange` — Framework-level changes
- `ChangeImpact` — Impact on affected controls/assessments

**Key Files:**
- `src/components/regulatory-tracker/` — Timeline, impact assessment, change list
- `src/app/[locale]/(dashboard)/regulatory/` — Page route

**API Endpoints:**
```
GET    /api/regulatory/changes             # List regulatory changes
POST   /api/regulatory/changes             # Create change
GET    /api/regulatory/changes/[id]        # Get change details
GET    /api/regulatory/impacts             # List impacted controls
```

---

### 4.3 Peer Benchmarking (FR-BENCHMARK)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- Anonymous cross-organization comparison
- Differential privacy (Laplace noise) to protect individual org data
- Benchmark snapshots (point-in-time measurements)
- Compliance score comparison by framework
- Risk distribution comparison across orgs
- Percentile ranking against peer group

**Database Models:**
- `BenchmarkSnapshot` — Snapshot of org metrics at point in time
- `BenchmarkResult` — Aggregated benchmark statistics with privacy

**Key Files:**
- `src/components/benchmarking/` — Peer comparison charts, percentile viz, metrics table
- `src/app/[locale]/(dashboard)/benchmarking/` — Page route
- `src/lib/differential-privacy.ts` — Laplace noise implementation

**API Endpoints:**
```
GET    /api/benchmarking/snapshots         # List benchmarks
POST   /api/benchmarking/snapshots         # Create snapshot
GET    /api/benchmarking/comparison        # Get peer comparison (anonymized)
GET    /api/benchmarking/percentiles       # Get percentile rankings
```

---

### 4.4 ROI Calculator (FR-ROICALC)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- ALE (Annualized Loss Expectancy) calculation
- ROSI (Return on Security Investment) formulas
- Scenario comparison (baseline vs. mitigation strategies)
- Cost/benefit analysis for risk treatments
- Investment recommendation scoring

**Database Models:**
- `RiskCostProfile` — Cost parameters per risk (frequency, loss value)
- `MitigationInvestment` — Cost of mitigation strategies
- `ROSICalculation` — Calculated ROSI metrics and scenarios

**Key Files:**
- `src/components/roi-calculator/` — Calculator form, scenario builder, comparison table
- `src/app/[locale]/(dashboard)/roi-calculator/` — Page route
- `src/lib/rosi-calculator.ts` — Formulas: ALE = frequency × loss value; ROSI = (benefit - cost) / cost

**API Endpoints:**
```
POST   /api/roi/calculate                  # Calculate ALE/ROSI
GET    /api/roi/scenarios                  # List saved scenarios
POST   /api/roi/scenarios                  # Save scenario
GET    /api/roi/scenarios/[id]             # Get scenario details
```

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

### 5.1 Remediation Burndown Charts (FR-BURNDOWN)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- Sprint-based remediation tracking
- Burndown chart visualization (tasks completed vs. time)
- Velocity bar chart (tasks closed per sprint)
- Sprint retrospective metrics
- Team capacity planning

**Key Files:**
- `src/components/dashboard/remediation-burndown-chart.tsx` — Recharts burndown + velocity
- `src/app/[locale]/(dashboard)/dashboard/` — Integrated into Operations tab

---

### 5.2 Framework Control Overlap (FR-OVERLAP)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- React Flow Sankey diagram visualization
- 172 control mappings across 23 frameworks
- Control coverage matrix (framework vs. control)
- Highlight unmapped controls
- Mapping confidence indicators (HIGH/MEDIUM/LOW)

**Key Files:**
- `src/components/dashboard/framework-control-overlap.tsx` — React Flow Sankey
- `src/components/dashboard/control-overlap-matrix.tsx` — Mapping matrix
- `src/app/[locale]/(dashboard)/dashboard/` — Integrated into Detailed Analytics tab

---

### 5.3 Bento Grid Layouts (FR-BENTO)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- 3 preset dashboard layouts: Executive, Analyst, Auditor
- Drag-and-drop widget reordering via dnd-kit
- Widget visibility toggles per user
- View mode persistence (localStorage)
- Responsive grid adaptation

**Database Model:**
- `DashboardLayout` — User's layout configuration and widget order

**Key Files:**
- `src/components/dashboard/bento-grid-preset-selector.tsx` — Layout picker
- `src/components/dashboard/dashboard-sortable-container.tsx` — dnd-kit container
- `src/components/dashboard/dashboard-widget-wrapper.tsx` — Widget controls
- `src/hooks/use-dashboard-widget-config.ts` — State management

---

### 5.4 Data Storytelling & Insights (FR-INSIGHTS)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- Template-based narrative insights generation
- Z-score anomaly detection for statistical outliers
- Auto-generated executive summaries
- Key findings and risk trends
- Actionable recommendations based on data patterns

**Database Models:**
- `InsightTemplate` — Narrative templates and rules
- `GeneratedInsight` — AI-generated insights per assessment
- `AnomalyEvent` — Detected anomalies (Z-score > 2.5)

**Key Files:**
- `src/components/insights/` — Insight display, anomaly indicators, trend analysis
- `src/lib/insight-generator.ts` — Z-score calculation, template rendering
- `src/app/[locale]/(dashboard)/dashboard/` — Integrated into Executive Brief tab

---

### 5.5 Compliance Chain Graph (FR-COMPCHAIN)
**Status:** ✅ Completed (Phase 21 - Feb 6, 2026)

**Features:**
- React Flow chain diagram: Requirement → Control → Evidence
- Visual traceability across compliance chain
- Coverage donut chart (% requirements with evidence)
- Filter by framework
- Gap identification (requirements without controls)

**Database Model:**
- `ComplianceChain` — Link between requirement, control, evidence

**Key Files:**
- `src/components/compliance-graph/` — Chain diagram, coverage donut, filter panel
- `src/lib/compliance-chain-builder.ts` — Graph generation
- `src/app/[locale]/(dashboard)/dashboard/` — Integrated into Detailed Analytics tab

---

### 6. Testing & Quality Assurance (Phase 7)
**Status:** ✅ Completed (Phase 7)

**Test Infrastructure:**
- **Framework:** Vitest for unit & integration tests
- **E2E Testing:** Playwright with Chromium
- **Performance:** Benchmark script measuring page load & API response times

**Test Coverage:**

1. **Unit Tests** (`tests/utils/`)
   - Risk scoring calculator logic
   - Utility function validation

2. **Integration Tests** (`tests/api/`)
   - AI Systems endpoint (CRUD operations)
   - Assessments endpoint (creation, queries)
   - Frameworks endpoint (data retrieval)
   - Dashboard endpoints (stats, heatmap, compliance, activity)
   - Mock Prisma client + session fixtures

3. **E2E Tests** (`tests/e2e/`)
   - auth-login-flow.spec.ts: Login, validation, error handling
   - auth-unauthorized-access-redirect.spec.ts: Authorization checks
   - dashboard-page-load.spec.ts: Component rendering, UI validation

**Test Configuration:**
- `playwright.config.ts`: Headless/headed modes, CI retries, trace recording
- `vitest.config.ts`: Unit test configuration
- `tests/setup.ts`: Global test setup & mocks

**Performance Benchmarking:**
- `scripts/performance-benchmark.ts`: Measures page load (< 3s) and API response (< 500ms P95)
- Validates: list, single resource, CRUD operations endpoints

**Execution:**
```bash
npm run test              # Run all tests
npm run test:e2e          # E2E tests headless
npm run test:e2e:headed   # E2E tests with browser
npx tsx scripts/performance-benchmark.ts  # Performance tests
```

**Key Files:**
- `tests/` directory structure
- `playwright.config.ts`
- `vitest.config.ts`
- `scripts/performance-benchmark.ts`

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

### 36 Core Models + 15 Enums

**Core Models (1-22):**
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

**Enterprise Features (23-36 - Phase 21):**
23. **WebhookDelivery** - Delivery logs with retry tracking
24. **Notification** - User notifications (7 types)
25. **Vendor** - Vendor registry for supply chain
26. **VendorRiskPath** - Risk propagation paths
27. **RegulatoryChange** - Regulatory change events
28. **FrameworkChange** - Framework version changes
29. **ChangeImpact** - Impact assessment on controls
30. **BenchmarkSnapshot** - Point-in-time org metrics
31. **BenchmarkResult** - Anonymized peer comparison
32. **RiskCostProfile** - Cost parameters per risk
33. **MitigationInvestment** - Mitigation cost tracking
34. **ROSICalculation** - ROSI metrics and scenarios
35. **InsightTemplate** - Narrative insight templates
36. **GeneratedInsight** - AI-generated insights
37. **AnomalyEvent** - Z-score anomalies
38. **DashboardLayout** - User layout preferences
39. **ComplianceChain** - Requirement→Control→Evidence chain

**Enums (15):**
UserRole, AISystemType, DataClassification, LifecycleStatus, AssessmentStatus, RiskCategory, TreatmentStatus, TaskPriority, TaskStatus, EvidenceStatus, NotificationType, RiskLevel, VendorRiskLevel, InsightCategory, ComplianceChainType

### Key Features
- ✅ Row-Level Security (RLS) support via Prisma
- ✅ Soft deletes for audit compliance
- ✅ Timestamp tracking (createdAt, updatedAt)
- ✅ Organization-level data isolation

---

## Performance Considerations

### Current Optimizations
1. **Pagination:** All list endpoints support offset/limit pagination
2. **Filtering:** Database-level filtering on list endpoints
3. **Indexing:** Primary key and foreign key indexes configured
4. **Query Selection:** Prisma select() for field-level optimization

### Recommended Optimizations (Phase 7)
1. Add database indexes for frequently filtered columns
2. Implement API response caching with Redis
3. Add Cache-Control headers to API responses
4. Optimize bundle size (split code by route)
5. Image optimization for dashboard charts

---

## Security Implementation

### Authentication & Authorization
- ✅ NextAuth.js JWT strategy
- ✅ Secure session management (30-min timeout)
- ✅ Role-based access control (5 roles)
- ✅ Protected API routes via middleware

### Data Protection
- ✅ PostgreSQL encryption at rest (via cloud provider)
- ✅ TLS 1.3 for all network communications
- ✅ Secrets management via environment variables
- ✅ No sensitive data in logs

### Audit Trail
- ✅ Audit logging table structure (not yet integrated)
- ✅ Timestamp tracking on all entities
- ✅ Soft deletes for historical tracking

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

## Feature Completeness Summary

**MVP4.5 Completed (Phases 1-15 + 21):**
Core features (auth, RBAC, AI inventory, risk assessment, dashboards), multi-tenant architecture, 23 compliance frameworks with 1,323 controls (NIST AI RMF, ISO 42001, OWASP LLM, MITRE ATLAS, Microsoft RAI, OECD AI Principles, Singapore AI Gov, CSA AICM, NIST 800-53, NIST CSF 2.0, ISO 27001, CIS Controls, COBIT, ITIL, PCI DSS, SCF v2025.4, EU AI Act, NIS2, DORA, CMMC 2.0, HIPAA, SOC 2, Google SAIF), evidence management, gap analysis, API keys, webhooks, notifications, audit logs, 375 tests (100% passing), 28+ E2E tests, WCAG 2.1 AA accessibility, multi-layer caching, rate limiting, unified adaptive theme system (light/dark toggle), dashboard consolidation (4-tab interface), customizable dashboard with Simple/Advanced widget modes and drag-and-drop reordering, **Phase 21 New Features:** risk supply chain mapping (React Flow vendor graph), regulatory change tracker (timeline + impact assessment), peer benchmarking (differential privacy + anonymized comparison), ROI calculator (ALE/ROSI formulas), remediation burndown charts (Recharts), framework control overlap (Sankey + matrix), bento grid layouts (3 presets with customization), data storytelling (anomaly detection + narrative insights), compliance chain graph (requirement→control→evidence visualization).

**MVP5+ Planned:**
S3/Blob file storage, scheduled reports, SSO/SAML integration, mobile app, advanced SIEM integrations.

---

## Git Repository Information

**Repository Status:** Development
**Main Branch:** main
**Current Tags:** v0.1.0-alpha
**Last Commit:** 2026-02-03 14:30 UTC

---

## Security Hardening (Phase 15 - In Progress)

**XSS Prevention (2026-02-05):**
- Added `escapeHtml()` utility in `src/lib/global-search-service.ts`
- Escapes HTML entities: `&`, `<`, `>`, `"`, `'`
- Applied to `highlightMatches()` function for search results
- Prevents injection of malicious scripts through user-generated content

**CSV Injection Prevention (2026-02-05):**
- Added `sanitizeCsvValue()` utility in `src/lib/export-generator.ts`
- Detects dangerous CSV formula characters: `=`, `+`, `-`, `@`, `\t`, `\r`, `\n`
- Prefixes dangerous values with single quote to neutralize formulas
- Applied to all CSV/Excel export generators
- Prevents arbitrary code execution in spreadsheet applications

---

## Code Review Findings (2026-02-04)

### Test & Build Status
- **Tests:** 262/262 passing (100%)
- **TypeScript:** 0 errors (strict mode)
- **Build:** Production build successful
- **Type Coverage:** 100% (no `any` abuse)

### Critical Issues Identified (In Progress - Phase 15)
1. **Console.error in auth route** - Uses console.error instead of logger (info leakage risk)
2. **Missing auth on framework controls endpoint** - No session check, should have defense-in-depth
3. **Rate limit header bug** - Header shows `remaining+1` instead of total limit
4. **Middleware path matching too broad** - Uses `.includes('.')` instead of regex, bypasses API routes

### High Priority Issues
5. **No XSS input sanitization** - Risk if dangerouslySetInnerHTML found (requires codebase scan)
6. **Weak login rate limiting** - Only 100 req/min, should be 10 req/min for login attempts
7. **Session token exposure in errors** - Token verification not wrapped in try-catch
8. **Potential N+1 queries** - Some nested includes could be optimized with Promise.all

### Medium Priority Issues
9. **Weak password requirements** - Only checks length, no complexity requirements
10. **Missing CORS headers** - No explicit CORS configuration in next.config.ts
11. **Database connection pool not configured** - Defaults to 10, needs tuning for >100 systems
12. **Notification links expose org ID** - Uses internal org CUID in URL (should use slug)
13. **CUID vs UUID validation mismatch** - Zod schemas expect UUID but DB uses CUID
14. **Redis key collision risk** - Simple colon delimiters in cache keys, should hash org IDs
15. **Fire-and-forget notifications** - No retry mechanism if delivery fails

**Full Review Report:** `plans/reports/code-review-260204-0935-codebase-review.md`

---

## Important Notes for Developers

1. **Database Setup Required:** PostgreSQL must be running before `npm run db:push`
2. **Environment Variables:** Copy `.env.example` to `.env.local` and configure
3. **Seed Data:** Run `npm run db:seed` after first migration
4. **Type Safety:** Always use TypeScript types from `src/types/`
5. **Component Imports:** Always import from `@/components` (alias)
6. **API Responses:** Follow standard response format in lib/
7. **i18n:** Always use next-intl `useTranslations()` hook
8. **Forms:** Use React Hook Form + Zod for validation

---

**Codebase Summary Generated:** 2026-02-06
**Last Updated:** 2026-02-06 (Phase 21: Dashboard Features & UI/UX Upgrade + Phase 15: Security Hardening Complete)
**Maintained By:** docs-manager agent
