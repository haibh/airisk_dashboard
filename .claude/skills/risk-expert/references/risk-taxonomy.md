# Risk Taxonomy

## AI Risk Categories (8 Types)

### 1. BIAS_FAIRNESS
**Scope:** Algorithmic bias, discrimination, unfair outcomes
- Training data bias (demographic, selection, measurement)
- Model bias (representation, aggregation, evaluation)
- Outcome bias (disparate impact, algorithmic discrimination)

**Controls:** Bias testing, fairness metrics, diverse datasets, human review

### 2. PRIVACY
**Scope:** Data protection, PII exposure, regulatory violations
- Unlawful data processing, consent violations
- PII in logs/outputs, data leakage
- Training data memorization, model inversion attacks
- Cross-border data transfer violations

**Controls:** Data minimization, anonymization, consent mgmt, DPIAs

### 3. SECURITY
**Scope:** Adversarial attacks, model theft, supply chain
- Prompt injection (direct/indirect)
- Model extraction/theft
- Data poisoning, backdoor attacks
- Insecure tool/plugin permissions
- Model supply chain compromise

**Controls:** Input validation, output filtering, sandboxing, provenance

### 4. RELIABILITY
**Scope:** Accuracy, consistency, failure modes
- Hallucinations, confabulation
- Model drift, performance degradation
- Edge case failures, inconsistent outputs
- Lack of uncertainty quantification

**Controls:** Evaluation pipelines, monitoring, fallbacks, confidence scores

### 5. TRANSPARENCY
**Scope:** Explainability, interpretability, disclosure
- Black-box decision-making
- Lack of model documentation
- No audit trail for decisions
- Hidden AI use in products

**Controls:** Explainability tools, model cards, decision logging

### 6. ACCOUNTABILITY
**Scope:** Responsibility, governance, ownership
- No clear AI system owner
- Missing human-in-the-loop
- Undefined escalation paths
- Lack of incident response

**Controls:** RACI matrices, governance boards, escalation procedures

### 7. SAFETY
**Scope:** Harmful outputs, dangerous behaviors
- Toxic/harmful content generation
- Unsafe recommendations
- Physical safety risks (robotics, autonomous)
- Misuse enablement

**Controls:** Content filters, safety classifiers, red-teaming, guardrails

### 8. OTHER
**Scope:** Miscellaneous risks not in above categories
- Regulatory changes, legal exposure
- Vendor lock-in, model availability
- Cost overruns, resource exhaustion

---

## IT Risk Themes

### Technology & Architecture
- Legacy systems, unsupported tech
- Technical debt accumulation
- Fragile integrations, tight coupling
- Capacity constraints, scalability limits
- Configuration drift, misconfigurations

### Change & Release
- Poor change management
- Untested releases, inadequate QA
- Missing rollback capability
- Emergency changes without review

### Third-Party & Cloud
- Vendor lock-in, SLA gaps
- Shared responsibility misunderstandings
- Data residency/sovereignty issues
- Shadow IT, unapproved services

---

## Security Risk Themes

### Identity & Access
- Weak IAM, missing MFA
- Over-privileged accounts
- Shared credentials, poor key management
- No Just-In-Time access

### Application Security
- OWASP Top 10 vulnerabilities
- Injection flaws (SQL, NoSQL, LDAP)
- Broken authentication/authorization
- Insecure deserialization
- Security misconfiguration

### Data Protection
- No encryption at rest/in transit
- Weak key rotation
- Excessive data retention
- Sensitive data in logs

### Detection & Response
- Insufficient logging
- No central monitoring
- Weak alerting, no playbooks
- Slow incident response

---

## Operational Risk Themes

### Process & Controls
- Undocumented processes
- Manual steps without checks
- Inconsistent execution
- Missing control points

### People
- Key-person dependency
- Inadequate training
- High turnover, poor handover
- Low risk culture

### Systems & Resilience
- Single points of failure
- No DR/BCP testing
- Weak capacity planning
- Missing failover mechanisms

### External & Vendor
- Vendor failure risk
- Geopolitical/regulatory changes
- Supply chain disruptions
- Natural disaster exposure

---

## Risk Statement Template

Format: "If **<condition/threat>** then **<impact>** because **<root cause/control gap>**."

**Examples:**
- "If user input is passed directly to LLM then prompt injection attacks could execute unauthorized actions because input sanitization is missing."
- "If API keys are hardcoded then credential theft enables unauthorized access because secrets management is not implemented."
- "If model outputs are not filtered then harmful content could reach users because content safety controls are bypassed."
