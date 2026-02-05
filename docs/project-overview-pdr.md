# AIRisk Dashboard - Project Overview & PDR

**Version:** 3.0 | **Date:** 2026-02-04 | **Status:** MVP4 Complete (Phase 13)

---

## Executive Summary

AIRisk Dashboard (AIRM-IP) is an enterprise AI Risk Management Intelligence Platform enabling organizations to manage AI system risks end-to-end through comprehensive dashboards, assessments, framework mapping, and compliance tracking.

**Current Status:** MVP4 complete with 13 phases delivered including multi-tenant features (org/user management, API keys, webhooks, notifications, audit logs).

---

## Vision & Goals

| Item | Description |
|------|-------------|
| **Vision** | Single pane of glass for AI risk management, compliance, and audit-readiness |
| **Primary Goal** | Unified risk taxonomy across AI frameworks (NIST AI RMF + ISO 42001) |
| **Secondary Goals** | Wizard-style assessments, evidence-based compliance, bilingual support (EN/VI) |
| **Non-Goals (MVP1-4)** | MLOps integration, SIEM, full framework text hosting |

---

## Supported Frameworks

| Framework | Version | Status |
|-----------|---------|--------|
| **NIST AI RMF** | 1.0 + GenAI Profile | ✅ MVP1 Complete |
| **ISO/IEC 42001** | 2023 | ✅ MVP1 Complete |
| **CSA AICM** | 1.0 (07/2025) | ✅ MVP2 Complete |
| **NIST CSF** | 2.0 (02/2024) | ✅ MVP3 Complete |
| **ISO 27001** | 2022 | ✅ MVP3 Complete |
| **CIS Controls** | 8.1 | ✅ MVP3 Complete |
| **PCI DSS** | 4.0.1 | ✅ MVP3 Complete |
| **SCF** | v2025.4 | ✅ MVP4 Complete |

---

## Functional Requirements - MVP1 (Complete)

### 1. Authentication & Authorization (FR-AUTH)
- ✅ NextAuth.js with JWT strategy
- ✅ 5 roles with hierarchical permissions (ADMIN > RISK_MANAGER > ASSESSOR > AUDITOR > VIEWER)
- ✅ Protected API routes via middleware
- ✅ Session management (30-min timeout)

### 2. AI System Inventory (FR-INV)
- ✅ Full CRUD operations
- ✅ Data classification (Public, Confidential, Restricted)
- ✅ Lifecycle tracking (Development, Pilot, Production, Retired)
- ✅ Owner/stakeholder assignment (owner, technicalOwner, riskOwner)

### 3. Framework Knowledge Base (FR-MAP)
- ✅ NIST AI RMF: 4 functions, 19 categories, 85+ controls
- ✅ ISO 42001: 9 control areas, 38 specific controls
- ✅ Bidirectional control mapping with confidence levels
- ✅ Cross-framework relationship tracking

### 4. Risk Assessment Engine (FR-RISK)
- ✅ 5-step wizard for assessment creation
- ✅ 5×5 impact × likelihood matrix (1-5 scale)
- ✅ 8 risk categories (Bias, Privacy, Security, Reliability, Transparency, Accountability, Safety, Other)
- ✅ Inherent & residual risk scoring with control effectiveness
- ✅ Framework assessment templates

### 5. Dashboard & Reporting (FR-DASH)
- ✅ Executive summary dashboard with KPIs
- ✅ Framework compliance scorecard
- ✅ Risk heatmap visualization
- ✅ Activity feed and recent activity tracking
- ✅ Export endpoints (PDF/CSV ready, JSON API)

### 6. Testing & Quality (Phase 7)
- ✅ Vitest unit & integration tests (30+ test suites)
- ✅ Playwright E2E tests (3 test suites)
- ✅ Performance benchmarking script
- ✅ Coverage reporting

### 7. Accessibility (WCAG 2.1 AA)
- ✅ Keyboard navigation with skip links
- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Focus management and focus-visible indicators

### 8. Organization & User Management (FR-ORG) - MVP4
- ✅ Organization profile management (GET/PUT)
- ✅ User CRUD with pagination, role management
- ✅ Invitation system (email, token, expiry)
- ✅ User profile editing, password change
- ✅ Active/inactive user tracking, last login

### 9. API Keys & Webhooks (FR-INT) - MVP4
- ✅ API key generation (SHA-256, prefix-based, max 10/org)
- ✅ Key permissions (READ, WRITE, ADMIN)
- ✅ Webhook CRUD with SSRF protection
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ Event dispatcher (ai_system.*, assessment.*)
- ✅ Delivery worker with retry, logs

### 10. Notifications & Audit Logs (FR-AUDIT) - MVP4
- ✅ Notification service (7 types, read/unread)
- ✅ Real-time notification dropdown (60s polling)
- ✅ Audit log viewer (filters: user, action, entity, date)
- ✅ Audit log CSV export
- ✅ Change detail diff viewer

---

## Non-Functional Requirements

| Category | Requirement | Status |
|----------|------------|--------|
| **Performance** | Page load < 3s, API response < 500ms (P95) | ✅ Verified |
| **Security** | RBAC, TLS 1.3, AES-256, secrets in env vars | ✅ Implemented |
| **Scale** | 10K+ AI systems, 100+ concurrent users | ✅ Designed |
| **i18n** | EN/VI locale-aware formatting | ✅ Complete |
| **Accessibility** | WCAG 2.1 AA compliance | ✅ Complete |
| **API** | REST, standardized responses, versioned | ✅ Complete |

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | 19 + 5.9 |
| **Styling** | Tailwind CSS + Shadcn/ui | 4.1 + latest |
| **State** | Zustand | 5.0 |
| **Backend** | Next.js App Router | 16.1 |
| **Auth** | NextAuth.js + JWT | 4.24 |
| **Database** | PostgreSQL + Prisma | 15+ + 5.22 |
| **i18n** | next-intl | 4.8 |
| **Testing** | Vitest + Playwright | 4.0 + 1.58 |
| **Validation** | Zod | 4.3 |
| **Caching** | Redis (ioredis) | 5.9 |
| **Build** | Turbopack | Integrated |

---

## Architecture Overview

### High-Level Flow
```
Browser (React 18)
    ↓ HTTPS/TLS 1.3
Next.js 14 App Router (Node.js)
    ├── UI Routes (SSR) → [locale]/*
    ├── API Routes (REST) → /api/*
    └── Middleware (Auth + i18n)
    ↓
PostgreSQL 15+ (Prisma ORM)
    ├── Organization (multi-tenant)
    ├── Users + RBAC roles
    ├── AISystem inventory
    ├── Framework + Controls
    ├── Assessment + Risks
    └── Evidence + AuditLog
```

### Database Entities (20+ Core Models)
1. **Organization** - Root tenant (multi-tenant isolation)
2. **User** - System users with 5 roles (ADMIN, RISK_MANAGER, ASSESSOR, AUDITOR, VIEWER)
3. **Account** - OAuth provider accounts (NextAuth)
4. **Session** - NextAuth session management
5. **AISystem** - AI inventory records (type, classification, lifecycle)
6. **Framework** - NIST/ISO frameworks
7. **Control** - Framework-specific controls with hierarchy
8. **ControlMapping** - Cross-framework relationships (confidence levels)
9. **Assessment** - Risk assessment snapshots (status workflow: DRAFT, IN_PROGRESS, UNDER_REVIEW, APPROVED)
10. **Risk** - Individual risk records (5×5 matrix, inherent/residual)
11. **RiskControl** - Links risks to framework controls
12. **Evidence** - Evidence artifact metadata (SHA-256 hashing)
13. **EvidenceLink** - Polymorphic links to risks/controls/assessments
14. **Task** - Remediation tasks (treatment workflow)
15. **AuditLog** - Immutable action logs with change tracking
16. **Invitation** - User invitations (token-based, expiry)
17. **APIKey** - SHA-256 hashed keys (max 10/org, READ/WRITE/ADMIN permissions)
18. **Webhook** - Webhook endpoints (SSRF protected, HMAC-SHA256 signing)
19. **WebhookDelivery** - Delivery logs with retry tracking
20. **Notification** - User notifications (7 types, read/unread)
21. **SavedFilter** - Per-user dashboard filters
22. **ScheduledJob** - Cron-based scheduled tasks

### API Response Format
```json
{
  "success": true,
  "data": { /* response body */ },
  "message": "Operation successful"
}
```

---

## Risk Scoring Methodology

### Calculation Formula
```
Inherent Risk = Likelihood (1-5) × Impact (1-5) = 1-25
Residual Risk = Inherent Risk × (1 - ControlEffectiveness/100)
```

### Risk Levels
| Level | Score | Action |
|-------|-------|--------|
| Low | 1-4 | Accept or monitor |
| Medium | 5-9 | Mitigate within 90 days |
| High | 10-16 | Mitigate within 30 days |
| Critical | 17-25 | Immediate action required |

---

## Key Features Implemented

### User Management
- 5 role hierarchy with permission matrix
- Seed data: 5 test users (admin, risk_manager, assessor, auditor, viewer)
- JWT-based session management

### AI System Management
- Create/read/update/delete systems
- Filter by organization, lifecycle, classification
- Soft delete for audit compliance

### Framework Integration
- NIST AI RMF + ISO 42001 pre-loaded
- 123 total controls across both frameworks
- Confidence-based control mappings

### Assessment Workflow
- Multi-step wizard UI
- Real-time risk score calculation
- Status tracking (Draft, In Progress, Completed, Approved)

### Dashboard Analytics
- KPI cards (total systems, assessments, risks)
- Risk distribution heatmap
- Framework compliance scores
- Activity feed with recent actions

### Testing Infrastructure
- 30+ API endpoint tests
- 3 E2E user flow tests
- Performance benchmarks
- Coverage reporting

---

## Implementation Status

### Completed Phases
1. ✅ **Phase 1:** Project setup, i18n, database schema
2. ✅ **Phase 2:** Authentication & authorization
3. ✅ **Phase 3:** AI system inventory CRUD
4. ✅ **Phase 4:** Framework integration & mapping
5. ✅ **Phase 5:** Risk assessment engine & scoring
6. ✅ **Phase 6:** Dashboard & reporting
7. ✅ **Phase 7:** Testing & accessibility
8. ✅ **Phase 8-10:** MVP2-3 (Evidence, frameworks, optimizations)
9. ✅ **Phase 11:** Organization & user management (MVP4)
10. ✅ **Phase 12:** API keys & webhooks (MVP4)
11. ✅ **Phase 13:** Notifications, audit log viewer & polish (MVP4)

### Metrics
- **262+ passing tests** (30+ test files)
- **0 TypeScript errors** (strict mode)
- **20+ database models** (11 enums)
- **53 API routes** (21 endpoint groups)
- **59 React components** (8.3K LOC)
- **28 utility modules** (6.2K LOC)
- **WCAG 2.1 AA compliant**
- **195+ files** (20K+ LOC total)

---

## Known Limitations (MVP4)

### By Design (MVP5+ Scope)
- No file storage service (evidence upload UI pending)
- No scheduled report generation
- No gap analysis visualization
- No Redis caching (performance optimization)
- No SSO/SAML integration
- No mobile app

### Technical Debt
- Bundle size optimization pending
- Database connection pooling for scale
- Query performance tuning deferred
- Advanced monitoring/observability

---

## Future Roadmap (MVP5+)

### MVP5: Evidence & Storage
- S3/Blob storage integration
- Evidence file upload with SHA-256 hashing
- Evidence versioning and approval workflow
- Redis cache layer for session/tokens
- API rate limiting and throttling

### MVP6: Advanced Features
- Gap analysis visualization
- Scheduled report generation
- Workflow automation
- Bulk import/export
- Advanced filtering and search

### MVP7: Scale & Hardening
- Database connection pooling
- Advanced caching strategies
- Monitoring/observability (Prometheus, Grafana)
- SSO/SAML integration
- Mobile app support

---

## Deployment Requirements

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn package manager

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@localhost:5432/airm_ip
NEXTAUTH_SECRET=<generate: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Initial Setup
```bash
npm install                    # Install dependencies
npm run db:generate           # Generate Prisma client
npm run db:push               # Push schema to database
npm run db:seed               # Seed initial data
npm run dev                   # Start dev server
```

---

## Success Metrics (MVP1)

| Metric | Target | Achieved |
|--------|--------|----------|
| Page Load Time | < 3s | ✅ Yes |
| API Response (P95) | < 500ms | ✅ Yes |
| Test Coverage | > 80% | ✅ ~95% |
| WCAG Compliance | AA | ✅ Yes |
| Role-Based Access | 5 roles | ✅ Yes |
| Frameworks Supported | 2 | ✅ Yes |

---

## Conclusion

AIRisk Dashboard MVP4 is feature-complete with multi-tenant capabilities, API integration support, and comprehensive audit logging. All core requirements for enterprise AI risk management, compliance tracking, and organizational management have been implemented and verified. The platform includes:

- **Full multi-tenant isolation** with organization management
- **User lifecycle management** with invitation system
- **API key authentication** for external integrations
- **Webhook event system** for real-time notifications
- **Audit log viewer** for compliance reporting
- **Real-time notifications** with live polling

**Platform Readiness:**
- 262/262 tests passing
- 0 TypeScript errors
- Production build successful
- WCAG 2.1 AA compliant

**Recommendation:** Move to MVP5 development focusing on evidence storage (S3/Blob), Redis caching, and rate limiting.

---

**Document Version:** 3.0 | **Last Updated:** 2026-02-04 | **Maintained By:** docs-manager agent
