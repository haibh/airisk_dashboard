# Gating Policies

## Release Gates by Risk Level

### CRITICAL (17-25) - BLOCK

**Policy:** Release BLOCKED until resolved or exec-level acceptance

**Requirements:**
- [ ] Risk must be mitigated to HIGH or below
- [ ] OR formal exception with exec sign-off
- [ ] Exception requires: justification, compensating controls, expiry date
- [ ] Exception max duration: 30 days

**Triggers:**
- Any residual CRITICAL risk
- P0 security vulnerabilities
- Regulatory non-compliance
- Unvalidated AI with external exposure

**Escalation:**
1. Immediate notification to risk owner
2. CISO/Head of Engineering review within 24h
3. Exec decision required for exception

---

### HIGH (10-16) - CONDITIONAL

**Policy:** Release CONDITIONAL on mitigation plan + evidence

**Requirements:**
- [ ] Documented mitigation plan with owner
- [ ] Evidence of control implementation
- [ ] Due date within 30 days
- [ ] Risk accepted by product owner

**Triggers:**
- Residual HIGH risks
- Missing critical controls
- Untested security measures
- AI without adequate monitoring

**Evidence Required:**
- Control implementation proof
- Test results (unit, integration, security)
- Configuration screenshots/exports
- Approval from security team

---

### MEDIUM (5-9) - TRACKED

**Policy:** Release ALLOWED with tracked remediation

**Requirements:**
- [ ] Risk logged in risk register
- [ ] Owner assigned
- [ ] Due date within 90 days
- [ ] Quarterly review scheduled

**Triggers:**
- Residual MEDIUM risks
- Partial control implementation
- Minor compliance gaps
- Limited monitoring coverage

**Tracking:**
- JIRA/issue ticket created
- Linked to release notes
- Progress reported weekly
- Escalate if overdue

---

### LOW (1-4) - ACCEPTED

**Policy:** Release ALLOWED, monitor only

**Requirements:**
- [ ] Risk documented
- [ ] Included in periodic risk review
- [ ] Re-assess annually or on change

**Triggers:**
- Well-controlled risks
- Low-exposure systems
- Minor technical debt

---

## Gate Decision Matrix

| Risk Level | Can Release? | Approval Required | Evidence Required |
|------------|--------------|-------------------|-------------------|
| CRITICAL | No | Exec exception only | Full audit pack |
| HIGH | Conditional | Product + Security | Mitigation proof |
| MEDIUM | Yes | Product owner | Tracking ticket |
| LOW | Yes | None | Documentation |

---

## P0 Blockers (Automatic CRITICAL)

These conditions automatically trigger CRITICAL gate:

### Security P0
- [ ] Hardcoded secrets in code
- [ ] SQL/NoSQL injection vulnerability
- [ ] Broken authentication on public endpoint
- [ ] PII exposure in logs/responses
- [ ] Missing encryption for sensitive data

### AI P0
- [ ] Unvalidated LLM input (prompt injection)
- [ ] Unbounded AI agent autonomy
- [ ] No output filtering on user-facing AI
- [ ] Training data with unlicensed content
- [ ] AI decision-making without human review (high-stakes)

### Compliance P0
- [ ] GDPR/privacy violation (no consent, no deletion)
- [ ] PCI scope without DSS compliance
- [ ] Healthcare data without HIPAA controls
- [ ] Missing audit logging for regulated data

### Operational P0
- [ ] No rollback capability
- [ ] Single point of failure in production
- [ ] No monitoring for critical services
- [ ] Missing incident response plan

---

## Exception Process

### When Exceptions Apply
- Business urgency outweighs risk
- Compensating controls reduce effective risk
- Time-bound with clear remediation path

### Exception Requirements

```markdown
## Risk Exception Request

**Risk ID:** [ID from risk register]
**Risk Description:** [Brief statement]
**Current Level:** [CRITICAL/HIGH]
**Requested Action:** [Release with exception]

### Business Justification
[Why this release cannot wait for full remediation]

### Compensating Controls
1. [Control]: [How it reduces risk]
2. [Control]: [How it reduces risk]

### Residual Risk After Compensation
- Likelihood: [1-5]
- Impact: [1-5]
- Effective Level: [Should be lower]

### Remediation Plan
- **Action:** [What will be done]
- **Owner:** [Name]
- **Due Date:** [Date]

### Approvals Required
- [ ] Risk Owner: [Name]
- [ ] Product Owner: [Name]
- [ ] Security Lead: [Name]
- [ ] Exec Sponsor: [Name] (for CRITICAL)

### Exception Validity
- **Start Date:** [Date]
- **Expiry Date:** [Max 30 days for CRITICAL, 90 for HIGH]
- **Review Date:** [Before expiry]
```

### Exception Approval Chain

| Risk Level | Approvers |
|------------|-----------|
| CRITICAL | Risk Owner + Security + Exec |
| HIGH | Risk Owner + Product Owner |
| MEDIUM | Product Owner only |

---

## Evidence Requirements by Gate

### For CRITICAL Exception
- Full risk assessment document
- Compensating control proof
- Penetration test results (if security)
- AI evaluation results (if AI risk)
- Legal/compliance sign-off
- Exec written approval

### For HIGH Conditional Release
- Mitigation implementation evidence
- Test coverage report
- Security scan results
- Control configuration export
- Monitoring dashboard screenshot

### For MEDIUM Tracking
- JIRA/issue ticket link
- Owner assignment proof
- Due date in system
- Risk register entry

---

## Review Cadences

| Risk Level | Review Frequency | Escalation Trigger |
|------------|------------------|-------------------|
| CRITICAL | Weekly | No progress in 7 days |
| HIGH | Bi-weekly | Missed due date |
| MEDIUM | Monthly | Missed due date |
| LOW | Quarterly | Significant change |

---

## Quick Reference

```
CRITICAL → BLOCK (exec exception only)
HIGH → CONDITIONAL (mitigate + evidence)
MEDIUM → TRACKED (ticket + owner + due date)
LOW → ACCEPTED (document + monitor)

P0 Auto-Blockers:
- Hardcoded secrets
- Injection vulnerabilities
- Broken auth
- PII exposure
- Prompt injection
- Unbounded AI autonomy
- Compliance violations

Exception Max Duration:
- CRITICAL: 30 days
- HIGH: 90 days
```
