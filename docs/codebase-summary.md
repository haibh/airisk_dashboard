# AIRisk Dashboard - Codebase Summary

**Generated:** 2026-02-03
**Codebase Status:** MVP 1 Phase 6 (Dashboard & Reports) - In Progress
**Total Files:** 85 files
**Total Lines:** ~10,000+ lines of TypeScript/TSX

---

## Executive Overview

AIRisk Dashboard is a comprehensive AI Risk Management Intelligence Platform built with:
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Next.js 14 API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js with JWT
- **Internationalization:** next-intl (EN/VI)
- **State Management:** Zustand
- **UI Components:** Shadcn/ui + Radix UI

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
│   ├── schema.prisma           # Complete data model (12+ entities)
│   ├── seed.ts                 # User and organization seeding
│   └── seed-frameworks.ts      # NIST/ISO framework data seeding
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
│   ├── components/
│   │   ├── layout/             # Header, Sidebar
│   │   ├── ui/                 # Shadcn/ui wrapper components
│   │   ├── forms/              # Form components (AI System, Assessment)
│   │   ├── tables/             # Data table components
│   │   ├── charts/             # Data visualization
│   │   └── providers/          # Theme and session providers
│   ├── lib/
│   │   ├── auth-helpers.ts     # RBAC and auth utilities
│   │   ├── db.ts               # Prisma client initialization
│   │   ├── risk-scoring-calculator.ts
│   │   └── utils.ts            # Utility functions
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
**Status:** ✅ Completed (Phase 4)

**Frameworks Integrated:**
1. **NIST AI RMF 1.0 (2023)**
   - 4 Functions: Govern, Map, Measure, Manage
   - 19 Categories
   - 85+ Specific Controls

2. **ISO/IEC 42001:2023**
   - 9 Control Areas (A.2 - A.10)
   - 38 Specific Controls

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
**Status:** ⏳ In Progress (Phase 6)

**Features Implemented:**
- ✅ FR-DASH-01: Executive summary dashboard (partial)
- ✅ FR-DASH-02: Framework compliance scorecard (partial)
- ✅ FR-DASH-03: Drill-down navigation (partial)
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

### 6. Internationalization (NFR-I18N)
**Status:** ✅ Completed (Phase 1)

**Implementation:**
- next-intl framework for i18n
- English (EN) & Vietnamese (VI) support
- Namespace-based translations
- Locale routing middleware

**Key Files:**
- `src/i18n/messages/en.json`
- `src/i18n/messages/vi.json`
- `src/i18n/request.ts`
- `src/middleware.ts`

**Translation Namespaces:**
- `common`: Global UI terms
- `auth`: Authentication pages
- `dashboard`: Dashboard module
- `assessment`: Risk assessment module
- `frameworks`: Framework browsing

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

### 12 Core Entities

1. **Organization** - Root tenant entity
2. **User** - System users with roles
3. **AISystem** - AI systems under assessment
4. **Framework** - Compliance frameworks (NIST, ISO, etc.)
5. **Control** - Specific controls within frameworks
6. **Mapping** - Cross-framework control relationships
7. **Assessment** - Risk assessment snapshots
8. **Risk** - Individual risk records
9. **Evidence** - Evidence artifact metadata
10. **EvidenceLink** - Links evidence to risks/controls
11. **Task** - Remediation tasks
12. **AuditLog** - Immutable action logs

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
npm run dev                   # Start Next.js dev server
npm run db:push              # Push schema to database
npm run db:seed              # Seed initial data

# Testing
npm run test                 # Run tests (not yet configured)
npm run lint                 # Run ESLint

# Production
npm run build                # Build Next.js application
npm run start                # Start production server
```

### Key Technologies Used
- **React 18** - UI framework
- **Next.js 14** - Full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Prisma** - ORM
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication
- **Zustand** - State management
- **next-intl** - Internationalization

---

## Known Limitations & Technical Debt

### Phase 6 Deferred Features
- User management UI (requires admin interface)
- Gap analysis visualization (deferred pending dashboard completion)
- Evidence management (deferred to Phase 2)
- Scheduled report generation (deferred to Phase 2)

### Performance Gaps (Phase 7 TODO)
- No response caching implemented
- Bundle size not optimized
- No database query optimization for complex queries
- No image optimization

### Testing Gaps (Phase 7 TODO)
- No unit tests
- No integration tests
- No E2E tests
- No accessibility testing

### Documentation Gaps (Phase 7 TODO)
- No API reference documentation
- No deployment guide
- No user guide
- No admin guide

---

## Next Phase: Dashboard & Reports (Phase 6)

**Current Focus:**
- Implement risk heatmap widget
- Build compliance scorecard visualization
- Create recent activity feed
- Implement drill-down navigation

**Success Criteria:**
- Dashboard loads in < 3 seconds
- All FR-DASH requirements met
- Export functionality working (PDF/CSV)

---

## Git Repository Information

**Repository Status:** Development
**Main Branch:** main
**Current Tags:** v0.1.0-alpha
**Last Commit:** 2026-02-03 14:30 UTC

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

**Codebase Summary Generated:** 2026-02-03
**Last Updated:** 2026-02-03 15:36 UTC
**Maintained By:** docs-manager agent
