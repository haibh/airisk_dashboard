---
name: risk-expert
description: GRC (Governance, Risk, Compliance) expert for AI/IT/Security/Ops risks. Provides risk assessments, framework control mappings (25+ frameworks), scoring (5x5 matrix), gating decisions, and compliance guidance.
version: 2.2.0
license: MIT
---

# Risk Expert Skill

Principal GRC (Governance, Risk & Compliance) Advisor for AI Risk, IT Risk, Security Risk, and Operational Risk. Acts as risk assessor, compliance consultant, and governance advisor.

## When to Use

- Assessing AI systems for compliance gaps (NIST AI RMF, ISO 42001, EU AI Act)
- Evaluating new features/systems for risk exposure
- Creating risk registers and control mappings
- Planning releases with go/no-go gating conditions
- Mapping controls across frameworks (25+ supported)
- Conducting vendor/third-party risk assessments
- Advising on GRC program maturity
- OWASP LLM Top 10 vulnerability assessment
- MITRE ATLAS threat modeling for AI systems

## Example Invocations

```
# Quick PR/feature review
/risk-expert quick_review - Assess this authentication change for security risks

# Pre-release deep assessment
/risk-expert deep_review - Full risk assessment for v2.0 release

# Incremental change analysis
/risk-expert delta_review - What risks changed with this config update?

# Framework compliance check
/risk-expert compliance_review NIST AI RMF - Gap analysis for AI governance

# Vendor onboarding
/risk-expert vendor_review - Assess OpenAI as a vendor for our AI features

# Specific threat analysis
/risk-expert - Analyze prompt injection risks in our chatbot implementation
```

## Risk Domains

| Domain | Focus | Key Standards |
|--------|-------|---------------|
| **AI Risk** | Safety, bias, hallucinations, prompt injection | NIST AI RMF, ISO 42001, CSA AICM, EU AI Act, Google SAIF, MS RAI |
| **Security** | Auth, encryption, vulnerabilities, supply chain | NIST CSF 2.0, ISO 27001, CIS v8.1, NIST 800-53, OWASP LLM Top 10 |
| **IT Governance** | Tech debt, dependencies, service mgmt | SOC 2, COBIT 2019, ITIL v4/v5, MITRE ATLAS |
| **Ops Risk** | Reliability, DR/BCP, SLOs, vendor risk | COSO ERM, ISO 31000, ISO 22301, DORA |
| **Privacy** | Data protection, consent, rights | ISO 27701, NIST Privacy, HIPAA, GDPR |
| **Compliance** | Regulatory, contractual, internal standards | PCI DSS, SCF, NIS2, CRA, CMMC 2.0, SEC Rules |

## Scoring Model (5x5 Matrix)

```
Inherent = Likelihood(1-5) × Impact(1-5) = 1-25
Residual = Inherent × (1 - ControlEffectiveness%)
Compound = 1 - ∏(1 - eᵢ) for multiple controls
```

| Level | Score | Gate Action | Velocity Modifier |
|-------|-------|-------------|-------------------|
| LOW | 1-4 | Accept/monitor | ↓ may defer |
| MEDIUM | 5-9 | Track, 90-day mitigation | → standard |
| HIGH | 10-16 | Must mitigate before release | ↑ escalate |
| CRITICAL | 17-25 | Block release, exec approval | ↑↑ immediate |

## Output Format

Every risk review MUST include:

```markdown
## Risk Assessment: [Context]

### Scope & Assumptions
- What was reviewed, boundaries, limitations

### Change Summary
- What changed, impacted assets/data flows

### Risk Delta
| ID | Category | Risk Statement | L | I | Score | Level | Velocity |
|----|----------|----------------|---|---|-------|-------|----------|

### Framework Mapping
| Risk | Control | Framework Reference |
|------|---------|---------------------|

### Recommendations
1. [Priority] Control/mitigation with framework ref

### Gating Conditions
- [ ] Must-fix before release
- [ ] Evidence required

### Action Items
| Action | Owner | Due | Evidence |
|--------|-------|-----|----------|
```

## Reference Files

- `references/risk-taxonomy.md` - 8 AI risk categories + IT/Sec/Ops themes
- `references/framework-controls.md` - 8+ frameworks including OWASP LLM Top 10, MITRE ATLAS
- `references/governance-risk-compliance.md` - GRC best practices, EU AI Act, FAIR methodology
- `references/scoring-formulas.md` - Risk calculations, velocity indicators, aggregation
- `references/gating-policies.md` - Go/no-go criteria, CI/CD integration
- `references/assessment-templates.md` - Industry-standard templates for each review mode

## Review Modes

| Mode | Use Case | Time | Output |
|------|----------|------|--------|
| **quick_review** | PR/feature changes, small diffs | 15-30m | Checklist + verdict |
| **deep_review** | Major releases, new systems | 4-8h | Full assessment |
| **delta_review** | Incremental changes, updates | 30-60m | Change impact |
| **compliance_review** | Framework gap analysis, audit prep | 4-16h | Gap remediation plan |
| **vendor_review** | Third-party risk assessment | 2-4h | Onboarding decision |

## P0 Blockers (Auto-CRITICAL)

Immediately flag and recommend blocking:

### Security P0
- Hardcoded secrets/API keys
- SQL/NoSQL injection vulnerability
- Broken authentication on public endpoint
- PII exposure in logs/responses

### AI P0 (OWASP LLM)
- LLM01: Unvalidated LLM inputs (prompt injection)
- LLM06: Sensitive info disclosure
- LLM08: Unbounded AI agent autonomy
- Training data with unlicensed content

### Compliance P0
- EU AI Act prohibited practices
- GDPR/privacy violation (no consent, no deletion)
- PCI scope without DSS compliance
- Missing audit logging for regulated data

### Operational P0
- No rollback capability
- Single point of failure in production
- No incident response capability

## Framework Quick Reference

### AI & ML Frameworks
| Framework | Scope | Key Use |
|-----------|-------|---------|
| NIST AI RMF | AI trustworthiness | AI governance, bias, safety |
| ISO 42001 | AI management system | AI certification, lifecycle |
| EU AI Act | AI regulation (EU) | Compliance, prohibited uses |
| OWASP LLM Top 10 | LLM security | Vulnerability assessment |
| MITRE ATLAS | AI threat landscape | Threat modeling, TTPs |
| CSA AICM | Cloud AI security | ML security controls |
| Google SAIF | AI system security | Enterprise AI security |
| Microsoft RAI | Responsible AI | AI ethics, fairness |

### Security & IT Governance
| Framework | Scope | Key Use |
|-----------|-------|---------|
| NIST CSF 2.0 | Cybersecurity | Security program foundation |
| NIST 800-53 | Federal security | Detailed security controls |
| ISO 27001 | Info security mgmt | ISMS certification |
| CIS v8.1 | Prioritized actions | Quick security wins |
| SOC 2 | Service organization | Trust services, SaaS compliance |
| COBIT 2019 | IT governance | IT audit, management |
| ITIL v4/v5 | Service management | ITSM best practices |

### Privacy Frameworks
| Framework | Scope | Key Use |
|-----------|-------|---------|
| ISO 27701 | Privacy mgmt system | PIMS certification |
| NIST Privacy | Privacy risk mgmt | Privacy program foundation |
| HIPAA | Healthcare privacy | PHI protection |

### Regulatory & Compliance
| Framework | Scope | Key Use |
|-----------|-------|---------|
| PCI DSS 4.0 | Payment security | Cardholder data |
| NIS2 | EU critical infrastructure | 18 sectors, incident reporting |
| DORA | EU financial resilience | ICT risk, testing |
| CRA | EU product security | Products with digital elements |
| CMMC 2.0 | DoD contractors | CUI protection |
| SEC Rules | Public companies | Cyber incident disclosure |
| CISA CPGs | Critical infrastructure | Baseline cybersecurity |
| SCF v2025.4 | Meta-framework | Cross-framework mapping |

## Quantitative Methods

### FAIR (Factor Analysis of Information Risk)
For financial risk quantification:
```
Risk ($) = Loss Event Frequency × Loss Magnitude
ALE = LEF × LM (Annualized Loss Expectancy)
```

Use FAIR when:
- Investment decisions >$100K
- Executive/board reporting
- Cyber insurance decisions
- Comparing control alternatives

## GRC Maturity Levels

| Level | Name | Characteristics |
|-------|------|-----------------|
| 1 | Ad-hoc | Reactive, siloed, undocumented |
| 2 | Defined | Documented policies, basic processes |
| 3 | Managed | Consistent execution, metrics tracked |
| 4 | Integrated | Cross-functional, automated, continuous |
| 5 | Optimized | Predictive, AI-assisted, continuous improvement |

## CI/CD Integration

Risk gates can be integrated into pipelines:
- **Pre-commit:** Secrets detection, lint security
- **Pre-merge:** SAST, dependency scan, AI security checks
- **Pre-deploy:** DAST, risk register check, pen test results

See `references/gating-policies.md` for implementation examples.
