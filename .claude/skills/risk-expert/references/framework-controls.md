# Framework Controls Reference

## Supported Frameworks (25+)

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

### IT Governance & Service Management Frameworks

#### 9. SOC 2 Type II (AICPA)
**Scope:** Service organization controls for trust services
**Structure:** 5 Trust Services Criteria (TSC)

| TSC | Focus | Key Requirements |
|-----|-------|------------------|
| **Security** (CC) | Protection against unauthorized access | Access controls, encryption, monitoring, incident response |
| **Availability** | System uptime and performance | SLAs, redundancy, capacity planning, DR/BCP |
| **Processing Integrity** | Accurate, complete, timely processing | Data validation, QA, error handling |
| **Confidentiality** | Protection of confidential info | Classification, encryption, access limits, disposal |
| **Privacy** | Personal data handling | Notice, consent, collection, retention, disposal |

**Common Criteria (Security):**
| ID | Control | Description |
|----|---------|-------------|
| CC1 | Control environment | Governance, ethics, accountability |
| CC2 | Communication & info | Internal/external communication |
| CC3 | Risk assessment | Risk identification and analysis |
| CC4 | Monitoring | Ongoing evaluation of controls |
| CC5 | Control activities | Policies and procedures |
| CC6 | Logical/physical access | Access control implementation |
| CC7 | System operations | Change management, incident response |
| CC8 | Change management | System changes, testing |
| CC9 | Risk mitigation | Vendor management, business disruption |

**Type I vs Type II:**
- Type I: Point-in-time design assessment
- Type II: 6-12 month operating effectiveness (preferred)

---

#### 10. COBIT 2019 (ISACA)
**Scope:** IT governance and management
**Structure:** 6 Principles → 40 Governance/Management Objectives → 5 Domains

| Domain | Code | Focus | Objectives |
|--------|------|-------|------------|
| **Evaluate, Direct, Monitor** | EDM | Governance | EDM01-05 |
| **Align, Plan, Organize** | APO | Strategy, architecture | APO01-14 |
| **Build, Acquire, Implement** | BAI | Solutions, changes | BAI01-11 |
| **Deliver, Service, Support** | DSS | Operations, security | DSS01-06 |
| **Monitor, Evaluate, Assess** | MEA | Performance, compliance | MEA01-04 |

**Key Governance Objectives:**
| ID | Objective | Description |
|----|-----------|-------------|
| EDM01 | Ensured governance framework | Governance structure and principles |
| EDM02 | Ensured benefits delivery | Value realization from IT |
| EDM03 | Ensured risk optimization | Risk appetite and tolerance |
| EDM04 | Ensured resource optimization | Resource allocation |
| EDM05 | Ensured stakeholder engagement | Transparency and reporting |

**Key Management Objectives:**
| ID | Objective | Description |
|----|-----------|-------------|
| APO12 | Managed risk | Enterprise IT risk management |
| APO13 | Managed security | Information security program |
| BAI06 | Managed IT changes | Change control process |
| DSS05 | Managed security services | Security operations |
| MEA03 | Managed compliance | Regulatory compliance |

**Design Factors:** Enterprise strategy, goals, risk profile, IT issues, threat landscape, compliance requirements, IT role, sourcing model, implementation methods, technology adoption, enterprise size.

---

#### 11. NIST SP 800-53 Rev 5 (2020)
**Scope:** Federal information system security and privacy controls
**Structure:** 20 Control Families → 1,189 Controls → 3 Baselines (Low/Mod/High)

| Family | Code | # Controls | Focus |
|--------|------|------------|-------|
| Access Control | AC | 25 | Identity, authentication, authorization |
| Awareness & Training | AT | 6 | Security training, awareness |
| Audit & Accountability | AU | 16 | Logging, monitoring, retention |
| Assessment & Authorization | CA | 9 | Security assessment, authorization |
| Configuration Management | CM | 14 | Baselines, change control |
| Contingency Planning | CP | 13 | Backup, recovery, DR |
| Identification & Auth | IA | 12 | MFA, credential management |
| Incident Response | IR | 10 | Detection, handling, reporting |
| Maintenance | MA | 7 | System maintenance, tools |
| Media Protection | MP | 8 | Media handling, sanitization |
| Physical & Environmental | PE | 23 | Physical security, environmental |
| Planning | PL | 11 | Security planning, rules of behavior |
| Program Management | PM | 32 | Program-level controls |
| Personnel Security | PS | 9 | Screening, termination, transfer |
| PII Processing | PT | 8 | Privacy-specific controls |
| Risk Assessment | RA | 10 | Vulnerability scanning, risk analysis |
| System & Services Acquisition | SA | 23 | SDLC, supply chain |
| System & Comms Protection | SC | 51 | Encryption, network segmentation |
| System & Info Integrity | SI | 23 | Malware, patching, monitoring |
| Supply Chain Risk Mgmt | SR | 12 | SCRM program |

**Control Baselines:**
| Baseline | Use Case | # Controls |
|----------|----------|------------|
| Low | Low-impact systems | ~156 |
| Moderate | Most federal systems | ~325 |
| High | High-value assets | ~421 |

**Key Controls for AI Systems:**
| ID | Control | AI Relevance |
|----|---------|--------------|
| AC-6 | Least privilege | AI agent permissions |
| AU-6 | Audit review | AI decision logging |
| CA-7 | Continuous monitoring | Model drift detection |
| CM-3 | Config change control | Model versioning |
| IR-4 | Incident handling | AI failure response |
| RA-5 | Vulnerability scanning | AI-specific vuln assessment |
| SA-11 | Developer testing | AI testing requirements |
| SI-4 | System monitoring | AI behavior monitoring |

---

#### 12. ITIL v4 (2019)
**Scope:** IT service management best practices
**Structure:** Service Value System (SVS) → 34 Practices

**Service Value Chain:**
| Activity | Purpose |
|----------|---------|
| Plan | Shared understanding of vision, status, direction |
| Improve | Continual improvement of products, services, practices |
| Engage | Stakeholder needs understanding |
| Design & Transition | Meet stakeholder expectations |
| Obtain/Build | Ensure service components available |
| Deliver & Support | Meet agreed specifications and expectations |

**Key Practices:**
| Practice | Category | Focus |
|----------|----------|-------|
| Information security mgmt | General | Security policies, controls |
| Risk management | General | Risk identification, assessment |
| Incident management | Service | Restore normal service |
| Problem management | Service | Root cause analysis |
| Change enablement | Service | Manage changes safely |
| Service continuity mgmt | Service | DR/BCP capabilities |
| Monitoring & event mgmt | Technical | Real-time monitoring |
| Deployment management | Technical | Release deployment |

**Guiding Principles:**
1. Focus on value
2. Start where you are
3. Progress iteratively with feedback
4. Collaborate and promote visibility
5. Think and work holistically
6. Keep it simple and practical
7. Optimize and automate

---

#### 13. ITIL v5 (2025 Preview)
**Scope:** Digital-first IT service management
**Structure:** Enhanced SVS + AI/Cloud integration

**Key Enhancements over v4:**
| Area | Enhancement |
|------|-------------|
| AI Integration | AI-assisted service management, AIOps |
| Cloud-native | Multi-cloud, containerization, serverless |
| DevOps alignment | Deeper CI/CD integration |
| Sustainability | Green IT, carbon footprint |
| Value streams | Enhanced value stream mapping |
| Automation | Hyperautomation practices |

**New/Enhanced Practices:**
- AI Operations (AIOps) management
- Platform engineering
- Site reliability engineering (SRE)
- FinOps (cloud financial management)
- Sustainability management

---

### AI Governance Frameworks (Industry)

#### 14. Google SAIF (Secure AI Framework)
**Scope:** Enterprise AI system security
**Structure:** 6 Core Elements

| Element | Focus | Key Actions |
|---------|-------|-------------|
| **Expand security foundations** | Extend security to AI | Apply existing controls to ML pipelines |
| **Extend detection & response** | AI-specific threats | ML-aware SOC, AI incident response |
| **Automate defenses** | Scale protection | Automated model validation, drift detection |
| **Harmonize platform controls** | Consistent security | Unified AI security across platforms |
| **Adapt controls for AI** | AI-specific risks | Prompt injection, data poisoning defenses |
| **Contextualize AI risks** | Business alignment | Risk assessment in business context |

**Implementation Guidance:**
| Phase | Activities |
|-------|------------|
| Foundation | Inventory AI systems, baseline security assessment |
| Detection | Deploy AI-specific monitoring, threat intelligence |
| Response | AI incident playbooks, model rollback procedures |
| Automation | Automated testing, continuous validation |
| Governance | Policies, roles, accountability for AI security |

**SAIF to NIST AI RMF Mapping:**
| SAIF Element | NIST AI RMF Function |
|--------------|---------------------|
| Expand foundations | GOVERN, MAP |
| Detection & response | MANAGE |
| Automate defenses | MEASURE |
| Platform controls | GOVERN |
| Adapt controls | MANAGE |
| Contextualize risks | MAP |

---

#### 15. Microsoft Responsible AI Standard v2 (2022)
**Scope:** Responsible AI development and deployment
**Structure:** 6 Principles → Goals → Requirements

| Principle | Goals | Key Requirements |
|-----------|-------|------------------|
| **Fairness** | Allocation, quality of service | Assess/mitigate unfair impacts, demographic analysis |
| **Reliability & Safety** | Reliable operation | Testing, monitoring, human oversight |
| **Privacy & Security** | Data protection | Privacy by design, security controls |
| **Inclusiveness** | Accessible to all | Accessibility, diverse representation |
| **Transparency** | Understandable AI | Documentation, explainability |
| **Accountability** | Human oversight | Governance, impact assessments |

**Sensitive Use Cases (Additional Scrutiny):**
- Criminal justice
- Employment decisions
- Healthcare diagnosis
- Financial services
- Child safety
- Government services

**Implementation Requirements:**
| Phase | Requirements |
|-------|--------------|
| Impact Assessment | Identify stakeholders, potential harms, benefits |
| Data | Data quality, provenance, bias assessment |
| Development | Fairness testing, red teaming, documentation |
| Deployment | Human oversight, monitoring, feedback loops |
| Operations | Incident response, continuous monitoring |

---

### Privacy Frameworks

#### 16. NIST Privacy Framework 1.0 (2020)
**Scope:** Privacy risk management
**Structure:** 5 Functions → 18 Categories → 100 Subcategories

| Function | Purpose | Key Categories |
|----------|---------|----------------|
| **Identify-P** | Understanding | Inventory, data processing ecosystem, risk assessment |
| **Govern-P** | Governance | Policies, roles, monitoring, review |
| **Control-P** | Management | Data processing policies, consent, access |
| **Communicate-P** | Transparency | Communication policies, data processing awareness |
| **Protect-P** | Safeguards | Data protection, identity management, security |

**Key Categories:**
| ID | Category | Description |
|----|----------|-------------|
| ID.IM | Inventory & mapping | Data inventory, processing activities |
| ID.BE | Business environment | Data processing role, third parties |
| ID.RA | Risk assessment | Privacy risk analysis |
| GV.PO | Governance policies | Privacy policies and procedures |
| CT.DP | Data processing management | Purpose limitation, consent |
| CT.DM | Data minimization | Collection, retention limits |
| CM.AW | Communication awareness | Privacy notices, transparency |
| PR.DS | Data security | Encryption, access controls |
| PR.AC | Identity management | Authentication, authorization |

**Relationship to NIST CSF:**
- Designed to complement NIST CSF
- Shared functions: Identify, Protect
- Privacy-specific: Govern-P, Control-P, Communicate-P
- Integration point: PR (Protect) function

---

#### 17. ISO/IEC 27701:2025
**Scope:** Privacy Information Management System (PIMS)
**Structure:** Extension to ISO 27001 + Privacy-specific controls

**Key Changes in 2025 Edition:**
| Change | Description |
|--------|-------------|
| Standalone option | Can be certified independently |
| AI/Analytics | Privacy considerations for AI systems |
| Global transfers | Enhanced cross-border data flow guidance |
| Third-party | Stronger processor/sub-processor requirements |

**Structure:**
| Clause | Focus |
|--------|-------|
| 5 | PIMS-specific requirements |
| 6 | PIMS guidance for ISO 27001 |
| 7 | Additional guidance for controllers |
| 8 | Additional guidance for processors |
| Annex A | Controller controls (31) |
| Annex B | Processor controls (18) |

**Key Controller Controls (Annex A):**
| ID | Control | Description |
|----|---------|-------------|
| A.7.2.1 | Purpose identification | Document processing purposes |
| A.7.2.2 | Lawful basis | Identify legal basis |
| A.7.3.1 | Consent | Obtain and record consent |
| A.7.3.6 | Data subject rights | Rights fulfillment process |
| A.7.4.1 | Collection limitation | Minimize data collection |
| A.7.4.5 | Retention | Retention and disposal policies |
| A.7.5.1 | Third-party transfers | Transfer safeguards |

**Regulatory Mapping:**
| ISO 27701 | GDPR | CCPA/CPRA |
|-----------|------|-----------|
| A.7.2.2 | Art. 6 (Lawful basis) | §1798.100 (Purpose) |
| A.7.3.1 | Art. 7 (Consent) | §1798.120 (Opt-out) |
| A.7.3.6 | Art. 15-22 (Rights) | §1798.105-125 (Rights) |
| A.7.4.5 | Art. 5(1)(e) (Retention) | §1798.105 (Deletion) |

---

#### 18. HIPAA Security Rule (45 CFR 164)
**Scope:** Protected Health Information (PHI) in US healthcare
**Structure:** 3 Safeguard Categories → 54 Implementation Specifications

| Category | Focus | Specifications |
|----------|-------|----------------|
| **Administrative** | Policies, procedures, workforce | 12 standards, 22 specifications |
| **Physical** | Facility, workstation, device | 4 standards, 10 specifications |
| **Technical** | Access, audit, integrity, transmission | 5 standards, 9 specifications |

**Administrative Safeguards (§164.308):**
| Standard | Key Requirements |
|----------|-----------------|
| Security management process | Risk analysis, risk management, sanctions, review |
| Workforce security | Authorization, clearance, termination |
| Information access management | Access authorization, establishment, modification |
| Security awareness training | Reminders, malware protection, login monitoring, password mgmt |
| Security incident procedures | Response and reporting |
| Contingency plan | Data backup, DR, emergency operations, testing |
| Evaluation | Periodic assessment |
| Business associate contracts | BAA requirements |

**Technical Safeguards (§164.312):**
| Standard | Key Requirements |
|----------|-----------------|
| Access control | Unique user ID, emergency access, auto logoff, encryption |
| Audit controls | Logging of PHI access |
| Integrity | ePHI alteration/destruction detection |
| Authentication | Person/entity verification |
| Transmission security | Integrity controls, encryption |

**Required vs Addressable:**
- **Required (R):** Must be implemented
- **Addressable (A):** Assess and implement if reasonable; document alternatives

**HIPAA for AI Systems:**
| Consideration | Requirement |
|---------------|-------------|
| PHI in training data | Must comply with minimum necessary |
| AI vendor as BA | Business Associate Agreement required |
| De-identification | Follow Safe Harbor or Expert Determination |
| Audit logging | Log AI access to PHI |
| Access controls | Role-based access for AI systems |

---

### Emerging Regulations (2024-2026)

#### 19. NIS2 Directive (EU 2022/2555)
**Scope:** Cybersecurity for essential and important entities
**Effective:** October 17, 2024 (member state transposition)
**Sectors:** 18 critical sectors

| Category | Sectors |
|----------|---------|
| **Essential** | Energy, transport, banking, health, water, digital infrastructure, ICT service management, public admin, space |
| **Important** | Postal, waste, chemicals, food, manufacturing, digital providers, research |

**10 Minimum Measures (Article 21):**
| # | Measure | Description |
|---|---------|-------------|
| 1 | Risk analysis & security policies | Document risk management approach |
| 2 | Incident handling | Detection, response, recovery |
| 3 | Business continuity | Crisis management, backup, DR |
| 4 | Supply chain security | Third-party risk management |
| 5 | Secure acquisition & development | Security in procurement and SDLC |
| 6 | Effectiveness assessment | Testing and measuring controls |
| 7 | Cyber hygiene & training | Basic security practices, awareness |
| 8 | Cryptography | Encryption policies |
| 9 | HR security & access control | Personnel security, IAM |
| 10 | MFA & secure communications | Authentication, emergency comms |

**Incident Reporting:**
| Timeline | Requirement |
|----------|-------------|
| 24 hours | Early warning to CSIRT |
| 72 hours | Incident notification with assessment |
| 1 month | Final report with root cause |

**Penalties:**
| Entity Type | Maximum Fine |
|-------------|--------------|
| Essential | €10M or 2% global turnover |
| Important | €7M or 1.4% global turnover |

**Management Liability:** Personal liability for management bodies.

---

#### 20. Cyber Resilience Act (CRA) - EU
**Scope:** Products with digital elements
**Effective:** December 10, 2024 (obligations from December 11, 2027)

**Product Categories:**
| Category | Examples | Assessment |
|----------|----------|------------|
| Default | Most software, IoT devices | Self-assessment |
| Important Class I | Password managers, VPNs, firewalls | Harmonized standard or third-party |
| Important Class II | Hypervisors, PKI, SIEM | Third-party assessment |
| Critical | Smart meters, HSMs, smart cards | EU certification |

**Essential Requirements:**
| Area | Requirements |
|------|--------------|
| **Security by design** | Secure default config, no known vulns, encryption |
| **Vulnerability handling** | CVE process, coordinated disclosure |
| **Security updates** | Free updates for support period |
| **Documentation** | Technical documentation, SBOM |
| **Incident reporting** | 24h notification of exploited vulns |

**Manufacturer Obligations:**
| Obligation | Description |
|------------|-------------|
| Conformity assessment | Before market placement |
| CE marking | Compliance indicator |
| SBOM | Software bill of materials |
| Support period | Minimum 5 years (default) |
| Vulnerability reporting | 24h to ENISA |

**Penalties:**
| Violation | Maximum Fine |
|-----------|--------------|
| Essential requirements | €15M or 2.5% global turnover |
| Other obligations | €10M or 2% global turnover |
| Incorrect information | €5M or 1% global turnover |

---

#### 21. AI Liability Directive (EU) - Proposed
**Scope:** Civil liability for AI-caused damage
**Status:** Proposed (expected 2025-2026)

**Key Provisions:**
| Provision | Description |
|-----------|-------------|
| Presumption of causality | AI output presumed to cause damage if fault shown |
| Disclosure of evidence | Courts can order AI providers to disclose evidence |
| Burden of proof | Shifted to defendant for high-risk AI |
| Fault-based liability | Extends existing liability rules to AI |

**Relationship to AI Act:**
| AI Act | Liability Directive |
|--------|---------------------|
| Defines high-risk AI | Uses same classification |
| Sets compliance requirements | Non-compliance = presumed fault |
| Requires documentation | Documentation discoverable |

**Implications for AI Developers:**
- Maintain comprehensive documentation
- Implement AI Act compliance
- Establish incident response
- Consider liability insurance

---

#### 22. CMMC 2.0 (2024)
**Scope:** US DoD contractor cybersecurity maturity
**Structure:** 3 Levels (simplified from CMMC 1.0's 5 levels)

| Level | Controls | Assessment | Applicability |
|-------|----------|------------|---------------|
| Level 1 | 17 (FCI) | Self-assessment | Federal Contract Info |
| Level 2 | 110 (CUI) | Third-party or self | Controlled Unclassified Info |
| Level 3 | 134 | Government-led | Critical programs |

**Level 1 - Foundational (17 controls):**
- Access control basics
- Identification & authentication
- Media protection
- Physical protection
- System & communications protection
- System & information integrity

**Level 2 - Advanced (110 controls from NIST 800-171):**
| Domain | # Controls |
|--------|------------|
| Access Control | 22 |
| Awareness & Training | 3 |
| Audit & Accountability | 9 |
| Configuration Management | 9 |
| Identification & Authentication | 11 |
| Incident Response | 3 |
| Maintenance | 6 |
| Media Protection | 9 |
| Personnel Security | 2 |
| Physical Protection | 6 |
| Risk Assessment | 3 |
| Security Assessment | 4 |
| System & Communications | 16 |
| System & Information Integrity | 7 |

**Assessment Requirements:**
| Level | Assessor | Frequency |
|-------|----------|-----------|
| 1 | Self-assessment | Annual |
| 2 | C3PAO (third-party) | Triennial |
| 3 | DIBCAC (government) | Triennial |

---

#### 23. SEC Cybersecurity Disclosure Rules (2023)
**Scope:** US public company cyber incident and risk disclosure
**Effective:** December 18, 2023

**Form 8-K (Incident Disclosure):**
| Requirement | Detail |
|-------------|--------|
| Trigger | Material cybersecurity incident |
| Timeline | 4 business days |
| Content | Nature, scope, timing, material impact |
| Delay | Only for national security/public safety |

**Form 10-K (Annual Disclosure):**
| Section | Required Disclosure |
|---------|---------------------|
| Risk management | Processes for assessing, identifying, managing cyber risks |
| Strategy | Integration of cyber risk into overall risk management |
| Governance | Board oversight of cyber risks |
| Management | Management's role in cyber risk assessment |

**Materiality Considerations:**
| Factor | Assessment |
|--------|------------|
| Financial impact | Quantifiable losses, costs |
| Operational impact | Business disruption |
| Reputational harm | Customer trust, brand damage |
| Litigation risk | Legal exposure |
| Regulatory impact | Compliance implications |

---

#### 24. CISA Cybersecurity Performance Goals (CPGs) 2024
**Scope:** Baseline cybersecurity practices for critical infrastructure
**Structure:** 8 Areas → 38 Goals

| Area | # Goals | Focus |
|------|---------|-------|
| Account Security | 6 | MFA, password policies, access control |
| Device Security | 7 | Asset inventory, secure config, patching |
| Data Security | 5 | Encryption, backup, data protection |
| Governance & Training | 5 | Leadership, awareness, policies |
| Vulnerability Management | 5 | Scanning, remediation, testing |
| Supply Chain | 4 | Vendor management, SBOM |
| Response & Recovery | 4 | Incident response, DR/BCP |
| Other | 2 | OT security, email security |

**Priority Goals:**
| ID | Goal | Priority |
|----|------|----------|
| 1.A | MFA | Essential |
| 1.B | Strong passwords | Essential |
| 2.A | Asset inventory | Essential |
| 2.E | Patching | Essential |
| 3.A | Log collection | Essential |
| 6.A | Incident reporting | Essential |
| 7.A | Backup | Essential |
| 8.A | Vendor risk | Essential |

**CISA CPG to NIST CSF Mapping:**
| CPG Area | NIST CSF Function |
|----------|-------------------|
| Account Security | Protect (PR.AC) |
| Device Security | Identify (ID.AM), Protect |
| Data Security | Protect (PR.DS) |
| Vulnerability Mgmt | Identify (ID.RA), Protect |
| Response & Recovery | Respond, Recover |

---

## Control Mapping Matrix

### Cross-Framework Mappings

| Risk Area | NIST AI RMF | ISO 42001 | NIST CSF | ISO 27001 | CIS | SOC 2 | NIST 800-53 |
|-----------|-------------|-----------|----------|-----------|-----|-------|-------------|
| AI Bias | MEASURE-2 | A.6.1 | - | - | - | - | - |
| Prompt Injection | MANAGE-1 | A.8.2 | PR.DS | A.8.28 | 16 | CC6 | SI-10 |
| Data Privacy | MAP-2 | A.7.1 | PR.DS | A.5.34 | 3 | Privacy | PT-2 |
| Access Control | - | - | PR.AC | A.8.2 | 5,6 | CC6 | AC-2,3 |
| Encryption | - | - | PR.DS | A.8.24 | 3 | CC6 | SC-13 |
| Logging | - | - | DE.CM | A.8.15 | 8 | CC7 | AU-2,3 |
| Incident Response | MANAGE-2 | A.10.1 | RS | A.5.24 | 17 | CC7 | IR-4 |
| Config Management | - | - | PR.IP | A.8.9 | 4 | CC8 | CM-2,3 |
| Vulnerability Mgmt | - | - | ID.RA | A.8.8 | 7 | CC7 | RA-5 |
| Third-Party Risk | MAP-1 | A.9.1 | GV.SC | A.5.19 | 15 | CC9 | SA-9 |
| Business Continuity | - | - | RC.RP | A.5.30 | - | A1 | CP-2 |
| PHI/Healthcare | - | - | PR.DS | - | - | Privacy | - |

### Regulatory Cross-Reference

| Requirement | NIS2 | DORA | CRA | CMMC | SEC Rules |
|-------------|------|------|-----|------|-----------|
| Risk Assessment | Art.21(a) | Art.6 | - | RA | 10-K |
| Incident Reporting | Art.23 | Art.19 | Art.14 | IR | 8-K (4 days) |
| Supply Chain | Art.21(d) | Art.28 | Art.13 | SR | 10-K |
| Vulnerability Mgmt | Art.21(e) | Art.8 | Art.11 | RA-5 | - |
| Business Continuity | Art.21(c) | Art.11 | - | CP | - |
| Encryption | Art.21(h) | Art.9 | Annex I | SC | - |
| Access Control | Art.21(i) | Art.9 | Annex I | AC | - |
| Testing | Art.21(f) | Art.24-27 | Art.10 | CA | - |
| Board Oversight | Art.20 | Art.5 | - | - | 10-K |

### Privacy Framework Mapping

| Requirement | GDPR | ISO 27701 | NIST Privacy | HIPAA |
|-------------|------|-----------|--------------|-------|
| Lawful Basis | Art.6 | A.7.2.2 | CT.DP-P1 | - |
| Consent | Art.7 | A.7.3.1 | CT.DP-P2 | - |
| Data Subject Rights | Art.15-22 | A.7.3.6 | CM.AW-P | §164.524 |
| Breach Notification | Art.33-34 | A.7.3.8 | - | §164.408 |
| Data Minimization | Art.5(1)(c) | A.7.4.1 | CT.DM-P | §164.502(b) |
| Security | Art.32 | Annex B | PR.DS-P | §164.312 |
| DPO/Privacy Officer | Art.37 | A.7.2.8 | GV.PO-P | §164.530(a) |
| International Transfer | Art.44-49 | A.7.5 | - | §164.532 |

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
AI Frameworks: NIST AI RMF | ISO 42001 | CSA AICM | OWASP LLM | MITRE ATLAS
AI Industry: Google SAIF | Microsoft Responsible AI
Security: NIST CSF 2.0 | ISO 27001 | CIS v8.1 | PCI DSS 4.0 | NIST 800-53
IT Governance: SOC 2 | COBIT 2019 | ITIL v4/v5
Privacy: ISO 27701 | NIST Privacy | HIPAA
Regulatory: NIS2 | DORA | CRA | CMMC 2.0 | SEC Rules | CISA CPGs
Meta-Framework: SCF v2025.4

Control Types: Preventive | Detective | Corrective | Compensating

Priority Order:
1. Asset inventory (know what you have)
2. Access control (who can access what)
3. Data protection (classify and protect)
4. Logging/monitoring (see what's happening)
5. Incident response (be prepared)

Regulatory Deadlines:
- NIS2: Oct 2024 (member state)
- DORA: Jan 2025 (financial)
- CRA: Dec 2027 (product security)
- CMMC: Ongoing (DoD contracts)

Incident Reporting Timelines:
- NIS2: 24h early warning, 72h notification
- DORA: 72h initial notification
- SEC: 4 business days (material)
- CRA: 24h (exploited vulns)
- HIPAA: 60 days
```
