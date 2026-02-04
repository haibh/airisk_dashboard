# AIRisk Dashboard - Code Standards & Conventions

**Version:** 2.0 | **Date:** 2026-02-04 | **Status:** Active

---

## Table of Contents

1. [General Principles](#general-principles)
2. [File Organization](#file-organization)
3. [Naming Conventions](#naming-conventions)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [React/Component Standards](#reactcomponent-standards)
6. [API Route Standards](#api-route-standards)
7. [Database & ORM](#database--orm)
8. [Testing Standards](#testing-standards)
9. [Error Handling](#error-handling)
10. [Security Practices](#security-practices)

---

## General Principles

### YAGNI, KISS, DRY
- **YAGNI (You Aren't Gonna Need It):** Don't implement features until they're needed
- **KISS (Keep It Simple, Stupid):** Prefer simple, readable solutions over clever ones
- **DRY (Don't Repeat Yourself):** Extract common logic into reusable modules

### Code Quality Standards
- Prioritize functionality and readability over strict style enforcement
- Maintain reasonable linting without being overly restrictive
- Ensure no syntax errors and code compiles cleanly
- Use try-catch error handling covering edge cases
- Include security standards compliance

### File Size Limits
- Individual code files: **Under 200 lines of code**
- If a file grows beyond 200 LOC, split into smaller modules
- Documentation files: **Under 800 lines** (split into subdirectories if needed)

---

## File Organization

### Directory Structure
```
src/
├── app/                           # Next.js App Router (16.1.6)
│   ├── [locale]/                  # Dynamic locale (en/vi)
│   │   ├── (auth)/                # Route group - auth pages
│   │   │   └── login/
│   │   └── (dashboard)/           # Route group - protected routes (29 pages)
│   │       ├── ai-systems/
│   │       ├── risk-assessment/
│   │       ├── frameworks/
│   │       ├── evidence/
│   │       ├── gap-analysis/
│   │       ├── settings/
│   │       └── dashboard/
│   └── api/                       # REST API (53 routes, 21 groups)
│       ├── ai-systems/            # CRUD + soft delete
│       ├── assessments/           # CRUD + risks + status workflow
│       ├── risks/                 # Individual risk operations
│       ├── frameworks/            # List, detail, controls, mappings
│       ├── dashboard/             # Stats, heatmap, compliance, activity
│       ├── reports/               # Compliance, assessment, risk-register
│       ├── evidence/              # Upload, approval, versioning
│       ├── gap-analysis/          # Gap analysis + export
│       ├── organizations/         # Profile management
│       ├── users/                 # CRUD users, password change
│       ├── invitations/           # Create, accept (public)
│       ├── api-keys/              # CRUD, max 10/org
│       ├── webhooks/              # CRUD, test, deliveries
│       ├── notifications/         # List, unread count, mark-read
│       ├── audit-logs/            # List, filters, CSV export
│       ├── saved-filters/         # Per-user filters
│       ├── search/                # Global multi-entity search
│       ├── export/                # CSV/Excel streaming export
│       ├── import/                # CSV/Excel import + validation
│       ├── scheduled-jobs/        # CRUD, trigger, logs
│       ├── health/                # DB + Redis + S3 status
│       └── cron/                  # Cron job handlers
├── components/                    # React components (59 files, 8.3K LOC)
│   ├── layout/                    # Header, Sidebar, with notification dropdown
│   ├── ui/                        # Shadcn/ui wrappers (23 components)
│   ├── forms/                     # Forms with React Hook Form + Zod
│   ├── tables/                    # Data tables with pagination
│   ├── charts/                    # Recharts components
│   ├── ai-systems/                # AI system management
│   ├── frameworks/                # Framework tree, controls table
│   ├── risk-assessment/           # 5-step wizard, matrix visualization
│   ├── evidence/                  # Evidence upload, approval
│   ├── gap-analysis/              # Gap analysis visualization
│   ├── settings/                  # Organization, users, API keys, webhooks
│   ├── notifications/             # Dropdown, notification list
│   ├── audit-log/                 # Viewer, filters, detail diff
│   ├── search/                    # Global search interface
│   └── providers/                 # NextAuth, Theme providers
├── lib/                           # Utilities (28 files, 6.2K LOC)
│   ├── auth-helpers.ts            # RBAC, hasMinimumRole()
│   ├── db.ts                      # Prisma client
│   ├── risk-scoring-calculator.ts # Risk scoring logic
│   ├── cache-*.ts                 # Multi-layer caching + Redis
│   ├── rate-limiter.ts            # Sliding window, role-based
│   ├── api-key-*.ts               # API key gen, auth middleware
│   ├── api-validation-schemas.ts  # Zod validation schemas
│   ├── api-error-handler.ts       # Error middleware
│   ├── logger*.ts                 # Structured logging
│   ├── webhook-*.ts               # Webhook dispatch, signing
│   ├── scheduled-job-*.ts         # Cron runner, handlers
│   ├── notification-service.ts    # Notification system
│   ├── gap-analysis-engine.ts     # Gap analysis logic
│   ├── global-search-service.ts   # Multi-entity search
│   ├── import-parser.ts           # CSV/Excel import
│   ├── export-generator.ts        # CSV/Excel export streaming
│   ├── storage-service.ts         # S3/Blob integration
│   └── utils.ts                   # General utilities
├── types/                         # TypeScript definitions (4 files)
├── store/                         # Zustand stores (4 stores: ui, ai-systems, assessments, frameworks)
├── i18n/                          # Internationalization
│   ├── messages/                  # en.json, vi.json (1000+ keys each)
│   └── request.ts                 # Locale detection
├── middleware.ts                  # Auth + i18n middleware
└── globals.css                    # Global Tailwind CSS

prisma/
├── schema.prisma                  # Database schema (20 models, 11 enums)
├── seed.ts                        # User & org seeding
├── seed-frameworks.ts             # NIST AI RMF + ISO 42001
├── seed-cis-controls.ts           # CIS Controls v8.1
├── seed-csa-aicm.ts               # CSA AICM framework
├── seed-nist-csf.ts               # NIST Cybersecurity Framework
└── seed-pci-dss.ts                # PCI DSS v4.0.1

tests/
├── setup.ts                       # Global test configuration + mocks
├── api/                           # API endpoint tests (262+ passing)
├── lib/                           # Unit tests
└── e2e/                           # End-to-end tests (Playwright)
```

### File Naming Rules
- **Components:** PascalCase (e.g., `AiSystemForm.tsx`)
- **Non-component files:** kebab-case (e.g., `risk-scoring-calculator.ts`)
- **Test files:** Match source file + `.test.ts` suffix
- **API routes:** kebab-case folders (e.g., `/ai-systems/[id]/route.ts`)
- **TypeScript files:** Include `.ts` extension (not `.js`)

---

## Naming Conventions

### Variables & Functions
```typescript
// Constants: SCREAMING_SNAKE_CASE
const MAX_RISK_SCORE = 25;
const DEFAULT_TIMEOUT_MS = 5000;

// Regular variables: camelCase
let assessmentCount = 0;
const riskLevel = 'HIGH';

// Functions: camelCase
function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

// Boolean variables: prefix with is/has/can
const isAuthenticated = !!session;
const hasEditPermission = userRole === 'ADMIN';
const canDelete = userRole === 'RISK_MANAGER';
```

### React Components
```typescript
// Component files: PascalCase
export function AiSystemForm() { }
export const RiskMatrixVisualization = () => { }

// Props interfaces: ComponentNameProps
interface AiSystemFormProps {
  onSubmit: (data: AISystem) => void;
  isLoading?: boolean;
}

// Hooks: use prefix
function useRiskCalculation(likelihood: number, impact: number) { }
```

### Database & Types
```typescript
// Types/Interfaces: PascalCase
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Enums: PascalCase with values
enum UserRole {
  ADMIN = 'ADMIN',
  RISK_MANAGER = 'RISK_MANAGER',
  ASSESSOR = 'ASSESSOR',
  AUDITOR = 'AUDITOR',
  VIEWER = 'VIEWER',
}

// Database model names: Singular PascalCase
model User { }        // not Users
model Assessment { }  // not Assessments
model AISystem { }    // not AISystems
```

---

## TypeScript Guidelines

### Type Safety
- **Always use TypeScript types** - No `any` type unless absolutely necessary
- **Import types from `@/types`** - Centralize type definitions
- **Use strict tsconfig** - Enable strict mode in `tsconfig.json`
- **Avoid `as` assertions** - Use proper typing instead

```typescript
// ❌ Bad: Using 'any'
function processData(data: any) {
  return data.value;
}

// ✅ Good: Properly typed
interface DataPayload {
  value: string;
}

function processData(data: DataPayload): string {
  return data.value;
}
```

### Generic Types
```typescript
// Use generics for reusable utilities
function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Nullable Types
```typescript
// Use union with null/undefined
const description: string | null = null;
const owner: string | undefined;

// Use optional properties for interfaces
interface Risk {
  id: string;
  title: string;
  description?: string;  // Optional
  controlEffectiveness?: number;
}
```

---

## React/Component Standards

### Functional Components Only
- Use functional components with hooks (no class components)
- Use TypeScript for prop typing
- Import React only when needed

```typescript
// ✅ Good: Functional component with proper types
import { FC } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: FC<ButtonProps> = ({ label, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}>
    {label}
  </button>
);
```

### Hook Usage
```typescript
// Use standard React hooks
import { useState, useEffect, useCallback, useMemo } from 'react';

// Use next-intl for translations
import { useTranslations } from 'next-intl';

// Use Zustand for client state
import { create } from 'zustand';

// Use React Hook Form for forms
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
```

### Form Handling
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema with Zod
const formSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
});

// Use in component
export function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

### Component Organization
```typescript
// 1. Imports
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// 2. Type definitions
interface Props {
  id: string;
  onSubmit: (data: FormData) => Promise<void>;
}

// 3. Component
export function MyComponent({ id, onSubmit }: Props) {
  // Hooks first
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers
  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit({});
    setIsLoading(false);
  };

  // Render
  return (
    <div>
      <button onClick={handleSubmit}>{t('submit')}</button>
    </div>
  );
}
```

---

## API Route Standards

### Response Format
All API responses follow this format:

```typescript
// Success response
{
  "success": true,
  "data": { /* response body */ },
  "message": "Operation successful"
}

// Paginated response
{
  "success": true,
  "data": [ /* array */ ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}

// Error response
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### Route Implementation
```typescript
// src/app/api/ai-systems/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { db } from '@/lib/db';
import { hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Authorization check
    if (!hasMinimumRole(session.user.role, 'VIEWER')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // 3. Validation
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 4. Database query
    const items = await db.aiSystem.findMany({
      where: { organizationId: session.user.organizationId },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await db.aiSystem.count({
      where: { organizationId: session.user.organizationId },
    });

    // 5. Response
    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('AI Systems fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Database & ORM

### Prisma Schema Guidelines
```prisma
model AISystem {
  // IDs and Foreign Keys
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  // Core Fields
  name            String
  description     String?
  type            AISystemType    // GenAI, ML, RPA
  dataClassification String        // Public, Confidential, Restricted
  status          LifecycleStatus // Development, Pilot, Production, Retired

  // Ownership
  owner           String?
  technicalOwner  String?
  riskOwner       String?

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime? // Soft delete

  // Relations
  assessments     Assessment[]
  evidence        EvidenceLink[]

  // Indexes
  @@index([organizationId])
  @@index([type])
  @@index([status])
  @@map("ai_system")  // Snake case table name
}
```

### Prisma Naming Gotchas
**Case Matters!**
- Model: `aISystem` (camelCase in Prisma, maps to `ai_system` table via `@@map`)
- Model: `aPIKey` (capital PI, not `apiKey`)
- Always use `@@map()` directive for snake_case table names
- Prisma client uses exact model names: `prisma.aISystem.findMany()`

### Query Patterns
```typescript
// Selection optimization
const system = await db.aiSystem.findUnique({
  where: { id: systemId },
  select: {
    id: true,
    name: true,
    description: true,
    assessments: {
      select: { id: true, status: true },
    },
  },
});

// Filtering with organization isolation
const items = await db.aiSystem.findMany({
  where: {
    organizationId: userOrgId,  // Multi-tenant isolation
    status: { in: ['PRODUCTION', 'PILOT'] },
  },
  orderBy: { createdAt: 'desc' },
});

// Pagination
const [items, total] = await Promise.all([
  db.aiSystem.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  }),
  db.aiSystem.count(),
]);
```

---

## Testing Standards

### Test File Organization
```typescript
// tests/api/ai-systems-endpoint.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/ai-systems/route';
import { prismaMock } from '@/tests/setup';

describe('GET /api/ai-systems', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated systems', async () => {
    // Arrange
    const mockSystems = [{ id: '1', name: 'System 1' }];
    prismaMock.aiSystem.findMany.mockResolvedValue(mockSystems);

    // Act
    const response = await GET(mockRequest);
    const json = await response.json();

    // Assert
    expect(json.success).toBe(true);
    expect(json.data).toEqual(mockSystems);
  });

  it('should return 401 if unauthorized', async () => {
    // Test without session
  });
});
```

### Testing Best Practices
- **Unit tests:** Focus on isolated functions
- **Integration tests:** Test API routes with mocked database
- **E2E tests:** Test complete user workflows
- **Coverage goal:** 80%+ for critical paths
- **No fake data:** Use realistic test scenarios
- **Mock external dependencies:** Database, auth, APIs

### Test Coverage Areas
- API endpoints (CRUD operations)
- Error handling and edge cases
- Authorization and RBAC
- Database queries and filters
- Business logic (risk scoring)
- i18n string loading

---

## Error Handling

### Error Response Standards
```typescript
// src/lib/api-error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Error Types
| Status | Code | Use Case |
|--------|------|----------|
| 400 | VALIDATION_ERROR | Invalid input data |
| 401 | UNAUTHORIZED | Missing authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource doesn't exist |
| 409 | CONFLICT | Duplicate or constraint violation |
| 500 | INTERNAL_ERROR | Unexpected server error |

---

## Security Practices

### Authentication & Authorization
```typescript
// Always check session
const session = await getServerSession();
if (!session?.user) throw new ApiError(401, 'UNAUTHORIZED', 'Not authenticated');

// Check role hierarchy
if (!hasMinimumRole(session.user.role, 'RISK_MANAGER')) {
  throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
}

// Multi-tenant isolation: always filter by organizationId
const data = await db.aiSystem.findMany({
  where: { organizationId: session.user.organizationId },
});
```

### Password & Secrets
```typescript
// Use environment variables for secrets
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.NEXTAUTH_SECRET;

// Hashed passwords with bcrypt (already in NextAuth)
// Never log sensitive data
// Use TLS for all network communication
```

### Input Validation
```typescript
// Always validate API input with Zod
import { z } from 'zod';

const createSystemSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['GenAI', 'ML', 'RPA']),
  organizationId: z.string().cuid(),
});

// Validate in route
const payload = createSystemSchema.parse(await request.json());
```

### SQL Injection Prevention
- Use Prisma ORM (prevents SQL injection)
- Never build raw SQL queries
- Use parameterized queries only

---

## Linting & Formatting

### ESLint Configuration
- Run `npm run lint` before commits
- Fix auto-fixable issues: `npm run lint -- --fix`
- Review and resolve non-fixable warnings

### Code Review Checklist
- [ ] No syntax errors (compiles cleanly)
- [ ] TypeScript strict mode passes
- [ ] No `any` types without justification
- [ ] Functions under 50 lines
- [ ] Components under 100 lines (split if larger)
- [ ] Error handling implemented
- [ ] Tests pass
- [ ] No console.log in production code
- [ ] Security checks passed
- [ ] Documentation updated

---

## Git Commit Standards

### Commit Message Format
```
feat(module): add feature description
fix(auth): resolve login timeout issue
docs(readme): update setup instructions
refactor(api): simplify error handling
test(risk): add scoring calculation tests
```

### Commit Best Practices
- One logical change per commit
- Keep commits focused and atomic
- Write clear, descriptive messages
- Reference issues/tickets if applicable
- Don't commit secrets or dependencies

---

**Code Standards Version:** 2.0 | **Last Updated:** 2026-02-04 | **Maintained By:** docs-manager agent
