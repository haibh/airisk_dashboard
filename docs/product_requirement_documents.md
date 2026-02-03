# Product Requirement Document (PRD)
## AI Risk Management Intelligence Platform (AIRM-IP)

**Version:** 2.0 (Unified)
**Date:** 2026-02-03
**Status:** Approved for Development
**Format:** Markdown

---

## User Preferences (Confirmed)

| Decision | Choice |
|----------|--------|
| **Tech Stack** | React + TypeScript |
| **MVP Scope** | Core Dashboard + 2 Frameworks (NIST AI RMF, ISO 42001) |
| **Deployment** | Both (single org → multi-tenant ready) |
| **Language** | Bilingual (English / Vietnamese) |

---

## 1. Overview & Scope

### 1.1 Vision
Build a "Single Pane of Glass" platform that enables enterprises to manage AI risks end-to-end, automatically mapping the latest AI standards with traditional security frameworks, ensuring compliance and audit-readiness.

### 1.2 Core Goals
1.  **Unified Taxonomy:** Standardize risk terminology across NIST AI RMF, ISO 42001, and Security standards (NIST CSF, PCI DSS).
2.  **Actionable Assessment:** Transform complex regulatory texts into specific checklists and wizard-style assessment workflows.
3.  **Evidence-based:** Ensure every risk assessment is tied to specific, hash-verified evidence, moving beyond simple "tick-box" compliance.

### 1.3 Non-Goals (MVP Phase)
* **No MLOps Platform:** We are not building training pipelines or feature stores.
* **No SIEM Replacement:** We ingest alert signals but do not perform raw log analysis.
* **No Full ISO Text Hosting:** We store metadata and mapping logic only, due to copyright restrictions on ISO standards.

---

## 2. Knowledge Base Standards

The system must support the following specific framework versions:

| Category | Framework | Version / Effective Date | Notes |
| :--- | :--- | :--- | :--- |
| **AI Risk** | **NIST AI RMF** | Ver 1.0 (2023) + GenAI Profile (2024) | Core framework. |
| **AI Mgmt** | **ISO/IEC 42001** | 2023 Edition | Management System Standard (AIMS). |
| **AI Control**| **CSA AICM** | Ver 1.0 (Release 07/2025) | Critical for Cloud AI controls. |
| **Security** | **NIST CSF** | Ver 2.0 (02/2024) | Mapped to the new "Govern" function. |
| **Security** | **CIS Controls** | Ver 8.1 (06/2024) | Mapped to specific technical controls. |
| **Compliance**| **PCI DSS** | Ver 4.0.1 (Active) | Mandatory for Fintech/Payment AI. |

---

## 3. Functional Requirements

### 3.1 Module 1: Inventory & Discovery (FR-INV)
**Goal:** AI Asset Management - comprehensive tracking of all AI systems within the organization.

| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **FR-INV-01** | AI System Registry | CRUD operations for AI Systems with required fields: System Type (GenAI, ML, RPA), Data Classification (Public, Confidential, Restricted), Status (Pilot, Prod, Retired) | P0 |
| **FR-INV-02** | Data Classification Tagging | Tag AI systems with data sensitivity levels and regulatory scope (GDPR, CCPA, etc.) | P0 |
| **FR-INV-03** | System Lifecycle Tracking | Track lifecycle stages: Development → Pilot → Production → Deprecated → Retired | P0 |
| **FR-INV-04** | Owner/Stakeholder Assignment | Assign Business Owner, Technical Owner, Risk Owner, and Data Steward roles per system | P0 |
| **FR-INV-05** | AI-BOM (Bill of Materials) | Management of AI components: Base models, Training Data sources, 3rd-party APIs, Libraries | P1 |
| **FR-INV-06** | Risk Tier Classification | Automatic risk classification (High/Medium/Low) based on Context Questionnaire aligned with EU AI Act logic | P1 |

### 3.2 Module 2: Risk Assessment Engine (FR-RISK)
**Goal:** Execute risk assessments via standardized workflows with framework-specific templates.

| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **FR-RISK-01** | Risk Identification Wizard | Step-by-step wizard to identify and categorize AI-specific risks | P0 |
| **FR-RISK-02** | Impact × Likelihood Scoring | 5×5 risk matrix with configurable scales (see Appendix C for methodology) | P0 |
| **FR-RISK-03** | Risk Categories | Standard categories: Bias/Fairness, Privacy, Security, Reliability, Transparency, Accountability, Safety | P0 |
| **FR-RISK-04** | Framework Assessment Templates | Pre-built templates for NIST AI RMF (4 functions: Govern, Map, Measure, Manage) and ISO 42001 (Annex A controls) | P0 |
| **FR-RISK-05** | Inherent/Residual Risk Views | Display both inherent risk (before controls) and residual risk (after controls) scores | P0 |
| **FR-RISK-06** | Risk Register | Centralized register with ability to select from standard Taxonomy or define custom risks | P1 |
| **FR-RISK-07** | Scoring Formula | `Risk Score = (Likelihood × Impact) × (1 - Control Effectiveness)` with scale 1-5 (configurable) | P0 |

### 3.3 Module 3: Framework Mapping (FR-MAP)
**Goal:** Cross-framework mapping and compliance gap analysis.

| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **FR-MAP-01** | NIST AI RMF ↔ ISO 42001 Mapping | Many-to-many control mapping between NIST AI RMF functions and ISO 42001 Annex A controls | P0 |
| **FR-MAP-02** | AI ↔ Security Framework Mapping | Map AI frameworks to security frameworks (NIST CSF 2.0, CIS Controls v8.1) | P1 |
| **FR-MAP-03** | Compliance Gap Analysis | Visual gap analysis showing unmapped/partially satisfied controls per framework | P0 |
| **FR-MAP-04** | Framework Version Management | Support multiple framework versions with migration paths and deprecation tracking | P1 |
| **FR-MAP-05** | Crosswalk Confidence Scoring | Auto-suggest control satisfaction with confidence scores (High/Medium/Low) and rationale | P0 |

*Example:* If user selects "Access Control" (NIST CSF) → System auto-suggests "Satisfied" for corresponding ISO 42001 requirement with confidence score.

### 3.4 Module 4: Dashboard & Reporting (FR-DASH)
**Goal:** Executive and operational visualization with export capabilities.

| ID | Requirement | Description | Priority | Status |
|:---|:------------|:------------|:---------|:--------|
| **FR-DASH-01** | Executive Summary Dashboard | Risk heatmap, compliance radar chart, trend analysis, top risks widget | P0 | ✅ Implemented |
| **FR-DASH-02** | Framework Compliance Scorecard | Per-framework compliance percentage with drill-down to control level | P0 | ✅ Implemented |
| **FR-DASH-03** | Drill-Down Navigation | Click-through from summary metrics → detailed views → individual records | P0 | ✅ Implemented |
| **FR-DASH-04** | Report Export | Export to PDF, CSV, Excel, JSON formats for audit packs | P0 | ✅ Implemented |
| **FR-DASH-05** | Scheduled Report Generation | Configure automated report generation on schedule (daily/weekly/monthly) | P2 | ⏳ Deferred to MVP 2 |
| **FR-DASH-06** | Operational View | SLA breach tracking, technical control status, remediation progress | P1 | ⏳ Deferred to MVP 2 |

### 3.5 Module 5: Evidence Management (FR-EVID)
**Goal:** Auditable evidence collection with integrity verification.

| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **FR-EVID-01** | Evidence Upload with Hashing | Upload files/links with SHA-256 hash verification for integrity | P0 |
| **FR-EVID-02** | Link Evidence to Controls/Risks | Associate evidence with specific controls, risks, or assessments | P0 |
| **FR-EVID-03** | Evidence Review Workflow | Approval workflow for evidence: Submitted → Under Review → Approved/Rejected | P1 |
| **FR-EVID-04** | Audit Trail Logging | Immutable log of all evidence actions (upload, view, modify, delete) | P0 |
| **FR-EVID-05** | Evidence Expiration | Track evidence validity periods with renewal reminders | P2 |

### 3.6 Module 6: Workflow & Remediation (FR-WORK)
**Goal:** Risk treatment tracking and task management.

| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **FR-WORK-01** | Risk Treatment Workflow | Four treatment options: Accept (requires approval), Mitigate, Transfer, Avoid | P0 |
| **FR-WORK-02** | Task Creation & Assignment | Create remediation tasks and assign to users with role-based visibility | P0 |
| **FR-WORK-03** | Remediation Tracking | Track progress with due dates, status updates, and completion percentage | P0 |
| **FR-WORK-04** | Notification System | Email and in-app notifications for assignments, due dates, escalations | P1 |
| **FR-WORK-05** | Approval Workflows | Configurable approval chains for high-risk treatment decisions | P1 |

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance (NFR-PERF)
| ID | Requirement | Target | Priority |
|:---|:------------|:-------|:---------|
| **NFR-PERF-01** | Page Load Time | < 3 seconds for initial load, < 1.5s for subsequent navigation | P0 |
| **NFR-PERF-02** | API Response Time | < 500ms for 95th percentile requests | P0 |
| **NFR-PERF-03** | Dashboard Rendering | < 2 seconds for complex visualizations with 1000+ data points | P1 |
| **NFR-PERF-04** | Search Response | < 1 second for full-text search across all entities | P1 |

### 4.2 Security (NFR-SEC)
| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **NFR-SEC-01** | Role-Based Access Control | RBAC with roles: Admin, Risk Manager, Assessor, Auditor, Viewer | P0 |
| **NFR-SEC-02** | Encryption at Rest | AES-256 encryption for all stored data | P0 |
| **NFR-SEC-03** | Encryption in Transit | TLS 1.3 for all network communications | P0 |
| **NFR-SEC-04** | Tenant Isolation | Row-Level Security (RLS) in PostgreSQL for multi-tenant data isolation | P0 |
| **NFR-SEC-05** | Session Management | JWT with secure refresh token rotation, 30-min idle timeout | P0 |
| **NFR-SEC-06** | Audit Logging | Immutable audit logs for all user actions and data changes | P0 |

### 4.3 Scalability (NFR-SCALE)
| ID | Requirement | Target | Priority |
|:---|:------------|:-------|:---------|
| **NFR-SCALE-01** | AI System Capacity | Support 10,000+ AI systems per organization | P1 |
| **NFR-SCALE-02** | Concurrent Users | Support 100+ concurrent users with consistent performance | P1 |
| **NFR-SCALE-03** | Data Retention | Support 7+ years of assessment history for audit compliance | P1 |

### 4.4 Internationalization (NFR-I18N)
| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **NFR-I18N-01** | Bilingual Support | Full UI support for English (EN) and Vietnamese (VI) | P0 |
| **NFR-I18N-02** | i18n Framework | Use react-i18next with namespace separation for scalable translations | P0 |
| **NFR-I18N-03** | RTL Ready | Architecture ready for future RTL language support | P2 |
| **NFR-I18N-04** | Date/Number Formatting | Locale-aware formatting (EN: MM/DD/YYYY, VI: DD/MM/YYYY) | P0 |

### 4.5 Accessibility (NFR-ACCESS)
| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **NFR-ACCESS-01** | WCAG 2.1 AA | Compliance with WCAG 2.1 Level AA guidelines | P1 |
| **NFR-ACCESS-02** | Keyboard Navigation | Full keyboard accessibility for all interactive elements | P1 |
| **NFR-ACCESS-03** | Screen Reader Support | ARIA labels and semantic HTML for screen reader compatibility | P1 |
| **NFR-ACCESS-04** | Color Contrast | Minimum 4.5:1 contrast ratio for text elements | P1 |

### 4.6 API Standards (NFR-API)
| ID | Requirement | Description | Priority |
|:---|:------------|:------------|:---------|
| **NFR-API-01** | API First | All functionality exposed via REST API | P0 |
| **NFR-API-02** | OpenAPI Spec | Auto-generated OpenAPI 3.0 (Swagger) documentation | P0 |
| **NFR-API-03** | Versioning | URL-based API versioning (e.g., /api/v1/) | P0 |
| **NFR-API-04** | Rate Limiting | Configurable rate limits per endpoint and user role | P1 |

---

## 5. Technical Architecture

### 5.1 Tech Stack
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **React 18 + TypeScript** | Type safety, component reusability, large ecosystem |
| **UI Framework** | **Tailwind CSS + Shadcn/ui** | Utility-first styling, accessible component library |
| **State Management** | **Zustand** | Lightweight, TypeScript-friendly, minimal boilerplate |
| **Backend** | **Next.js API Routes** | Unified codebase, serverless-ready, excellent DX |
| **Database** | **PostgreSQL 15+** | ACID compliance, RLS support, JSON capabilities |
| **ORM** | **Prisma** | Type-safe queries, migrations, schema management |
| **Auth** | **NextAuth.js + JWT** | Flexible auth with RBAC support |
| **Infra** | **Docker + Cloud-agnostic** | Portable deployment (AWS, Azure, GCP, self-hosted) |

### 5.2 Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Browser   │  │   Mobile    │  │    API Consumers        │  │
│  │  (React)    │  │  (Future)   │  │    (Integrations)       │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Next.js (React + API Routes)                   │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │ │
│  │  │Dashboard │ │Assessment│ │Framework │ │ Evidence     │   │ │
│  │  │ Module   │ │ Engine   │ │ Mapping  │ │ Management   │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Middleware                               │ │
│  │  Auth │ RBAC │ Rate Limit │ i18n │ Audit Logging           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │   PostgreSQL     │  │   Redis Cache    │  │ File Storage  │  │
│  │   (Primary DB)   │  │   (Sessions)     │  │ (Evidence)    │  │
│  │   + RLS + Prisma │  │                  │  │               │  │
│  └──────────────────┘  └──────────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Deployment Architecture
- **Development:** Local Docker Compose
- **Staging/Production:** Docker containers on cloud provider (AWS ECS, Azure Container Apps, or GCP Cloud Run)
- **Database:** Managed PostgreSQL (RDS, Azure Database, Cloud SQL)
- **CDN:** CloudFront/Azure CDN for static assets
- **CI/CD:** GitHub Actions with automated testing and deployment

---

## 6. UI/UX Requirements

### 6.1 Design System
| Component | Specification |
|:----------|:--------------|
| **Component Library** | Shadcn/ui (built on Radix UI primitives) |
| **Styling** | Tailwind CSS with custom design tokens |
| **Icons** | Lucide React |
| **Charts** | Recharts or Tremor for data visualization |
| **Theme** | Dark/Light mode with system preference detection |

### 6.2 Key Screens

| Screen | Description | Priority |
|:-------|:------------|:---------|
| **Dashboard** | Executive summary with risk heatmap, compliance scores, trends | P0 |
| **AI System Registry** | List/Grid view of all AI systems with filters and search | P0 |
| **Risk Register** | Tabular view of risks with sorting, filtering, bulk actions | P0 |
| **Assessment Wizard** | Multi-step wizard for risk assessments (NIST/ISO templates) | P0 |
| **Framework Map** | Visual mapping between frameworks with gap analysis | P0 |
| **Evidence Library** | File browser with upload, preview, and linking capabilities | P1 |
| **Reports** | Report builder with template selection and export options | P1 |
| **Settings** | User profile, organization settings, framework configuration | P1 |

### 6.3 Responsive Design
- **Primary:** Desktop-first design (1280px+ optimal)
- **Secondary:** Tablet-friendly (768px - 1279px) with responsive tables
- **Future:** Mobile companion app for approvals and notifications

### 6.4 User Experience Principles
1. **Progressive Disclosure:** Show essential information first, details on demand
2. **Contextual Help:** Inline tooltips explaining framework terms and requirements
3. **Undo/Redo:** Support for reversible actions where possible
4. **Keyboard Shortcuts:** Power user shortcuts for common actions
5. **Empty States:** Helpful guidance when no data exists

---

## 7. Core Data Schema

Key Entities required in the Database:

| Entity | Description | Key Fields |
|:-------|:------------|:-----------|
| **Organizations** | Root Tenant | id, name, settings, created_at |
| **Users** | System users | id, org_id, email, role, language_pref |
| **AI_Systems** | Primary object for assessment | id, org_id, name, type, status, risk_tier, owner_id |
| **Frameworks** | Metadata for NIST, ISO, etc. | id, name, version, effective_date, is_active |
| **Controls** | Specific requirements per framework | id, framework_id, code, title, description |
| **Mappings** | Many-to-Many framework relationships | source_control_id, target_control_id, confidence_score, rationale |
| **Risk_Assessments** | Assessment snapshots | id, ai_system_id, framework_id, status, created_by |
| **Risks** | Individual risk records | id, assessment_id, category, likelihood, impact, inherent_score, residual_score |
| **Evidence** | Evidence metadata | id, filename, hash_sha256, storage_path, uploaded_by |
| **Evidence_Links** | Links evidence to entities | evidence_id, entity_type, entity_id |
| **Tasks** | Remediation tasks | id, risk_id, assignee_id, status, due_date |
| **Audit_Logs** | Immutable action logs | id, user_id, action, entity_type, entity_id, timestamp |

---

## 8. MVP Phasing

### 8.1 Phase Overview

| Phase | Focus | Key Deliverables |
|:------|:------|:-----------------|
| **MVP 1** | Core Foundation | Dashboard + NIST AI RMF + ISO 42001 + Basic Risk Assessment |
| **MVP 2** | Evidence & Controls | Add CSA AICM + Evidence Management + Control Library |
| **MVP 3** | Security Integration | Add NIST CSF, CIS Controls, PCI DSS mapping |
| **MVP 4** | Enterprise Scale | Multi-tenant, Advanced Reporting, API Integrations |

### 8.2 MVP 1 Detailed Scope (Primary Target)

**Duration:** Months 1-3

| Module | Features Included |
|:-------|:------------------|
| **Inventory** | FR-INV-01 through FR-INV-04 (System Registry, Classification, Lifecycle, Owners) |
| **Risk Assessment** | FR-RISK-01 through FR-RISK-05 (Wizard, 5×5 Matrix, Categories, Templates, Scoring) |
| **Framework Mapping** | FR-MAP-01, FR-MAP-03, FR-MAP-05 (NIST↔ISO mapping, Gap Analysis, Confidence) |
| **Dashboard** | FR-DASH-01 through FR-DASH-04 (Executive Dashboard, Scorecard, Drill-down, Export) |
| **Infrastructure** | Auth, RBAC (Admin, Risk Manager, Viewer), Bilingual UI (EN/VI) |

**Frameworks in MVP 1:**
- NIST AI RMF 1.0 (including GenAI Profile)
- ISO/IEC 42001:2023

### 8.3 MVP 2 Scope

**Duration:** Months 4-5

| Addition | Features |
|:---------|:---------|
| **CSA AICM** | Full CSA AI Controls Matrix integration |
| **Evidence** | FR-EVID-01 through FR-EVID-04 (Upload, Linking, Workflow, Audit Trail) |
| **Workflow** | FR-WORK-01 through FR-WORK-03 (Treatment, Tasks, Tracking) |

### 8.4 MVP 3 Scope

**Duration:** Months 6-7

| Addition | Features |
|:---------|:---------|
| **Security Frameworks** | NIST CSF 2.0, CIS Controls v8.1, PCI DSS 4.0.1 |
| **Cross-Mapping** | FR-MAP-02 (AI ↔ Security framework mapping) |
| **Advanced Reporting** | FR-DASH-05 (Scheduled Reports) |

### 8.5 MVP 4 Scope

**Duration:** Months 8-9

| Addition | Features |
|:---------|:---------|
| **Multi-Tenant** | Full multi-organization support with tenant isolation |
| **Integrations** | API for Jira, Slack, ServiceNow integration |
| **Advanced Features** | AI-assisted suggestions, Custom frameworks |

### 8.6 Roadmap Visualization

```
Month:    1    2    3    4    5    6    7    8    9
          ├────────────┼─────────┼─────────┼─────────┤
MVP 1:    ████████████│         │         │         │
          Dashboard + NIST AI RMF + ISO 42001       │
                      │         │         │         │
MVP 2:                │█████████│         │         │
          CSA AICM + Evidence Management  │         │
                      │         │         │         │
MVP 3:                │         │█████████│         │
          Security Frameworks + Advanced Reporting  │
                      │         │         │         │
MVP 4:                │         │         │█████████│
          Multi-tenant + Integrations + AI Assist   │
```

---

## 9. Next Steps for Agentic AI

To initiate the build, provide the following prompt to your AI Agent:

> "Act as a Senior Full-Stack Architect. Based on PRD v2.0, generate the following:
> 1.  **PostgreSQL Schema (Prisma):** Focus on the `Mappings` table for many-to-many framework relationships and RLS policies for `Organizations`.
> 2.  **Next.js Project Structure:** Follow feature-based architecture with TypeScript strict mode.
> 3.  **i18n Setup:** Configure react-i18next with EN/VI namespaces."

---

## Appendix A: Glossary of AI Risk Terms

| Term | Definition |
|:-----|:-----------|
| **AI System** | Any system that uses machine learning, deep learning, or algorithmic decision-making |
| **AI-BOM** | AI Bill of Materials - comprehensive list of components in an AI system |
| **Bias/Fairness Risk** | Risk of AI system producing discriminatory or inequitable outcomes |
| **Control** | Safeguard or countermeasure to reduce risk |
| **Control Effectiveness** | Measure of how well a control reduces risk (0-100%) |
| **Crosswalk** | Mapping between controls in different frameworks |
| **GenAI** | Generative AI systems (LLMs, image generation, etc.) |
| **Inherent Risk** | Risk level before any controls are applied |
| **Residual Risk** | Risk level after controls are applied |
| **Risk Appetite** | Amount of risk an organization is willing to accept |
| **Risk Register** | Centralized repository of identified risks |
| **Risk Treatment** | Response to risk: Accept, Mitigate, Transfer, or Avoid |
| **Transparency Risk** | Risk from lack of explainability or interpretability |

---

## Appendix B: Framework Version Reference

### B.1 NIST AI RMF 1.0 (2023)

**Four Core Functions:**
1. **GOVERN** - Organizational policies, roles, and culture for AI risk management
2. **MAP** - Context and impact assessment for AI systems
3. **MEASURE** - Quantitative and qualitative risk measurement
4. **MANAGE** - Risk treatment and continuous monitoring

**GenAI Profile (2024) Additions:**
- Additional considerations for generative AI risks
- Hallucination and confabulation risks
- Data provenance requirements

### B.2 ISO/IEC 42001:2023

**Management System Standard for AI (AIMS)**

**Key Annex A Control Areas:**
- A.2: Policies for AI
- A.3: AI system lifecycle
- A.4: Data management
- A.5: AI system development
- A.6: AI system operation
- A.7: AI system monitoring
- A.8: Supply chain and third parties
- A.9: Impact assessment

### B.3 Framework Mapping Priority

| Source Framework | Target Framework | MVP Phase |
|:-----------------|:-----------------|:----------|
| NIST AI RMF | ISO 42001 | MVP 1 |
| ISO 42001 | NIST AI RMF | MVP 1 |
| CSA AICM | NIST AI RMF | MVP 2 |
| CSA AICM | ISO 42001 | MVP 2 |
| NIST AI RMF | NIST CSF 2.0 | MVP 3 |
| NIST AI RMF | CIS Controls | MVP 3 |
| ISO 42001 | PCI DSS 4.0.1 | MVP 3 |

---

## Appendix C: Risk Scoring Methodology

### C.1 5×5 Risk Matrix Definition

**Likelihood Scale:**
| Level | Score | Description |
|:------|:------|:------------|
| Rare | 1 | < 10% probability in assessment period |
| Unlikely | 2 | 10-30% probability |
| Possible | 3 | 30-50% probability |
| Likely | 4 | 50-80% probability |
| Almost Certain | 5 | > 80% probability |

**Impact Scale:**
| Level | Score | Description |
|:------|:------|:------------|
| Negligible | 1 | Minimal impact, easily absorbed |
| Minor | 2 | Some impact, manageable with existing resources |
| Moderate | 3 | Significant impact, requires dedicated response |
| Major | 4 | Severe impact, threatens objectives |
| Catastrophic | 5 | Critical impact, existential threat |

### C.2 Risk Matrix Visualization

```
                         IMPACT
           │  1    │  2    │  3    │  4    │  5    │
     ──────┼───────┼───────┼───────┼───────┼───────┤
       5   │   5   │  10   │  15   │  20   │  25   │ ← Almost Certain
L    ──────┼───────┼───────┼───────┼───────┼───────┤
I      4   │   4   │   8   │  12   │  16   │  20   │ ← Likely
K    ──────┼───────┼───────┼───────┼───────┼───────┤
E      3   │   3   │   6   │   9   │  12   │  15   │ ← Possible
L    ──────┼───────┼───────┼───────┼───────┼───────┤
I      2   │   2   │   4   │   6   │   8   │  10   │ ← Unlikely
H    ──────┼───────┼───────┼───────┼───────┼───────┤
O      1   │   1   │   2   │   3   │   4   │   5   │ ← Rare
O    ──────┴───────┴───────┴───────┴───────┴───────┘
D
```

### C.3 Risk Rating Thresholds

| Score Range | Rating | Color | Action Required |
|:------------|:-------|:------|:----------------|
| 1-4 | Low | 🟢 Green | Accept or monitor |
| 5-9 | Medium | 🟡 Yellow | Mitigate within 90 days |
| 10-15 | High | 🟠 Orange | Mitigate within 30 days |
| 16-25 | Critical | 🔴 Red | Immediate action required |

### C.4 Residual Risk Calculation

```
Inherent Risk Score = Likelihood × Impact
Residual Risk Score = Inherent Risk Score × (1 - Control Effectiveness)
```

**Example:**
- Likelihood: 4 (Likely)
- Impact: 4 (Major)
- Inherent Risk: 4 × 4 = 16 (Critical)
- Control Effectiveness: 70%
- Residual Risk: 16 × (1 - 0.70) = 4.8 (Medium)

---

## Appendix D: User Roles and Permissions

| Role | Description | Key Permissions |
|:-----|:------------|:----------------|
| **Admin** | System administrator | Full access, user management, settings |
| **Risk Manager** | Risk management lead | Create/edit assessments, approve treatments |
| **Assessor** | Conducts assessments | Create assessments, upload evidence |
| **Auditor** | External/internal auditor | Read-only access, export reports |
| **Viewer** | General stakeholder | Read-only dashboard access |

---

## Appendix E: Document Methodology

### E.1 PRD Development Methodology

This PRD was developed following an **Agentic AI-Assisted Documentation** approach:

| Phase | Activities | Tools/Agents Used |
|:------|:-----------|:------------------|
| **1. Discovery** | Stakeholder interviews, user preference gathering | AskUserQuestion tool |
| **2. Research** | Framework analysis (NIST AI RMF, ISO 42001), industry best practices | WebSearch, WebFetch |
| **3. Planning** | Architecture decisions, tech stack selection, MVP scoping | Planning skill, EnterPlanMode |
| **4. Documentation** | PRD writing, section structuring, requirement specification | docs-manager agent, Edit tool |
| **5. Review** | Completeness validation, requirement traceability | Read tool, verification steps |

### E.2 Requirement Gathering Process

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Input    │────▶│  AI Processing  │────▶│  PRD Output     │
│                 │     │                 │     │                 │
│ • Preferences   │     │ • Analysis      │     │ • Functional    │
│ • Constraints   │     │ • Structuring   │     │ • Non-Functional│
│ • Goals         │     │ • Validation    │     │ • Architecture  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### E.3 Documentation Standards Applied

- **IEEE 830** - Software Requirements Specification guidelines
- **INVEST** - Independent, Negotiable, Valuable, Estimable, Small, Testable requirements
- **MoSCoW** - Priority classification (P0=Must, P1=Should, P2=Could)
- **Traceability** - Each requirement has unique ID for tracking

---

## Appendix F: Progress Tracking

### F.1 PRD Completion Status

| Section | Status | Completion % | Last Updated |
|:--------|:-------|:-------------|:-------------|
| 1. Overview & Scope | ✅ Complete | 100% | 2026-02-03 |
| 2. Knowledge Base Standards | ✅ Complete | 100% | 2026-02-03 |
| 3. Functional Requirements | ✅ Complete | 100% | 2026-02-03 |
| 4. Non-Functional Requirements | ✅ Complete | 100% | 2026-02-03 |
| 5. Technical Architecture | ✅ Complete | 100% | 2026-02-03 |
| 6. UI/UX Requirements | ✅ Complete | 100% | 2026-02-03 |
| 7. Core Data Schema | ✅ Complete | 100% | 2026-02-03 |
| 8. MVP Phasing | ✅ Complete | 100% | 2026-02-03 |
| 9. Next Steps | ✅ Complete | 100% | 2026-02-03 |
| Appendices A-D | ✅ Complete | 100% | 2026-02-03 |
| Appendices E-F | ✅ Complete | 100% | 2026-02-03 |

**Overall PRD Completion: 100%**

### F.2 Implementation Progress

| Phase | Target | Status | Progress |
|:------|:-------|:-------|:---------|
| **MVP 1** | Months 1-3 | 🟢 In Progress (Phase 6) | 95% |
| **MVP 2** | Months 4-5 | ⚪ Planned | 0% |
| **MVP 3** | Months 6-7 | ⚪ Planned | 0% |
| **MVP 4** | Months 8-9 | ⚪ Planned | 0% |

### F.3 Requirement Traceability Matrix

| Requirement ID | PRD Section | Implementation Status | Test Coverage |
|:---------------|:------------|:----------------------|:--------------|
| FR-INV-01 to 06 | 3.1 | ✅ Completed (Phase 3) | ⏳ Phase 7 |
| FR-RISK-01 to 07 | 3.2 | ✅ Completed (Phase 5) | ⏳ Phase 7 |
| FR-MAP-01 to 05 | 3.3 | ✅ Completed (Phase 4) | ⏳ Phase 7 |
| FR-DASH-01 to 04 | 3.4 | ✅ Completed (Phase 6) | ⏳ Phase 7 |
| FR-DASH-05 to 06 | 3.4 | ⏳ Deferred to MVP 2 | - |
| FR-EVID-01 to 05 | 3.5 | ⏳ Planned (MVP 2) | - |
| FR-WORK-01 to 05 | 3.6 | ⏳ Planned (MVP 2) | - |
| NFR-PERF-01 to 04 | 4.1 | ⏳ Phase 7 (In Progress) | ⏳ Phase 7 |
| NFR-SEC-01 to 06 | 4.2 | ✅ Completed (Phase 2) | ⏳ Phase 7 |
| NFR-SCALE-01 to 03 | 4.3 | ⏳ Phase 7 Review | - |
| NFR-I18N-01 to 04 | 4.4 | ✅ Completed (Phase 1) | ⏳ Phase 7 |
| NFR-ACCESS-01 to 04 | 4.5 | ⏳ Phase 7 Audit | - |
| NFR-API-01 to 04 | 4.6 | ⏳ Phase 7 (In Progress) | - |

---

## Appendix G: Changelog

### Version History

| Version | Date | Author | Changes |
|:--------|:-----|:-------|:--------|
| 1.0 | 2026-02-03 | Initial | Initial PRD draft with basic structure |
| 2.0 | 2026-02-03 | AI-Assisted | **Major update:** Complete rewrite with comprehensive requirements |

### Detailed Changelog

#### Version 2.0 (2026-02-03) - Current

**Added:**
- ✅ User Preferences section with confirmed decisions
- ✅ Complete Functional Requirements (6 modules, 34 requirements)
  - FR-INV: Inventory & Discovery (6 requirements)
  - FR-RISK: Risk Assessment Engine (7 requirements)
  - FR-MAP: Framework Mapping (5 requirements)
  - FR-DASH: Dashboard & Reporting (6 requirements)
  - FR-EVID: Evidence Management (5 requirements)
  - FR-WORK: Workflow & Remediation (5 requirements)
- ✅ Non-Functional Requirements (6 categories, 21 requirements)
  - Performance, Security, Scalability, i18n, Accessibility, API Standards
- ✅ Technical Architecture with diagram
- ✅ UI/UX Requirements section
- ✅ Expanded Core Data Schema (12 entities)
- ✅ Detailed MVP Phasing (4 phases with timeline visualization)
- ✅ Appendix A: Glossary (13 terms)
- ✅ Appendix B: Framework Version Reference
- ✅ Appendix C: Risk Scoring Methodology (5×5 matrix)
- ✅ Appendix D: User Roles and Permissions
- ✅ Appendix E: Document Methodology
- ✅ Appendix F: Progress Tracking
- ✅ Appendix G: Changelog

**Modified:**
- 📝 Updated tech stack from FastAPI to Next.js API Routes
- 📝 Restructured all FR tables with ID, Requirement, Description, Priority columns
- 📝 Enhanced Core Data Schema with detailed entity fields
- 📝 Updated Next Steps prompt for Full-Stack architecture

**Technical Specifications:**
- Document expanded from 127 lines to 600+ lines
- 34 functional requirements defined
- 21 non-functional requirements defined
- 4 MVP phases documented
- 7 appendices included

#### Version 1.0 (2026-02-03) - Initial

**Initial Release:**
- Basic PRD structure
- Overview and scope
- Knowledge base standards table
- Partial functional requirements
- Initial technical architecture
- Basic roadmap

---

*End of Document*

---

## Document Control

| Property | Value |
|:---------|:------|
| **Version** | 2.0 (Unified) |
| **Last Updated** | 2026-02-03 |
| **Status** | ✅ Approved for Development |
| **Total Requirements** | 55 (34 FR + 21 NFR) |
| **Total Lines** | 600+ |
| **Methodology** | Agentic AI-Assisted (docs-manager) |
| **Review Status** | Complete |

**Prepared Using:**
- ClaudeKit Engineer v2.9.1
- docs-manager agent
- planning skill

**Next Review Date:** Before MVP 1 Development Start