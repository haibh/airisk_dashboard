# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIRM-IP (AI Risk Management Intelligence Platform) - Enterprise platform for managing AI risks, compliance frameworks (NIST AI RMF, ISO 42001), and governance. Built with Next.js 16 App Router, TypeScript, PostgreSQL/Prisma, and bilingual i18n (EN/VI).

## Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint check

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations (dev)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed with initial data

# Testing
npm run test             # Run Vitest in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:headed  # Run E2E with browser visible

# Type check
npm run type-check       # TypeScript check without emit
```

## Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│  React 18 + TypeScript │ Tailwind CSS │ Shadcn/ui │ Zustand        │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │   Pages (SSR)   │  │   API Routes    │  │     Middleware      │ │
│  │  /[locale]/*    │  │    /api/*       │  │ - Auth (JWT check)  │ │
│  └─────────────────┘  └─────────────────┘  │ - i18n (locale)     │ │
│                                             │ - RBAC              │ │
│  ┌──────────────────────────────────────┐  └─────────────────────┘ │
│  │         Business Logic               │                          │
│  │  - Risk Scoring Calculator           │                          │
│  │  - Auth Helpers (bcrypt, JWT)        │                          │
│  └──────────────────────────────────────┘                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ Prisma ORM
┌───────────────────────────────▼─────────────────────────────────────┐
│                        POSTGRESQL 15+                               │
│  Organizations │ Users │ AISystem │ Framework │ RiskAssessment     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Model (Entity Relationships)
```
┌──────────────┐
│ Organization │─────────────────────────────────────────────┐
└──────┬───────┘                                             │
       │ 1:N                                                 │
       ▼                                                     │
┌──────────────┐      1:N      ┌──────────────┐             │
│     User     │──────────────▶│   AISystem   │◀────────────┤
│  (5 roles)   │   owns        └──────┬───────┘             │
└──────────────┘                      │                      │
                                      │ 1:N                  │
                                      ▼                      │
┌──────────────┐  1:N   ┌────────────────────┐              │
│  Framework   │───────▶│  RiskAssessment    │◀─────────────┘
│ NIST/ISO     │        │  (status workflow) │
└──────┬───────┘        └─────────┬──────────┘
       │ 1:N                      │ 1:N
       ▼                          ▼
┌──────────────┐           ┌──────────────┐
│   Control    │◀──────────│     Risk     │
│  (hierarchy) │  N:M via  │ (5x5 matrix) │
└──────┬───────┘ RiskControl└──────┬───────┘
       │                           │ 1:N
       │ N:M                       ▼
       ▼                    ┌──────────────┐
┌────────────────┐          │     Task     │
│ ControlMapping │          │ (treatment)  │
│ (cross-framework)         └──────────────┘
└────────────────┘

Evidence ←──── EvidenceLink ────→ AISystem/Risk/Control/Assessment
AuditLog ←──── tracks all mutations
```

### Request Flow
```
Browser Request
       │
       ▼
┌──────────────────────────────────────────────────────┐
│                    middleware.ts                      │
│  1. Skip if /api or static files                     │
│  2. Check isPublicPath (/, /login)                   │
│  3. Verify JWT token (getToken from next-auth/jwt)   │
│  4. Redirect to /{locale}/login if unauthorized      │
│  5. Apply i18n middleware (locale detection)         │
└──────────────────────┬───────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐               ┌──────────────┐
│  Page Route  │               │  API Route   │
│ (React SSR)  │               │ (REST JSON)  │
└──────────────┘               └──────┬───────┘
                                      │
                               ┌──────▼───────┐
                               │ getServerSession()
                               │ Check RBAC   │
                               └──────┬───────┘
                                      │
                               ┌──────▼───────┐
                               │ Prisma Query │
                               │ + orgId filter
                               └──────────────┘
```

### Route Structure (App Router with i18n)
```
src/app/
├── [locale]/                    # Dynamic locale (en/vi)
│   ├── (auth)/login/            # Auth group - login page
│   ├── (dashboard)/             # Dashboard group - protected routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── ai-systems/          # AI inventory CRUD
│   │   ├── risk-assessment/     # Risk assessment wizard
│   │   └── frameworks/          # NIST/ISO frameworks
│   └── layout.tsx               # Root layout with providers
└── api/                         # API routes (no locale prefix)
    ├── auth/[...nextauth]/      # NextAuth handlers
    ├── ai-systems/              # AI system CRUD
    ├── assessments/             # Risk assessments
    ├── frameworks/              # Framework & controls
    ├── dashboard/               # Dashboard stats endpoints
    └── reports/                 # Export endpoints
```

### Key Modules

**Authentication** (`src/app/api/auth/`, `src/lib/auth-helpers.ts`, `src/middleware.ts`)
- NextAuth.js with credentials provider + JWT strategy
- RBAC: ADMIN > RISK_MANAGER > ASSESSOR > AUDITOR > VIEWER
- Middleware handles auth check + i18n routing

**Risk Scoring** (`src/lib/risk-scoring-calculator.ts`)
- 5×5 matrix: `inherentScore = likelihood × impact` (1-25)
- `residualScore = inherentScore × (1 - controlEffectiveness%)`
- Levels: LOW (1-4), MEDIUM (5-9), HIGH (10-15), CRITICAL (16-25)

**Database** (`prisma/schema.prisma`)
- 12 core models: Organization, User, AISystem, Framework, Control, ControlMapping, RiskAssessment, Risk, RiskControl, Evidence, Task, AuditLog
- Multi-tenant via organizationId on most entities

### Testing

- **Unit/Integration**: Vitest with mocked Prisma (`tests/setup.ts` exports `prismaMock`)
- **E2E**: Playwright in `tests/e2e/`, runs against `localhost:3000`
- **Coverage**: API routes and lib functions only (see `vitest.config.ts` include/exclude)

Run single test file:
```bash
npm run test -- tests/api/ai-systems-endpoint.test.ts
npm run test:e2e -- tests/e2e/auth-login-flow.spec.ts
```

### State Management

- **Zustand** for client state (`src/store/`)
- **Server state** via API routes + fetch

### i18n

- Locales: `en`, `vi` (defined in `src/i18n/request.ts`)
- Messages: `src/i18n/messages/{locale}.json`
- URL pattern: `/{locale}/dashboard`, `/{locale}/login`

## Environment Setup

Copy `.env.example` to `.env.local`:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/airm_ip"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

## Conventions

- Path alias: `@/` maps to `src/`
- UI components: Shadcn/ui in `src/components/ui/`
- API responses: `{ success: boolean, data?, error?, total?, page? }`
- Role check: `hasMinimumRole(userRole, 'ASSESSOR')` for hierarchical permissions
