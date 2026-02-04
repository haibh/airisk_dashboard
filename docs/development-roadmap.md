# AIRisk Dashboard - Development Roadmap

**Version:** 2.1 | **Date:** 2026-02-04 | **Last Updated:** Framework UI grouping + SCF v2025.4

---

## Roadmap Overview

```
MVP1 (Core)      MVP2-3 (Frameworks)    MVP4 (Multi-Tenant)    MVP5+ (Enterprise)
Completed        Completed             Completed              Planned
Jan-Feb 2025     Feb-Mar 2025          Jan-Feb 2026           Q1+ 2026
```

---

## Completed Phases (MVP1-4)

### Phase 1: Project Setup & i18n (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- Next.js 16 App Router setup
- TypeScript strict mode configuration
- Tailwind CSS v4 + Shadcn/ui integration
- i18n setup (EN/VI via next-intl)
- Database schema initialization (20 models)
- Prisma ORM configuration

### Phase 2: Authentication & Authorization (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- NextAuth.js JWT integration
- 5-role RBAC hierarchy (ADMIN, RISK_MANAGER, ASSESSOR, AUDITOR, VIEWER)
- Login page with i18n
- Protected middleware routes
- Session management (24h JWT, 30min idle)
- 5 seeded test users

### Phase 3: AI System Inventory (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- CRUD operations (Create, Read, Update, Delete)
- AI system list with pagination
- Data classification (Public, Confidential, Restricted)
- Lifecycle tracking (Development, Pilot, Production, Retired)
- Owner/stakeholder assignment
- Soft delete for audit compliance

### Phase 4: Framework Integration & Mapping (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- NIST AI RMF 1.0 (4 functions, 19 categories, 85+ controls)
- ISO/IEC 42001:2023 (9 control areas, 38 controls)
- Bidirectional control mapping (HIGH/MEDIUM/LOW confidence)
- Cross-framework relationship tracking
- Framework detail page with control hierarchy

### Phase 5: Risk Assessment Engine (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- 5-step assessment wizard
- Risk entry form with real-time scoring
- 5×5 impact × likelihood matrix (1-5 scale)
- 8 risk categories (Bias, Privacy, Security, Reliability, Transparency, Accountability, Safety, Other)
- Inherent & residual risk calculation
- Control effectiveness scoring
- Assessment status workflow (DRAFT → IN_PROGRESS → UNDER_REVIEW → APPROVED)

### Phase 6: Dashboard & Reporting (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- Executive summary KPI dashboard
- Framework compliance scorecard
- Risk distribution heatmap
- Activity feed with recent actions
- Real-time stat cards
- Export endpoints (JSON API ready)

### Phase 7: Testing & Accessibility (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan 2025
- Vitest setup (262+ unit/integration tests)
- Playwright E2E tests (3+ test suites)
- Performance benchmarking script
- WCAG 2.1 AA compliance
- Keyboard navigation with skip links
- Focus management and ARIA labels
- 100% test pass rate

### Phase 8-10: Evidence, Frameworks, Optimizations (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Feb 2025
- Evidence management with SHA-256 hashing
- Evidence approval workflow
- Multi-entity evidence linking (risks, controls, assessments)
- Framework seed expansion (CIS Controls, CSA AICM, NIST CSF, PCI DSS, ISO 27001, SCF v2025.4)
- Gap analysis engine with CSV export
- Multi-layer caching (LRU + Redis fallback)
- Rate limiting (sliding window, role-based tiers)

### Phase 11: Organization & User Management (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Jan-Feb 2026
- Organization profile CRUD
- User management with pagination
- Role assignment and management
- User invitation system (token-based, expiry)
- User profile editing
- Password change functionality
- Active/inactive user tracking
- Last login timestamp

### Phase 12: API Keys & Webhooks (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Feb 2026
- API key generation (SHA-256, prefix-based, max 10/org)
- Key permission levels (READ, WRITE, ADMIN)
- API key authentication middleware
- Webhook CRUD operations
- Webhook signature verification (HMAC-SHA256)
- Event dispatcher (ai_system.*, assessment.*)
- Webhook delivery worker with retry logic
- Delivery log tracking and filtering

### Phase 13: Notifications, Audit Logs & Polish (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Feb 2026
- Notification service (7 event types)
- Real-time notification dropdown (60s polling)
- Unread notification badge
- Audit log viewer with filters
- Audit log CSV export
- Change detail diff viewer
- UI refinements and consistency
- Error handling improvements

---

## Current Status Summary

**Completed Features:** 73/73 (100%)
- ✅ All MVP1-4 requirements
- ✅ Multi-tenant architecture
- ✅ API integration support (webhooks, API keys)
- ✅ Enterprise audit logging
- ✅ Real-time notifications

**Test Coverage:** 262/262 tests passing (100%)
**Type Safety:** 100% (strict mode, zero `any`)
**Build Status:** Production-ready

---

## Planned Phases (MVP5+)

### Phase 14: Critical Security Fixes (SPRINT)
**Status:** 🔴 TODO | **Timeline:** 2026-02-05 to 2026-02-07

**Critical Issues (Production Blocker):**
1. Replace console.error in auth with structured logger
2. Add missing auth check to framework controls endpoint
3. Fix rate limit header calculation bug
4. Fix middleware path matching (use regex instead of `.includes('.')`)

**High Priority:**
5. Add XSS sanitization (DOMPurify if needed)
6. Implement stricter login rate limiting (10/min)
7. Wrap token verification in try-catch
8. Add CSP headers to next.config.ts

**Medium Priority:**
9. Add password complexity validation
10. Configure database connection pooling
11. Use organization slug instead of org ID in notification URLs
12. Fix CUID vs UUID validation mismatch
13. Implement background job queue for notifications

**Success Criteria:**
- All 4 critical issues fixed
- All tests still pass (262/262)
- Production deployment approved

### Phase 15: File Storage & Evidence (MVP5)
**Status:** 📋 PLANNED | **Timeline:** 2026-02-10 to 2026-02-28

**Features:**
- S3/MinIO storage integration for evidence files
- File upload with virus scanning
- Evidence file versioning
- Storage quota management (org-level)
- Evidence approval workflow refinement

**Success Criteria:**
- Evidence file upload fully functional
- Upload progress tracking
- File download with audit logging

### Phase 16: Scheduled Reports & Cron Jobs (MVP5)
**Status:** 📋 PLANNED | **Timeline:** 2026-03-01 to 2026-03-15

**Features:**
- Scheduled report generation (PDF, Excel)
- Email delivery of reports
- Cron job management UI
- Report templates customization
- Recurring assessments automation

**Success Criteria:**
- Reports scheduled and generated
- Email notifications working
- Cron execution logs tracked

### Phase 17: Advanced Features (MVP6)
**Status:** 📋 PLANNED | **Timeline:** 2026-03-15+

**Planned Features:**
- Advanced gap analysis visualization (interactive charts)
- Bulk import/export (CSV, Excel)
- Advanced filtering and saved views
- Risk treatment workflows
- Remediation task tracking
- KPI dashboard customization
- Custom report builder

---

## Known Issues Tracker

### Critical (Blocking Production)
- [ ] Fix console.error in auth route
- [ ] Add auth to framework controls endpoint
- [ ] Fix rate limit header bug
- [ ] Fix middleware path matching

### High Priority (Before Next Release)
- [ ] Add XSS sanitization
- [ ] Implement stricter login rate limiting
- [ ] Wrap token verification in try-catch
- [ ] Add password complexity
- [ ] Configure Prisma connection pool

### Medium Priority (Next Sprint)
- [ ] Add CORS configuration
- [ ] Use org slug instead of org ID in URLs
- [ ] Fix CUID validation mismatch
- [ ] Implement notification retry queue
- [ ] Add API versioning strategy

### Low Priority (Nice to Have)
- [ ] Optimize bundle size
- [ ] Add comprehensive health checks
- [ ] Audit N+1 query patterns
- [ ] Implement query result caching
- [ ] Add correlation ID propagation to DB

---

## Performance Roadmap

### Current Baseline (MVP4)
- Page load: <3s
- API response (P95): <500ms
- Bundle size: ~450KB gzip
- Database queries: 10 concurrent connection pool

### Q1 2026 Targets (MVP5)
- Page load: <2s
- API response (P95): <200ms
- Bundle size: <400KB gzip
- Database: PgBouncer connection pooling
- Cache hit rate: >70% for dashboard

### Q2 2026 Targets (MVP6+)
- Page load: <1.5s
- API response (P95): <100ms
- Bundle size: <300KB gzip
- Database: Read replicas for reporting
- Cache hit rate: >80%

---

## Scaling Roadmap

### MVP4 Capacity (Current)
- Users per org: 50
- AI systems: 5,000
- Assessments: 10,000
- Concurrent users: 50

### MVP5 Targets
- Users per org: 500
- AI systems: 50,000
- Assessments: 100,000
- Concurrent users: 500

### MVP6+ Targets
- Users per org: 5,000
- AI systems: 500,000
- Assessments: 1,000,000
- Concurrent users: 5,000
- Multi-region deployment

---

## Integration Roadmap

### MVP4 (Current)
- ✅ API key authentication
- ✅ Webhook event dispatching
- ✅ CSV import/export

### MVP5 (Planned)
- 📋 OAuth 2.0 provider
- 📋 OIDC integration
- 📋 SAML 2.0 support

### MVP6+ (Future)
- 📋 SSO/SAML enterprise integration
- 📋 SCIM user provisioning
- 📋 Third-party risk management API
- 📋 SIEM integration

---

## Infrastructure Roadmap

### Development
- Next.js 16 App Router
- PostgreSQL 15
- Redis (optional)
- Docker support

### Staging
- Kubernetes (optional)
- CloudFlare CDN
- AWS RDS PostgreSQL
- AWS ElastiCache Redis

### Production (Future)
- Multi-region deployment
- Read replicas for reporting
- Message queue (RabbitMQ/SQS)
- Object storage (S3)
- Load balancer with auto-scaling

---

## Documentation Roadmap

### Current Status
- ✅ Project overview & PDR
- ✅ System architecture documentation
- ✅ Code standards & conventions
- ✅ Codebase summary
- ✅ Deployment guide
- ✅ API reference (partial)
- ✅ Design guidelines

### Planned (MVP5+)
- 📋 API versioning guide
- 📋 Integration guide (webhooks, API keys)
- 📋 Deployment on Kubernetes
- 📋 Monitoring & observability guide
- 📋 Security hardening guide
- 📋 Data export & import procedures

---

## Risk Register

### High Risk Items
1. **Security Audit** - Code review identified 4 critical, 4 high, 7 medium issues
   - Mitigation: Phase 14 sprint to fix critical issues
   - Timeline: 2-3 days
   - Owner: Engineering team

2. **Performance at Scale** - Untested with >1000 concurrent users
   - Mitigation: Load testing plan, connection pooling config
   - Timeline: MVP5
   - Owner: DevOps/Infrastructure

3. **File Storage Complexity** - S3/storage integration needed for evidence
   - Mitigation: Prototype in Phase 15
   - Timeline: 3 weeks
   - Owner: Backend team

### Medium Risk Items
1. **WCAG Compliance Maintenance** - Accessibility regression risk
   - Mitigation: Accessibility tests in CI/CD
   - Owner: QA team

2. **Framework Data Maintenance** - Quarterly updates needed
   - Mitigation: Automated seed script management
   - Owner: Product team

---

## Success Metrics

### MVP4 (Current Status)
- ✅ Test coverage: 262/262 passing (100%)
- ✅ Type safety: 100% (strict mode)
- ✅ Build status: Production-ready
- ✅ Accessibility: WCAG 2.1 AA compliant
- ✅ Documentation: Complete for all modules
- ⚠️ Security: 15 issues identified, 4 critical

### MVP5 Targets
- 300+ tests passing
- <400KB bundle size gzip
- <200ms P95 API response
- Zero critical security issues
- 50+ organizations supported

### MVP6 Targets
- 400+ tests passing
- <300KB bundle size gzip
- <100ms P95 API response
- Enterprise feature parity
- 500+ organizations supported

---

## Strategic Goals Alignment

| Goal | MVP4 Status | MVP5 Target | Timeline |
|------|-----------|-----------|----------|
| Enterprise AI Risk Management | ✅ 100% | ✅ Ready | Current |
| Multi-framework Compliance | ✅ 8 frameworks (3 AI-risk, 5 general) | 📋 10+ frameworks | Q1 2026 |
| Security & Audit Trail | ✅ Basic | 📋 Enterprise-grade | Q2 2026 |
| Scalability | ✅ 50 users | 📋 500+ users | Q1-Q2 2026 |
| International Support | ✅ 2 locales | 📋 5+ locales | Q2 2026 |

---

## Key Milestones

| Milestone | Target Date | Status |
|-----------|------------|--------|
| MVP4 Launch (Multi-Tenant) | 2026-02-04 | ✅ Complete |
| Security Hardening (Phase 14) | 2026-02-07 | 🔴 TODO |
| MVP5 Beta (File Storage) | 2026-03-01 | 📋 Planned |
| Production Release | 2026-03-15 | 📋 Planned |
| Enterprise Features (MVP6) | 2026-04-30 | 📋 Planned |

---

**Document Version:** 2.0
**Last Updated:** 2026-02-04 12:08 UTC
**Maintained By:** docs-manager agent
**Next Review:** 2026-02-07 (Post Phase 14)
