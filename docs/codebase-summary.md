# AIRisk Dashboard - Codebase Summary

**Generated:** 2026-02-04
**Codebase Status:** MVP4 Phase 13 (Multi-Tenant & Polish) - Complete
**Total Files:** 195+ files (including tests, migrations, seeds)
**Total Lines:** ~20,000+ lines of TypeScript/TSX/SQL

---

## Executive Overview

AIRisk Dashboard is a comprehensive AI Risk Management Intelligence Platform built with:
- **Frontend:** React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Next.js 16 App Router
- **Database:** PostgreSQL 15+ with Prisma ORM (20 models)
- **Authentication:** NextAuth.js with JWT (24h session, 30min idle)
- **Internationalization:** next-intl (EN/VI)
- **State Management:** Zustand (4 stores)
- **UI Components:** Shadcn/ui (23 wrappers) + Radix UI
- **Testing:** Vitest 4.0+ (262 passing) + Playwright 1.58

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
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   │   └── login/
│   │   │   ├── (dashboard)/    # Protected dashboard routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── ai-systems/
│   │   │   │   ├── risk-assessment/
│   │   │   │   └── frameworks/
│   │   │   └── layout.tsx
│   │   └── api/                # REST API endpoints
│   │       ├── auth/
│   │       ├── ai-systems/
│   │       ├── assessments/
│   │       ├── frameworks/
│   │       ├── dashboard/
│   │       └── reports/
│   ├── components/             # 59 files, 8.3K LOC
│   │   ├── layout/             # Header, Sidebar, notification dropdown
│   │   ├── ui/                 # Shadcn/ui wrappers (23 components)
│   │   ├── forms/              # Form components with Zod validation
│   │   ├── tables/             # Data tables with pagination
│   │   ├── charts/             # Risk heatmap, compliance scorecard
│   │   ├── risk-assessment/    # 5-step wizard, matrix visualization
│   │   ├── frameworks/         # Framework tree, controls table
│   │   ├── settings/           # Organization, users, API keys, webhooks
│   │   ├── evidence/           # Evidence upload, approval workflow
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
**Status:** ✅ Completed (Phase 2)

**Implementation:**
- NextAuth.js with JWT strategy
- Role-based access control (RBAC)
- Login page with i18n support
- Protected API routes via middleware
- Seed script with 5 test users

**Key Files:**
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth-helpers.ts`
- `src/middleware.ts`
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
**Status:** ✅ Completed (Phase 4, expanded Phase 10+)

**Frameworks grouped into two sections in UI:**

**AI Risk Frameworks** (with per-framework icons):
1. **NIST AI RMF 1.0** — BrainCircuit icon — 4 Functions, 19 Categories, 72+ Subcategories
2. **ISO/IEC 42001:2023** — Settings2 icon — 9 Domains, 38 Controls
3. **CSA AI Controls Matrix 1.0** — ShieldCheck icon — 18 Domains, 51 Controls

**Non-AI-Specific Frameworks**:
4. **NIST CSF 2.0** — ShieldAlert icon — 6 Functions, 22 Categories
5. **ISO 27001:2022** — Lock icon — 4 Themes, 93 Controls
6. **CIS Controls v8.1** — Target icon — 18 Controls, 153 Safeguards
7. **PCI DSS v4.0.1** — CreditCard icon — 12 Requirements, 58 Sub-requirements
8. **SCF v2025.4** — Layers icon — 21 Domains, ~90 Controls

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

### 5. Dashboard & Reporting (FR-DASH)
**Status:** ✅ Completed (Phase 6)

**Features Implemented:**
- ✅ FR-DASH-01: Executive summary dashboard
- ✅ FR-DASH-02: Framework compliance scorecard
- ✅ FR-DASH-03: Drill-down navigation
- ✅ FR-DASH-04: Report export (PDF/CSV)

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
- `src/app/[locale]/(dashboard)/dashboard/page.tsx`

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

### 20 Core Models + 11 Enums

**Models:**
1. **Organization** - Root tenant
2. **User** - System users (5 roles, active/inactive, lastLoginAt)
3. **Account** - OAuth provider accounts
4. **Session** - NextAuth sessions
5. **AISystem** - AI systems under assessment
6. **Framework** - Compliance frameworks
7. **Control** - Framework controls with hierarchy
8. **ControlMapping** - Cross-framework relationships
9. **Assessment** - Risk assessment snapshots
10. **Risk** - Individual risks (5×5 matrix)
11. **RiskControl** - Risk-to-control relationships
12. **Evidence** - Evidence artifacts (SHA-256 hash)
13. **EvidenceLink** - Evidence to entity links (polymorphic)
14. **Task** - Remediation tasks (treatment workflow)
15. **AuditLog** - Immutable action logs (detailed change tracking)
16. **Invitation** - User invitations (token-based, expiry)
17. **APIKey** - API keys (SHA-256 hashed, permissions)
18. **Webhook** - Webhook endpoints (SSRF protected)
19. **WebhookDelivery** - Delivery logs with retry tracking
20. **Notification** - User notifications (7 types)
21. **SavedFilter** - Per-user dashboard filters
22. **ScheduledJob** - Cron-based scheduled tasks

**Enums (11):**
UserRole, AISystemType, DataClassification, LifecycleStatus, AssessmentStatus, RiskCategory, TreatmentStatus, TaskPriority, TaskStatus, EvidenceStatus, NotificationType

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

## Known Limitations & Technical Debt

### MVP1-4 Completed Phases
- ✅ Phase 1-7: Core features, testing, accessibility
- ✅ Phase 8-10: Evidence, framework seeds, optimizations
- ✅ Phase 11: Organization & user management
- ✅ Phase 12: API keys & webhooks (HMAC-SHA256 signing)
- ✅ Phase 13: Notifications, audit logs, UI polish

### Completed Features (MVP4)
- ✅ 262+ integration/unit tests passing
- ✅ E2E tests with Playwright (3+ test suites)
- ✅ Performance benchmarking script
- ✅ Multi-layer caching (LRU + Redis) with cache warming
- ✅ Rate limiting (sliding window, role-based tiers)
- ✅ API key authentication (SHA-256 hashing)
- ✅ Webhook delivery with retry logic
- ✅ Notification service (7 event types, polling)
- ✅ Audit log viewer with filters & CSV export
- ✅ Evidence management with linking
- ✅ Gap analysis engine with CSV export
- ✅ Global search across 5+ entity types
- ✅ Import/export (CSV/Excel with streaming)
- ✅ Keyboard accessibility & WCAG 2.1 AA
- ✅ RBAC with 5 role hierarchy

### Deferred Features (MVP5+)
- S3/Blob file storage integration
- Scheduled report generation (cron-based)
- Advanced gap analysis visualization
- Bundle size optimization (target: 400KB gzip)
- Database connection pooling for scale
- Real-time collaboration features
- SSO/SAML integration
- Mobile application

---

## Next Phase: File Storage & Reporting (MVP5)

**Planned Focus:**
- S3/Blob storage integration for evidence upload
- Scheduled report generation & email delivery
- Advanced visualization for gap analysis
- Bundle size optimization
- Database connection pooling (PgBouncer)

**Success Criteria:**
- Evidence file upload fully functional
- Reports scheduled and emailed
- Bundle size < 400KB gzip
- API response time < 200ms P95 (95th percentile)

---

## Git Repository Information

**Repository Status:** Development
**Main Branch:** main
**Current Tags:** v0.1.0-alpha
**Last Commit:** 2026-02-03 14:30 UTC

---

## Code Review Findings (2026-02-04)

### Test & Build Status
- **Tests:** 262/262 passing (100%)
- **TypeScript:** 0 errors (strict mode)
- **Build:** Production build successful
- **Type Coverage:** 100% (no `any` abuse)

### Critical Issues Identified (Fix Before Production)
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

**Codebase Summary Generated:** 2026-02-04
**Last Updated:** 2026-02-04 12:08 UTC (Framework UI grouping, icons, SCF v2025.4)
**Maintained By:** docs-manager agent
