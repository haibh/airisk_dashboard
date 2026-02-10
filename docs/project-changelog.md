# AIRisk Dashboard - Project Changelog

**Last Updated:** 2026-02-10 | **Current Version:** 2.7.0 (Security Audit & Hardening)

---

## Version History

### 2.7.0 — Security Audit & Hardening (2026-02-10)
**Date:** 2026-02-10
**Impact:** Low-priority security audit completion with Grade B+ assessment

**Security Audit Results:**
- **Grade:** B+ (Strong foundational security with minor recommendations)
- **Scanner:** Nuclei v3.7.0 (zero CVEs or misconfigurations found)
- **Status:** All 11/12 API endpoint groups return 401 for unauthenticated access (health check is public)
- **Verdict:** Production-ready with robust security controls

**Security Enhancements Implemented (commit abe1d16):**
1. **CORS Restriction:** Changed from wildcard `*` to `ALLOWED_ORIGINS` environment variable
   - Configurable: comma-separated trusted origins
   - Backward compatible (defaults to `*` if not set)
   - Prevents cross-origin attacks from untrusted domains
2. **Brute-Force Protection:** New `login-attempt-tracker.ts` service
   - 5 failed login attempts = 15-minute account lockout
   - In-memory tracking with automatic cleanup
   - Prevents credential stuffing attacks
3. **Server Info Leak Prevention:** `X-Powered-By` header removed
   - `poweredByHeader: false` in next.config.ts
   - Reduces reconnaissance surface
4. **HSTS Preload:** Enhanced Strict-Transport-Security header
   - Added `preload` directive
   - Increases browser HSTS preload list eligibility
   - Forces HTTPS for all requests

**Security Headers Verified:**
- Content-Security-Policy ✅
- Strict-Transport-Security (with preload) ✅
- X-Frame-Options: DENY ✅
- X-Content-Type-Options: nosniff ✅
- Referrer-Policy ✅
- Permissions-Policy ✅

**Database Security Verified:**
- SQL injection: Not vulnerable (Prisma parameterization)
- Path traversal: Not vulnerable (validation + 403 responses)
- Sensitive files: All hidden (404 for .env, package.json, etc.)

**Files Modified:** 2 files
- `next.config.ts` — CORS + poweredByHeader + HSTS preload
- `src/lib/login-attempt-tracker.ts` — NEW brute-force service
- `src/app/api/auth/[...nextauth]/route.ts` — Integrated login attempt tracker
- `tests/setup.ts` — Mock for login-attempt-tracker
- `.env.example` — Added ALLOWED_ORIGINS documentation

**Tests:** 1,080/1,080 passing (100%) — No regression
**Type Safety:** 0 TypeScript errors
**Documentation:** README, Deployment Guide, System Architecture updated with security findings

**Future Recommendations (not implemented):**
- 2FA/MFA (TOTP) — Multi-factor authentication
- JWT Revocation — Redis-based token blacklist
- Magic Byte Validation — Enhanced file type verification
- CSP Nonces — Replace unsafe-inline directives
- Per-Endpoint Rate Limiting — Fine-grained limits on sensitive operations

---

### 2.6.2 — Docker Optimization & Deployment (2026-02-10)
**Date:** 2026-02-10
**Impact:** Production-ready Docker deployment with critical security and performance fixes

**Docker Enhancements:**
- **3-stage Dockerfile:** deps → builder → runner (optimized image: 421MB)
- **Multi-environment compose:** Base + dev override (hot-reload) + prod override (nginx)
- **Nginx reverse proxy:** SSL termination, gzip, rate limiting, static caching
- **Makefile automation:** 21 targets (dev, prod, build, logs, clean, backup, ssl)
- **Health checks:** IPv4-specific `curl 127.0.0.1:3000/api/health`
- **Resource limits:** Production memory (1GB) and CPU (1.5 cores) constraints

**Critical Fixes (7 total):**
1. **Prisma CLI availability:** Keep devDependencies in deps stage (TypeScript/Next.js build requirement)
2. **Binary targets:** Added `linux-musl-openssl-3.0.x` for Alpine Linux compatibility
3. **IPv4 health checks:** Changed `localhost` → `127.0.0.1` (Alpine networking)
4. **Package-lock sync:** Ensured package.json/package-lock.json consistency
5. **Security:** Removed .env.docker with credentials, added .env.docker.example template
6. **Wait scripts:** Added postgres-ready check before migrations
7. **Entrypoint:** Prisma generate + migrate + seed automation

**Infrastructure:**
- Files: Dockerfile (109L), docker-compose.yml/dev/prod, Makefile (116L), .dockerignore
- Scripts: docker-entrypoint-startup.sh, wait-for-postgres-database-ready.sh, postgres-backup-with-rotation.sh
- Nginx: reverse-proxy config (130L) with SSL, gzip, rate limiting
- CI/CD: Added docker-build job, Trivy security scan

**Metrics:** 421MB final image, 3.5s startup time, production-ready deployment
**Tests:** 1,080/1,080 passing (100%) — Docker verified
**Build Status:** Production-ready
**Deployment Guide:** docs/deployment-guide.md updated with Docker instructions

---

### 2.6.1 — Security Headers & API Quality Improvements (2026-02-09)
**Date:** 2026-02-09
**Impact:** Medium-priority security and code quality enhancements (MEDIUM findings)

**Security Enhancements:**
- **Configurable CORS:** Replace wildcard `*` with environment-based origin list
  - New env var: `ALLOWED_ORIGINS` (comma-separated)
  - Supports multiple trusted origins for production
  - Backward compatible (defaults to `*` if not configured)

- **Enhanced Security Headers:**
  - `Content-Security-Policy` — Restrict resource loading to trusted sources
  - `Permissions-Policy` — Disable camera/microphone/geolocation
  - `Strict-Transport-Security` — Force HTTPS with 1-year max-age
  - `X-Correlation-ID` added to CORS allowed headers

**API Improvements:**
- **API Versioning:** All API responses include `X-API-Version` header (default: 1.0.0)
- **Correlation ID Propagation:** Error responses now include correlation ID from request headers
  - Updated all error helpers: `handleApiError`, `validationError`, `notFoundError`, etc.
  - Improved debugging with request-to-error traceability

**Health Check Enhancement:**
- PostgreSQL version detection added to `/api/health`
- Response now includes `services.database.version` field (e.g., "15.3")

**Files Modified:** 4 files (+96 lines)
- `.env.example` — Added CORS/API version config
- `next.config.ts` — Enhanced security headers
- `src/lib/api-error-handler.ts` — Correlation ID support
- `src/app/api/health/route.ts` — DB version detection

**Tests:** 833/833 passing (100%) — No regression
**Type Safety:** 0 TypeScript errors
**Breaking Changes:** None (all backward compatible)

**Environment Variables Added:**
```bash
ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
API_VERSION="1.0.0"
```

---

### 2.6.0 — Frontend UI Implementation (2026-02-09)
**Date:** 2026-02-09
**Impact:** Complete frontend UI for Phase 16-18 backend features

**UI Features Delivered:**
- **Phase A:** Evidence version history panel with diff viewer and per-version download
- **Phase B:** Storage quota indicator (admin-only) with progress bar and usage tracking
- **Phase C:** Full task management page (list, detail slideout, create form, comment feed)
- **Phase D:** Bulk import wizard (multi-step: upload→preview→import) with progress tracking
- **Phase E:** Report template manager (CRUD) with templates tab in reports page

**New Components (12 total):**
- `evidence-version-history-panel.tsx` — Version list + diff + download
- `storage-quota-indicator.tsx` — Progress UI with usage tracking
- `task-list-table.tsx` — Paginated task list with filters
- `task-detail-panel.tsx` — Slideout detail view with comment thread
- `task-create-form.tsx` — Task creation and editing form
- `task-comment-feed.tsx` — Discussion threads and activity
- `bulk-import-wizard.tsx` — Multi-step import workflow
- `import-preview-table.tsx` — Data preview with validation
- `report-template-manager.tsx` — Template list + CRUD forms
- Plus evidence-detail-modal modifications and evidence-upload-form enhancements

**New Routes:**
- `/{locale}/tasks` — Full task management page (sidebar nav added)

**Modified Pages:**
- `/{locale}/evidence` — Added quota widget + version tabs to detail modal
- `/{locale}/reports` — Added templates management tab
- `/{locale}/risk-assessment` — Added import button for bulk upload

**i18n Expansion (+158 keys per language):**
- `evidence.versions.*` — Version history terminology
- `evidence.storage.*` — Quota and usage tracking
- `tasks.*` — Task management UI text
- `import.*` — Bulk import wizard workflow
- `reportTemplates.*` — Template management

**Files Modified:** 27 files (12 new components + 10 modified + 5 i18n updates)
**Lines Added:** 2,938+ (component code + i18n translations)
**Tests:** 833/833 passing (100%) — no regression

**Build Status:** Production-ready
**Type Safety:** 0 TypeScript errors

---

### 2.5.1 — Security Hardening & Test Expansion (2026-02-09)
**Date:** 2026-02-09
**Impact:** Security fixes for HIGH and MEDIUM code review findings

**Security Fixes:**
- **HIGH-01:** Filename sanitization - collapse consecutive dots to prevent path traversal
- **HIGH-02:** Virus scanner path validation - ensure file path is within /tmp/ before scanning
- **HIGH-03:** Atomic storage quota check - use Prisma transaction to prevent race conditions
- **HIGH-04:** Rate limit bulk uploads - maximum 20 files per request

**Additional Fixes:**
- **MEDIUM-03:** Add 10K row limit to Excel/CSV import parsers to prevent DoS
- **MEDIUM-04:** Only clear completedAt timestamp on COMPLETED→other status transitions
- **CRITICAL:** Fix timing attack in cron auth - use timingSafeEqual for secret comparison

**Testing:**
- Expanded test coverage: 833/833 tests passing (100%)
- 46 test files across all API endpoints and lib modules
- Added 173 new tests for Phases 16-18
- Test files: cron-trigger, evidence-versions, report-templates, tasks, bulk-import, email, virus-scanner, storage-quota

**Build Status:** Production-ready
**Security Status:** All CRITICAL + HIGH findings resolved

---

### 2.5.0 — File Storage, Reports & Advanced Features (2026-02-09)

#### Phase 16: File Storage & Evidence Backend
**Date:** 2026-02-09
**Impact:** Complete evidence file management with versioning, virus scanning, and quota management

**Features Delivered:**
- Evidence file versioning with history tracking
- Virus scanning integration (ClamAV) with scan verification
- Storage quota management (org-level and per-user limits)
- Bulk file upload with progress tracking
- Evidence approval workflow with review status
- Storage usage endpoint for quota monitoring

**Backend Services (New):**
- `EvidenceVersionService` — Version control and history
- `VirusScannerService` — File scanning and threat detection
- `StorageQuotaService` — Quota enforcement and tracking
- `BulkUploadService` — Batch file processing

**New API Endpoints:**
- `GET/POST /api/evidence/[id]/versions` — Version management
- `GET /api/evidence/storage-usage` — Usage tracking
- `POST /api/evidence/bulk-upload` — Batch upload
- `PUT /api/evidence/[id]/approve` — Approval workflow

**New Database Models:**
- `EvidenceVersion` — Version history with checksums

**Tests:** 48 new tests, 100% passing
**Build Status:** Production-ready

---

#### Phase 17: Scheduled Reports & Cron Jobs Backend
**Date:** 2026-02-09
**Impact:** Automated report generation and scheduling with email delivery

**Features Delivered:**
- Scheduled report generation (PDF via node-html2pdf, Excel via ExcelJS)
- SMTP email service for report delivery with template rendering
- Cron job management with execution logs
- Report templates with Handlebars + Markdown support
- Recurring assessment automation
- S3 file manager for report storage with lifecycle policies
- Automatic report cleanup based on retention policies

**Backend Services (New):**
- `EmailService` — SMTP with HTML/text rendering
- `ExcelReportGenerator` — Multi-sheet formatted workbooks
- `PdfReportGenerator` — HTML-to-PDF with custom styling
- `FileReportManager` — S3 storage and lifecycle management
- `ScheduledJobQueue` — Job processing with Bull/BullMQ
- `CronTriggerHandler` — Cron expression execution
- `ReportCleanupHandler` — Retention policy enforcement
- `RecurringAssessmentHandler` — Automated triggering

**New API Endpoints:**
- `POST /api/cron` — Execute cron job
- `GET /api/reports/download` — Download with signed URLs
- `GET/POST /api/report-templates` — Template CRUD
- `GET/PUT/DELETE /api/report-templates/[id]` — Template management
- `GET /api/jobs` — Job execution logs

**New Database Models:**
- `ReportTemplate` — Custom report templates
- `ScheduledJob` — Cron job configuration and logs

**Tests:** 56 new tests, 100% passing
**Build Status:** Production-ready

---

#### Phase 18: Advanced Features Backend
**Date:** 2026-02-09
**Impact:** Bulk import, task management, and advanced reporting capabilities

**Features Delivered:**
- Bulk import service (CSV/Excel with Zod validation)
- Risk import API with data mapping and conflict resolution
- Task management CRUD (creation, assignment, status tracking)
- Task comments and activity threads
- Advanced gap analysis with interactive filtering
- Duplicate detection and conflict resolution
- Remediation task prioritization with deadlines

**Backend Services (New):**
- `BulkImportService` — CSV/Excel parsing with streaming
- `RiskImportValidator` — Zod validation schemas for data
- `TaskManagementService` — Task lifecycle and workflow
- `ConflictResolutionEngine` — Duplicate detection and merging
- `GapAnalysisFilter` — Advanced filtering and analytics

**New API Endpoints:**
- `POST /api/import/risks` — Bulk risk import with validation
- `GET /api/import/status/[jobId]` — Import progress tracking
- `GET/POST /api/tasks` — Task listing and creation
- `GET/PUT/DELETE /api/tasks/[id]` — Task management
- `GET/POST /api/tasks/[id]/comments` — Task comments
- `GET /api/gap-analysis/advanced` — Advanced filtering

**New Database Models:**
- `Task` — Enhanced with comments and workflow tracking
- `TaskComment` — Discussion threads per task
- `ImportJob` — Bulk import tracking and status

**Tests:** 68 new tests, 100% passing
**Build Status:** Production-ready

**Statistics:**
- 27 files modified/created
- 3,307 lines added (+2,156 net)
- 6 new Prisma models (with extensions)
- 7 new lib modules (email, scanners, generators, services)
- 15+ new API endpoints
- 172 total new tests

---

### 2.0.1 — Risk Visualization Enhancement (2026-02-08)

#### Risk Visualization Enhancement - Phases 4-6
**Date:** 2026-02-08
**Impact:** Advanced risk analytics with trajectory tracking, drill-down, and velocity indicators

**Features Delivered:**

**Phase 4: Risk Velocity Indicators**
- Batch velocity calculator with 30-day lookback window
- Compact velocity badges (↑ increasing, → stable, ↓ decreasing)
- API endpoint `/api/risks?includeVelocity=true` for velocity data
- Integration into risk heatmap drill-down modal
- Z-score normalization for trend classification

**Phase 5: Control-Risk Sankey Diagram**
- Full-width Sankey visualization in Detailed Analytics view
- Control → Risk mitigation flow visualization
- Link thickness proportional to number of risk-control mappings
- Interactive nodes with risk details on hover
- Responsive design for mobile and desktop

**Phase 6: AI Model Risk Radar Chart**
- 6-axis radar chart for AI model risk profiles
- Axes: Bias, Privacy, Security, Reliability, Transparency, Accountability
- Score range 0-100 per dimension
- Aggregation across all risks per AI system
- Integration into AI Risk View panel

**New Components:**
- `risk-velocity-compact-indicator.tsx` — Velocity badge component
- `risk-velocity-batch-calculator.ts` — Batch calculator utility (supports up to 50 risks)

**API Enhancements:**
- `/api/risks` — Optional `includeVelocity=true` parameter
- Batch velocity calculation for performance optimization
- Supports filtering by organizationId, aiSystemId, category, level

**Infrastructure:**
- 285 new tests added (375 → 660 total)
- Coverage expanded across API routes, utilities, and components
- All tests passing (100%)

**Test Coverage Expansion:**
- **New test files (Feb 8):** risk-velocity-batch-calculator, risk-history-endpoint, heatmap-cell-endpoint, risks-endpoint, ai-systems-detail, assessments-detail, risks-detail, frameworks-detail, reports, cache-advanced, logger, utils
- **Total tests:** 660/660 passing (100%)
- **Coverage:** Stmts 29.7%, Branches 30.48%, Functions 24.88%, Lines 30.36%

**Build Status:** Production-ready
**TypeScript:** 0 errors

---

### 2.0.0 — Dashboard Features & UI/UX Upgrade (2026-02-06)

#### Phase 21: 9 New Advanced Features
**Date:** 2026-02-06
**Impact:** Enterprise-grade analytics, risk visualization, benchmarking, and ROI capabilities

**New Features (9 total):**

**Group A — Data Features (4):**
1. **Risk Supply Chain Mapping** — Graph-based vendor risk propagation using React Flow
   - Interactive vendor registry with risk scoring
   - Bidirectional risk path tracking
   - Risk cascade visualization across supply chain
2. **Regulatory Change Tracker** — Timeline view with impact assessment
   - Track regulatory changes and effective dates
   - Assess impact on frameworks and controls
   - Historical change annotations
3. **Peer Benchmarking** — Anonymous cross-org comparison with differential privacy
   - Laplace noise for data privacy protection
   - Percentile ranking against peer group
   - Compliance score comparison by framework
4. **ROI Calculator** — Financial analysis with ALE/ROSI formulas
   - Annualized Loss Expectancy calculation
   - Return on Security Investment (ROSI) modeling
   - Scenario comparison and investment recommendation

**Group B — Visualization Features (2):**
5. **Remediation Burndown Charts** — Sprint-based progress tracking
   - Recharts burndown and velocity charts
   - Task completion tracking
   - Team capacity planning
6. **Framework Control Overlap** — Sankey diagram + mapping matrix
   - React Flow visualization of 172 control mappings
   - Coverage matrix across 23 frameworks
   - Mapping confidence indicators

**Group C — UI/UX Improvements (3):**
7. **Bento Grid Layouts** — Customizable dashboard presets
   - 3 preset layouts (Executive, Analyst, Auditor)
   - Drag-and-drop reordering with dnd-kit
   - Widget visibility toggles and persistence
8. **Data Storytelling** — Template-based narrative insights
   - Automatic insight generation from data patterns
   - Z-score anomaly detection
   - Actionable recommendations based on trends
9. **Compliance Chain Graph** — Requirement→Control→Evidence visualization
   - React Flow chain diagram
   - Coverage donut chart
   - Gap identification

**Infrastructure:**
- 16 new Prisma models (Vendor, RegulatoryChange, BenchmarkSnapshot, ROSICalculation, InsightTemplate, DashboardLayout, ComplianceChain, etc.)
- 8 new API route groups (38 routes)
- 8 new utility libraries (differential-privacy.ts, rosi-calculator.ts, insight-generator.ts, compliance-chain-builder.ts, etc.)
- 41 new UI component files (6,972+ lines)
- 4 new sidebar pages (/supply-chain, /regulatory, /benchmarking, /roi-calculator)
- 179 new i18n keys (EN + VI)
- New dependencies: reactflow (~45KB gzip), @radix-ui/react-slider

**Test Status:** 375/375 tests passing (100%)
**Build Status:** Production-ready
**Bundle Size:** ~500KB gzip (45KB increase from new visualizations)

---

### MVP4.5 (Current) - 2026-02-06

#### Phase 14.5: Dashboard Widget System + Phase 15 Security Hardening
**Date:** 2026-02-05 to 2026-02-06
**Impact:** Customizable dashboard with Simple/Advanced widget modes + security hardening

**Dashboard Widget System (Feb 5-6):**
- **New components (8):** dashboard-sortable-container, dashboard-widget-wrapper, dashboard-widget-settings-panel, sortable-widget, risk-pulse-strip, unified-risk-view, compliance-status-card, next-best-actions-card
- **New hook:** use-dashboard-widget-config (view mode + widget state management via localStorage)
- **Dnd-kit integration:** Drag-and-drop widget reordering with rectSortingStrategy
- **Simple Mode (6 consolidated widgets):** Risk Pulse Strip, Unified Risk View, Compliance Status, Next-Best Actions, Activity Feed, AI Model Registry
- **Advanced Mode (15 individual widgets):** All metrics + framework-specific visualizations
- **UX improvements:** CSS Grid heatmap, React Portal for tooltips (escape dnd-kit transforms), explicit modal backgrounds, slimmed header (h-16 → h-12)

**Phase 15 Security Hardening (In Progress - 2/12 items):**
**Date:** 2026-02-05
**Impact:** XSS & CSV injection prevention added

**Security Fixes Applied:**
- XSS prevention: Added `escapeHtml()` utility in `src/lib/global-search-service.ts`
  - Escapes HTML entities (`&`, `<`, `>`, `"`, `'`) before rendering search results
  - Applied to `highlightMatches()` function - sanitizes all text segments
  - Prevents injection of malicious scripts through search results
- CSV injection protection: Added `sanitizeCsvValue()` utility in `src/lib/export-generator.ts`
  - Detects dangerous CSV formula characters: `=`, `+`, `-`, `@`, tab, carriage return, newline
  - Prefixes dangerous values with single quote to neutralize formulas
  - Applied to all CSV/Excel export generators
  - Prevents arbitrary code execution in spreadsheet applications
- Infrastructure: Updated Playwright config with extended webServer timeout (60s → 120s)

**Test Status:** 262/262 unit tests passing
**Build Status:** Production-ready

---

### MVP4.5 (Previous) - 2026-02-04

#### Complete Phase 14: Theme Unification & Dashboard Consolidation
**Date:** 2026-02-04
**Impact:** Single coherent theme system + unified 4-tab dashboard navigation

**Combined Changes (Commits ea1905a + 200d3ac):**
- Unified 3 fragmented visual themes into single adaptive system
- All pages respect dark/light toggle via `next-themes`
- CSS variable tokens (`hsl(var(--xxx))`) replace hardcoded classes
- Framework UI grouping: AI Risk Frameworks + Non-AI-Specific Frameworks
- Per-framework icons (BrainCircuit, Settings2, ShieldCheck, ShieldAlert, Lock, Target, CreditCard, Layers)
- SCF updated to v2025.4 (effective April 2025)
- Dashboard merged: `/dashboard` + `/technical-view` → 4-tab interface (Executive Brief | Detailed Analytics | Operations | AI Risk)
- Landing page expanded with stats, frameworks grid, capabilities, methodology, architecture sections
- Theme toggle (Sun/Moon) button added to auth layout
- Sidebar: single "Dashboard" nav entry

**Test Status:** 262/262 passing (100%)
**TypeScript:** 0 errors
**Bundle:** Production-ready

---

### MVP4.4 - 2026-02-04

#### Theme Unification + Dashboard Consolidation
**Date:** 2026-02-04
**Impact:** Unified adaptive theme system + consolidated dashboard navigation

**Theme Consolidation (Commit ea1905a):**
- Unified 3 fragmented visual themes (landing dark-only, login dark-only, dashboard adaptive) into single coherent theme
- All pages now use CSS variable tokens (`hsl(var(--xxx))`) with `next-themes` dark class toggle
- **Removed old CSS classes:** `login-hero-gradient`, `glass-card`, `glass-card-glow`, `login-bg-*`, `landing-float-*`, `landing-node-*`
- **New shared animation prefix:** `ai-scene-*` (float, pulse, dash-flow, logo-bob, shape-morph) for consistency
- **Auth page adaptive styling:** `auth-adaptive-bg` (light pastels / dark gradient), `auth-card-adaptive` (solid / glassmorphism)
- **Landing page adaptive:** `landing-gradient` (light gray / dark navy), new content sections (stats, frameworks grid, capabilities, methodology, architecture)
- **SVG backgrounds:** migrated from hardcoded rgba to `currentColor` for true theme support
- **Theme toggle:** added Sun/Moon button to auth layout header
- Login uses standard shadcn Card/Input/Label without custom color overrides
- Landing modularized: `landing-page.tsx` + `landing-page-content-sections.tsx`
- i18n expanded: `landing.stats.*`, `landing.supportedFrameworks.*`, `landing.capabilities.*`, `landing.methodology.*`, `landing.architecture.*`

**Dashboard Consolidation (Commit 200d3ac):**
- Merged `/dashboard` (Executive Brief + Detailed Analytics) with `/technical-view` (Operations + AI Risk)
- Created unified 4-tab dashboard: Executive Brief | Detailed Analytics | Operations | AI Risk
- Deleted `/technical-view` route entirely
- Sidebar: single "Dashboard" nav entry
- Extracted sub-components: `operations-view.tsx`, `ai-risk-view-panel.tsx`
- Added `useDashboardData` hook for parallel API fetching
- Extracted dashboard types to `src/types/dashboard.ts`

**Files Modified (ea1905a):**
- `src/app/globals.css` — gradient-shift keyframes, glass-card utilities, adaptive color system
- `src/app/[locale]/(auth)/layout.tsx` — auth-adaptive-bg, theme toggle button
- `src/app/[locale]/(auth)/login/page.tsx` — removed custom color overrides, standard shadcn
- `src/components/landing/landing-page.tsx` — modular structure, adaptive gradients
- `src/components/landing/landing-page-content-sections.tsx` — new, content organization
- `src/i18n/messages/en.json` — landing namespace expansion
- `src/i18n/messages/vi.json` — landing namespace expansion

**Files Modified (200d3ac):**
- `src/app/[locale]/(dashboard)/dashboard/page.tsx` — 4-tab layout (~85 LOC)
- `src/components/dashboard/operations-view.tsx` — extracted ops tab (35 LOC)
- `src/components/dashboard/ai-risk-view-panel.tsx` — extracted AI risk tab (74 LOC)
- `src/components/layout/sidebar.tsx` — single Dashboard entry
- `src/types/dashboard.ts` — extracted types
- `src/hooks/use-dashboard-data.ts` — parallel API fetching

**Tests:** 262/262 passing (100%)
**Build Status:** TypeScript 0 errors

---


### MVP4.1 - 2026-02-04

#### Code Review & Security Audit
**Date:** 2026-02-04
**Impact:** Critical security findings identified

**Findings Summary:**
- **Critical Issues:** 4 found (console.error, missing auth, rate limit bug, middleware path matching)
- **High Issues:** 4 found (XSS, weak login rate limiting, token exposure, N+1 queries)
- **Medium Issues:** 7 found (password requirements, CORS, connection pooling, etc.)
- **Tests:** 262/262 passing (100%)
- **Type Safety:** 100% (strict mode)
- **Build:** Production-ready

**Review Report:** See `plans/reports/code-review-260204-0935-codebase-review.md`

#### Fixes Applied (Phase 13 Completion)
- Fixed ESLint errors in gap-list-table.tsx, search-results-panel.tsx, export-generator.ts
- TypeScript compilation successful (zero errors)
- All 262 tests passing

**Next Actions:**
1. Phase 14: Fix 4 critical security issues (2-3 day sprint)
2. Phase 15: File storage integration (S3/Blob)
3. Phase 16: Scheduled reports & cron jobs

---

## Version 4.0 (MVP4) - Multi-Tenant & Enterprise Features - 2026-02-04

### Phase 13: Notifications, Audit Logs & Polish (Complete)
**Timeline:** Jan 25 - Feb 04, 2026
**Status:** ✅ Delivered

**New Features:**
- Notification service with 7 event types
- Real-time notification dropdown (60s polling)
- Unread notification badge and counter
- Audit log viewer with advanced filters (user, action, entity, date)
- Audit log CSV export functionality
- Change detail diff viewer for mutation tracking
- Notification mark-as-read functionality
- UI polish and consistency improvements

**Components Added:**
- `notification-dropdown-menu.tsx` - Dropdown with list
- `notification-list-item.tsx` - Individual notification display
- `audit-log-filter-toolbar.tsx` - Filter controls
- `audit-log-viewer-table.tsx` - Paginated audit log table
- `audit-log-detail-diff.tsx` - Change detail visualization

**Files Modified:** 37 files
**Tests:** 262/262 passing
**Build Status:** ✅ Production ready

---

### Phase 12: API Keys & Webhooks Integration - 2026-01-28

**Timeline:** Jan 20 - Jan 28, 2026
**Status:** ✅ Delivered

**New Features:**
- API key generation with SHA-256 hashing
- API key management (list, create, revoke, max 10/org)
- Key permission levels (READ, WRITE, ADMIN)
- API key authentication middleware
- Webhook CRUD operations
- Webhook signature verification (HMAC-SHA256)
- Event dispatcher for entity changes (ai_system.*, assessment.*)
- Webhook delivery worker with retry logic (exponential backoff)
- Delivery log tracking and filtering
- Webhook test endpoint for validation

**Database Schema:**
- `APIKey` model (SHA-256 hashed, prefix-based, permissions)
- `Webhook` model (URL, events, secret, status)
- `WebhookDelivery` model (status, response code, retry count)

**Files Added:** ~15 files
**Tests:** 262/262 passing

---

### Phase 11: Organization & User Management - 2026-01-20

**Timeline:** Jan 15 - Jan 20, 2026
**Status:** ✅ Delivered

**New Features:**
- Organization profile management (GET, PUT)
- User CRUD with pagination and search
- Role assignment and management (5-tier hierarchy)
- User invitation system (email, token-based, expiry 7 days)
- User profile editing (name, email, avatar)
- Password change functionality
- Active/inactive user tracking
- Last login timestamp tracking
- Seed script for initial data

**Database Schema Changes:**
- Added `Invitation` model (token-based, status tracking)
- Enhanced `User` model (isActive, lastLoginAt, invitedAt)
- Added `lastPasswordChangedAt` timestamp

**API Endpoints Added:**
- `/api/organizations/[id]` - GET, PUT
- `/api/users` - GET, POST, paginated
- `/api/users/[id]` - GET, PUT, DELETE
- `/api/users/me` - GET current user, PUT profile
- `/api/users/me/password` - PUT password change
- `/api/invitations` - POST create, GET list
- `/api/invitations/[token]/accept` - POST (public)

**Components Added:**
- `user-management-table.tsx`
- `user-invite-form.tsx`
- `user-profile-form.tsx`
- `organization-profile-form.tsx`

**Tests:** 262/262 passing

---

## Versions 1.0-3.0 (MVP1-MVP3) - Foundation & Core Features

| Phase | Timeline | Key Deliverables |
|-------|----------|------------------|
| **Phase 1: Setup** | Jun 01-15, 2025 | Next.js 16 + React 19 + Tailwind v4, Prisma ORM, 20 data models, i18n (EN/VI) |
| **Phase 2: Auth** | Jun 15 - Jul 01, 2025 | NextAuth JWT, 5-tier RBAC, session management, middleware protection |
| **Phase 3: AI Inventory** | Jul 01-15, 2025 | AISystem CRUD, lifecycle tracking, classification enums, soft delete |
| **Phase 4: Frameworks** | Jul 15 - Aug 01, 2025 | NIST AI RMF 1.0 + ISO 42001, control mapping, hierarchy, bidirectional relationships |
| **Phase 5: Risk Engine** | Aug 01-15, 2025 | 5-step assessment wizard, 5×5 risk matrix, 8 categories, inherent/residual scoring |
| **Phase 6: Dashboard** | Sep 01-15, 2025 | KPI cards, risk heatmap, compliance scorecard, activity feed, CSV/JSON export |
| **Phase 7: Testing** | Sep 15 - Oct 15, 2025 | Vitest (262+ tests), Playwright E2E, WCAG 2.1 AA compliance, coverage reporting |
| **Phase 8: Performance** | Oct 15 - Nov 01, 2025 | Multi-layer cache (Redis + LRU), rate limiting, structured logging, health checks |
| **Phase 9: Evidence** | Nov 15 - Dec 01, 2025 | File upload (SHA-256), multi-entity linking, approval workflow, gap analysis |
| **Phase 10: Expansion** | Dec 01-15, 2025 | CIS v8.1, CSA AICM, NIST CSF 2.0, PCI DSS v4.0.1, cross-framework mappings |

**Status:** ✅ All phases delivered | **Total:** 10 phases, 6 months | **Foundation:** 20+ models, 262 tests, 23 frameworks

---

---

## Current Project Status (v2.6.1)

**Document Version:** 2.6.1
**Last Updated:** 2026-02-09
**Maintained By:** docs-manager agent

### Metrics
- **Tests:** 1,080/1,080 passing (100%) across 55 test files
- **UI Components:** 174+ (Phases 1-21)
- **Database Models:** 42 (Phases 1-18)
- **API Routes:** 97 route files
- **Frameworks:** 23 frameworks, 1,323 controls, 172 mappings
- **Type Safety:** 100% (strict mode)
- **Accessibility:** WCAG 2.1 AA compliant
- **Security Status:** All CRITICAL + HIGH findings resolved

### Dependencies (Current)
- Next.js 16.1.6, React 19.0, TypeScript 5.9, Tailwind CSS 4.1
- Prisma 5.22, NextAuth.js 4.24, Zod 4.3
- Vitest 4.0, Playwright 1.58, ioredis 5.9

**Production Ready:** ✅ v2.6.1 - Security hardened + full enterprise features
