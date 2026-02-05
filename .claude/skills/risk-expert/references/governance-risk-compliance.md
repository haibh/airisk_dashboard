# Governance, Risk & Compliance (GRC) Reference

## GRC Fundamentals (2025-2026)

### Three Pillars Integration

| Pillar | Focus | Key Activities |
|--------|-------|----------------|
| **Governance** | Direction & oversight | Policies, roles, accountability, culture |
| **Risk Management** | Uncertainty handling | Identify, assess, treat, monitor risks |
| **Compliance** | Obligation adherence | Regulatory, contractual, internal standards |

### GRC Maturity Model

| Level | Name | Characteristics |
|-------|------|-----------------|
| 1 | **Ad-hoc** | Reactive, siloed, undocumented |
| 2 | **Defined** | Documented policies, basic processes |
| 3 | **Managed** | Consistent execution, metrics tracked |
| 4 | **Integrated** | Cross-functional, automated, continuous |
| 5 | **Optimized** | Predictive, AI-assisted, continuous improvement |

---

## Enterprise Risk Management (ERM)

### COSO ERM Framework (2017 Update)

**Components:**
1. **Governance & Culture** - Board oversight, operating structure, talent
2. **Strategy & Objective-Setting** - Business context, risk appetite, strategy alignment
3. **Performance** - Risk identification, severity assessment, prioritization
4. **Review & Revision** - Substantial change assessment, risk/performance review
5. **Information, Communication & Reporting** - Leveraging IT, risk communication

### ISO 31000:2018 Risk Management

**Principles:**
- Integrated into organizational processes
- Structured and comprehensive
- Customized to context
- Inclusive of stakeholders
- Dynamic and responsive to change
- Best available information
- Human and cultural factors
- Continual improvement

**Process:**
```
Context → Identify → Analyze → Evaluate → Treat → Monitor → Communicate
```

### Three Lines Model (IIA 2020)

| Line | Role | Responsibility |
|------|------|----------------|
| **1st** | Operations | Own & manage risk, implement controls |
| **2nd** | Risk & Compliance | Oversight, frameworks, monitoring |
| **3rd** | Internal Audit | Independent assurance |

---

## Regulatory Landscape (2025-2026)

### AI Governance

| Regulation | Jurisdiction | Status | Key Requirements |
|------------|--------------|--------|------------------|
| **EU AI Act** | EU | Effective Feb 2025 | Risk classification, prohibited uses, conformity |
| **NIST AI RMF 1.0** | US (voluntary) | Active | Govern, Map, Measure, Manage |
| **ISO/IEC 42001** | Global | Active | AI Management System certification |
| **Colorado SB21-169** | US/Colorado | Active | Algorithmic discrimination prevention |
| **NYC Local Law 144** | US/NYC | Active | Bias audits for hiring AI |

### Data Privacy

| Regulation | Key Provisions |
|------------|----------------|
| **GDPR** | Consent, data subject rights, DPO, 72h breach notification |
| **CCPA/CPRA** | Opt-out, sensitive data, risk assessments |
| **LGPD** (Brazil) | Similar to GDPR, DPO required |
| **PIPL** (China) | Consent, localization, cross-border transfer |
| **DPDPA** (India) | Consent, data fiduciaries, significant penalties |

### Industry-Specific

| Industry | Key Regulations |
|----------|-----------------|
| **Finance** | SOX, Basel III/IV, DORA (EU), PCI DSS 4.0 |
| **Healthcare** | HIPAA, HITECH, FDA AI/ML guidance |
| **Critical Infrastructure** | NIS2 (EU), CIRCIA (US), TSA directives |

---

## EU AI Act Compliance (Effective Feb 2025)

### Risk Classification

| Category | Description | Requirements |
|----------|-------------|--------------|
| **Unacceptable** | Prohibited AI practices | Banned |
| **High-Risk** | Listed in Annex III | Full compliance required |
| **Limited Risk** | Transparency obligations | Disclosure required |
| **Minimal Risk** | Low-risk AI | Voluntary codes |

### Prohibited AI Practices (Article 5)

Verify AI system does NOT:
- [ ] Use subliminal/manipulative techniques causing harm
- [ ] Exploit vulnerabilities (age, disability, social/economic)
- [ ] Social scoring by public authorities
- [ ] Real-time remote biometric ID in public (exceptions apply)
- [ ] Emotion recognition in workplace/education
- [ ] Biometric categorization inferring sensitive attributes
- [ ] Scraping facial images for recognition databases
- [ ] Predictive policing based solely on profiling

### High-Risk AI Compliance Checklist (Articles 8-15)

#### Risk Management System (Art. 9)
- [ ] Risk identification and analysis established
- [ ] Risk estimation and evaluation procedures
- [ ] Risk treatment measures implemented
- [ ] Residual risk acceptable and documented
- [ ] Testing for foreseeable misuse

#### Data Governance (Art. 10)
- [ ] Training data quality criteria defined
- [ ] Data bias examination conducted
- [ ] Data gaps and shortcomings identified
- [ ] Relevant data characteristics documented
- [ ] Data preparation processes traceable

#### Technical Documentation (Art. 11)
- [ ] General description of AI system
- [ ] Design specifications documented
- [ ] Development process described
- [ ] Monitoring and control methods
- [ ] Cybersecurity measures documented

#### Record-Keeping (Art. 12)
- [ ] Automatic logging capability
- [ ] Logs cover operational events
- [ ] Traceability throughout lifecycle
- [ ] Logs retained appropriately

#### Transparency (Art. 13)
- [ ] Instructions for use provided
- [ ] Capabilities and limitations disclosed
- [ ] Human oversight requirements stated
- [ ] Risks to health/safety/rights identified

#### Human Oversight (Art. 14)
- [ ] Oversight measures designed in
- [ ] Operators can understand outputs
- [ ] Operators can override/stop system
- [ ] Bias patterns detectable by humans

#### Accuracy, Robustness, Security (Art. 15)
- [ ] Accuracy levels documented
- [ ] Robustness testing completed
- [ ] Resilience to manipulation verified
- [ ] Cybersecurity requirements met

#### Conformity Assessment
- [ ] Internal control (most cases) OR
- [ ] Third-party assessment (biometrics, critical infrastructure)
- [ ] CE marking applied
- [ ] EU database registration complete

### Penalties

| Violation | Maximum Fine |
|-----------|--------------|
| Prohibited practices | €35M or 7% global turnover |
| High-risk non-compliance | €15M or 3% global turnover |
| Incorrect information | €7.5M or 1.5% global turnover |

---

## FAIR Quantitative Risk Analysis

### Factor Analysis of Information Risk (FAIR)

**Purpose:** Convert qualitative risk to monetary terms for business decisions.

### FAIR Ontology

```
Risk
├── Loss Event Frequency (LEF)
│   ├── Threat Event Frequency (TEF)
│   │   ├── Contact Frequency
│   │   └── Probability of Action
│   └── Vulnerability (VULN)
│       ├── Threat Capability (TCap)
│       └── Resistance Strength (RS)
└── Loss Magnitude (LM)
    ├── Primary Loss
    │   ├── Productivity
    │   ├── Response
    │   ├── Replacement
    │   └── Fines/Judgments
    └── Secondary Loss
        ├── Secondary Loss Event Frequency
        └── Secondary Loss Magnitude
```

### Key FAIR Formulas

```
Risk = Loss Event Frequency × Loss Magnitude

LEF = TEF × Vulnerability

Vulnerability = P(TCap > RS)

Annualized Loss Expectancy (ALE) = LEF × LM
```

### FAIR Estimation Scales

**Loss Event Frequency (per year):**
| Level | Range | Description |
|-------|-------|-------------|
| Very High | >100 | Multiple times per day |
| High | 10-100 | Weekly to monthly |
| Medium | 1-10 | Several times per year |
| Low | 0.1-1 | Once every few years |
| Very Low | <0.1 | Less than once per decade |

**Loss Magnitude ($):**
| Level | Range | Description |
|-------|-------|-------------|
| Catastrophic | >$100M | Existential threat |
| Severe | $10M-$100M | Major business impact |
| Significant | $1M-$10M | Substantial impact |
| Moderate | $100K-$1M | Noticeable impact |
| Minor | $10K-$100K | Limited impact |
| Negligible | <$10K | Minimal impact |

### FAIR Analysis Example

**Scenario:** Data breach via SQL injection

**Inputs:**
- TEF: 10/year (automated scanning)
- TCap: High (skilled attackers)
- RS: Medium (parameterized queries, WAF)
- Primary Loss: $500K (response, notification)
- Secondary Loss: $2M (reputation, legal)

**Calculation:**
```
Vulnerability = 30% (TCap > RS)
LEF = 10 × 0.3 = 3 events/year
LM = $500K + $2M = $2.5M
ALE = 3 × $2.5M = $7.5M/year
```

**Decision:** Controls costing <$7.5M/year justified.

### FAIR vs Qualitative Comparison

| Aspect | 5×5 Matrix | FAIR |
|--------|------------|------|
| Output | L/M/H/C rating | $ value |
| Precision | Ordinal scale | Continuous |
| Effort | Low | High |
| Data needed | Expert judgment | Historical data |
| Best for | Prioritization | Investment decisions |
| Repeatability | Varies | High (documented) |

### When to Use FAIR

- Major investment decisions (>$100K)
- Executive/board risk reporting
- Comparing control alternatives
- Cyber insurance decisions
- M&A risk assessment
- Regulatory risk quantification

---

## Control Frameworks Comparison

### Framework Selection Guide

| Need | Recommended Framework |
|------|----------------------|
| AI system governance | NIST AI RMF, ISO 42001 |
| Cybersecurity program | NIST CSF 2.0, ISO 27001 |
| Prioritized security actions | CIS Controls v8.1 |
| Payment processing | PCI DSS 4.0.1 |
| Comprehensive mapping | SCF v2025.4 |
| Cloud AI security | CSA AICM |

### Control Types

| Type | Purpose | Example |
|------|---------|---------|
| **Preventive** | Stop incidents before they occur | Access controls, encryption |
| **Detective** | Identify incidents when they occur | Monitoring, logging, SIEM |
| **Corrective** | Fix issues after detection | Incident response, patching |
| **Directive** | Guide behavior | Policies, training, signage |
| **Deterrent** | Discourage violations | Legal warnings, audit trails |
| **Compensating** | Alternative when primary unavailable | Manual review when automation fails |

---

## Risk Assessment Methodology

### Qualitative vs Quantitative

| Approach | When to Use | Output |
|----------|-------------|--------|
| **Qualitative** | Early stages, limited data, communication | L/M/H ratings, risk matrices |
| **Quantitative** | Mature programs, financial decisions | ALE, probability distributions |
| **Semi-quantitative** | Balance of both | Scored scales (1-5, 1-25) |

### Key Risk Indicators (KRIs)

**Categories:**
- **Leading** - Predict future risk (vulnerability scan results)
- **Lagging** - Measure past events (incidents, breaches)
- **Current** - Real-time status (control health)

**Examples:**
| KRI | Type | Threshold |
|-----|------|-----------|
| Unpatched critical vulnerabilities | Leading | <5 |
| Mean time to detect (MTTD) | Lagging | <24h |
| % controls operating effectively | Current | >90% |
| Overdue risk acceptances | Leading | 0 |
| Security training completion | Leading | >95% |

---

## Policy Framework

### Policy Hierarchy

```
Governance Level:
├── Board Charter / Risk Appetite Statement
├── Enterprise Policies (mandatory, org-wide)
│   ├── Information Security Policy
│   ├── AI Ethics Policy
│   ├── Data Privacy Policy
│   └── Business Continuity Policy
├── Standards (specific requirements)
│   ├── Encryption Standard
│   ├── Access Control Standard
│   └── Model Validation Standard
├── Procedures (how-to guides)
│   ├── Incident Response Procedure
│   └── Risk Assessment Procedure
└── Guidelines (recommendations)
    └── Secure Coding Guidelines
```

### Policy Lifecycle

1. **Draft** - Author creates, legal/compliance review
2. **Review** - Stakeholder input, risk assessment
3. **Approve** - Appropriate authority sign-off
4. **Publish** - Communicate, train, acknowledge
5. **Implement** - Operationalize, monitor compliance
6. **Review** - Annual or trigger-based revision
7. **Retire** - Archive when obsolete

---

## Compliance Management

### Compliance Program Elements

1. **Compliance Risk Assessment** - Identify obligations, assess gaps
2. **Policies & Procedures** - Document requirements
3. **Training & Communication** - Educate workforce
4. **Monitoring & Testing** - Verify adherence
5. **Reporting & Escalation** - Track issues, inform leadership
6. **Response & Remediation** - Address findings
7. **Continuous Improvement** - Learn and adapt

### Audit Readiness Checklist

- [ ] Control inventory mapped to requirements
- [ ] Evidence collection automated where possible
- [ ] Policy review dates current
- [ ] Training records complete
- [ ] Risk register up to date
- [ ] Incident log maintained
- [ ] Vendor assessments current
- [ ] Change management documented
- [ ] Access reviews completed
- [ ] Penetration test results addressed

---

## Vendor/Third-Party Risk Management

### Due Diligence Tiers

| Tier | Criteria | Assessment |
|------|----------|------------|
| **Critical** | System access, sensitive data, revenue impact | Full assessment, onsite audit |
| **High** | Some data access, significant spend | Detailed questionnaire, SOC 2 |
| **Medium** | Limited access, moderate spend | Standard questionnaire |
| **Low** | No data access, minimal spend | Self-attestation |

### Key Vendor Risk Areas

- **Security** - Data protection, access controls, incident response
- **Privacy** - Data handling, sub-processors, cross-border
- **Operational** - SLAs, BCP/DR, support quality
- **Financial** - Viability, insurance, concentration
- **Compliance** - Certifications, regulatory adherence
- **AI-Specific** - Model governance, bias testing, data usage

---

## Incident & Issue Management

### Incident Severity Classification

| Severity | Definition | Response Time | Escalation |
|----------|------------|---------------|------------|
| **P1/Critical** | Business-stopping, data breach | <15 min | Exec, legal, regulator |
| **P2/High** | Major degradation, potential breach | <1 hour | Management |
| **P3/Medium** | Limited impact, workaround exists | <4 hours | Team lead |
| **P4/Low** | Minor, no business impact | <24 hours | Standard queue |

### Issue Lifecycle

```
Open → Assigned → In Progress → Pending Verification → Closed
                ↓
          (On Hold / Escalated)
```

### Root Cause Categories (5 Whys + Ishikawa)

- **People** - Training, capacity, error
- **Process** - Procedure gaps, unclear ownership
- **Technology** - System failure, configuration error
- **Policy** - Missing or inadequate policy
- **External** - Vendor, threat actor, regulation change

---

## Metrics & Reporting

### GRC Dashboard KPIs

| Metric | Target | Frequency |
|--------|--------|-----------|
| Risk register completeness | 100% | Quarterly |
| Controls tested | 100% | Annually |
| High/Critical risks with mitigation plan | 100% | Monthly |
| Policy acknowledgment rate | >95% | Annually |
| Security training completion | >95% | Annually |
| Audit findings closed on time | >90% | Quarterly |
| Vendor assessments current | >95% | Quarterly |

### Reporting Cadence

| Audience | Report | Frequency |
|----------|--------|-----------|
| Board | Risk appetite, top risks, compliance status | Quarterly |
| Exec | Risk trends, KRIs, incidents | Monthly |
| Management | Detailed risks, controls, issues | Weekly |
| Operations | Action items, due dates | Daily |

---

## Best Practices (2025-2026)

### Emerging Trends

1. **Integrated GRC Platforms** - Unified tools for risk, compliance, audit
2. **AI-Powered GRC** - Automated control testing, anomaly detection
3. **Continuous Control Monitoring (CCM)** - Real-time compliance
4. **Zero Trust Architecture** - Never trust, always verify
5. **Supply Chain Security** - SBOM, provenance, attestation
6. **AI Governance Maturity** - Model risk management, MLOps controls
7. **ESG Risk Integration** - Environmental, social, governance factors
8. **Cyber Resilience** - Beyond prevention to recovery

### Common Pitfalls to Avoid

- Treating compliance as checkbox exercise
- Siloed risk management (IT vs operational vs financial)
- Over-reliance on point-in-time assessments
- Ignoring third-party/supply chain risks
- Insufficient board/exec engagement
- Manual, spreadsheet-based processes
- Reactive vs proactive risk management
- Neglecting risk culture and awareness

---

## Quick Reference

```
GRC Integration = Governance + Risk + Compliance working together

ERM Process: Context → Identify → Analyze → Evaluate → Treat → Monitor

Three Lines: 1-Operations | 2-Risk/Compliance | 3-Audit

Control Types: Preventive | Detective | Corrective | Directive

Policy Hierarchy: Charter → Policy → Standard → Procedure → Guideline

Vendor Tiers: Critical → High → Medium → Low

Incident Severity: P1(Critical) → P2(High) → P3(Medium) → P4(Low)
```
