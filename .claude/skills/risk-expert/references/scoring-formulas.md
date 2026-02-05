# Risk Scoring Formulas

## 5×5 Risk Matrix

### Likelihood Scale (L)

| Score | Level | Description | Frequency |
|-------|-------|-------------|-----------|
| 1 | Rare | Unlikely to occur | <1% annually |
| 2 | Unlikely | Could occur but not expected | 1-10% annually |
| 3 | Possible | Might occur at some point | 10-50% annually |
| 4 | Likely | Will probably occur | 50-90% annually |
| 5 | Almost Certain | Expected to occur | >90% annually |

### Impact Scale (I)

| Score | Level | Financial | Operational | Reputational |
|-------|-------|-----------|-------------|--------------|
| 1 | Negligible | <$10K | Minor delay | No media |
| 2 | Minor | $10K-$100K | <1 day disruption | Local media |
| 3 | Moderate | $100K-$1M | 1-7 days disruption | Industry media |
| 4 | Major | $1M-$10M | 1-4 weeks disruption | National media |
| 5 | Catastrophic | >$10M | >1 month disruption | International media |

---

## Core Formulas

### Inherent Risk Score

Score before any controls are applied.

```
Inherent Score = Likelihood × Impact
Range: 1-25
```

**Examples:**
- L=3, I=4 → 12 (HIGH)
- L=2, I=2 → 4 (LOW)
- L=5, I=5 → 25 (CRITICAL)

### Residual Risk Score

Score after control effectiveness applied.

```
Residual Score = Inherent Score × (1 - Effectiveness/100)
Range: 0-25
```

**Examples:**
- Inherent=16, Eff=50% → 16 × 0.5 = 8 (MEDIUM)
- Inherent=20, Eff=80% → 20 × 0.2 = 4 (LOW)
- Inherent=12, Eff=0% → 12 × 1.0 = 12 (HIGH)

### Compound Control Effectiveness

Multiple controls reduce risk multiplicatively (not additively).

```
Overall Effectiveness = 1 - ∏(1 - eᵢ/100) × 100

Where eᵢ = effectiveness of control i (0-100%)
```

**Example:** Two controls at 60% and 40%
```
Residual = (1 - 0.6) × (1 - 0.4) = 0.4 × 0.6 = 0.24
Overall = (1 - 0.24) × 100 = 76%
```

**Why multiplicative?**
- Controls often overlap or address same threat
- Diminishing returns on stacked controls
- More realistic than simple addition

---

## Risk Level Classification

| Level | Score Range | Color | Action Required |
|-------|-------------|-------|-----------------|
| **LOW** | 1-4 | Green | Accept or monitor |
| **MEDIUM** | 5-9 | Yellow | Mitigate within 90 days |
| **HIGH** | 10-16 | Orange | Mitigate within 30 days |
| **CRITICAL** | 17-25 | Red | Immediate action |

### Risk Matrix Visualization

```
Impact →
  5 |  5  | 10  | 15  | 20  | 25  |
  4 |  4  |  8  | 12  | 16  | 20  |
L 3 |  3  |  6  |  9  | 12  | 15  |
↓ 2 |  2  |  4  |  6  |  8  | 10  |
  1 |  1  |  2  |  3  |  4  |  5  |
    +-----+-----+-----+-----+-----+
        1     2     3     4     5
                Likelihood →

Legend: ■ Critical ■ High ■ Medium ■ Low
```

---

## Risk Velocity (Trend Indicators)

### Velocity Scale

| Symbol | Velocity | Description | Action Modifier |
|--------|----------|-------------|-----------------|
| ↑↑ | Rapidly Increasing | Getting much worse | +2 priority |
| ↑ | Increasing | Trending upward | +1 priority |
| → | Stable | No significant change | No change |
| ↓ | Decreasing | Improving trend | May defer |
| ↓↓ | Rapidly Decreasing | Strong improvement | Reduce focus |

### Velocity Factors

**Triggers for Increasing (↑):**
- New threat actors targeting this risk
- Control degradation observed
- Increased attack surface
- Regulatory enforcement increasing
- Recent incidents in industry

**Triggers for Decreasing (↓):**
- New controls implemented
- Control effectiveness improving
- Threat landscape shifting away
- Industry maturity increasing
- Successful remediation efforts

### Velocity-Adjusted Prioritization

| Base Level | Velocity | Effective Priority |
|------------|----------|-------------------|
| HIGH | ↑↑ | CRITICAL (treat as P0) |
| HIGH | ↑ | HIGH+ (escalate timeline) |
| HIGH | → | HIGH (standard) |
| HIGH | ↓ | HIGH- (may extend timeline) |
| MEDIUM | ↑↑ | HIGH (escalate) |
| MEDIUM | ↑ | MEDIUM+ (closer monitoring) |
| LOW | ↑↑ | MEDIUM (reassess) |

### Risk Record with Velocity

```markdown
| ID | Risk | L | I | Score | Level | Velocity | Adj. Priority |
|----|------|---|---|-------|-------|----------|---------------|
| R001 | Prompt injection | 4 | 4 | 16 | HIGH | ↑↑ | CRITICAL |
| R002 | Data breach | 3 | 5 | 15 | HIGH | → | HIGH |
| R003 | Model drift | 3 | 3 | 9 | MEDIUM | ↓ | MEDIUM- |
```

---

## Risk Aggregation (Portfolio View)

### Simple Aggregation Methods

**Count-Based:**
```
Portfolio Risk = Σ(Risks by Level)
Critical: 2, High: 5, Medium: 12, Low: 8
```

**Weighted Score:**
```
Portfolio Score = Σ(Score × Weight)
Where weights reflect business criticality
```

### Risk Concentration Analysis

| Asset/System | Critical | High | Medium | Concentration |
|--------------|----------|------|--------|---------------|
| AI Platform | 3 | 4 | 2 | HIGH |
| Payment System | 1 | 2 | 5 | MEDIUM |
| Internal Tools | 0 | 1 | 8 | LOW |

### Aggregation Warnings

- **Correlation Risk:** Related risks may trigger together
- **Cascade Risk:** One risk can trigger others
- **Concentration Risk:** Too many risks in one area
- **Tail Risk:** Low probability, catastrophic impact

---

## Control Effectiveness Guidelines

### Effectiveness Ratings

| Rating | % Range | Criteria |
|--------|---------|----------|
| None | 0% | No control exists |
| Minimal | 1-25% | Ad-hoc, undocumented |
| Partial | 26-50% | Documented but inconsistent |
| Substantial | 51-75% | Consistent, some gaps |
| Strong | 76-90% | Well-implemented, tested |
| Comprehensive | 91-100% | Mature, automated, verified |

### Factors Affecting Effectiveness

**Increase effectiveness:**
- Automated enforcement
- Regular testing/validation
- Clear ownership
- Documented procedures
- Independent verification

**Decrease effectiveness:**
- Manual processes
- No testing
- Unclear ownership
- Outdated documentation
- Self-assessment only

---

## Practical Examples

### Example 1: API Authentication Risk

**Risk:** Unauthorized API access due to weak authentication
**Inherent:** L=4 (likely), I=4 (major) = 16 (HIGH)

**Controls:**
1. JWT with 24h expiry: 40% effective
2. Rate limiting: 30% effective
3. API key rotation: 25% effective

**Compound:**
```
Residual = 0.6 × 0.7 × 0.75 = 0.315
Overall Eff = (1 - 0.315) × 100 = 68.5%
Residual Score = 16 × 0.315 = 5.04 (MEDIUM)
```

### Example 2: AI Model Bias Risk

**Risk:** Discriminatory outcomes from biased training data
**Inherent:** L=3 (possible), I=5 (catastrophic) = 15 (HIGH)

**Controls:**
1. Bias testing pipeline: 50% effective
2. Diverse training data: 40% effective
3. Human review of edge cases: 35% effective

**Compound:**
```
Residual = 0.5 × 0.6 × 0.65 = 0.195
Overall Eff = 80.5%
Residual Score = 15 × 0.195 = 2.93 (LOW)
```

### Example 3: Data Breach Risk

**Risk:** PII exposure through SQL injection
**Inherent:** L=3 (possible), I=5 (catastrophic) = 15 (HIGH)

**Controls:**
1. Parameterized queries: 90% effective
2. WAF: 60% effective
3. Input validation: 70% effective

**Compound:**
```
Residual = 0.1 × 0.4 × 0.3 = 0.012
Overall Eff = 98.8%
Residual Score = 15 × 0.012 = 0.18 (LOW)
```

---

## TypeScript Implementation

```typescript
function calculateInherentScore(likelihood: number, impact: number): number {
  if (likelihood < 1 || likelihood > 5 || impact < 1 || impact > 5) {
    throw new Error('Values must be 1-5');
  }
  return likelihood * impact;
}

function calculateResidualScore(
  inherentScore: number,
  controlEffectiveness: number
): number {
  if (controlEffectiveness < 0 || controlEffectiveness > 100) {
    throw new Error('Effectiveness must be 0-100');
  }
  return inherentScore * (1 - controlEffectiveness / 100);
}

function calculateCompoundEffectiveness(
  effectivenessValues: number[]
): number {
  if (effectivenessValues.length === 0) return 0;

  const residualRisk = effectivenessValues.reduce((acc, eff) => {
    return acc * (1 - eff / 100);
  }, 1);

  return (1 - residualRisk) * 100;
}

function getRiskLevel(score: number): string {
  if (score >= 17) return 'CRITICAL';
  if (score >= 10) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}
```

---

## Quick Reference Card

```
INHERENT = L × I (1-25)
RESIDUAL = INHERENT × (1 - Eff%)
COMPOUND = 1 - ∏(1 - eᵢ)

Levels: LOW(1-4) MEDIUM(5-9) HIGH(10-16) CRITICAL(17-25)

Gates:
- CRITICAL: Block release
- HIGH: Must fix before release
- MEDIUM: Track with due date
- LOW: Accept/monitor
```
