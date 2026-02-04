# E2E Tests Documentation

## Overview

This directory contains end-to-end (E2E) tests for the AIRisk Dashboard using Playwright. These tests validate authentication flows and dashboard functionality.

## Prerequisites

### Database Setup
The E2E tests require a running PostgreSQL database with seeded data:

```bash
# Start PostgreSQL (if using Docker)
docker run --name airm-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=airm_ip -p 5432:5432 -d postgres:16

# Push Prisma schema to database
npm run db:push

# Seed test data
npm run db:seed
```

### Test User Credentials
Default test credentials (created by seed script):
- Email: `admin@airm-ip.local`
- Password: `Test@123456`

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth-login-flow.spec.ts
```

### Run with debug mode
```bash
npx playwright test --debug
```

## Test Files

### 1. auth-login-flow.spec.ts
Tests core authentication functionality:
- Login with valid credentials → redirect to dashboard
- Login with invalid credentials → display error
- Required field validation
- Loading state during login

### 2. auth-unauthorized-access-redirect.spec.ts
Tests access control:
- Redirect to login when accessing dashboard without auth
- Prevention of unauthenticated dashboard access

### 3. dashboard-page-load.spec.ts
Tests dashboard UI components:
- Successful dashboard load after login
- Presence of 4 stat cards (TotalSystems, HighRisks, ComplianceScore, PendingActions)
- Risk heatmap card display
- Compliance frameworks card display
- Activity/Recent actions card display
- Stat cards contain numeric values

## Configuration

See `playwright.config.ts` for configuration:
- baseURL: `http://localhost:3000`
- Browser: Chromium only (MVP scope)
- Test directory: `tests/e2e/`
- Server: Starts dev server automatically in non-CI environments

## Debugging

### View test report
```bash
npx playwright show-report
```

### Run single test with trace
```bash
npx playwright test auth-login-flow.spec.ts --trace on
```

## CI/CD Integration

Tests are configured for CI with:
- 2 retries on failure
- Single worker (serial execution)
- Trace recording on first retry
- HTML report generation
