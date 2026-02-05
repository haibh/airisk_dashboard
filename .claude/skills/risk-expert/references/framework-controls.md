# Framework Controls Reference

## Supported Frameworks (8)

### AI-Risk Specific Frameworks

#### 1. NIST AI RMF 1.0
**Scope:** AI trustworthiness, risk management lifecycle
**Structure:** 4 Functions → 19 Categories → 85+ Subcategories

| Function | Purpose | Key Categories |
|----------|---------|----------------|
| **GOVERN** | Accountability, culture | Policies, roles, risk culture, legal compliance |
| **MAP** | Context understanding | Use cases, data, dependencies, stakeholders |
| **MEASURE** | Assessment methods | Metrics, testing, bias detection, monitoring |
| **MANAGE** | Risk treatment | Mitigations, prioritization, improvement |

**Key Controls:**
- GOVERN-1: Legal/regulatory compliance
- MAP-1: AI use case documentation
- MAP-2: Data governance practices
- MEASURE-2: Bias and fairness testing
- MANAGE-1: Risk prioritization

#### 2. ISO/IEC 42001:2023
**Scope:** AI Management System (AIMS)
**Structure:** 10 Clauses + Annex A Controls (38 controls)

| Clause | Focus |
|--------|-------|
| 4 | Context of organization |
| 5 | Leadership & commitment |
| 6 | Planning (risk assessment) |
| 7 | Support (resources, competence) |
| 8 | Operation (AI system lifecycle) |
| 9 | Performance evaluation |
| 10 | Improvement |

**Key Controls (Annex A):**
- A.5.1: AI policy
- A.6.1: AI risk assessment
- A.7.1: Data management
- A.8.1: AI system development
- A.9.1: Third-party AI

#### 3. CSA AICM (AI Controls Matrix)
**Scope:** Cloud-based AI security controls
**Structure:** 4 Domains → Control Objectives

| Domain | Focus |
|--------|-------|
| Governance | Policies, accountability, ethics |
| Development | Secure ML lifecycle, testing |
| Operations | Deployment, monitoring, incident |
| Data | Privacy, quality, lineage |

---

### Security & Compliance Frameworks

#### 4. NIST CSF 2.0
**Scope:** Cybersecurity risk management
**Structure:** 6 Functions → 23 Categories → 108 Subcategories

| Function | Purpose | Example Categories |
|----------|---------|-------------------|
| **GOVERN** | Strategy, policy | Organizational context, risk strategy |
| **IDENTIFY** | Asset management | Asset inventory, risk assessment |
| **PROTECT** | Safeguards | Access control, awareness, data security |
| **DETECT** | Monitoring | Anomalies, continuous monitoring |
| **RESPOND** | Incident handling | Response planning, communications |
| **RECOVER** | Restoration | Recovery planning, improvements |

**Key Controls:**
- GV.RM: Risk management strategy
- ID.AM: Asset management
- PR.AC: Access control
- DE.CM: Continuous monitoring
- RS.AN: Incident analysis

#### 5. ISO 27001:2022
**Scope:** Information security management system
**Structure:** 10 Clauses + Annex A (93 controls, 4 themes)

| Theme | Controls |
|-------|----------|
| Organizational | Policies, roles, asset mgmt (37) |
| People | Screening, awareness, terms (8) |
| Physical | Perimeters, equipment, media (14) |
| Technological | Access, crypto, network, ops (34) |

**Key Controls:**
- A.5.1: Information security policies
- A.8.2: Access rights management
- A.8.24: Cryptography
- A.8.9: Configuration management
- A.8.15: Logging

#### 6. CIS Controls v8.1
**Scope:** Prioritized cybersecurity actions
**Structure:** 18 Controls → Implementation Groups (IG1-IG3)

| # | Control | IG |
|---|---------|-----|
| 1 | Inventory of enterprise assets | IG1 |
| 2 | Inventory of software assets | IG1 |
| 3 | Data protection | IG1 |
| 4 | Secure configuration | IG1 |
| 5 | Account management | IG1 |
| 6 | Access control management | IG1 |
| 7 | Continuous vulnerability mgmt | IG2 |
| 8 | Audit log management | IG2 |
| 14 | Security awareness training | IG1 |
| 17 | Incident response | IG2 |

#### 7. PCI DSS v4.0.1
**Scope:** Payment card data security
**Structure:** 12 Requirements → 200+ sub-requirements

| Req | Focus |
|-----|-------|
| 1-2 | Network security (firewalls, configs) |
| 3-4 | Data protection (storage, transmission) |
| 5-6 | Vulnerability mgmt (malware, patching) |
| 7-9 | Access control (need-to-know, auth, physical) |
| 10-11 | Monitoring (logging, testing) |
| 12 | Policies & procedures |

#### 8. SCF v2025.4
**Scope:** Meta-framework, comprehensive controls
**Structure:** 32 Domains → 1000+ controls

**Key Domains:**
- AST: Asset management
- CPL: Compliance
- CRY: Cryptography
- IAC: Identity & access
- IRO: Incident response
- PRI: Privacy
- RSK: Risk management
- TDA: Technology development

---

## Control Mapping Types

| Type | Meaning | Example |
|------|---------|---------|
| **EQUIVALENT** | Same intent/outcome | ISO 27001 A.8.24 ↔ NIST CSF PR.DS-2 |
| **PARTIAL** | Covers subset | CIS-3 partially covers PCI-3 |
| **RELATED** | Conceptually linked | NIST AI MAP-1 related to ISO 42001 A.7.1 |
| **SUPERSET** | Source covers more | SCF-CRY superset of PCI-4 |
| **SUBSET** | Source covers less | Single control vs comprehensive |

## Confidence Levels

| Level | Meaning | Use |
|-------|---------|-----|
| **HIGH** | Expert-validated, well-documented | Audit-ready mappings |
| **MEDIUM** | Reasonable interpretation | Working mappings |
| **LOW** | Possible connection, needs validation | Exploratory |

---

## Quick Reference: Risk → Framework

| Risk Type | Primary Framework | Secondary |
|-----------|------------------|-----------|
| AI Bias | NIST AI RMF MEASURE-2 | ISO 42001 A.6.1 |
| Prompt Injection | NIST AI RMF MANAGE-1 | OWASP LLM01 |
| Data Privacy | ISO 42001 A.7.1 | NIST CSF PR.DS |
| Auth/Authz | ISO 27001 A.8.2 | CIS-5, CIS-6 |
| Encryption | ISO 27001 A.8.24 | PCI-4, CIS-3 |
| Logging | ISO 27001 A.8.15 | CIS-8, PCI-10 |
| Incident Response | NIST CSF RS | CIS-17 |
| Config Mgmt | ISO 27001 A.8.9 | CIS-4 |
