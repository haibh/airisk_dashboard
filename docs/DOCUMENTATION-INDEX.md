# AIRisk Dashboard - Documentation Index

**Updated:** 2026-02-04
**Version:** 3.0
**Status:** MVP4 Complete (Phase 13)
**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, PostgreSQL 15+, Prisma 5

---

## Documentation Files

| # | File | LOC | Purpose |
|---|------|-----|---------|
| 1 | [README.md](./README.md) | 355 | Quick start, features, commands |
| 2 | [project-overview-pdr.md](./project-overview-pdr.md) | 379 | PRD, vision, roadmap, requirements |
| 3 | [product_requirement_documents.md](./product_requirement_documents.md) | 175 | Condensed PRD (70+ requirements) |
| 4 | [codebase-summary.md](./codebase-summary.md) | 727 | Codebase overview, modules, file counts |
| 5 | [code-standards.md](./code-standards.md) | 743 | Dev standards, naming, patterns, testing |
| 6 | [system-architecture.md](./system-architecture.md) | 500 | Architecture, data model, request flow |
| 7 | [api-reference.md](./api-reference.md) | 914 | API endpoints with examples |
| 8 | [deployment-guide.md](./deployment-guide.md) | 637 | Setup, deploy (Vercel/Docker/AWS), ops |
| 9 | [caching-architecture.md](./caching-architecture.md) | 332 | Multi-layer cache (LRU + Redis) |
| 10 | [monitoring-and-logging.md](./monitoring-and-logging.md) | 354 | Health checks, structured logging |
| 11 | [performance-optimization-guide.md](./performance-optimization-guide.md) | 549 | Performance targets, optimization |
| **Total** | **11 files** | **~5,665** | |

---

## Coverage Summary

| Category | Scope | Status |
|----------|-------|--------|
| Database Models | 20+ models, 11 enums | Documented |
| API Endpoints | 53 routes, 21 groups | Documented |
| Components | 59 files, 14 directories | Documented |
| Lib Modules | 28 files | Documented |
| Testing | 262+ tests (Vitest + Playwright) | Documented |
| Caching | Multi-layer (LRU + Redis) | Documented |
| Auth & RBAC | 5 roles, JWT, rate limiting | Documented |
| i18n | EN/VI bilingual | Documented |
| Deployment | Vercel, Docker, AWS EC2 | Documented |

---

## By Audience

### New Developers
1. `README.md` → Quick start & commands
2. `codebase-summary.md` → Codebase structure
3. `code-standards.md` → Patterns & conventions
4. `api-reference.md` → API contracts

### Backend Developers
1. `code-standards.md` → API route patterns, Prisma gotchas
2. `api-reference.md` → Endpoint specs
3. `system-architecture.md` → Data flows, auth, middleware
4. `caching-architecture.md` → Cache strategy

### Frontend Developers
1. `codebase-summary.md` → Component structure
2. `code-standards.md` → React/TypeScript patterns
3. `system-architecture.md` → Component hierarchy

### DevOps / Operations
1. `deployment-guide.md` → Setup & deploy
2. `monitoring-and-logging.md` → Health checks, logs
3. `performance-optimization-guide.md` → Optimization
4. `caching-architecture.md` → Redis setup

### Product / Stakeholders
1. `project-overview-pdr.md` → Vision, roadmap, status
2. `product_requirement_documents.md` → Requirements
3. `README.md` → Features overview

---

## Implementation Status (MVP4 Phase 13)

| Module | Phase | Status |
|--------|-------|--------|
| Foundation & i18n | 1 | Complete |
| Authentication & RBAC | 2 | Complete |
| AI System Registry | 3 | Complete |
| Framework Knowledge Base | 4 | Complete |
| Risk Assessment Engine | 5 | Complete |
| Dashboard & Reports | 6 | Complete |
| Testing & Accessibility | 7 | Complete |
| Evidence Management | 8 | Complete |
| Data Import/Export | 9 | Complete |
| Gap Analysis & Search | 10 | Complete |
| Org Management & Invitations | 11 | Complete |
| API Keys & Webhooks | 12 | Complete |
| Notifications & Audit Logs | 13 | Complete |

---

## Related Project Files

- **CLAUDE.md** — AI assistant guidance (`/CLAUDE.md`)
- **Prisma Schema** — Database models (`/prisma/schema.prisma`)
- **Environment Template** — Config vars (`/.env.example`)
- **Vercel Config** — Deployment + cron (`/vercel.json`)

---

## Maintenance

| Property | Value |
|----------|-------|
| Last Updated | 2026-02-04 |
| Version | 3.0 |
| LOC Limit | 800 per file |
| Maintained By | docs-manager |
| Update Trigger | After feature implementation or phase completion |

**Note:** `api-reference.md` (914 LOC) exceeds the 800 LOC limit. Consider splitting by endpoint group in a future update.

---

*Documentation Index v3.0 — Generated 2026-02-04*
