# Framework Controls Reference

## Supported Frameworks (8)

### AI-Risk Frameworks

#### 1. NIST AI RMF 1.0 (2023)
**Scope:** AI trustworthiness, risk management lifecycle
**Structure:** 4 Functions → 19 Categories → 85+ Subcategories

| Function | Purpose | Key Categories |
|----------|---------|----------------|
| **GOVERN** | Accountability, culture | Policies, roles, risk culture, legal compliance |
| **MAP** | Context understanding | Use cases, data, dependencies, stakeholders |
| **MEASURE** | Assessment methods | Metrics, testing, bias detection, monitoring |
| **MANAGE** | Risk treatment | Mitigations, prioritization, improvement |

**Key Controls:**
| ID | Control | Description |
|----|---------|-------------|
| GOVERN-1 | Legal/regulatory compliance | Ensure AI complies with applicable laws |
| GOVERN-2 | Accountability structure | Define roles and responsibilities |
| MAP-1 | Use case documentation | Document intended use and limitations |
| MAP-2 | Data governance | Manage training/inference data quality |
| MEASURE-1 | Performance metrics | Define and track AI performance |
| MEASURE-2 | Bias/fairness testing | Test for discriminatory outcomes |
| MANAGE-1 | Risk prioritization | Rank and address risks systematically |
| MANAGE-2 | Incident response | Plan for AI failures and incidents |

---

#### 2. ISO/IEC 42001:2023
**Scope:** AI Management System (AIMS) certification
**Structure:** 10 Clauses + Annex A (38 controls)

| Clause | Focus |
|--------|-------|
| 4 | Context of organization |
| 5 | Leadership & commitment |
| 6 | Planning (risk assessment) |
| 7 | Support (resources, competence) |
| 8 | Operation (AI system lifecycle) |
| 9 | Performance evaluation |
| 10 | Improvement |

**Annex A Controls:**
| ID | Control | Description |
|----|---------|-------------|
| A.5.1 | AI policy | Establish AI governance policy |
| A.5.2 | Roles & responsibilities | Define AI accountability |
| A.6.1 | AI risk assessment | Systematic risk identification |
| A.6.2 | Risk treatment | Plan risk mitigation |
| A.7.1 | Data management | Data quality, privacy, governance |
| A.7.2 | Data for learning | Training data validation |
| A.8.1 | AI development lifecycle | Secure development practices |
| A.8.2 | AI testing & validation | Verify AI behavior |
| A.9.1 | Third-party AI | Manage external AI components |
| A.10.1 | AI system operation | Monitor production AI |

---

#### 3. CSA AICM (AI Controls Matrix)
**Scope:** Cloud-based AI security controls
**Structure:** 4 Domains → Control Objectives

| Domain | Focus | Key Controls |
|--------|-------|--------------|
| **Governance** | Policies, accountability, ethics | AI ethics policy, risk ownership |
| **Development** | Secure ML lifecycle, testing | Model validation, code security |
| **Operations** | Deployment, monitoring, incident | Drift detection, incident response |
| **Data** | Privacy, quality, lineage | Data classification, consent mgmt |

---

### AI Threat Frameworks

#### OWASP LLM Top 10 (2025)
**Scope:** Large Language Model security risks
**Structure:** 10 vulnerability categories

| ID | Risk | Description | Mitigation |
|----|------|-------------|------------|
| **LLM01** | Prompt Injection | Malicious prompts manipulate LLM behavior | Input validation, output filtering, sandboxing |
| **LLM02** | Insecure Output Handling | Unvalidated LLM output causes downstream issues | Output sanitization, encoding, validation |
| **LLM03** | Training Data Poisoning | Malicious data corrupts model behavior | Data provenance, validation pipelines |
| **LLM04** | Model Denial of Service | Resource exhaustion via complex queries | Rate limiting, resource caps, timeouts |
| **LLM05** | Supply Chain Vulnerabilities | Compromised models, plugins, or data | SBOM, provenance verification, signing |
| **LLM06** | Sensitive Info Disclosure | PII/secrets leaked in responses | PII filtering, output scanning, redaction |
| **LLM07** | Insecure Plugin Design | Plugins with excessive permissions | Least privilege, input validation, sandboxing |
| **LLM08** | Excessive Agency | AI takes unauthorized actions | Human-in-loop, action limits, approval gates |
| **LLM09** | Overreliance | Blind trust in AI outputs | Uncertainty display, disclaimers, verification |
| **LLM10** | Model Theft | Unauthorized model extraction | Access controls, monitoring, watermarking |

**Control Mapping:**
| OWASP LLM | NIST AI RMF | ISO 42001 | Mitigation Priority |
|-----------|-------------|-----------|---------------------|
| LLM01 | MANAGE-1 | A.8.2 | P0 - Critical |
| LLM02 | MANAGE-1 | A.8.2 | P1 - High |
| LLM03 | MAP-2 | A.7.2 | P1 - High |
| LLM04 | MANAGE-2 | A.10.1 | P2 - Medium |
| LLM05 | MAP-1 | A.9.1 | P1 - High |
| LLM06 | MAP-2 | A.7.1 | P0 - Critical |
| LLM07 | GOVERN-1 | A.5.2 | P1 - High |
| LLM08 | GOVERN-2 | A.5.2 | P0 - Critical |
| LLM09 | MEASURE-1 | A.8.2 | P2 - Medium |
| LLM10 | MANAGE-1 | A.8.1 | P1 - High |

---

#### MITRE ATLAS (Adversarial Threat Landscape for AI Systems)
**Scope:** AI/ML adversarial attack taxonomy
**Structure:** Tactics → Techniques → Procedures (TTPs)

**Tactics (Attack Phases):**
| ID | Tactic | Description |
|----|--------|-------------|
| AML.TA0001 | Reconnaissance | Gather info about target ML system |
| AML.TA0002 | Resource Development | Prepare attack infrastructure |
| AML.TA0003 | Initial Access | Gain entry to ML system |
| AML.TA0004 | ML Model Access | Access target model |
| AML.TA0005 | Execution | Run adversarial techniques |
| AML.TA0006 | Persistence | Maintain access to ML system |
| AML.TA0007 | Defense Evasion | Avoid detection |
| AML.TA0008 | Discovery | Learn about ML environment |
| AML.TA0009 | Collection | Gather ML artifacts |
| AML.TA0010 | ML Attack Staging | Prepare ML-specific attacks |
| AML.TA0011 | Exfiltration | Steal model or data |
| AML.TA0012 | Impact | Damage or manipulate system |

**Key Techniques:**
| ID | Technique | Description | Detection |
|----|-----------|-------------|-----------|
| AML.T0000 | Model Evasion | Craft inputs to cause misclassification | Anomaly detection, input validation |
| AML.T0001 | Model Inversion | Extract training data from model | Query monitoring, differential privacy |
| AML.T0002 | Model Stealing | Clone model via queries | Rate limiting, query monitoring |
| AML.T0003 | Data Poisoning | Corrupt training data | Data validation, provenance tracking |
| AML.T0004 | Backdoor Attack | Insert hidden trigger patterns | Model inspection, input sanitization |
| AML.T0005 | Prompt Injection | Manipulate LLM via inputs | Input filtering, output validation |
| AML.T0006 | Supply Chain Compromise | Attack ML dependencies | SBOM, integrity verification |

**ATLAS to Framework Mapping:**
| ATLAS Technique | OWASP LLM | NIST AI RMF | Control |
|-----------------|-----------|-------------|---------|
| Model Evasion | - | MEASURE-2 | Adversarial testing |
| Model Inversion | LLM06 | MAP-2 | Differential privacy |
| Model Stealing | LLM10 | MANAGE-1 | Access controls |
| Data Poisoning | LLM03 | MAP-2 | Data validation |
| Backdoor Attack | LLM03 | MEASURE-2 | Model inspection |
| Prompt Injection | LLM01 | MANAGE-1 | Input validation |
| Supply Chain | LLM05 | MAP-1 | SBOM, provenance |

---

### Security & Compliance Frameworks

#### 4. NIST CSF 2.0 (2024)
**Scope:** Cybersecurity risk management
**Structure:** 6 Functions → 23 Categories → 108 Subcategories

| Function | Purpose | Key Categories |
|----------|---------|----------------|
| **GOVERN** | Strategy, policy | Context, risk strategy, supply chain |
| **IDENTIFY** | Asset management | Asset inventory, risk assessment |
| **PROTECT** | Safeguards | Access control, awareness, data security |
| **DETECT** | Monitoring | Anomalies, continuous monitoring |
| **RESPOND** | Incident handling | Response planning, communications |
| **RECOVER** | Restoration | Recovery planning, improvements |

**Key Controls:**
| ID | Control | Description |
|----|---------|-------------|
| GV.RM | Risk management strategy | Define risk tolerance and approach |
| GV.SC | Supply chain risk | Manage third-party cyber risks |
| ID.AM | Asset management | Inventory hardware, software, data |
| ID.RA | Risk assessment | Identify and evaluate cyber risks |
| PR.AC | Access control | Manage identities and permissions |
| PR.DS | Data security | Protect data at rest and in transit |
| DE.CM | Continuous monitoring | Monitor for anomalies |
| RS.AN | Incident analysis | Analyze and contain incidents |
| RC.RP | Recovery planning | Restore operations after incidents |

---

#### 5. ISO 27001:2022
**Scope:** Information security management system
**Structure:** 10 Clauses + Annex A (93 controls, 4 themes)

| Theme | # Controls | Focus Areas |
|-------|-----------|-------------|
| Organizational | 37 | Policies, roles, asset mgmt, supplier |
| People | 8 | Screening, awareness, terms, discipline |
| Physical | 14 | Perimeters, equipment, media, utilities |
| Technological | 34 | Access, crypto, network, ops, dev |

**Key Controls:**
| ID | Control | Description |
|----|---------|-------------|
| A.5.1 | Information security policies | Establish and maintain policies |
| A.5.15 | Access control | Restrict access based on need |
| A.5.23 | Cloud service security | Secure cloud usage |
| A.8.2 | Privileged access rights | Manage admin accounts |
| A.8.9 | Configuration management | Secure system configurations |
| A.8.15 | Logging | Record security events |
| A.8.16 | Monitoring activities | Monitor for anomalies |
| A.8.24 | Cryptography | Use encryption appropriately |
| A.8.25 | Secure development | Build security into SDLC |
| A.8.28 | Secure coding | Follow secure coding practices |

---

#### 6. CIS Controls v8.1 (2024)
**Scope:** Prioritized cybersecurity actions
**Structure:** 18 Controls → Implementation Groups (IG1-IG3)

| IG | Description | Controls |
|----|-------------|----------|
| IG1 | Essential cyber hygiene | Basic controls for all orgs |
| IG2 | Foundational | Additional for sensitive data |
| IG3 | Comprehensive | Full implementation |

**Priority Controls:**
| # | Control | IG | Description |
|---|---------|-----|-------------|
| 1 | Enterprise asset inventory | IG1 | Know what you have |
| 2 | Software asset inventory | IG1 | Know what's installed |
| 3 | Data protection | IG1 | Classify and protect data |
| 4 | Secure configuration | IG1 | Harden systems |
| 5 | Account management | IG1 | Manage user accounts |
| 6 | Access control | IG1 | Implement least privilege |
| 7 | Continuous vulnerability mgmt | IG2 | Find and fix vulns |
| 8 | Audit log management | IG2 | Collect and review logs |
| 14 | Security awareness training | IG1 | Train users |
| 17 | Incident response | IG2 | Prepare for incidents |

---

#### 7. PCI DSS v4.0.1 (2024)
**Scope:** Payment card data security
**Structure:** 12 Requirements → 200+ sub-requirements

| Req | Focus | Key Areas |
|-----|-------|-----------|
| 1-2 | Network security | Firewalls, secure configs |
| 3-4 | Data protection | Storage encryption, transmission |
| 5-6 | Vulnerability mgmt | Malware protection, patching |
| 7-9 | Access control | Need-to-know, auth, physical |
| 10-11 | Monitoring & testing | Logging, pen testing |
| 12 | Policies & procedures | Security policies, training |

**Key Requirements:**
| Req | Control | Description |
|-----|---------|-------------|
| 3.5 | PAN protection | Protect primary account numbers |
| 4.2 | Encryption in transit | TLS for cardholder data |
| 6.4 | Change control | Manage changes to systems |
| 8.3 | MFA | Multi-factor for admin access |
| 10.2 | Audit logging | Log all access to cardholder data |
| 11.3 | Penetration testing | Annual pen tests |

---

#### 8. SCF v2025.4 (Secure Controls Framework)
**Scope:** Meta-framework, comprehensive controls
**Structure:** 32 Domains → 1000+ controls

**Key Domains:**
| Domain | Code | Focus |
|--------|------|-------|
| Asset Management | AST | Hardware, software, data inventory |
| Compliance | CPL | Regulatory adherence |
| Cryptography | CRY | Encryption, key management |
| Identity & Access | IAC | AuthN, AuthZ, privileged access |
| Incident Response | IRO | Detection, response, recovery |
| Privacy | PRI | Data protection, consent |
| Risk Management | RSK | Risk assessment, treatment |
| Technology Development | TDA | Secure SDLC, testing |
| AI & Machine Learning | AIM | AI governance, model risk |
| Third-Party | TPM | Vendor risk management |

---

## Control Mapping Matrix

### Cross-Framework Mappings

| Risk Area | NIST AI RMF | ISO 42001 | NIST CSF | ISO 27001 | CIS |
|-----------|-------------|-----------|----------|-----------|-----|
| AI Bias | MEASURE-2 | A.6.1 | - | - | - |
| Prompt Injection | MANAGE-1 | A.8.2 | PR.DS | A.8.28 | 16 |
| Data Privacy | MAP-2 | A.7.1 | PR.DS | A.5.34 | 3 |
| Access Control | - | - | PR.AC | A.8.2 | 5,6 |
| Encryption | - | - | PR.DS | A.8.24 | 3 |
| Logging | - | - | DE.CM | A.8.15 | 8 |
| Incident Response | MANAGE-2 | A.10.1 | RS | A.5.24 | 17 |
| Config Management | - | - | PR.IP | A.8.9 | 4 |
| Vulnerability Mgmt | - | - | ID.RA | A.8.8 | 7 |
| Third-Party Risk | MAP-1 | A.9.1 | GV.SC | A.5.19 | 15 |

### Mapping Confidence Levels

| Level | Meaning | Use Case |
|-------|---------|----------|
| **HIGH** | Expert-validated, well-documented | Audit-ready mappings |
| **MEDIUM** | Reasonable interpretation | Working mappings |
| **LOW** | Possible connection, needs validation | Exploratory |

---

## Risk-to-Control Quick Reference

| Risk Type | Primary Control | Framework Reference |
|-----------|-----------------|---------------------|
| AI Bias/Discrimination | Fairness testing, diverse data | NIST AI MEASURE-2, ISO 42001 A.6.1 |
| Prompt Injection | Input validation, output filtering | NIST AI MANAGE-1, OWASP LLM01 |
| Model Hallucination | Grounding, fact-checking | NIST AI MEASURE-1 |
| Data Poisoning | Data validation, provenance | ISO 42001 A.7.2 |
| Unauthorized Access | MFA, RBAC, least privilege | ISO 27001 A.8.2, CIS-5,6 |
| Data Breach | Encryption, DLP, logging | ISO 27001 A.8.24, CIS-3 |
| Insider Threat | Monitoring, access reviews | NIST CSF DE.CM, CIS-8 |
| Vendor Failure | Due diligence, contracts, monitoring | NIST CSF GV.SC, ISO 27001 A.5.19 |
| Compliance Violation | Policy, training, audit | PCI DSS 12, ISO 27001 A.5.1 |
| System Unavailability | DR/BCP, redundancy | NIST CSF RC.RP |

---

## Implementation Priority

### Quick Wins (30 days)
- Asset inventory (CIS-1,2)
- Access control review (CIS-5,6)
- Security awareness (CIS-14)
- Logging enabled (CIS-8)
- AI use case documentation (NIST AI MAP-1)

### Foundation (90 days)
- Risk assessment complete
- Key policies documented
- Vulnerability management active
- Incident response plan tested
- AI bias testing implemented

### Maturity (12 months)
- Full framework compliance
- Automated control monitoring
- Third-party risk program
- Continuous improvement cycle
- AI governance matured

---

## Quick Reference

```
AI Frameworks: NIST AI RMF | ISO 42001 | CSA AICM
Security Frameworks: NIST CSF 2.0 | ISO 27001 | CIS v8.1 | PCI DSS 4.0
Meta-Framework: SCF v2025.4

Control Types: Preventive | Detective | Corrective | Compensating

Priority Order:
1. Asset inventory (know what you have)
2. Access control (who can access what)
3. Data protection (classify and protect)
4. Logging/monitoring (see what's happening)
5. Incident response (be prepared)
```
