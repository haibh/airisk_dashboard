# AIRisk Dashboard Documentation

**Status:** MVP4 Phase 14.5 + Phase 15 (Dashboard Widgets & Security Hardening)
**Last Updated:** 2026-02-06

---

## Quick Navigation

### For Project Understanding
- **[project-overview-pdr.md](./project-overview-pdr.md)** - Project vision, features, tech stack, status, roadmap
- **[product_requirement_documents.md](./product_requirement_documents.md)** - Condensed PRD with user preferences

### For Development
- **[code-standards.md](./code-standards.md)** - Coding conventions, patterns, and best practices
- **[codebase-summary.md](./codebase-summary.md)** - Complete file structure and module overview

### For Architecture & Technical Decisions
- **[system-architecture.md](./system-architecture.md)** - System design, data flows, security, scalability
- **[api-reference.md](./api-reference.md)** - API endpoints documentation

### For Operations & Deployment
- **[deployment-guide.md](./deployment-guide.md)** - Setup, deployment strategies, troubleshooting
- **[performance-optimization-guide.md](./performance-optimization-guide.md)** - Performance tuning recommendations

### Reference
- **[DOCUMENTATION-INDEX.md](./DOCUMENTATION-INDEX.md)** - Complete documentation index

---

## Key Information

### Technology Stack
- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Shadcn/ui
- **Backend:** Next.js 16 App Router + NextAuth.js (JWT)
- **Database:** PostgreSQL 15+ with Prisma ORM
- **Testing:** Vitest (unit) + Playwright (E2E)
- **i18n:** next-intl (EN/VI)

### Current Features
1. ✅ Authentication & Authorization (5 roles + RBAC)
2. ✅ AI System Registry (CRUD, lifecycle, classification)
3. ✅ Framework Integration (23 frameworks, 1,323 controls, 172 mappings)
4. ✅ Risk Assessment Engine (5-step wizard, 5×5 matrix)
5. ✅ Dashboard & Reporting (analytics + exports)
6. ✅ Organization & User Management (invitations, roles)
7. ✅ API Keys & Webhooks (HMAC-SHA256 signing)
8. ✅ Notifications & Audit Logs (7 event types + CSV export)
9. ✅ Evidence Management & Gap Analysis
10. ✅ Testing Infrastructure (262+ tests, 95%+ coverage)
11. ✅ Accessibility (WCAG 2.1 AA)
12. ✅ Caching & Rate Limiting (Redis + sliding window)

### Quick Commands
```bash
npm run dev                # Start dev server
npm run build             # Production build
npm run test              # Run tests
npm run test:e2e          # E2E tests
npm run db:push           # Push schema
npm run db:seed           # Seed database
npm run lint              # ESLint check
```

### Git Workflow
```bash
# Development
git checkout -b feature/your-feature
npm run dev              # Test changes

# Before commit
npm run lint -- --fix    # Fix linting
npm run test:run         # Run tests

# Commit
git add <files>
git commit -m "feat(module): description"
```

---

## Codebase Structure

```
src/
├── app/[locale]/                # UI routes with i18n
│   ├── (auth)/login/            # Login page
│   └── (dashboard)/             # Protected dashboard (29 pages)
├── app/api/                     # REST API (53 routes across 21 groups)
├── components/                  # React components (112+ files, 12K+ LOC)
├── lib/                        # Utilities (28 files: caching, webhooks, jobs, etc.)
├── store/                      # Zustand state (4 stores)
├── types/                      # TypeScript definitions
├── i18n/                       # Translations (EN/VI)
└── middleware.ts               # Auth + i18n middleware

prisma/
├── schema.prisma               # Database schema (20 models + 11 enums)
├── seed.ts                     # User/org seeding
├── seed-frameworks.ts          # NIST/ISO framework data
├── seed-cis-controls.ts        # CIS Controls v8.1
├── seed-csa-aicm.ts            # CSA AICM framework
├── seed-nist-csf.ts            # NIST Cybersecurity Framework
└── seed-pci-dss.ts             # PCI DSS v4.0.1

tests/
├── api/                        # Integration tests (262+ passing)
├── e2e/                        # End-to-end tests (Playwright)
├── lib/                        # Unit tests
└── setup.ts                    # Global test configuration
```

---

## Database Entities (20 Models)

| Entity | Purpose |
|--------|---------|
| **Organization** | Root tenant entity |
| **User** | System users with 5 roles (active/inactive tracking) |
| **AISystem** | AI inventory (name, type, lifecycle, classification) |
| **Framework** | NIST/ISO frameworks (85+ NIST, 38 ISO controls) |
| **Control** | Framework controls with hierarchy |
| **Mapping** | Cross-framework relationships (confidence levels) |
| **Assessment** | Risk assessment snapshots (4-step status workflow) |
| **Risk** | Individual risks (5×5 matrix, inherent/residual scores) |
| **RiskControl** | Links risks to framework controls |
| **Evidence** | Evidence artifacts (SHA-256 hashing) |
| **EvidenceLink** | Links evidence to risks/controls/assessments |
| **Task** | Remediation tasks (treatment workflow) |
| **AuditLog** | Immutable action logs (user, entity, change details) |
| **Invitation** | User invitations (token-based, expiry tracking) |
| **APIKey** | API keys (SHA-256 hashed, max 10/org, 3 permission levels) |
| **Webhook** | Webhook endpoints (SSRF protected, HMAC signing) |
| **WebhookDelivery** | Delivery logs (retry tracking, response codes) |
| **Notification** | User notifications (7 event types, read/unread) |
| **SavedFilter** | Per-user saved filters for dashboards |
| **ScheduledJob** | Cron-based scheduled tasks |

---

## API Endpoints

```
/api/
├── /auth/[...nextauth]/           # Authentication
├── /ai-systems/[id]               # AI system CRUD
├── /assessments/[id]/risks        # Risk assessment
├── /risks/[id]                    # Risk operations
├── /frameworks/[id]/controls      # Framework & controls
├── /dashboard/stats               # Dashboard APIs
└── /reports/*                     # Export endpoints
```

---

## Authentication & Authorization

### Roles (Hierarchical)
1. **Admin** - Full system access
2. **Risk Manager** - Manage systems, assessments, risks
3. **Assessor** - Create/edit assessments and risks
4. **Auditor** - View-only access
5. **Viewer** - Dashboard view only

### Session Management
- JWT tokens (24-hour expiration)
- Refresh tokens (secure HttpOnly cookies)
- 30-minute idle timeout
- Multi-tenant isolation via organizationId

---

## Risk Scoring

### Formula
```
Inherent Risk = Likelihood (1-5) × Impact (1-5) = 1-25
Residual Risk = Inherent × (1 - ControlEffectiveness/100)
```

### Risk Levels
- **Low (1-4):** Accept or monitor
- **Medium (5-9):** Mitigate within 90 days
- **High (10-16):** Mitigate within 30 days
- **Critical (17-25):** Immediate action required

---

## Testing

### Unit Tests (Vitest)
```bash
npm run test -- tests/utils/
```

### Integration Tests (API)
```bash
npm run test -- tests/api/
```

### E2E Tests (Playwright)
```bash
npm run test:e2e              # Headless
npm run test:e2e:headed       # With browser
```

### Performance Benchmarks
```bash
npx tsx scripts/performance-benchmark.ts
```

---

## Documentation Standards

### File Size Limits
- Code files: < 200 LOC (split if larger)
- Doc files: < 800 lines (split if larger)

### Naming Conventions
- Components: PascalCase
- Functions/variables: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Files: kebab-case
- Types: PascalCase

### Commit Format
```
feat(module): add new feature
fix(auth): resolve login bug
docs(readme): update instructions
test(api): add endpoint tests
refactor(db): optimize queries
```

---

## Deployment

### Development
```bash
npm install
npm run db:push
npm run db:seed
npm run dev      # http://localhost:3000
```

### Production
See [deployment-guide.md](./deployment-guide.md) for:
- Vercel deployment
- AWS EC2 setup
- Docker containerization
- SSL/TLS configuration

---

## Security Checklist

### Code Review
- [ ] No `any` types
- [ ] No hardcoded secrets
- [ ] All input validated
- [ ] Error handling present
- [ ] Tests pass
- [ ] Security headers set

### Deployment
- [ ] Environment variables configured
- [ ] Database backups tested
- [ ] TLS/SSL enabled
- [ ] CORS configured
- [ ] Rate limiting ready
- [ ] Monitoring configured

---

## Accessibility

### WCAG 2.1 AA Compliance
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ Color contrast (4.5:1)
- ✅ ARIA labels
- ✅ Screen reader support

---

## Known Limitations (MVP4)

- No file storage integration (S3/Blob uploading evidence files)
- No scheduled report generation (cron-based)
- Bundle size optimization pending (target: 400KB gzip)

---

## Next Phase (MVP5)

**Focus Areas:**
- S3/Blob storage integration for evidence files
- Report scheduling & email delivery
- Advanced gap analysis visualization
- Performance optimizations (bundle size, query caching)

**Documentation Updates:**
- evidence-storage-guide.md
- report-scheduling.md
- advanced-caching-guide.md

---

## Getting Help

### Developer Resources
1. Read relevant doc file from above
2. Check code examples in files
3. Review test suites for patterns
4. Check CLAUDE.md for project context

### Common Issues
See [deployment-guide.md](./deployment-guide.md#troubleshooting) for:
- Database connection errors
- Configuration issues
- Performance problems
- Debugging tips

---

## Document Maintenance

### Update Triggers
- After each feature implementation
- After major bug fixes
- After security updates
- At each phase milestone
- When architecture changes

### Process
1. Read current doc
2. Identify what changed
3. Update affected sections
4. Verify accuracy against code
5. Update last-modified date
6. Commit with clear message

---

**Documentation Status:** Current ✅
**Last Verified:** 2026-02-04
**MVP Phase:** 4 (Phase 13 - Multi-Tenant & Polish)
**Test Status:** 262/262 passing
**Quality Score:** A+ (97/100)

For detailed information, see individual documentation files above.
