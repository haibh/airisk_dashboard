# Risk Assessment Templates

Industry-standard templates for each review mode. Based on ISO 31000, NIST RMF, FAIR, and enterprise risk management best practices.

---

## 1. Quick Review Template

**Use for:** Feature changes, PR reviews, small diffs (<200 lines)
**Time:** 15-30 minutes
**Output:** Brief risk delta with recommendations

```markdown
# Quick Risk Review: [Feature/Change Name]

**Date:** YYYY-MM-DD
**Reviewer:** [Name]
**Scope:** [Brief description of change]

## Change Summary
- **Files Modified:** [count]
- **Type:** [Feature | Bugfix | Refactor | Config | Dependencies]
- **Components Affected:** [list]

## Risk Checklist

### Security
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] Authentication/authorization unchanged or improved
- [ ] No new attack surface exposed

### AI-Specific (if applicable)
- [ ] User input not directly passed to LLM
- [ ] Output filtering present
- [ ] No PII in prompts/logs
- [ ] Agent actions bounded

### Data
- [ ] No new PII collection
- [ ] Encryption requirements met
- [ ] Logging sanitized

## Risk Delta

| Risk | L | I | Score | Level | Action |
|------|---|---|-------|-------|--------|
| [Risk 1] | | | | | |

## Verdict

- [ ] **APPROVED** - No blocking risks
- [ ] **CONDITIONAL** - Approve with conditions: [list]
- [ ] **BLOCKED** - Must fix: [list]

## Notes
[Any additional observations]
```

---

## 2. Deep Review Template

**Use for:** Major releases, new systems, annual assessments
**Time:** 2-8 hours
**Output:** Comprehensive risk assessment with full documentation

```markdown
# Comprehensive Risk Assessment

**System/Project:** [Name]
**Version:** [Version]
**Assessment Date:** YYYY-MM-DD
**Lead Assessor:** [Name]
**Review Period:** [Start] to [End]

---

## Executive Summary

### Overall Risk Rating
| Category | Inherent | Residual | Trend |
|----------|----------|----------|-------|
| AI Risk | | | |
| Security | | | |
| Privacy | | | |
| Operational | | | |
| Compliance | | | |
| **Aggregate** | | | |

### Key Findings
1. [Finding 1 - Most critical]
2. [Finding 2]
3. [Finding 3]

### Immediate Actions Required
- [ ] [P0 Action 1]
- [ ] [P0 Action 2]

---

## 1. Scope & Methodology

### 1.1 Assessment Scope
- **In Scope:** [Systems, processes, data]
- **Out of Scope:** [Exclusions and rationale]
- **Assumptions:** [Key assumptions made]
- **Limitations:** [Known limitations]

### 1.2 Methodology
- **Framework:** [NIST AI RMF | ISO 31000 | FAIR | Custom]
- **Scoring:** 5×5 matrix (L×I = 1-25)
- **Sources:** [Interviews, documentation, testing, tools]

### 1.3 Participants
| Name | Role | Contribution |
|------|------|--------------|
| | | |

---

## 2. System Context

### 2.1 System Description
[Overview of system purpose, architecture, data flows]

### 2.2 Asset Inventory
| Asset | Type | Classification | Owner |
|-------|------|----------------|-------|
| | | | |

### 2.3 Data Flows
```
[Diagram or description of data flows]
```

### 2.4 Trust Boundaries
| Boundary | From | To | Controls |
|----------|------|-----|----------|
| | | | |

### 2.5 Third-Party Dependencies
| Vendor | Service | Criticality | Risk Tier |
|--------|---------|-------------|-----------|
| | | | |

---

## 3. Risk Register

### 3.1 Risk Inventory

| ID | Category | Risk Statement | Threat Source | Affected Asset |
|----|----------|----------------|---------------|----------------|
| R001 | | | | |
| R002 | | | | |

### 3.2 Risk Scoring

| ID | Likelihood | Impact | Inherent | Controls | Eff% | Residual | Level | Velocity |
|----|------------|--------|----------|----------|------|----------|-------|----------|
| R001 | | | | | | | | |
| R002 | | | | | | | | |

### 3.3 Risk Details

#### R001: [Risk Title]
- **Description:** [Detailed risk description]
- **Threat Source:** [Who/what causes this risk]
- **Vulnerability:** [What weakness is exploited]
- **Impact:** [What happens if risk materializes]
- **Existing Controls:** [Current mitigations]
- **Control Gaps:** [Missing or weak controls]
- **Recommended Controls:** [Proposed mitigations]
- **Framework Reference:** [NIST AI RMF/ISO 42001/etc.]

---

## 4. Control Assessment

### 4.1 Control Inventory
| Control ID | Control Name | Type | Owner | Status |
|------------|--------------|------|-------|--------|
| | | | | |

### 4.2 Control Effectiveness

| Control | Design | Operating | Evidence | Overall |
|---------|--------|-----------|----------|---------|
| | | | | |

### 4.3 Control Gaps
| Gap | Severity | Affected Risks | Remediation |
|-----|----------|----------------|-------------|
| | | | |

---

## 5. Framework Compliance

### 5.1 Compliance Matrix

| Requirement | Framework | Status | Evidence | Gap |
|-------------|-----------|--------|----------|-----|
| | NIST AI RMF | | | |
| | ISO 42001 | | | |
| | NIST CSF | | | |
| | ISO 27001 | | | |

### 5.2 Compliance Score
| Framework | Controls Required | Implemented | Partially | Missing | Score |
|-----------|------------------|-------------|-----------|---------|-------|
| | | | | | |

---

## 6. Recommendations

### 6.1 Prioritized Actions

| Priority | Action | Owner | Due Date | Resources | Risk Addressed |
|----------|--------|-------|----------|-----------|----------------|
| P0 | | | | | |
| P1 | | | | | |
| P2 | | | | | |

### 6.2 Roadmap
| Phase | Actions | Timeline | Milestone |
|-------|---------|----------|-----------|
| Immediate | | 0-30 days | |
| Short-term | | 30-90 days | |
| Medium-term | | 3-6 months | |
| Long-term | | 6-12 months | |

---

## 7. Gating Decision

### 7.1 Gate Status
- [ ] **APPROVED** - Acceptable risk level
- [ ] **CONDITIONAL** - Approved with conditions
- [ ] **BLOCKED** - Unacceptable risks, cannot proceed

### 7.2 Conditions (if applicable)
| Condition | Due Date | Owner | Evidence Required |
|-----------|----------|-------|-------------------|
| | | | |

### 7.3 Accepted Risks
| Risk ID | Acceptance Rationale | Compensating Controls | Expiry |
|---------|---------------------|----------------------|--------|
| | | | |

---

## 8. Appendices

### A. Glossary
| Term | Definition |
|------|------------|
| | |

### B. Evidence Inventory
| Evidence ID | Description | Location | Date |
|-------------|-------------|----------|------|
| | | | |

### C. Interview Notes
[Summary of stakeholder interviews]

### D. Tool Outputs
[Security scan results, test reports, etc.]

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Risk Owner | | | |
| System Owner | | | |
| Security Lead | | | |
| Compliance Lead | | | |
```

---

## 3. Delta Review Template

**Use for:** Incremental changes, version updates, config changes
**Time:** 30-60 minutes
**Output:** Change impact analysis with risk delta

```markdown
# Delta Risk Review

**Change:** [Description]
**From:** [Previous state/version]
**To:** [New state/version]
**Date:** YYYY-MM-DD

## Change Analysis

### What Changed
| Category | Before | After | Impact |
|----------|--------|-------|--------|
| Code | | | |
| Config | | | |
| Dependencies | | | |
| Infrastructure | | | |
| Data | | | |

### Change Classification
- **Type:** [Feature | Bugfix | Security | Performance | Config]
- **Scope:** [Isolated | Module | System-wide]
- **Reversibility:** [Easy | Moderate | Difficult]

## Risk Delta

### New Risks Introduced
| ID | Risk | L | I | Score | Mitigation |
|----|------|---|---|-------|------------|
| | | | | | |

### Risks Reduced/Eliminated
| ID | Risk | Previous | New | Reason |
|----|------|----------|-----|--------|
| | | | | |

### Risks Unchanged
| ID | Risk | Score | Notes |
|----|------|-------|-------|
| | | | |

## Net Risk Change
| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Critical Risks | | | |
| High Risks | | | |
| Total Risk Score | | | |

## Recommendation
- [ ] **PROCEED** - Risk profile improved or unchanged
- [ ] **PROCEED WITH MONITORING** - New risks within tolerance
- [ ] **HOLD** - Further analysis needed
- [ ] **REVERT** - Unacceptable risk increase
```

---

## 4. Compliance Review Template

**Use for:** Framework gap analysis, audit prep, certification
**Time:** 4-16 hours
**Output:** Compliance status with gap remediation plan

```markdown
# Compliance Gap Analysis

**Framework:** [NIST AI RMF | ISO 42001 | NIST CSF | ISO 27001 | etc.]
**Scope:** [System/Organization]
**Date:** YYYY-MM-DD
**Assessor:** [Name]

## Executive Summary

### Compliance Score
| Section | Required | Implemented | Partial | Gap | Score |
|---------|----------|-------------|---------|-----|-------|
| | | | | | |
| **Total** | | | | | **%** |

### Certification Readiness
- [ ] **Ready** - All critical controls in place
- [ ] **Nearly Ready** - Minor gaps to address
- [ ] **Not Ready** - Significant gaps remain

## Detailed Assessment

### [Framework Section 1]

#### Requirements
| ID | Requirement | Priority | Status | Evidence |
|----|-------------|----------|--------|----------|
| | | | | |

#### Gaps Identified
| Gap | Severity | Remediation | Effort | Owner |
|-----|----------|-------------|--------|-------|
| | | | | |

### [Framework Section 2]
[Repeat structure]

## Remediation Roadmap

### Phase 1: Critical Gaps (0-30 days)
| Gap | Action | Owner | Due |
|-----|--------|-------|-----|
| | | | |

### Phase 2: High Gaps (30-90 days)
| Gap | Action | Owner | Due |
|-----|--------|-------|-----|
| | | | |

### Phase 3: Medium Gaps (90-180 days)
| Gap | Action | Owner | Due |
|-----|--------|-------|-----|
| | | | |

## Evidence Collection Plan
| Control | Evidence Needed | Source | Format | Frequency |
|---------|-----------------|--------|--------|-----------|
| | | | | |

## Audit Preparation Checklist
- [ ] All policies current and approved
- [ ] Evidence repository organized
- [ ] Control owners briefed
- [ ] Sample populations identified
- [ ] Interview schedule confirmed
```

---

## 5. Vendor Review Template

**Use for:** Third-party/vendor risk assessments
**Time:** 2-4 hours
**Output:** Vendor risk rating with onboarding decision

```markdown
# Vendor Risk Assessment

**Vendor:** [Company Name]
**Service:** [Description]
**Assessment Date:** YYYY-MM-DD
**Assessor:** [Name]

## Vendor Profile

| Attribute | Value |
|-----------|-------|
| Company Size | |
| Years in Business | |
| Industry | |
| Geographic Location | |
| Certifications | |

## Risk Tier Classification

### Criticality Factors
| Factor | Score (1-5) | Weight | Weighted |
|--------|-------------|--------|----------|
| Data Access | | 30% | |
| System Integration | | 25% | |
| Business Impact | | 25% | |
| Replaceability | | 20% | |
| **Total** | | | |

### Tier Assignment
- [ ] **Critical** (4.0+) - Full assessment, ongoing monitoring
- [ ] **High** (3.0-3.9) - Detailed assessment, annual review
- [ ] **Medium** (2.0-2.9) - Standard questionnaire
- [ ] **Low** (<2.0) - Self-attestation

## Risk Assessment

### Security
| Control Area | Rating | Evidence | Notes |
|--------------|--------|----------|-------|
| Access Control | | | |
| Encryption | | | |
| Vulnerability Mgmt | | | |
| Incident Response | | | |
| Business Continuity | | | |

### Privacy
| Control Area | Rating | Evidence | Notes |
|--------------|--------|----------|-------|
| Data Handling | | | |
| Sub-processors | | | |
| Cross-border | | | |
| Retention/Deletion | | | |

### AI-Specific (if applicable)
| Control Area | Rating | Evidence | Notes |
|--------------|--------|----------|-------|
| Model Governance | | | |
| Bias Testing | | | |
| Data Usage | | | |
| Transparency | | | |

### Compliance
| Framework | Status | Certificate # | Expiry |
|-----------|--------|---------------|--------|
| SOC 2 Type II | | | |
| ISO 27001 | | | |
| GDPR | | | |
| Other | | | |

## Risk Summary

| Risk Area | Rating | Key Concerns |
|-----------|--------|--------------|
| Security | | |
| Privacy | | |
| Operational | | |
| Financial | | |
| Compliance | | |
| AI | | |
| **Overall** | | |

## Contract Requirements

### Required Clauses
- [ ] Data processing agreement
- [ ] Security requirements
- [ ] Breach notification (<72h)
- [ ] Audit rights
- [ ] Termination assistance
- [ ] Insurance requirements
- [ ] Sub-processor restrictions

### SLA Requirements
| Metric | Requirement | Penalty |
|--------|-------------|---------|
| Availability | | |
| Response Time | | |
| Resolution Time | | |

## Decision

- [ ] **APPROVED** - Proceed with onboarding
- [ ] **CONDITIONAL** - Approve with requirements: [list]
- [ ] **DEFERRED** - Additional assessment needed
- [ ] **REJECTED** - Unacceptable risk

## Monitoring Plan
| Activity | Frequency | Owner |
|----------|-----------|-------|
| Performance Review | | |
| Security Assessment | | |
| Compliance Check | | |
| Contract Review | | |
```

---

## Quick Reference: Template Selection

| Scenario | Template | Time | Output |
|----------|----------|------|--------|
| PR/MR review | Quick Review | 15-30m | Checklist + verdict |
| New feature | Quick Review | 30m | Risk delta |
| Major release | Deep Review | 4-8h | Full assessment |
| New system | Deep Review | 1-2d | Comprehensive |
| Version update | Delta Review | 30-60m | Change impact |
| Config change | Delta Review | 30m | Risk delta |
| Audit prep | Compliance Review | 4-16h | Gap analysis |
| Certification | Compliance Review | 1-2d | Remediation plan |
| New vendor | Vendor Review | 2-4h | Onboarding decision |
| Vendor renewal | Vendor Review | 1-2h | Continued approval |
