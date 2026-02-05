# Product Requirement Document (PRD)
## AI Risk Management Intelligence Platform (AIRM-IP)

**Version:** 3.0 | **Date:** 2026-02-04 | **Status:** MVP4 Complete

---

## User Preferences

| Decision | Choice |
|----------|--------|
| Tech Stack | Next.js + TypeScript + Tailwind + Shadcn/ui |
| MVP Scope | Dashboard + NIST AI RMF + ISO 42001 |
| Deployment | Single org → Multi-tenant ready |
| Language | Bilingual (EN/VI) |

---

## 1. Vision & Goals

**Vision:** Single pane of glass for AI risk management, compliance, and audit-readiness.

**Core Goals:**
1. Unified risk taxonomy across AI frameworks
2. Wizard-style assessment workflows
3. Evidence-based compliance (hash-verified)

**Non-Goals (MVP):** No MLOps, no SIEM, no full ISO text hosting.

---

## 2. Supported Frameworks

| Framework | Version | MVP |
|-----------|---------|-----|
| NIST AI RMF | 1.0 + GenAI Profile | ✅ MVP1 |
| ISO/IEC 42001 | 2023 | ✅ MVP1 |
| CSA AICM | 1.0 (07/2025) | ✅ MVP2 |
| NIST CSF | 2.0 (02/2024) | ✅ MVP3 |
| ISO 27001 | 2022 | ✅ MVP3 |
| CIS Controls | 8.1 | ✅ MVP3 |
| PCI DSS | 4.0.1 | ✅ MVP3 |
| SCF | v2025.4 | ✅ MVP4 |

---

## 3. Functional Requirements

### Module 1: Inventory (FR-INV) - P0
- AI System Registry (CRUD, types, classification)
- Lifecycle tracking (Dev → Prod → Retired)
- Owner/stakeholder assignment

### Module 2: Risk Assessment (FR-RISK) - P0
- 5-step assessment wizard
- 5×5 risk matrix (likelihood × impact)
- 8 risk categories (Bias, Privacy, Security, etc.)
- Inherent/residual scoring with controls

### Module 3: Framework Mapping (FR-MAP) - P0
- NIST AI RMF ↔ ISO 42001 bidirectional mapping
- Confidence scoring (High/Medium/Low)
- Gap analysis visualization

### Module 4: Dashboard & Reports (FR-DASH) - P0
- Risk heatmap, compliance scorecard, trends
- Export: PDF, CSV, Excel, JSON
- Drill-down navigation

### Module 5: Evidence (FR-EVID) - P1 (MVP2)
- Upload with SHA-256 hashing
- Link to controls/risks
- Approval workflow

### Module 6: Workflow (FR-WORK) - P1 (MVP2)
- Risk treatment (Accept/Mitigate/Transfer/Avoid)
- Task management with assignments

---

## 4. Non-Functional Requirements

| Category | Key Requirements |
|----------|------------------|
| **Performance** | Page < 3s, API < 500ms (P95) |
| **Security** | RBAC (5 roles), AES-256, TLS 1.3, RLS |
| **Scale** | 10K+ AI systems, 100+ concurrent users |
| **i18n** | EN/VI, locale-aware formatting |
| **Accessibility** | WCAG 2.1 AA |
| **API** | REST, OpenAPI 3.0, versioned |

---

## 5. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript 5.9 |
| UI | Tailwind CSS v4 + Shadcn/ui |
| State | Zustand 5 |
| Backend | Next.js 16 App Router |
| Database | PostgreSQL 15+ + Prisma 5 |
| Auth | NextAuth.js + JWT |
| Validation | Zod v4 |
| Testing | Vitest 4 + Playwright 1.58 |

---

## 6. Data Schema (Key Entities)

| Entity | Purpose |
|--------|---------|
| Organizations | Multi-tenant root |
| Users | Auth + RBAC (5 roles) |
| AI_Systems | Asset inventory |
| Frameworks | NIST, ISO, CSA, CIS, PCI metadata |
| Controls | Framework requirements (hierarchical) |
| ControlMappings | Cross-framework links |
| Risk_Assessments | Assessment snapshots |
| Risks | Individual risk records (5×5 matrix) |
| RiskControls | Risk ↔ Control junction |
| Evidence + EvidenceLinks | File metadata + hashes + polymorphic links |
| Tasks | Remediation tracking |
| Audit_Logs | Immutable action logs |
| ScheduledJobs | Cron-based report generation |
| SavedFilters | Per-user saved search filters |
| Invitations | Email invites with token acceptance |
| APIKeys | API key management (SHA-256 hashed) |
| Webhooks + WebhookDeliveries | Event-driven integrations |
| Notifications | In-app notification system |

---

## 7. MVP Phases

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **MVP1** | M1-3 | Dashboard + NIST + ISO 42001 + Risk Assessment | ✅ Complete |
| **MVP2** | M4-5 | CSA AICM + Evidence Management | ✅ Complete |
| **MVP3** | M6-7 | Security frameworks (CSF, CIS, PCI) | ✅ Complete |
| **MVP4** | M8-9 | Multi-tenant + Integrations | ✅ Complete |
| **MVP5** | M10-11 | Advanced analytics + ML insights | 🔄 Next |

---

## 8. User Roles

| Role | Access |
|------|--------|
| Admin | Full system access |
| Risk Manager | Create/edit assessments, approve treatments |
| Assessor | Create assessments, upload evidence |
| Auditor | Read-only, export reports |
| Viewer | Dashboard only |

---

## 9. Risk Scoring

**Formula:** `Residual = Inherent × (1 - Control Effectiveness)`

**5×5 Matrix Thresholds:**
| Score | Level | Action |
|-------|-------|--------|
| 1-4 | Low 🟢 | Monitor |
| 5-9 | Medium 🟡 | 90 days |
| 10-15 | High 🟠 | 30 days |
| 16-25 | Critical 🔴 | Immediate |

---

*Document Control: v3.0 | 70+ requirements (50+ FR + 20 NFR) | Last updated: 2026-02-04*
