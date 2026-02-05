# Architecture Review Checklist

## Trust Boundaries

### Identify All Boundaries
- [ ] External ↔ Internal network
- [ ] Public ↔ Authenticated zones
- [ ] User ↔ Admin interfaces
- [ ] Frontend ↔ Backend
- [ ] Service ↔ Service (microservices)
- [ ] Application ↔ Database
- [ ] Cloud provider ↔ On-premise

### Boundary Controls
| Boundary | Expected Controls |
|----------|-------------------|
| Internet → App | WAF, rate limiting, TLS |
| App → API | Authentication, authorization |
| API → DB | Connection pooling, least privilege |
| Service → Service | mTLS, service mesh, API keys |
| User → Admin | MFA, privileged access mgmt |

---

## Data Flow Analysis

### Sensitive Data Inventory
- [ ] PII (names, emails, addresses, SSN)
- [ ] Financial data (cards, accounts, transactions)
- [ ] Health data (PHI, medical records)
- [ ] Authentication data (passwords, tokens, keys)
- [ ] AI training data (proprietary, licensed)
- [ ] AI model weights and configs

### Data Flow Questions
1. Where does sensitive data enter the system?
2. Where is it stored (at rest)?
3. How does it move between components (in transit)?
4. Who/what can access it?
5. Where does it exit the system?
6. How long is it retained?

### Data Protection Matrix
| Data Type | Classification | Encryption | Access Control | Retention |
|-----------|---------------|------------|----------------|-----------|
| User PII | Confidential | AES-256 | RBAC | 7 years |
| API Keys | Secret | HSM/Vault | Strict need | Until revoked |
| Logs | Internal | At rest | Ops team | 90 days |

---

## Single Points of Failure

### Infrastructure SPOF
- [ ] Single database instance (no replica)
- [ ] Single region deployment
- [ ] Single load balancer
- [ ] Single DNS provider
- [ ] Single authentication provider
- [ ] Single external API dependency

### Application SPOF
- [ ] Monolithic without graceful degradation
- [ ] Critical path without circuit breaker
- [ ] Shared state without failover
- [ ] Singleton services without clustering

### AI/ML SPOF
- [ ] Single model endpoint
- [ ] Single embedding provider
- [ ] No fallback for AI failures
- [ ] Single training pipeline

### Mitigation Patterns
| SPOF | Mitigation |
|------|------------|
| Single DB | Read replicas, multi-AZ |
| Single region | Multi-region active-passive |
| External API | Circuit breaker, fallback |
| Single model | Model routing, degraded mode |

---

## AI System Architecture

### Model Integration Points
- [ ] Where do prompts originate? (user, system, tool)
- [ ] What data flows into the model?
- [ ] What actions can the model trigger?
- [ ] How are outputs validated?
- [ ] Where are outputs displayed/used?

### AI Risk Checklist
| Concern | Question | Control |
|---------|----------|---------|
| Prompt Injection | Can users influence prompts? | Input sanitization |
| Data Leakage | Does model see sensitive data? | PII redaction |
| Output Safety | Can model produce harmful content? | Content filtering |
| Autonomy | What can model do automatically? | Human-in-the-loop |
| Observability | Can we trace model decisions? | Logging, monitoring |

### Agentic AI Concerns
- [ ] What tools/functions can the agent call?
- [ ] Are tool permissions scoped?
- [ ] Is there approval workflow for actions?
- [ ] Can agent escalate to human?
- [ ] How are agent loops prevented?
- [ ] What's the max autonomous actions?

---

## Authentication & Authorization

### Auth Architecture Review
- [ ] What authentication methods supported?
- [ ] Where are credentials stored?
- [ ] How are sessions managed?
- [ ] What's the token lifetime?
- [ ] Is MFA available/required?
- [ ] How is SSO integrated?

### Authorization Model
| Model | Description | When to Use |
|-------|-------------|-------------|
| RBAC | Role-based | Clear job functions |
| ABAC | Attribute-based | Complex policies |
| ReBAC | Relationship-based | Social/collaborative |
| ACL | Access control lists | File/resource-level |

### Permission Audit
- [ ] Principle of least privilege applied?
- [ ] Permissions reviewed periodically?
- [ ] Admin access justified and logged?
- [ ] Service accounts scoped?
- [ ] API keys have expiry?

---

## External Dependencies

### Dependency Inventory
| Dependency | Type | Criticality | Fallback |
|------------|------|-------------|----------|
| Auth0 | Auth SaaS | Critical | Local auth |
| OpenAI | AI API | High | Anthropic |
| Stripe | Payments | Critical | None |
| S3 | Storage | High | GCS |

### Dependency Risk Factors
- [ ] Vendor lock-in level
- [ ] SLA guarantees
- [ ] Data residency compliance
- [ ] Disaster recovery plan
- [ ] Exit strategy documented

### Third-Party AI Risks
- [ ] Model versioning tracked
- [ ] Rate limits understood
- [ ] Cost monitoring in place
- [ ] Data retention policy known
- [ ] Training data usage consent

---

## Scalability & Resilience

### Load Handling
- [ ] Horizontal scaling capability
- [ ] Auto-scaling configured
- [ ] Load testing performed
- [ ] Capacity planning documented
- [ ] Traffic spikes handled

### Resilience Patterns
| Pattern | Purpose | Implementation |
|---------|---------|----------------|
| Circuit Breaker | Prevent cascade | Hystrix, resilience4j |
| Retry w/ Backoff | Transient failures | Exponential backoff |
| Bulkhead | Isolation | Thread pools, queues |
| Timeout | Resource protection | Connection/read timeouts |
| Fallback | Degraded mode | Cached/default response |

### Disaster Recovery
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Backup strategy documented
- [ ] DR tested in last 12 months
- [ ] Runbooks up to date

---

## Observability

### Logging Requirements
- [ ] Structured logging format (JSON)
- [ ] Correlation IDs for tracing
- [ ] Log levels properly used
- [ ] Sensitive data redacted
- [ ] Centralized log aggregation
- [ ] Log retention policy

### Monitoring Requirements
- [ ] Health check endpoints
- [ ] Key metrics dashboards
- [ ] Alerting thresholds defined
- [ ] On-call rotation setup
- [ ] Incident response playbooks

### AI-Specific Observability
- [ ] Model latency tracking
- [ ] Token usage monitoring
- [ ] Error rate dashboards
- [ ] Drift detection alerts
- [ ] Prompt/response logging (privacy-aware)

---

## Quick Architecture Review Template

```markdown
## Architecture Risk Assessment: [System Name]

### Components
- Frontend: [Tech]
- Backend: [Tech]
- Database: [Tech]
- AI/ML: [Model/Provider]
- External: [Dependencies]

### Trust Boundaries Identified
1. [Boundary]: [Controls present/missing]

### Data Flow Concerns
1. [Sensitive data]: [Enters at X, stored in Y, protected by Z]

### Single Points of Failure
1. [SPOF]: [Mitigation status]

### AI-Specific Risks
1. [Risk]: [Control status]

### Recommendations
| Priority | Finding | Recommendation |
|----------|---------|----------------|
| P0 | [Critical] | [Action] |
| P1 | [High] | [Action] |

### Gating Decision
- [ ] Ready for production
- [ ] Conditional (requires X)
- [ ] Block until resolved
```
