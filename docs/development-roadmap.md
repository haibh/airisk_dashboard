# AIRisk Dashboard - Development Roadmap

**Version:** 2.5 | **Date:** 2026-02-04 | **Last Updated:** 2026-02-09 (Risk Visualization + Test Expansion)

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
**Status:** ✅ Delivered | **Timeline:** Jan-Feb 2026
- Notification service (7 event types)
- Real-time notification dropdown (60s polling)
- Unread notification badge
- Audit log viewer with filters
- Audit log CSV export
- Change detail diff viewer
- UI refinements and consistency
- Error handling improvements

### Phase 14: Theme Unification & Dashboard Consolidation (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** Feb 04-06, 2026
**Commits:** ea1905a (Theme), 200d3ac (Dashboard), + Phase 14.5 Widget System (Feb 5-6)

**Theme Unification (ea1905a):**
- Unified 3 fragmented themes → single adaptive CSS variable system
- All pages now respect dark/light toggle via `next-themes`
- Removed hardcoded gradient/glass classes, migrated to token-based design
- Auth page: `auth-adaptive-bg`, `auth-card-adaptive` (light pastels / dark glass)
- Landing page: expanded with stats, frameworks grid, capabilities, methodology sections
- SVG backgrounds: hardcoded rgba → `currentColor` for theme support
- Theme toggle button (Sun/Moon) added to auth layout
- i18n expanded: `landing.stats.*`, `landing.supportedFrameworks.*`, `landing.capabilities.*`

**Dashboard Consolidation (200d3ac):**
- Merged `/dashboard` and `/technical-view` → 4-tab unified interface
- Tab structure: Executive Brief | Detailed Analytics | Operations | AI Risk
- Deleted `/technical-view` route, retained component dirs for reuse
- Extracted `useDashboardData` hook for parallel API fetching
- Types extracted to `src/types/dashboard.ts`
- Sidebar: single Dashboard nav entry

**Phase 14.5: Dashboard Widget System (Feb 5-6, 2026):**
- Customizable widgets with Simple/Advanced modes
- **Simple Mode (6 consolidated):** Risk Pulse Strip, Unified Risk View, Compliance Status, Next-Best Actions, Activity Feed, Model Registry
- **Advanced Mode (15 individual):** All widgets + framework-specific visualizations
- Drag-and-drop reordering via dnd-kit (rectSortingStrategy)
- Widget visibility toggles, view mode persistence (localStorage)
- New components: dashboard-sortable-container, dashboard-widget-wrapper, dashboard-widget-settings-panel, sortable-widget, 4 consolidated widgets
- New hook: use-dashboard-widget-config
- UX improvements: CSS Grid heatmap, React Portal tooltips, explicit modal backgrounds

**Metrics:** 308 files, 400K+ tokens, 262/262 tests passing, TypeScript 0 errors, production-ready

---

### Phase 21: Dashboard Features & UI/UX Upgrade (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** 2026-02-06
**Progress:** 100% (all 9 features implemented and tested)

**9 New Features Delivered:**

**Group A — New Data Features (4):**
1. ✅ Risk Supply Chain Mapping — React Flow vendor graph, bidirectional risk paths, cascade viz
2. ✅ Regulatory Change Tracker — Timeline, framework change tracking, impact assessment
3. ✅ Peer Benchmarking — Differential privacy, anonymized comparison, percentile ranking
4. ✅ ROI Calculator — ALE/ROSI formulas, scenario builder, investment recommendation

**Group B — New Visualization Features (2):**
5. ✅ Remediation Burndown Charts — Recharts burndown + velocity, sprint tracking
6. ✅ Framework Control Overlap — React Flow Sankey, 172 mapping coverage, matrix view

**Group C — UI/UX Improvements (3):**
7. ✅ Bento Grid Layouts — 3 presets (Executive/Analyst/Auditor), dnd-kit reordering
8. ✅ Data Storytelling — Z-score anomaly detection, narrative insights, auto-generated summaries
9. ✅ Compliance Chain Graph — Requirement→Control→Evidence chain, coverage donut

**Infrastructure Additions:**
- 16 new Prisma models + 4 new enums
- 8 new API route groups (38 routes)
- 8 new utility libraries with business logic
- 41 new UI component files (6,972+ LOC)
- 4 new sidebar pages
- 179 new i18n keys (EN + VI)
- New dependencies: reactflow, @radix-ui/react-slider

**Metrics:** 350+ files, 480K+ tokens, 375/375 tests passing, TypeScript 0 errors, production-ready

**Success Criteria:** ✅ All met
- All 9 features implemented and integrated
- 375 tests passing (100%)
- Zero TypeScript errors
- No breaking changes
- Production deployment ready

---

### Risk Visualization Enhancement (COMPLETE)
**Status:** ✅ Delivered | **Timeline:** 2026-02-08
**Progress:** 100% (6 phases implemented)

**Enhancements Delivered:**
1. ✅ Database & Data Layer — RiskScoreHistory model for tracking score changes
2. ✅ Risk Trajectory Timeline — Recharts timeline with selectable date range
3. ✅ Heatmap Drill-down — Clickable cells, modal with risk list and details
4. ✅ Risk Velocity Indicators — Batch calculator, compact badges (↑↓→ trends)
5. ✅ Control-Risk Sankey — Full-width Sankey in Detailed Analytics view
6. ✅ AI Model Risk Radar — 6-axis radar chart in AI Risk View panel

**New Components:** risk-velocity-compact-indicator, risk-velocity-batch-calculator
**New API:** /api/risks with optional velocity calculation
**Integration:** Heatmap drill-down modal shows velocity badges per risk

---

## Current Status Summary

**Completed Features:** 115+/115+ (100%)
- ✅ All MVP1-4 requirements
- ✅ Phase 15 security hardening (XSS & CSV injection prevention)
- ✅ Phase 21: Dashboard Features & UI/UX Upgrade (9 advanced features)
- ✅ Risk Visualization Enhancement (velocity, Sankey, radar, drill-down)
- ✅ Multi-tenant architecture with API keys & webhooks
- ✅ Enterprise audit logging & notifications
- ✅ Risk Supply Chain Mapping with React Flow
- ✅ Regulatory Change Tracker with impact assessment
- ✅ Peer Benchmarking with differential privacy
- ✅ ROI Calculator with ALE/ROSI formulas
- ✅ Remediation Burndown Charts (Recharts)
- ✅ Framework Control Overlap (Sankey + matrix)
- ✅ Bento Grid Layouts (3 presets + dnd-kit)
- ✅ Data Storytelling with anomaly detection
- ✅ Compliance Chain Graph visualization
- ✅ Dashboard consolidation (4-tab unified interface)
- ✅ Theme unification (light/dark toggle)
- ✅ Landing page content sections
- ✅ 23 compliance frameworks with 1,323 controls
- ✅ Phase 16: File Storage & Evidence (virus scanning, versioning, quotas)
- ✅ Phase 17: Scheduled Reports & Cron Jobs (email, PDF/Excel generation, scheduling)
- ✅ Phase 18: Advanced Features (bulk import, task management, report templates)

**Test Coverage:** 833/833 tests passing (100%)
**Type Safety:** 100% (strict mode, zero `any`)
**Build Status:** ✅ Production-ready
**Backend Implementation:** 100% complete for Phases 16-18

---

## Completed Recent Phases

### Phase 14.5: Dashboard Widget System (COMPLETE)
**Status:** ✅ COMPLETE | **Timeline:** 2026-02-05 to 2026-02-06
**Progress:** 100% (all widget components + hook + UI integration complete)

---

### Phase 15: Critical Security Fixes (COMPLETE)
**Status:** ✅ COMPLETE | **Timeline:** 2026-02-05 to 2026-02-06
**Progress:** 12/12 security improvements completed (100%)

**Security Fixes Applied:**
1. ✅ Added XSS sanitization (escapeHtml utility)
2. ✅ Added CSV injection protection (sanitizeCsvValue utility)
3. ✅ Console.error replaced with structured logger
4. ✅ Auth check added to framework controls endpoint
5. ✅ Rate limit header calculation fixed
6. ✅ Middleware path matching improved (regex-based)
7. ✅ Stricter login rate limiting implemented
8. ✅ Token verification wrapped in try-catch
9. ✅ CSP headers added to next.config.ts
10. ✅ Password complexity validation implemented
11. ✅ Database connection pooling configured
12. ✅ Organization slug used in notification URLs

**Success Criteria:** ✅ All met
- All 12 security fixes completed
- Tests passing (262/262)
- Production deployment approved

---

### Phase 21: Dashboard Features & UI/UX Upgrade (COMPLETE)
**Status:** ✅ COMPLETE | **Timeline:** 2026-02-06
**Progress:** 100% (all 9 features fully implemented and tested)

---

## Completed Recent Phases (MVP5)

### Phase 16: File Storage & Evidence (COMPLETE)
**Status:** ✅ DELIVERED | **Timeline:** 2026-02-09
**Progress:** 100% (all backend services implemented and tested)

**Features Delivered:**
- ✅ S3/MinIO storage integration for evidence files
- ✅ File upload with virus scanning (ClamAV)
- ✅ Evidence file versioning with version history tracking
- ✅ Storage quota management (org-level, per-user limits)
- ✅ Bulk upload with progress tracking
- ✅ Evidence approval workflow with review status
- ✅ Storage usage endpoint for quota tracking

**Backend Services:**
- `EvidenceVersionService` — Version history management
- `VirusScannerService` — ClamAV integration with scan verification
- `StorageQuotaService` — Quota enforcement and usage tracking
- `BulkUploadService` — Batch file processing
- `EvidenceApprovalWorkflow` — Review and sign-off workflow

**New API Endpoints:**
- `GET/POST /api/evidence/[id]/versions` — Version history
- `GET /api/evidence/storage-usage` — Quota tracking
- `POST /api/evidence/bulk-upload` — Batch processing
- `PUT /api/evidence/[id]/approve` — Review workflow

**Metrics:** 6 new lib modules, 4 new API routes, 48 new tests

### Phase 17: Scheduled Reports & Cron Jobs (COMPLETE)
**Status:** ✅ DELIVERED | **Timeline:** 2026-02-09
**Progress:** 100% (all backend services implemented and tested)

**Features Delivered:**
- ✅ Scheduled report generation (PDF via node-html2pdf, Excel via ExcelJS)
- ✅ SMTP email service for report delivery
- ✅ Cron job management with execution logs
- ✅ Report templates customization (Handlebars + Markdown)
- ✅ Recurring assessments automation
- ✅ Report file manager (S3 storage with signed URLs)
- ✅ Report cleanup handler (retention policies)

**Backend Services:**
- `EmailService` — SMTP integration with template rendering
- `ExcelReportGenerator` — Multi-sheet Excel reports with formatting
- `PdfReportGenerator` — HTML-to-PDF conversion with custom styling
- `FileReportManager` — S3 file management with lifecycle policies
- `ScheduledJobQueue` — Bull/BullMQ job processing
- `CronTriggerHandler` — Cron expression execution
- `ReportCleanupHandler` — Automatic report retention management
- `RecurringAssessmentHandler` — Automated assessment triggering

**New API Endpoints:**
- `POST /api/cron` — Trigger cron job execution
- `GET /api/reports/download` — Report download with signed URLs
- `GET/POST /api/report-templates` — Template CRUD
- `GET/PUT/DELETE /api/report-templates/[id]` — Template management

**Metrics:** 8 new lib modules, 7 new API routes, 56 new tests

### Phase 18: Advanced Features (COMPLETE)
**Status:** ✅ DELIVERED | **Timeline:** 2026-02-09
**Progress:** 100% (all backend services implemented and tested)

**Features Delivered:**
- ✅ Bulk import service (CSV/Excel with Zod validation)
- ✅ Risk import API with data mapping and conflict resolution
- ✅ Task management CRUD (task creation, assignment, tracking)
- ✅ Task comments and activity tracking
- ✅ Advanced gap analysis with interactive filtering
- ✅ Report templates with dynamic field mapping
- ✅ Remediation task tracking with priority and deadline management

**Backend Services:**
- `BulkImportService` — CSV/Excel parsing with validation
- `RiskImportValidator` — Zod schema validation for bulk data
- `TaskManagementService` — Task CRUD and workflow
- `ConflictResolutionEngine` — Duplicate detection and merging

**New API Endpoints:**
- `POST /api/import/risks` — Bulk risk import
- `GET/POST /api/tasks` — Task list and creation
- `GET/PUT/DELETE /api/tasks/[id]` — Task management
- `GET/POST /api/tasks/[id]/comments` — Task comments
- `GET/POST /api/report-templates` — Report template CRUD
- `GET/PUT/DELETE /api/report-templates/[id]` — Template management

**Database Models:**
- `EvidenceVersion` — Version history tracking
- `Task` — Enhanced with comments and workflow
- `ReportTemplate` — Custom report templates
- `ScheduledJob` — Cron job management
- `TaskComment` — Task discussion threads

**Metrics:** 7 new lib modules, 9 new API routes, 68 new tests, 3,307 lines added

---

## Known Issues Tracker

### Critical (Blocking Production - Phase 15)
- [x] Fix console.error in auth route ✅ Fixed (Phase 15)
- [x] Add auth to framework controls endpoint ✅ Fixed (Phase 15)
- [x] Fix rate limit header bug ✅ Fixed (Phase 15)
- [x] Fix middleware path matching ✅ Fixed (Phase 15)

### High Priority (Before Next Release - Phase 15)
- [x] Add XSS sanitization ✅ Fixed (Phase 15)
- [x] Implement stricter login rate limiting ✅ Fixed (Phase 15)
- [x] Wrap token verification in try-catch ✅ Fixed (Phase 15)
- [x] Add password complexity ✅ Fixed (Phase 15)
- [x] Configure Prisma connection pool ✅ Fixed (Phase 15)

### Medium Priority (Phase 16-17)
- [ ] Add CORS configuration
- [ ] Use org slug instead of org ID in URLs
- [ ] Fix CUID validation mismatch
- [ ] Implement notification retry queue
- [ ] Add API versioning strategy

### Low Priority (Phase 18+)
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
- ✅ Test coverage: 833/833 passing (100%)
- ✅ Type safety: 100% (strict mode)
- ✅ Build status: Production-ready
- ✅ Accessibility: WCAG 2.1 AA compliant
- ✅ Documentation: Complete for all modules
- ✅ Security: All critical issues resolved (Phase 15)

### MVP5 Targets
- 700+ tests passing
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
| Dashboard Consolidation (Phase 14) | 2026-02-04 | ✅ Complete |
| Widget System (Phase 14.5) | 2026-02-06 | ✅ Complete |
| Security Hardening (Phase 15) | 2026-02-06 | ✅ Complete |
| Dashboard Features & UI/UX (Phase 21) | 2026-02-06 | ✅ Complete |
| Risk Visualization Enhancement | 2026-02-08 | ✅ Complete |
| Test Coverage 660 Tests | 2026-02-08 | ✅ Complete |
| File Storage & Evidence (Phase 16) | 2026-02-09 | ✅ Complete |
| Scheduled Reports & Cron (Phase 17) | 2026-02-09 | ✅ Complete |
| Advanced Features (Phase 18) | 2026-02-09 | ✅ Complete |
| MVP5 Release (All Backend Complete) | 2026-02-09 | ✅ Complete |
| Production Deployment | 2026-03-01 | 📋 Planned |
| Enterprise SSO/SAML (MVP6) | 2026-04-30 | 📋 Planned |

---

**Document Version:** 2.6
**Last Updated:** 2026-02-09 (MVP5 Complete: Phases 16-18 Backend Implementation)
**Maintained By:** docs-manager agent
**Next Review:** 2026-03-01 (MVP6 Enterprise Features Phase)
