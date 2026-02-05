# Code Review Security Patterns

## Critical Blockers (P0) - Must Block

### 1. Hardcoded Secrets
**Pattern:** API keys, passwords, tokens in code
```regex
(api[_-]?key|password|secret|token|credential)\s*[:=]\s*["'][^"']+["']
```
**Risk:** CRITICAL | Credential theft, unauthorized access
**Framework:** CIS-3, ISO 27001 A.8.24
**Fix:** Use environment variables, secrets manager

### 2. SQL Injection
**Pattern:** String concatenation in queries
```regex
(execute|query|raw)\s*\(\s*["'`].*\$\{|\+\s*\w+\s*\+
```
**Risk:** CRITICAL | Data breach, data manipulation
**Framework:** OWASP A03, CIS-16
**Fix:** Parameterized queries, ORM with escaping

### 3. Prompt Injection (AI)
**Pattern:** Unvalidated user input to LLM
```regex
(openai|anthropic|llm|gpt|claude).*\.\w+\(.*user(Input|Message|Query)
```
**Risk:** CRITICAL | Unauthorized actions, data exfiltration
**Framework:** NIST AI RMF MANAGE-1, OWASP LLM01
**Fix:** Input sanitization, output validation, sandboxing

### 4. Missing Authentication
**Pattern:** Public endpoints without auth check
```regex
(app\.(get|post|put|delete)|router\.\w+)\s*\([^)]+\)\s*=>\s*\{[^}]*(?!auth|session|token)
```
**Risk:** CRITICAL | Unauthorized access
**Framework:** ISO 27001 A.8.2, CIS-6
**Fix:** Middleware auth, session validation

### 5. PII in Logs
**Pattern:** Logging sensitive data
```regex
(console\.log|logger\.\w+|log\.\w+)\s*\([^)]*\b(email|ssn|password|credit|phone)\b
```
**Risk:** CRITICAL | Privacy violation, data breach
**Framework:** ISO 42001 A.7.1, NIST CSF PR.DS
**Fix:** Log sanitization, PII redaction

---

## High Severity (P1) - Must Fix Before Release

### 6. NoSQL Injection
**Pattern:** Unvalidated input in MongoDB queries
```regex
(find|update|delete)\w*\(\s*\{[^}]*\$\w+
```
**Risk:** HIGH | Data manipulation
**Framework:** OWASP A03
**Fix:** Schema validation, sanitize operators

### 7. XSS (Cross-Site Scripting)
**Pattern:** Unescaped output to HTML
```regex
(innerHTML|dangerouslySetInnerHTML|v-html)\s*=
```
**Risk:** HIGH | Session hijacking, defacement
**Framework:** OWASP A03, CIS-16
**Fix:** Output encoding, CSP headers

### 8. Insecure Deserialization
**Pattern:** Deserializing untrusted data
```regex
(JSON\.parse|pickle\.loads?|yaml\.load|eval)\s*\([^)]*\b(req|request|input|body)\b
```
**Risk:** HIGH | Remote code execution
**Framework:** OWASP A08
**Fix:** Schema validation, allowlisting

### 9. Path Traversal
**Pattern:** File paths from user input
```regex
(readFile|writeFile|open|path\.join)\s*\([^)]*\b(req|request|user|param)\b
```
**Risk:** HIGH | Unauthorized file access
**Framework:** OWASP A01, CIS-3
**Fix:** Path normalization, allowlisting

### 10. Missing Rate Limiting
**Pattern:** Auth endpoints without throttling
```regex
(login|signin|register|password|reset).*(?!rateLimit|throttle)
```
**Risk:** HIGH | Brute force, DoS
**Framework:** OWASP A04, CIS-16
**Fix:** Rate limiter middleware

---

## Medium Severity (P2) - Track & Fix

### 11. Weak Cryptography
**Pattern:** Deprecated algorithms
```regex
(md5|sha1|des|rc4|ecb)\s*\(
```
**Risk:** MEDIUM | Data compromise
**Framework:** ISO 27001 A.8.24, CIS-3
**Fix:** Use SHA-256+, AES-GCM

### 12. Missing Error Handling
**Pattern:** Unhandled async/promises
```regex
(await|\.then)\s*\([^)]+\)(?!\.catch|\s*catch)
```
**Risk:** MEDIUM | Information disclosure, crashes
**Framework:** OWASP A09
**Fix:** try-catch, error boundaries

### 13. Excessive Data Exposure
**Pattern:** Returning full objects
```regex
res\.(json|send)\s*\(\s*(user|account|profile|data)\s*\)
```
**Risk:** MEDIUM | Information disclosure
**Framework:** OWASP A01
**Fix:** Response DTOs, field selection

### 14. Insecure Cookie
**Pattern:** Missing security flags
```regex
(cookie|setCookie)\s*\([^)]+(?!httpOnly|secure|sameSite)
```
**Risk:** MEDIUM | Session hijacking
**Framework:** OWASP A07
**Fix:** httpOnly, secure, sameSite

### 15. Missing Input Validation
**Pattern:** Direct use of request params
```regex
(req\.(body|params|query)\.\w+)(?!\s*\?\?|\s*\|\||\s*&&)
```
**Risk:** MEDIUM | Various injection attacks
**Framework:** OWASP A03
**Fix:** Zod/Joi validation schemas

---

## AI-Specific Patterns

### 16. Unbounded AI Autonomy
**Pattern:** AI agent with unlimited tool access
```regex
(agent|assistant).*tools?\s*[:=]\s*\[.*\](?!.*limit|.*restrict)
```
**Risk:** HIGH | Uncontrolled actions
**Framework:** NIST AI RMF GOVERN-1
**Fix:** Scope tools, approval workflows

### 17. Missing Output Filters
**Pattern:** Raw LLM output to user
```regex
(response|completion|message)\.content(?!.*filter|.*sanitize)
```
**Risk:** HIGH | Harmful content exposure
**Framework:** NIST AI RMF MANAGE-1
**Fix:** Content filtering, safety classifiers

### 18. Training Data Leakage
**Pattern:** Model outputs with memorization risk
```regex
(fine[_-]?tune|train).*(?!.*differential|.*privacy)
```
**Risk:** MEDIUM | PII/IP exposure
**Framework:** ISO 42001 A.7.1
**Fix:** Differential privacy, data filtering

### 19. Missing Model Monitoring
**Pattern:** Production model without observability
```regex
(model|llm|inference)\.predict(?!.*log|.*metric|.*monitor)
```
**Risk:** MEDIUM | Drift, degradation undetected
**Framework:** NIST AI RMF MEASURE-1
**Fix:** Logging, metrics, alerts

### 20. Unsafe Tool Permissions
**Pattern:** AI tools with write access
```regex
(tool|function).*\b(write|delete|execute|modify)\b(?!.*confirm|.*approve)
```
**Risk:** HIGH | Unintended modifications
**Framework:** NIST AI RMF MANAGE-1
**Fix:** Read-only default, approval gates

---

## Quick Scan Commands

```bash
# Secrets scan
grep -rn "api_key\|password\|secret" --include="*.ts" --include="*.js"

# SQL injection
grep -rn "execute\|query.*\+" --include="*.ts" --include="*.js"

# Dangerous functions
grep -rn "eval\|innerHTML\|dangerouslySetInnerHTML" --include="*.ts" --include="*.tsx"

# Missing auth
grep -rn "app\.\(get\|post\)" --include="*.ts" | grep -v "auth\|session"
```

## Review Checklist

- [ ] No hardcoded secrets
- [ ] All queries parameterized
- [ ] Auth on all protected routes
- [ ] Input validation with schemas
- [ ] Output encoding for HTML
- [ ] Error handling complete
- [ ] Logging sanitized (no PII)
- [ ] AI inputs/outputs filtered
- [ ] Rate limiting on sensitive endpoints
- [ ] Secure cookie flags set
