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
npm run type-check       # TypeScript check without emit
npm run analyze          # Bundle analysis (ANALYZE=true build)

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations (dev)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed with initial data (tsx prisma/seed.ts)

# Testing
npm run test             # Run Vitest in watch mode
npm run test:run         # Run tests once
npm run test:coverage    # Run with coverage report
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:headed  # Run E2E with browser visible

# Single test file
npm run test -- tests/api/ai-systems-endpoint.test.ts
npm run test:e2e -- tests/e2e/auth-login-flow.spec.ts
```

## Architecture

### System Stack
```
Client: React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui + Zustand
Server: Next.js 16 App Router + NextAuth.js (JWT) + Prisma ORM
DB:     PostgreSQL 15+ (multi-tenant via organizationId)
Cache:  Redis (optional, via ioredis) + in-memory fallback
```

### Data Model (Core Relationships)
```
Organization ──1:N──▶ User (5 roles) ──1:N──▶ AISystem
Organization ──1:N──▶ RiskAssessment ◀── Framework (1:N)
RiskAssessment ──1:N──▶ Risk ──N:M──▶ Control (via RiskControl)
Control ──N:M──▶ ControlMapping (cross-framework)
Evidence ◀── EvidenceLink ──▶ AISystem/Risk/Control/Assessment
AuditLog tracks all mutations
```

### Request Flow
```
Browser → middleware.ts (rate limit → JWT check → i18n locale) → Page or API Route
API Route: getServerSession() → RBAC check → Zod validation → Prisma query (+ orgId filter)
```

Middleware skips auth for `/api` routes (handled individually), static files, and public paths (`/`, `/login`). Rate limiting uses tiered configs: DEFAULT (unauthenticated), AUTHENTICATED, ADMIN.

### Route Structure
```
src/app/
├── [locale]/                    # Dynamic locale (en/vi)
│   ├── (auth)/login/            # Auth group
│   ├── (dashboard)/             # Protected routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── ai-systems/          # AI inventory CRUD (not yet implemented)
│   │   ├── risk-assessment/     # Risk assessment wizard
│   │   ├── frameworks/          # Framework browser + control tree
│   │   ├── technical-view/      # Operations + AI risk (tabbed)
│   │   ├── evidence/            # Evidence management
│   │   ├── gap-analysis/        # Gap analysis views
│   │   └── settings/            # User/org settings
│   └── layout.tsx               # Root layout with providers
└── api/                         # REST API (no locale prefix)
    ├── auth/[...nextauth]/      # NextAuth handlers
    ├── ai-systems/[id]/         # AI system CRUD
    ├── assessments/[id]/        # Risk assessments
    ├── frameworks/[id]/controls/# Framework & controls
    ├── dashboard/{stats,compliance,risk-heatmap,activity}/
    ├── evidence/                # Evidence upload/management
    ├── gap-analysis/            # Gap analysis engine
    ├── reports/compliance/      # Export endpoints
    ├── health/                  # Health check
    ├── search/                  # Global search
    ├── organizations/           # Org management
    ├── users/                   # User management
    ├── notifications/           # Notification CRUD
    ├── webhooks/                # Webhook management
    ├── api-keys/                # API key management
    └── audit-logs/              # Audit trail
```

### Key Modules

**Authentication** (`src/lib/auth-helpers.ts`, `src/app/api/auth/[...nextauth]/route.ts`)
- NextAuth.js credentials provider + JWT strategy (24h session, 30min refresh)
- RBAC hierarchy: ADMIN > RISK_MANAGER > ASSESSOR > AUDITOR > VIEWER
- Use `hasMinimumRole(userRole, 'ASSESSOR')` for hierarchical permission checks
- JWT token includes: `id`, `role`, `organizationId`, `organizationName`

**API Error Handling** (`src/lib/api-error-handler.ts`)
- All API routes use: `handleApiError(error, 'context description')` in catch blocks
- Helper functions: `unauthorizedError()`, `forbiddenError()`, `validationError()`, `notFoundError()`
- Auto-detects Prisma errors (P2002→409 CONFLICT, P2025→404 NOT_FOUND)
- Responses include `errorId` for log correlation

**Validation** (`src/lib/api-validation-schemas.ts`)
- Zod v4 schemas for all API inputs
- Use `validateBody(schema, data)` → returns `{ success, data?, error? }`
- Use `formatZodErrors(error)` to convert Zod errors to user-friendly messages

**Caching** (`src/lib/cache-advanced.ts`, `src/lib/cache-invalidation.ts`)
- `getFromCache(key, fetcher, options)` — Redis with in-memory fallback
- `invalidateOnAISystemChange(orgId, systemId)` — pattern-based cache invalidation
- Tests mock cache to pass-through to fetcher (see `tests/setup.ts`)

**Risk Scoring** (`src/lib/risk-scoring-calculator.ts`)
- 5×5 matrix: `inherentScore = likelihood × impact` (1-25)
- `residualScore = inherentScore × (1 - controlEffectiveness%)`
- Levels: LOW (1-4), MEDIUM (5-9), HIGH (10-15), CRITICAL (16-25)

### API Route Pattern

Every API route follows this structure:
```typescript
import { getServerSession } from '@/lib/auth-helpers';
import { handleApiError, unauthorizedError, forbiddenError, validationError } from '@/lib/api-error-handler';
import { validateBody, someSchema, formatZodErrors } from '@/lib/api-validation-schemas';
import { invalidateOnXChange } from '@/lib/cache-invalidation';
import { emitWebhookEvent } from '@/lib/webhook-event-dispatcher';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) return unauthorizedError();
    // All queries MUST filter by organizationId: session.user.organizationId
    // ... Prisma query ...
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    return handleApiError(error, 'fetching items');
  }
}
```

### Testing Patterns

Tests in `tests/api/` use Vitest with a **mocked Prisma** client. Key patterns:

```typescript
import { prisma } from '@/lib/db';                    // auto-mocked via tests/setup.ts
const importRoute = async () => import('@/app/api/xxx/route'); // dynamic import (required)

vi.mocked(prisma.aISystem.findMany).mockResolvedValue([...]); // set up mock returns
const { GET } = await importRoute();                           // import after mocks
const response = await GET(new NextRequest('http://localhost:3000/api/xxx'));
```

- `tests/setup.ts` exports `prismaMock` and auto-mocks: `@/lib/db`, `@/lib/auth-helpers`, `@/lib/cache-advanced`, `@/lib/redis-client`, `@/lib/logger`, `@/lib/notification-service`, `@/lib/webhook-event-dispatcher`
- Auth mock: `vi.mocked(getServerSession).mockResolvedValue({ user: { id, role, organizationId } })`
- Coverage targets: API routes (`src/app/api/**`) and lib functions (`src/lib/**`) only

### Prisma Gotchas

- **AISystem model accessor**: Prisma generates `prisma.aISystem` (capital I), not `prisma.aiSystem`
- **APIKey model accessor**: `prisma.aPIKey` (capital PI)
- All models use `@@map("table_name")` for snake_case table names
- `$transaction` is mocked to call the callback with a fresh prismaMock in tests

### i18n

- Locales: `en`, `vi` (defined in `src/i18n/request.ts`)
- Messages: `src/i18n/messages/{locale}.json`
- URL pattern: `/{locale}/dashboard`, `/{locale}/login`
- Use `next-intl` — `useTranslations('namespace')` in components

## Environment Setup

Copy `.env.example` to `.env.local`. Required variables:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/airm_ip"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

Optional: `REDIS_URL` (caching falls back to in-memory), S3/MinIO vars (evidence storage), SMTP vars (email notifications).

## Conventions

- Path alias: `@/` maps to `src/`
- UI components: Shadcn/ui in `src/components/ui/`
- Multi-tenancy: every data query must include `organizationId` from session
- Webhook events: emit via `emitWebhookEvent(orgId, 'entity.action', payload)` after mutations
- Cache invalidation: call appropriate `invalidateOn*Change()` after mutations
- Database singleton: import `prisma` from `@/lib/db`, never instantiate directly
