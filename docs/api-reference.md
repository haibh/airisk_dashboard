# AIRisk Dashboard - API Reference

**Version:** 1.0
**Base URL:** `/api`
**Format:** JSON
**Authentication:** JWT Bearer Token
**Last Updated:** 2026-02-03

---

## Quick Reference

### Response Format
All endpoints return standard response format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

### Query Parameters (Common)
- `page` (integer): Page number for pagination (default: 1)
- `pageSize` (integer): Items per page (default: 10)
- `search` (string): Search query for filtering
- `sortBy` (string): Field to sort by
- `sortOrder` (asc|desc): Sort direction

---

## Authentication Endpoints

### POST /auth/signin
Sign in with credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "Risk Manager"
    },
    "token": "eyJhbGc..."
  }
}
```

**Errors:**
- 401: Invalid credentials
- 400: Email or password missing

---

### POST /auth/signout
Sign out current user session.

**Request:** No body required

**Response (200):**
```json
{
  "success": true,
  "message": "Signed out successfully"
}
```

---

## AI Systems Endpoints

### GET /ai-systems
List all AI systems with pagination and filtering.

**Query Parameters:**
- `page` (integer, default: 1)
- `pageSize` (integer, default: 10)
- `search` (string): Search in name/description
- `status` (string): Filter by status (Development, Pilot, Production, Retired)
- `dataClassification` (string): Filter by classification
- `sortBy` (string): Field to sort (name, status, createdAt)
- `sortOrder` (asc|desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sys_123",
      "name": "Customer Churn Prediction",
      "type": "ML",
      "status": "Production",
      "dataClassification": "Confidential",
      "description": "Predicts customer churn...",
      "owner": "john@example.com",
      "technicalOwner": "jane@example.com",
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-03T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  }
}
```

**Errors:**
- 401: Unauthorized
- 400: Invalid query parameters

---

### POST /ai-systems
Create a new AI system.

**Request:**
```json
{
  "name": "Customer Churn Prediction",
  "type": "ML",
  "status": "Pilot",
  "dataClassification": "Confidential",
  "description": "Predicts customer churn probability",
  "owner": "john@example.com",
  "technicalOwner": "jane@example.com",
  "riskOwner": "risk@example.com"
}
```

**Required Fields:** name, type, status, dataClassification
**Optional Fields:** description, owner, technicalOwner, riskOwner

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "sys_456",
    "name": "Customer Churn Prediction",
    "type": "ML",
    "status": "Pilot",
    "dataClassification": "Confidential",
    "createdAt": "2026-02-03T15:00:00Z"
  }
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 400: Validation error

---

### GET /ai-systems/[id]
Get a single AI system by ID.

**Path Parameters:**
- `id` (string): System ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sys_123",
    "name": "Customer Churn Prediction",
    "type": "ML",
    "status": "Production",
    "dataClassification": "Confidential",
    "description": "Predicts customer churn...",
    "owner": "john@example.com",
    "technicalOwner": "jane@example.com",
    "riskOwner": "risk@example.com",
    "createdAt": "2026-02-01T10:00:00Z",
    "updatedAt": "2026-02-03T14:30:00Z"
  }
}
```

**Errors:**
- 401: Unauthorized
- 404: System not found

---

### PUT /ai-systems/[id]
Update an AI system.

**Path Parameters:**
- `id` (string): System ID

**Request:**
```json
{
  "name": "Updated Name",
  "status": "Production",
  "dataClassification": "Restricted",
  "owner": "newowner@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "sys_123",
    "name": "Updated Name",
    "status": "Production",
    "dataClassification": "Restricted",
    "updatedAt": "2026-02-03T15:15:00Z"
  }
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: System not found
- 400: Validation error

---

### DELETE /ai-systems/[id]
Soft delete an AI system (sets status to RETIRED).

**Path Parameters:**
- `id` (string): System ID

**Response (200):**
```json
{
  "success": true,
  "message": "System retired successfully",
  "data": {
    "id": "sys_123",
    "status": "Retired"
  }
}
```

**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: System not found

---

## Assessments Endpoints

### GET /assessments
List all assessments with pagination and filtering.

**Query Parameters:**
- `page` (integer, default: 1)
- `pageSize` (integer, default: 10)
- `search` (string): Search in title/description
- `status` (string): Filter by status (DRAFT, IN_PROGRESS, UNDER_REVIEW, APPROVED)
- `systemId` (string): Filter by AI system
- `frameworkId` (string): Filter by framework
- `sortBy` (string): Field to sort (createdAt, title, status)
- `sortOrder` (asc|desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "assess_123",
      "title": "Q1 2026 Risk Assessment",
      "description": "Quarterly assessment...",
      "aiSystemId": "sys_123",
      "systemName": "Customer Churn Prediction",
      "frameworkId": "fw_001",
      "frameworkName": "NIST AI RMF",
      "status": "APPROVED",
      "riskCount": 15,
      "criticalRiskCount": 2,
      "createdBy": "assessor@example.com",
      "createdAt": "2026-02-01T10:00:00Z",
      "updatedAt": "2026-02-03T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 28,
    "page": 1,
    "pageSize": 10,
    "totalPages": 3
  }
}
```

---

### POST /assessments
Create a new assessment.

**Request:**
```json
{
  "title": "Q1 2026 Risk Assessment",
  "description": "Quarterly assessment for churn model",
  "aiSystemId": "sys_123",
  "frameworkId": "fw_001"
}
```

**Required Fields:** title, aiSystemId, frameworkId
**Optional Fields:** description

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "assess_456",
    "title": "Q1 2026 Risk Assessment",
    "status": "DRAFT",
    "createdAt": "2026-02-03T15:00:00Z"
  }
}
```

---

### GET /assessments/[id]
Get a single assessment with all risks.

**Path Parameters:**
- `id` (string): Assessment ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "assess_123",
    "title": "Q1 2026 Risk Assessment",
    "status": "APPROVED",
    "aiSystemId": "sys_123",
    "frameworkId": "fw_001",
    "risks": [
      {
        "id": "risk_001",
        "title": "Data Bias in Model",
        "category": "Bias/Fairness",
        "likelihood": 4,
        "impact": 4,
        "inherentScore": 16,
        "controlEffectiveness": 70,
        "residualScore": 5,
        "status": "Open",
        "createdAt": "2026-02-01T10:00:00Z"
      }
    ],
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

---

### PUT /assessments/[id]
Update an assessment.

**Path Parameters:**
- `id` (string): Assessment ID

**Request:**
```json
{
  "title": "Updated Title",
  "status": "IN_PROGRESS",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "assess_123",
    "status": "IN_PROGRESS",
    "updatedAt": "2026-02-03T15:15:00Z"
  }
}
```

---

### GET /assessments/[id]/risks
Get all risks for an assessment.

**Path Parameters:**
- `id` (string): Assessment ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "risk_001",
      "assessmentId": "assess_123",
      "title": "Data Bias in Model",
      "category": "Bias/Fairness",
      "likelihood": 4,
      "impact": 4,
      "inherentScore": 16,
      "controlEffectiveness": 70,
      "residualScore": 5,
      "status": "Open"
    }
  ]
}
```

---

### POST /assessments/[id]/risks
Add a risk to an assessment.

**Path Parameters:**
- `id` (string): Assessment ID

**Request:**
```json
{
  "title": "Model Transparency Issue",
  "category": "Transparency",
  "description": "Model predictions are not easily explainable",
  "likelihood": 3,
  "impact": 3,
  "controlEffectiveness": 50
}
```

**Required Fields:** title, category, likelihood, impact
**Optional Fields:** description, controlEffectiveness

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "risk_789",
    "assessmentId": "assess_123",
    "title": "Model Transparency Issue",
    "category": "Transparency",
    "inherentScore": 9,
    "residualScore": 5,
    "status": "Open"
  }
}
```

---

## Risks Endpoints

### GET /risks/[id]
Get a single risk by ID.

**Path Parameters:**
- `id` (string): Risk ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "risk_001",
    "assessmentId": "assess_123",
    "title": "Data Bias in Model",
    "category": "Bias/Fairness",
    "description": "Training data contains historical bias",
    "likelihood": 4,
    "impact": 4,
    "inherentScore": 16,
    "controlEffectiveness": 70,
    "residualScore": 5,
    "status": "Open",
    "createdAt": "2026-02-01T10:00:00Z"
  }
}
```

---

### PUT /risks/[id]
Update a risk.

**Path Parameters:**
- `id` (string): Risk ID

**Request:**
```json
{
  "title": "Updated Risk Title",
  "likelihood": 3,
  "impact": 4,
  "controlEffectiveness": 80,
  "status": "In Progress"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "risk_001",
    "title": "Updated Risk Title",
    "inherentScore": 12,
    "residualScore": 2,
    "updatedAt": "2026-02-03T15:20:00Z"
  }
}
```

---

### DELETE /risks/[id]
Delete a risk.

**Path Parameters:**
- `id` (string): Risk ID

**Response (200):**
```json
{
  "success": true,
  "message": "Risk deleted successfully"
}
```

---

## Frameworks Endpoints

### GET /frameworks
List all available frameworks.

**Query Parameters:**
- `isActive` (boolean): Filter by active status

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "fw_001",
      "name": "NIST AI RMF",
      "version": "1.0",
      "effectiveDate": "2023-01-01",
      "description": "NIST AI Risk Management Framework",
      "isActive": true,
      "controlCount": 85
    },
    {
      "id": "fw_002",
      "name": "ISO 42001",
      "version": "2023",
      "effectiveDate": "2023-10-01",
      "description": "ISO AI Management System",
      "isActive": true,
      "controlCount": 38
    }
  ]
}
```

---

### GET /frameworks/[id]
Get a single framework with metadata.

**Path Parameters:**
- `id` (string): Framework ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "fw_001",
    "name": "NIST AI RMF",
    "version": "1.0",
    "effectiveDate": "2023-01-01",
    "description": "NIST AI Risk Management Framework 1.0",
    "isActive": true,
    "controlCount": 85,
    "categories": 19
  }
}
```

---

### GET /frameworks/[id]/controls
Get all controls for a framework.

**Path Parameters:**
- `id` (string): Framework ID

**Query Parameters:**
- `search` (string): Search controls
- `category` (string): Filter by category

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ctrl_001",
      "code": "GOVERN-1.1",
      "title": "Risk Management Structure",
      "description": "Organization has established structure...",
      "category": "Govern",
      "frameworkId": "fw_001"
    },
    {
      "id": "ctrl_002",
      "code": "MAP-2.1",
      "title": "Context Definition",
      "description": "AI system context is defined...",
      "category": "Map",
      "frameworkId": "fw_001"
    }
  ]
}
```

---

### GET /frameworks/mappings
Get control mappings between frameworks.

**Query Parameters:**
- `sourceFrameworkId` (string): Source framework
- `targetFrameworkId` (string): Target framework
- `confidenceLevel` (string): Filter by confidence (HIGH, MEDIUM, LOW)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "map_001",
      "sourceControl": {
        "id": "ctrl_001",
        "code": "GOVERN-1.1",
        "title": "Risk Management Structure",
        "frameworkName": "NIST AI RMF"
      },
      "targetControl": {
        "id": "ctrl_iso_001",
        "code": "A.2.1",
        "title": "Leadership and Commitment",
        "frameworkName": "ISO 42001"
      },
      "confidence": "HIGH",
      "rationale": "Both controls address organizational governance..."
    }
  ]
}
```

---

## Dashboard Endpoints

### GET /dashboard/stats
Get dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalAISystems": 45,
    "activeAssessments": 12,
    "criticalRisks": 3,
    "mediumRisks": 18,
    "lowRisks": 42,
    "completedAssessments": 28,
    "frameworkComplianceAverage": 72.5
  }
}
```

---

### GET /dashboard/risk-heatmap
Get risk distribution data for heatmap.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "distribution": [
      { "category": "Bias/Fairness", "count": 12, "critical": 1 },
      { "category": "Privacy", "count": 8, "critical": 1 },
      { "category": "Security", "count": 15, "critical": 1 },
      { "category": "Reliability", "count": 10, "critical": 0 },
      { "category": "Transparency", "count": 7, "critical": 0 }
    ],
    "byStatus": {
      "Open": 34,
      "InProgress": 12,
      "Resolved": 8
    }
  }
}
```

---

### GET /dashboard/compliance
Get framework compliance scores.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "frameworkId": "fw_001",
      "frameworkName": "NIST AI RMF",
      "compliancePercentage": 75,
      "satisfiedControls": 64,
      "totalControls": 85,
      "lastAssessment": "2026-02-03T10:00:00Z"
    },
    {
      "frameworkId": "fw_002",
      "frameworkName": "ISO 42001",
      "compliancePercentage": 68,
      "satisfiedControls": 26,
      "totalControls": 38,
      "lastAssessment": "2026-02-01T14:30:00Z"
    }
  ]
}
```

---

### GET /dashboard/activity
Get recent activity feed.

**Query Parameters:**
- `limit` (integer, default: 20): Number of recent activities

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_001",
      "type": "assessment_created",
      "title": "Assessment created",
      "description": "New assessment 'Q1 2026' created for system 'Churn Model'",
      "actor": "assessor@example.com",
      "timestamp": "2026-02-03T15:20:00Z"
    },
    {
      "id": "activity_002",
      "type": "risk_updated",
      "title": "Risk updated",
      "description": "Risk 'Data Bias' updated with new effectiveness score",
      "actor": "risk-manager@example.com",
      "timestamp": "2026-02-03T14:50:00Z"
    }
  ]
}
```

---

## Reports Endpoints

### GET /reports/risk-register
Export risk register (PDF or CSV).

**Query Parameters:**
- `format` (pdf|csv): Export format
- `assessmentId` (string, optional): Filter by assessment
- `status` (string, optional): Filter by risk status

**Response (200):**
```
Content-Type: application/pdf or text/csv
[Binary content or CSV data]
```

---

### GET /reports/assessment-summary
Export assessment summary report.

**Query Parameters:**
- `format` (pdf|csv): Export format
- `assessmentId` (string): Assessment ID (required)

**Response (200):**
```
Content-Type: application/pdf or text/csv
[Binary content or CSV data]
```

---

### GET /reports/compliance
Export compliance report.

**Query Parameters:**
- `format` (pdf|csv): Export format
- `frameworkId` (string, optional): Filter by framework

**Response (200):**
```
Content-Type: application/pdf or text/csv
[Binary content or CSV data]
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | Insufficient permissions for action |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Request validation failed |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Rate limit exceeded |
| SERVER_ERROR | 500 | Internal server error |

---

## Rate Limiting

API endpoints are rate limited per role:

| Role | Requests/Minute | Requests/Hour |
|------|-----------------|---------------|
| Admin | 120 | 3000 |
| Risk Manager | 90 | 2000 |
| Assessor | 60 | 1500 |
| Auditor | 40 | 1000 |
| Viewer | 20 | 500 |

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1645105200
```

---

## Performance Guidelines

**Response Time Targets (NFR-PERF-02):**
- List endpoints: < 500ms
- Single resource: < 200ms
- Create/Update: < 300ms
- Delete: < 200ms
- Export: < 5 seconds

**Pagination Recommendations:**
- Default page size: 10-25 items
- Maximum page size: 100 items
- Use pagination for lists > 50 items

---

**API Reference Version:** 1.0
**Last Updated:** 2026-02-03
**Maintained By:** docs-manager agent
