# AIRisk Dashboard - System Architecture

**Version:** 2.0
**Date:** 2026-02-03
**Status:** MVP 1 Implementation (Phase 6)
**Authors:** Senior Full-Stack Architect

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Architecture](#deployment-architecture)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Authentication Flow](#authentication-flow)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Database Schema](#database-schema)
7. [Component Architecture](#component-architecture)
8. [Security Architecture](#security-architecture)
9. [Scalability Considerations](#scalability-considerations)
10. [Monitoring & Observability](#monitoring--observability)

---

## Architecture Overview

### Technology Stack

```
┌────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
├────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript  │  Tailwind CSS  │  Shadcn/ui Components│
│  State: Zustand         │  i18n: next-intl                      │
└────────────────────────────────────────────────────────────────┘
                            │ HTTPS/TLS 1.3
┌────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
├────────────────────────────────────────────────────────────────┤
│  Next.js 14 App Router  │  API Routes  │  Middleware            │
│  NextAuth.js (JWT)      │  Route Handlers                       │
└────────────────────────────────────────────────────────────────┘
                            │
┌────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
├────────────────────────────────────────────────────────────────┤
│  PostgreSQL 15+  │  Prisma ORM  │  Row-Level Security (RLS)    │
│  Redis Cache (Sessions)  │  File Storage (Evidence)            │
└────────────────────────────────────────────────────────────────┘
```

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                                │
│  Web Browser │ Mobile (Future) │ API Consumers (Integrations)   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NETWORK LAYER                                 │
│  HTTPS/TLS 1.3  │  CloudFront/CDN  │  Rate Limiting            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                  APPLICATION SERVER                              │
│                   Next.js 14 (Node.js)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  UI Routes   │  │  API Routes  │  │  Middleware Stack    │  │
│  │ (React SSR)  │  │ (REST API)   │  │  - Auth              │  │
│  └──────────────┘  └──────────────┘  │  - RBAC              │  │
│                                        │  - i18n              │  │
│  ┌──────────────────────────────────┤  - Rate Limit        │  │
│  │   Business Logic Layer            │  - Audit Logging    │  │
│  │ - Risk Scoring                    │  - Error Handler    │  │
│  │ - Assessment Engine               └──────────────────────┘  │
│  │ - Framework Mapping                                         │
│  │ - Report Generation                                         │
│  └──────────────────────────────────────────────────────────────┘
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬─────────────────┐
        │                         │                 │
        ▼                         ▼                 ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────┐
│   PostgreSQL     │   │   Redis Cache    │   │ File Storage │
│   (Primary DB)   │   │   (Sessions)     │   │  (Evidence)  │
│   + RLS          │   │   (Tokens)       │   │              │
└──────────────────┘   └──────────────────┘   └──────────────┘
```

---

## Deployment Architecture

### Development Environment
```
Local Machine
├── Node.js 18+
├── PostgreSQL (Docker or local)
├── Next.js dev server (port 3000)
└── Environment: .env.local
```

### Staging/Production Environment
```
Cloud Provider (AWS/Azure/GCP)
├── Containerized Application
│   ├── Docker image with Node.js + Next.js
│   ├── Auto-scaling groups/instances
│   └── Load balancer (ALB/Azure LB)
├── Managed PostgreSQL
│   ├── Primary instance
│   ├── Read replicas (optional)
│   └── Automated backups
├── Redis Cache (managed service)
├── File Storage
│   ├── S3/Blob Storage for evidence files
│   └── CDN for static assets
├── CI/CD Pipeline
│   ├── GitHub Actions
│   ├── Automated testing
│   ├── Docker image build
│   └── Deployment to cloud
└── Monitoring & Logging
    ├── CloudWatch/Azure Monitor
    ├── Error tracking (Sentry optional)
    └── Application logs
```

### Infrastructure as Code (IaC)
```
- Docker: Dockerfile for containerization
- Docker Compose: Local development stack
- Cloud Provider: Terraform/CloudFormation (future)
```

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User enters credentials
       ▼
┌─────────────────────────────┐
│   POST /api/auth/signin     │
└──────┬──────────────────────┘
       │ 2. Validate email/password
       ▼
┌──────────────────────────────────┐
│   NextAuth.js + bcrypt hash      │
│   - Hash password verification   │
│   - Generate JWT token           │
└──────┬───────────────────────────┘
       │ 3. Create session
       ▼
┌──────────────────────────┐
│   Redis Session Store    │
│   (JWT + refresh token)  │
└──────┬───────────────────┘
       │ 4. Return to browser
       ▼
┌──────────────────────────────┐
│   Set-Cookie: next-auth.session-token
│   Authorization: Bearer <JWT>
└──────────────────────────────┘
```

### 2. Risk Assessment Workflow

```
┌──────────────────────┐
│  Create Assessment   │
│  (Step 1-2)          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  Select Framework (NIST/ISO)     │
│  (Step 3)                        │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  Identify Risks & Score (Step 4)         │
│  ┌─────────────────────────────────────┐ │
│  │ For each risk:                      │ │
│  │ 1. Select category                  │ │
│  │ 2. Set likelihood (1-5)             │ │
│  │ 3. Set impact (1-5)                 │ │
│  │ 4. Calculate inherent = L × I       │ │
│  │ 5. Set control effectiveness       │ │
│  │ 6. Calculate residual = I × (1-E%) │ │
│  └─────────────────────────────────────┘ │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Save Assessment         │
│  - Status: DRAFT         │
│  - Store all risks       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Review & Submit (Step 5)│
│  - Status: IN_PROGRESS   │
│  - Status: UNDER_REVIEW  │
│  - Status: APPROVED      │
└──────────────────────────┘
```

### 3. Dashboard Data Flow

```
┌──────────────────────────┐
│   User opens Dashboard   │
└──────┬───────────────────┘
       │
       ├─────────────┬──────────────┬──────────────────┐
       │             │              │                  │
       ▼             ▼              ▼                  ▼
   GET /api/      GET /api/    GET /api/          GET /api/
   dashboard/     dashboard/   dashboard/         dashboard/
   stats          risk-        compliance         activity
                  heatmap
       │             │              │                  │
       ▼             ▼              ▼                  ▼
    ┌────────────────────────────────────────────┐
    │   PostgreSQL Queries                       │
    │ - COUNT(*) risks by status/level           │
    │ - SUM(score) by category                   │
    │ - Compliance % per framework               │
    │ - Recent activities (audit logs)           │
    └────┬─────────────────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────────────────┐
    │   Aggregate & Format Response              │
    └────┬─────────────────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────────────────┐
    │   React Components Render                  │
    │ - Risk Heatmap (Recharts)                  │
    │ - Compliance Scorecard                     │
    │ - Activity Feed                            │
    │ - Stats Widgets                            │
    └────────────────────────────────────────────┘
```

---

## Authentication Flow

### JWT Token Strategy

```
Token Payload Structure:
{
  "sub": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "Risk Manager",
  "organizationId": "org_123",
  "iat": 1643827200,
  "exp": 1643914600
}

Token Lifespan: 24 hours
Refresh Token: Secure HttpOnly cookie
Idle Timeout: 30 minutes

Session Management:
- JWT in Authorization header: Bearer <token>
- Refresh token in secure cookie: next-auth.session-token
- Automatic renewal on activity
```

### RBAC Permission Matrix

```
┌─────────────────┬───────────┬────────────┬──────────┬────────┬──────────┐
│ Resource/Action │   Admin   │ Risk Manager│ Assessor │ Auditor│  Viewer  │
├─────────────────┼───────────┼────────────┼──────────┼────────┼──────────┤
│ Dashboard       │   FULL    │   VIEW     │  VIEW    │  VIEW  │  VIEW    │
│ AI Systems      │   FULL    │   FULL     │  VIEW    │  VIEW  │  VIEW    │
│ Assessments     │   FULL    │   FULL     │ CREATE   │  VIEW  │  VIEW    │
│ Risks           │   FULL    │   FULL     │ CREATE   │  VIEW  │  VIEW    │
│ Evidence        │   FULL    │   FULL     │ CREATE   │  VIEW  │  NONE    │
│ Reports         │   FULL    │   FULL     │  VIEW    │  VIEW  │  NONE    │
│ Settings        │   FULL    │   VIEW     │  NONE    │  NONE  │  NONE    │
│ User Management │   FULL    │   NONE     │  NONE    │  NONE  │  NONE    │
└─────────────────┴───────────┴────────────┴──────────┴────────┴──────────┘
```

---

## API Routes & Endpoints

### Route Organization

```
/api/
├── /auth/
│   ├── POST   /signin          - User login
│   └── POST   /signout         - User logout
├── /ai-systems/
│   ├── GET    /                - List systems
│   ├── POST   /                - Create system
│   ├── GET    /[id]            - Get single system
│   ├── PUT    /[id]            - Update system
│   └── DELETE /[id]            - Delete (soft)
├── /assessments/
│   ├── GET    /                - List assessments
│   ├── POST   /                - Create assessment
│   ├── GET    /[id]            - Get assessment
│   ├── PUT    /[id]            - Update assessment
│   ├── GET    /[id]/risks      - Get risks
│   └── POST   /[id]/risks      - Add risk
├── /risks/
│   ├── GET    /[id]            - Get risk
│   ├── PUT    /[id]            - Update risk
│   └── DELETE /[id]            - Delete risk
├── /frameworks/
│   ├── GET    /                - List frameworks
│   ├── GET    /[id]            - Get framework
│   ├── GET    /[id]/controls   - Get controls
│   └── GET    /mappings        - Get mappings
├── /dashboard/
│   ├── GET    /stats           - Dashboard statistics
│   ├── GET    /risk-heatmap    - Risk distribution
│   ├── GET    /compliance      - Framework compliance
│   └── GET    /activity        - Activity feed
└── /reports/
    ├── GET    /risk-register   - Export risk register
    ├── GET    /assessment-summary - Export assessment
    └── GET    /compliance      - Export compliance
```

### Middleware Stack

```
Request Flow:
1. Next.js Router Matching
2. Middleware.ts
   ├── i18n locale detection
   ├── CORS headers
   └── Authentication check
3. Route Handler
   ├── RBAC authorization check
   ├── Request validation
   ├── Business logic
   └── Response formatting
4. Error Handler
   ├── 4xx/5xx status codes
   └── Error logging
```

---

## Database Schema

### Core Entities (12)

```prisma
// Organizations
model Organization {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users     User[]
  systems   AISystem[]
}

// Users
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String   // bcrypt hashed
  name     String
  role     String   // Admin, Risk Manager, Assessor, Auditor, Viewer
  orgId    String
  org      Organization @relation(fields: [orgId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// AI Systems
model AISystem {
  id       String   @id @default(cuid())
  orgId    String
  name     String
  type     String   // GenAI, ML, RPA
  status   String   // Development, Pilot, Production, Retired
  dataClassification String
  owner    String?
  assessments Assessment[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Frameworks
model Framework {
  id       String   @id @default(cuid())
  name     String   // NIST AI RMF, ISO 42001
  version  String
  effectiveDate DateTime
  isActive Boolean  @default(true)
  controls Control[]
}

// Controls
model Control {
  id        String   @id @default(cuid())
  frameworkId String
  code      String
  title     String
  description String?
  framework Framework @relation(fields: [frameworkId], references: [id])
  mappings  Mapping[]
}

// Mappings
model Mapping {
  id        String   @id @default(cuid())
  sourceControlId String
  targetControlId String
  confidence String // HIGH, MEDIUM, LOW
  rationale String?
}

// Assessments
model Assessment {
  id        String   @id @default(cuid())
  aiSystemId String
  frameworkId String
  title     String
  status    String   // DRAFT, IN_PROGRESS, UNDER_REVIEW, APPROVED
  risks     Risk[]
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Risks
model Risk {
  id        String   @id @default(cuid())
  assessmentId String
  category  String   // Bias/Fairness, Privacy, Security, etc.
  title     String
  likelihood Int     // 1-5
  impact    Int      // 1-5
  inherentScore Int  // Likelihood × Impact
  residualScore Int  // Inherent × (1 - effectiveness%)
  status    String   // Open, InProgress, Resolved
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Evidence
model Evidence {
  id        String   @id @default(cuid())
  filename  String
  hash      String   // SHA-256
  links     EvidenceLink[]
  createdAt DateTime @default(now())
}

// Evidence Links
model EvidenceLink {
  id        String   @id @default(cuid())
  evidenceId String
  entityType String  // risk, control, assessment
  entityId  String
}

// Tasks
model Task {
  id        String   @id @default(cuid())
  riskId    String
  title     String
  assigneeId String
  status    String   // Open, InProgress, Completed
  dueDate   DateTime?
  createdAt DateTime @default(now())
}

// Audit Logs
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  entityType String
  entityId  String
  timestamp DateTime @default(now())
}
```

### Database Indexes

```sql
-- Performance Indexes
CREATE INDEX idx_aiSystem_orgId ON "AISystem"(organizationId);
CREATE INDEX idx_assessment_aiSystemId ON "Assessment"(aiSystemId);
CREATE INDEX idx_assessment_frameworkId ON "Assessment"(frameworkId);
CREATE INDEX idx_risk_assessmentId ON "Risk"(assessmentId);
CREATE INDEX idx_control_frameworkId ON "Control"(frameworkId);
CREATE INDEX idx_user_orgId ON "User"(organizationId);
CREATE INDEX idx_auditLog_userId ON "AuditLog"(userId);
CREATE INDEX idx_auditLog_timestamp ON "AuditLog"(timestamp DESC);

-- Full-text Search Index
CREATE INDEX idx_aiSystem_fulltext ON "AISystem"
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

---

## Component Architecture

### Directory Structure

```
src/components/
├── layout/
│   ├── sidebar.tsx              # Main navigation
│   └── header.tsx               # Top header with user menu
├── ui/                          # Shadcn/ui wrapper components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── badge.tsx
│   ├── dropdown-menu.tsx
│   ├── tooltip.tsx
│   └── ... (12+ ui components)
├── forms/
│   └── ai-system-form.tsx       # Form for creating/editing AI systems
├── tables/
│   └── data-table.tsx           # Reusable data table component
├── charts/
│   ├── risk-heatmap.tsx         # Risk distribution heatmap
│   └── compliance-scorecard.tsx # Framework compliance visualization
├── risk-assessment/
│   ├── assessment-creation-wizard.tsx     # 5-step wizard
│   ├── risk-entry-form.tsx      # Risk data entry
│   └── risk-matrix-visualization.tsx # 5×5 matrix interactive
├── ai-systems/
│   └── ai-system-form.tsx
├── frameworks/
│   └── framework-control-tree.tsx # Collapsible framework tree
└── providers/
    ├── session-provider.tsx      # NextAuth provider wrapper
    └── theme-provider.tsx        # Dark/light mode provider
```

### Component Hierarchy

```
App (pages)
├── _app.tsx
│   ├── SessionProvider (NextAuth)
│   ├── ThemeProvider
│   └── Layout
│       ├── Sidebar
│       │   └── NavLinks
│       └── Main Content
│           ├── Header
│           │   └── UserMenu
│           └── Page Content
│               ├── DataTable
│               ├── Forms
│               ├── Charts
│               └── Cards
```

---

## Security Architecture

### Authentication & Authorization

```
┌──────────────┐
│  User Login  │
└──────┬───────┘
       │
       ▼
┌────────────────────────────┐
│  NextAuth.js Providers     │
│  - Credentials Provider    │
│  - Email/Password Check    │
└──────┬─────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│  bcrypt Password Verification      │
│  - Hash comparison (constant-time) │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│  JWT Token Generation              │
│  - Subject: user_id                │
│  - Role: from database             │
│  - Organization: from database     │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│  Session Management                │
│  - Store in Redis (optional)       │
│  - Set secure cookie               │
│  - Return JWT in response          │
└────────────────────────────────────┘
```

### Data Protection

```
At Rest:
- PostgreSQL encryption (via cloud provider)
- Sensitive fields encrypted (passwords via bcrypt)
- PII handled according to GDPR/CCPA

In Transit:
- HTTPS/TLS 1.3 enforced
- No sensitive data in URLs
- Secure cookie flags (HttpOnly, Secure)

Access Control:
- Row-Level Security (RLS) via Prisma
- Organization-level data isolation
- Role-based endpoint access
```

### Encryption Strategy

```
Passwords:
- Algorithm: bcrypt with salt rounds = 10
- Never stored in plain text
- Never transmitted except during login

API Keys/Secrets:
- Stored in environment variables
- Not committed to Git
- Rotated periodically

JWT Tokens:
- Signed with HS256
- Expiration: 24 hours
- Refresh token: Secure HttpOnly cookie
```

---

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    │
    ├─── Application Server 1 (Node.js)
    ├─── Application Server 2 (Node.js)
    └─── Application Server 3 (Node.js)

All share:
- PostgreSQL (managed, read replicas)
- Redis Cache (shared session store)
- S3/Blob Storage (evidence files)
```

### Database Scaling

```
PostgreSQL Optimization:
1. Connection pooling (PgBouncer)
2. Read replicas for reporting
3. Sharding by organization (future)
4. Caching layer (Redis)
5. Query optimization (indexed columns)
```

### Caching Strategy

```
├── HTTP Cache Headers
│   └── Cache-Control: max-age=3600 (1 hour)
├── Redis Cache (Sessions)
│   ├── Session tokens: TTL 24 hours
│   ├── Refresh tokens: TTL 7 days
│   └── Query results: TTL 1 hour
└── CDN Cache (Static Assets)
    ├── CSS/JS bundles: 1 week
    ├── Images: 1 month
    └── HTML: no-cache
```

### Pagination Strategy

```
All list endpoints support pagination:

Query Parameters:
- page: 1-based page number
- pageSize: 10-100 items (default 10)
- searchTerm: full-text search
- sortBy: column name
- sortOrder: asc|desc

Response includes:
- total: total record count
- page: current page
- pageSize: items per page
- totalPages: calculated pages
```

---

## Monitoring & Observability

### Logging Strategy

```
Application Logs:
- All API requests (method, path, status, duration)
- Authentication events (login, logout, role changes)
- Data mutations (create, update, delete)
- Errors and exceptions (with stack traces)
- Sensitive data excluded from logs

Log Levels:
- DEBUG: Development only
- INFO: Normal operations
- WARN: Warnings and recoverable errors
- ERROR: Errors requiring attention
- FATAL: Critical failures

Retention:
- Development: 7 days
- Staging: 30 days
- Production: 90 days
```

### Metrics & Monitoring

```
Application Metrics:
- API response times (p50, p95, p99)
- Request rate and error rate
- Database query performance
- Memory and CPU usage

Business Metrics:
- Active assessments
- Risks by severity
- Framework compliance scores
- User activity

Alerting:
- API error rate > 1%
- Response time p95 > 500ms
- Database unavailable
- High memory usage (> 80%)
```

### Health Checks

```
GET /health
├── Database connectivity
├── Redis connectivity
├── Application status
└── External services

Response:
{
  "status": "healthy",
  "timestamp": "2026-02-03T15:00:00Z",
  "components": {
    "database": "ok",
    "redis": "ok",
    "application": "ok"
  }
}
```

---

## Error Handling Strategy

### Global Error Handler

```
Request → Route Handler → Error → Error Middleware → Response

Error Handler:
1. Catch all errors
2. Log with context
3. Sanitize for client
4. Return standard error response

Standard Error Response:
{
  "success": false,
  "error": "User-friendly message",
  "code": "ERROR_CODE",
  "details": {} (dev only)
}
```

### Error Codes

```
Authentication Errors:
- 401_UNAUTHORIZED: Invalid/missing token
- 401_SESSION_EXPIRED: Token expired

Authorization Errors:
- 403_FORBIDDEN: No permission
- 403_INSUFFICIENT_ROLE: Role doesn't allow action

Validation Errors:
- 400_VALIDATION_ERROR: Invalid input
- 400_MISSING_FIELD: Required field missing

Resource Errors:
- 404_NOT_FOUND: Resource doesn't exist
- 409_CONFLICT: Resource already exists

Server Errors:
- 500_INTERNAL_ERROR: Unexpected server error
- 503_SERVICE_UNAVAILABLE: Maintenance/down
```

---

## Performance Targets

### API Performance (NFR-PERF-02)

| Endpoint Type | Target | Status |
|---|---|---|
| List (with pagination) | < 500ms | ⏳ Pending |
| Single resource | < 200ms | ⏳ Pending |
| Create/Update | < 300ms | ⏳ Pending |
| Delete | < 200ms | ⏳ Pending |
| Export (PDF) | < 5s | ⏳ Pending |
| Search | < 1s | ⏳ Pending |

### Frontend Performance (NFR-PERF-01)

| Metric | Target | Status |
|---|---|---|
| Initial load | < 3 seconds | ⏳ Pending |
| Navigation | < 1.5 seconds | ⏳ Pending |
| Dashboard render | < 2 seconds | ⏳ Pending |
| Bundle size | < 500KB gzip | ⏳ Pending |

### Database Performance

| Operation | Target | Strategy |
|---|---|---|
| SELECT simple | < 10ms | Indexed columns |
| SELECT complex | < 100ms | Query optimization |
| INSERT/UPDATE | < 50ms | Efficient schema |
| EXPORT (1000 rows) | < 2s | Streaming |

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Performance benchmarks met

### Deployment Steps
1. Build Docker image
2. Push to container registry
3. Update cloud deployment
4. Run database migrations
5. Seed initial data (if needed)
6. Run smoke tests
7. Monitor error rates

### Post-Deployment
- [ ] Health check passing
- [ ] API response times normal
- [ ] Error logs clean
- [ ] User testing completed
- [ ] Rollback plan ready

---

## Future Enhancements

### Phase 2 (MVP 2)
- Evidence management with file versioning
- Advanced caching with Redis
- API rate limiting
- Webhook integrations

### Phase 3 (MVP 3)
- Multi-tenant organization support
- Advanced reporting and analytics
- Custom framework support
- AI-assisted risk suggestions

### Phase 4 (MVP 4)
- Mobile companion app
- Real-time collaboration
- Advanced integrations (Jira, Slack, ServiceNow)
- Machine learning for risk prediction

---

**Architecture Version:** 2.0
**Last Updated:** 2026-02-03
**Maintained By:** Senior Full-Stack Architect (docs-manager agent)
