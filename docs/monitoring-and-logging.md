# Monitoring and Logging

## Overview

This document describes the health check and monitoring system for AIRM-IP, including structured logging, correlation ID tracking, and service health monitoring.

## Health Check Endpoint

### Endpoint
```
GET /api/health
```

### Response Format
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  timestamp: string,  // ISO 8601 format
  version: string,    // Application version
  services: {
    database: {
      status: 'up' | 'down',
      latencyMs: number,
      message?: string  // Error message if down
    },
    redis: {
      status: 'up' | 'down',
      latencyMs: number,
      message?: string
    },
    storage: {
      status: 'up' | 'down',
      latencyMs: number,
      message?: string
    }
  },
  uptime: number  // Server uptime in seconds
}
```

### Health Status Logic

- **healthy**: All services are operational
- **degraded**: Non-critical services (Redis, S3) are down, but database is up
- **unhealthy**: Critical service (database) is down

### HTTP Status Codes

- `200 OK`: Healthy or degraded
- `503 Service Unavailable`: Unhealthy

### Performance Target

- Response time: < 100ms
- All checks run in parallel for faster response
- Includes `X-Response-Time` header in response

### Usage

#### Kubernetes Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

#### Kubernetes Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  successThreshold: 1
  failureThreshold: 3
```

#### Monitoring Services
```bash
# Datadog
curl http://localhost:3000/api/health

# Prometheus
# (Add custom exporter to convert JSON to metrics)
```

## Structured Logging

### Module: `src/lib/logger-structured.ts`

Enhanced logger with correlation ID tracking, sensitive data redaction, and JSON output for production.

### Basic Usage

```typescript
import * as logger from '@/lib/logger-structured';

// Basic logging
logger.info('User login successful', { userId: '123' });
logger.warn('Cache miss detected', { key: 'user:profile:123' });
logger.error('Database connection failed', new Error('ECONNREFUSED'));
logger.debug('Query executed', { query: 'SELECT * FROM users' });

// With correlation ID (from request context)
logger.info('Processing request', {
  correlationId: req.headers.get('x-correlation-id'),
  userId: session.user.id,
  action: 'create-assessment'
});
```

### Request Logging

```typescript
import { logRequest } from '@/lib/logger-structured';

// Log HTTP requests
logRequest('GET', '/api/assessments', 200, 145, {
  correlationId: 'req-abc123',
  userId: 'user-456',
  ip: '192.168.1.1'
});
// Output: GET /api/assessments 200 (145ms)
```

### Database Query Logging

```typescript
import { logDbQuery } from '@/lib/logger-structured';

// Log slow queries (only logged if > 1s in production)
logDbQuery(
  'SELECT * FROM risk_assessment WHERE organizationId = ?',
  1250,  // 1.25 seconds
  {
    correlationId: 'req-abc123',
    params: { organizationId: 'org-123' }
  }
);
```

### Features

#### Sensitive Data Redaction
Automatically redacts fields containing:
- `password`
- `token`
- `secret`
- `api_key` / `apiKey`
- `auth`
- `credential`
- `bearer`
- `authorization`

```typescript
logger.info('User authenticated', {
  userId: '123',
  password: 'secret123',  // Will be redacted
  apiKey: 'sk-abc'        // Will be redacted
});
// Output: { userId: '123', password: '[REDACTED]', apiKey: '[REDACTED]' }
```

#### Environment-Based Formatting

**Development** (human-readable):
```
[2026-02-04T00:50:00.123Z] [INFO] [corr:req-abc123] [user:user-456] (145ms): Processing request
```

**Production** (JSON for log aggregators):
```json
{
  "timestamp": "2026-02-04T00:50:00.123Z",
  "level": "info",
  "message": "Processing request",
  "correlationId": "req-abc123",
  "userId": "user-456",
  "duration": 145,
  "metadata": {}
}
```

## Correlation ID Tracking

### Purpose
Track requests across distributed services and log entries for debugging and tracing.

### Implementation

Correlation IDs are automatically generated in `middleware.ts` and attached to all responses via the `x-correlation-id` header.

#### Format
```
req-{timestamp36}-{random12hex}
Example: req-lzq7k3-8a9f2e4d1c6b
```

#### Request Flow

1. **Middleware** generates or extracts correlation ID from request header
2. **Middleware** attaches to response header `x-correlation-id`
3. **API Routes** extract from request and pass to logger
4. **Logger** includes in all log entries for that request

#### API Route Usage

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as logger from '@/lib/logger-structured';

export async function GET(request: NextRequest) {
  const correlationId = request.headers.get('x-correlation-id');

  logger.info('Fetching assessments', {
    correlationId,
    userId: session.user.id
  });

  // ... business logic ...

  return NextResponse.json(data, {
    headers: {
      'x-correlation-id': correlationId || ''
    }
  });
}
```

## Integration with Monitoring Services

### CloudWatch Logs (AWS)

```typescript
// JSON format is automatically parsed by CloudWatch
// Search by correlation ID:
// { $.correlationId = "req-lzq7k3-8a9f2e4d1c6b" }
```

### Datadog

```typescript
// Add Datadog agent configuration
// Logs are automatically ingested and searchable
// Filter: correlationId:req-lzq7k3-8a9f2e4d1c6b
```

### Grafana Loki

```typescript
// LogQL query
{job="airm-ip"} |= "req-lzq7k3-8a9f2e4d1c6b"
```

## Best Practices

### 1. Always Use Correlation ID
```typescript
// ✅ Good
logger.info('Processing request', {
  correlationId: request.headers.get('x-correlation-id')
});

// ❌ Bad
logger.info('Processing request');
```

### 2. Include User Context
```typescript
// ✅ Good
logger.error('Failed to create assessment', error, {
  correlationId: req.headers.get('x-correlation-id'),
  userId: session.user.id,
  organizationId: session.user.organizationId
});

// ❌ Bad
logger.error('Failed to create assessment', error);
```

### 3. Log Slow Operations
```typescript
const startTime = Date.now();
// ... operation ...
const duration = Date.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow operation detected', {
    duration,
    operation: 'generateReport',
    correlationId
  });
}
```

### 4. Structured Metadata
```typescript
// ✅ Good - structured data
logger.info('Assessment created', {
  assessmentId: 'assess-123',
  riskLevel: 'HIGH',
  controlCount: 15
});

// ❌ Bad - string concatenation
logger.info('Assessment assess-123 created with HIGH risk and 15 controls');
```

## Troubleshooting

### High Health Check Latency

If health checks consistently exceed 100ms:

1. **Check Database Connection Pool**
   ```typescript
   // Prisma connection pool settings
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     // Add connection pool settings
   }
   ```

2. **Check Redis Latency**
   ```bash
   redis-cli --latency
   ```

3. **Check S3 Connectivity**
   ```bash
   aws s3 ls s3://bucket-name --endpoint-url http://localhost:9000
   ```

### Missing Correlation IDs in Logs

Ensure middleware is properly configured and correlation ID is passed through all layers:
- Middleware generates ID
- API routes extract from headers
- Business logic passes to logger

### Logs Not Appearing in Production

Check:
1. `NODE_ENV=production` is set
2. Log aggregator is configured
3. Console output is not suppressed by process manager
