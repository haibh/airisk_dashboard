# AIRM-IP (AI Risk Management Intelligence Platform)

Enterprise-grade platform for managing AI risks, compliance frameworks, and governance. Built with Next.js 16, TypeScript, and PostgreSQL.

## Screenshots

| Landing Page | Login |
|:---:|:---:|
| ![Landing](docs/screenshots/00-landing.png) | ![Login](docs/screenshots/01-login.png) |

| Change Password (First Login) | Executive Dashboard |
|:---:|:---:|
| ![Change Password](docs/screenshots/02-change-password.png) | ![Dashboard](docs/screenshots/03-dashboard.png) |

| Risk Assessment | Compliance Frameworks |
|:---:|:---:|
| ![Risk Assessment](docs/screenshots/04-risk-assessment.png) | ![Frameworks](docs/screenshots/05-frameworks.png) |

| AI System Registry | Evidence Management |
|:---:|:---:|
| ![AI Systems](docs/screenshots/06-ai-systems.png) | ![Evidence](docs/screenshots/07-evidence.png) |

| Settings |
|:---:|
| ![Settings](docs/screenshots/08-settings.png) |

## Quick Start

### Docker (Recommended)
```bash
# 1. Copy environment config
cp .env.docker.example .env.docker

# 2. Start dev environment (PostgreSQL, Redis, MinIO, App with hot-reload)
make dev

# 3. Push schema and seed database (first time only)
docker exec airm-ip-app-dev sh -c 'npx prisma db push'
docker exec airm-ip-app-dev sh -c 'npx prisma db seed'

# 4. Open http://localhost:3000
```

### Local Development (without Docker)
```bash
# 1. Install dependencies and setup database
cp .env.example .env.local
npm install
npm run db:generate
npm run db:push
npm run db:seed

# 2. Start development server (http://localhost:3000)
npm run dev
```

### Test Accounts

The seed script creates 5 test accounts (one per role). All accounts require a **password change on first login**.

| Email | Password | Role |
|-------|----------|------|
| `admin@airm-ip.local` | `Test@123456` | Admin (full access) |
| `riskmanager@airm-ip.local` | `Test@123456` | Risk Manager |
| `assessor@airm-ip.local` | `Test@123456` | Assessor |
| `auditor@airm-ip.local` | `Test@123456` | Auditor |
| `viewer@airm-ip.local` | `Test@123456` | Viewer (read-only) |

> After first login you will be redirected to a password change page. Set a new password, then sign in again to access the dashboard.

### Docker Commands
```bash
make dev                 # Start dev environment with hot-reload
make prod                # Start production environment
make logs                # View container logs
make clean               # Stop and remove containers
make backup              # Backup PostgreSQL database
```

## Features

### Core Capabilities
- **23 Compliance Frameworks** — NIST AI RMF 1.0, ISO 42001:2023, EU AI Act, OWASP LLM Top 10 v2025, MITRE ATLAS, NIST CSF 2.0, ISO 27001:2022, CIS Controls v8.1, NIS2, DORA, CMMC 2.0, HIPAA, PCI DSS 4.0.1, SOC 2, and 9 more
- **1,323 Controls** with 172 cross-framework mappings
- **Risk Scoring** — 5×5 matrix (likelihood × impact), inherent + residual scoring, velocity tracking
- **Gap Analysis** — Framework control mapping, compliance scoring, evidence tracking
- **Evidence Management** — File upload, version history, virus scanning, storage quotas
- **Task Management** — Workflow tracking, comments, assignments, due dates
- **Bulk Import** — CSV/Excel risk import with validation and dry-run preview
- **Report Generation** — PDF/Excel exports, scheduled reports, custom templates
- **Supply Chain Risk** — Vendor assessment, dependency mapping, third-party monitoring
- **Regulatory Tracking** — Change monitoring, impact analysis, deadline alerts
- **Benchmarking** — Industry comparison, maturity scoring, peer analysis
- **ROI Calculator** — Risk reduction metrics, cost-benefit analysis

### Enterprise Features
- **SSO/SAML Authentication** — Enterprise identity provider integration
- **Session Tracking** — Active session management, concurrent login limits
- **IP Allowlist** — Network access control, CIDR range support
- **Custom Branding** — Logo, colors, domain customization
- **Audit Log Export** — Compliance reporting, full activity trail
- **Multi-tenancy** — Organization-level isolation, role-based access control (5 roles)
- **Webhooks** — Event-driven integrations, custom endpoints
- **API Keys** — Programmatic access, rate limiting

### Internationalization
- **English + Vietnamese** — Full i18n support via next-intl

## Tech Stack

### Frontend
- **React 19.1.0** — Latest React with Next.js App Router
- **Next.js 16.1.6** — Server-side rendering, API routes, middleware
- **TypeScript 5.8.3** — Type safety across codebase
- **Tailwind CSS v4** — Modern utility-first CSS
- **shadcn/ui** — Accessible component library (Radix UI primitives)
- **Zustand** — Lightweight state management
- **React Flow** — Interactive diagrams and flowcharts
- **Recharts** — Data visualization and charts

### Backend
- **NextAuth.js** — JWT-based authentication, session management
- **Prisma ORM 5.22.0** — Type-safe database access
- **PostgreSQL 15+** — Primary data store
- **Redis** — Caching layer (optional, falls back to in-memory)
- **Zod v4** — Runtime validation and type inference

### Infrastructure
- **Docker** — 421MB optimized multi-stage image
- **Nginx** — Reverse proxy, SSL termination, rate limiting
- **Node.js 22.13.2 Alpine** — Minimal runtime environment

## Project Structure

```
src/
├── app/
│   ├── [locale]/                    # i18n routes (en/vi)
│   │   ├── (auth)/login/            # Authentication pages
│   │   ├── (dashboard)/             # Protected dashboard routes
│   │   │   ├── dashboard/           # Main dashboard (4 views)
│   │   │   ├── ai-systems/          # AI inventory management
│   │   │   ├── risk-assessment/     # Risk assessment wizard
│   │   │   ├── frameworks/          # Framework browser
│   │   │   ├── evidence/            # Evidence management
│   │   │   ├── tasks/               # Task management
│   │   │   ├── supply-chain/        # Vendor risk
│   │   │   ├── regulatory/          # Regulatory tracking
│   │   │   ├── benchmarking/        # Industry comparison
│   │   │   ├── roi-calculator/      # ROI analysis
│   │   │   └── settings/            # User/org settings
│   └── api/                         # REST API endpoints
├── components/                      # React components
│   ├── ui/                          # shadcn/ui components
│   ├── dashboard/                   # Dashboard views + widgets
│   ├── auth/                        # Auth forms
│   ├── landing/                     # Public landing page
│   ├── ops-center/                  # Operations panels
│   ├── ai-risk-view/                # AI risk specialist panels
│   ├── supply-chain/                # Supply chain components
│   ├── regulatory-tracker/          # Regulatory components
│   ├── benchmarking/                # Benchmarking UI
│   └── roi-calculator/              # ROI calculator UI
├── lib/                             # Core utilities
│   ├── auth-helpers.ts              # RBAC + session helpers
│   ├── api-error-handler.ts         # Standardized error handling
│   ├── api-validation-schemas.ts    # Zod validation schemas
│   ├── cache-advanced.ts            # Redis + in-memory caching
│   ├── risk-scoring-calculator.ts   # 5×5 matrix scoring
│   ├── bulk-import-service.ts       # CSV/Excel import
│   ├── webhook-event-dispatcher.ts  # Webhook events
│   └── notification-service.ts      # Email notifications
├── hooks/                           # React hooks
├── i18n/                            # Internationalization
│   ├── messages/                    # EN/VI translations
│   └── request.ts                   # Locale configuration
└── types/                           # TypeScript type definitions

prisma/
├── schema.prisma                    # Database schema (45 models)
├── seed.ts                          # Main seed orchestrator
└── seed-*.ts                        # Framework seed files (23 frameworks)

tests/
├── api/                             # API route tests (1,080 tests)
├── lib/                             # Utility function tests
├── e2e/                             # Playwright E2E tests (28 tests)
└── setup.ts                         # Test configuration + mocks

docs/
├── project-overview-pdr.md          # Product requirements
├── code-standards.md                # Coding conventions
├── codebase-summary.md              # Architecture overview
├── system-architecture.md           # System design
├── deployment-guide.md              # Production deployment
└── development-roadmap.md           # Feature roadmap

docker/
└── nginx/                           # Nginx reverse proxy config

plans/                               # Implementation plans + reports
```

## Commands

### Development
```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run lint             # ESLint check
npm run type-check       # TypeScript check without emit
npm run analyze          # Bundle analysis (ANALYZE=true build)
```

### Database
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations (dev)
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed with initial data (23 frameworks)
```

### Testing
```bash
npm run test             # Run Vitest in watch mode
npm run test:run         # Run tests once (1,080 unit tests)
npm run test:coverage    # Run with coverage report
npm run test:e2e         # Run Playwright E2E tests (28 tests)
npm run test:e2e:headed  # Run E2E with browser visible

# Single test file
npm run test -- tests/api/ai-systems-endpoint.test.ts
npm run test:e2e -- tests/e2e/auth-login-flow.spec.ts
```

## Environment Setup

### Required Variables
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/airm_ip"

# NextAuth
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
```

### Optional Variables
```bash
# Redis (caching falls back to in-memory if not set)
REDIS_URL="redis://localhost:6379"

# File Storage (Evidence management)
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="airm-evidence"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"

# Email Notifications
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Scheduled Reports
CRON_SECRET="<openssl rand -base64 32>"

# Security
CLAMAV_ENABLED="false"  # Set to "true" to enable virus scanning
```

Copy `.env.example` to `.env.local` for local development or `.env.docker` for Docker deployments.

## Documentation

Comprehensive documentation in `/docs`:

- **[Project Overview & PDR](./docs/project-overview-pdr.md)** — Product requirements, features, roadmap
- **[Code Standards](./docs/code-standards.md)** — Coding conventions, file structure, naming
- **[Codebase Summary](./docs/codebase-summary.md)** — Architecture overview, key patterns
- **[System Architecture](./docs/system-architecture.md)** — Technical design, data flow, infrastructure
- **[API Reference](./docs/api-reference.md)** — REST API endpoints, authentication, examples
- **[Deployment Guide](./docs/deployment-guide.md)** — Production setup, Docker, CI/CD
- **[Development Roadmap](./docs/development-roadmap.md)** — Feature timeline, milestones

## Testing

### Unit Tests (1,080 tests)
- **API Routes** — All 55+ endpoints covered with request/response validation
- **Service Layer** — Business logic, caching, validation, scoring algorithms
- **Utilities** — Error handling, RBAC, risk calculation, bulk import
- **Mocking** — Auto-mocked Prisma, Auth, Cache, Redis, Logger, Webhooks

### E2E Tests (28 tests)
- **Authentication** — Login, logout, session management
- **Dashboard** — Widget interactions, data loading, tab navigation
- **Risk Assessment** — Wizard flow, form validation, submission
- **Evidence Management** — Upload, version history, storage quotas

## License

MIT
