# AIRisk Dashboard - Deployment Guide

**Version:** 2.2 | **Date:** 2026-02-10 | **Status:** Active (Updated for Docker deployment)
**Tech Stack:** Next.js 16, React 19, PostgreSQL 15+, Prisma 5, Tailwind CSS v4

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Build & Testing](#build--testing)
6. [Production Deployment](#production-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
| Component | Minimum | Recommended |
|-----------|---------|------------|
| Node.js | 18.x | 20.x LTS |
| npm | 9.x | 10.x |
| PostgreSQL | 14.x | 15.x |
| RAM | 2GB | 8GB |
| Storage | 5GB | 20GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04+ |

### Required Software
```bash
# Check Node.js version
node --version  # v18.0.0 or higher

# Check npm version
npm --version   # 9.0.0 or higher

# PostgreSQL client (optional, for local management)
psql --version  # 14.0 or higher
```

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourorg/airisk-dashboard.git
cd airisk-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy example file
cp .env.example .env.local

# Edit configuration
nano .env.local  # or use your editor
```

### 4. Database Initialization
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

### 6. Verify Setup
```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

---

## Environment Configuration

### Development (.env.local)
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/airm_ip_dev"

# NextAuth Configuration
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_ENV="development"

# Logging
LOG_LEVEL="debug"

# Optional: Redis (for caching, falls back to in-memory)
REDIS_URL="redis://localhost:6379"

# Optional: S3/Blob Storage (for evidence files)
STORAGE_TYPE="s3"  # or "blob"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="airisk-evidence"

# Optional: SMTP (for email notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@company.com"
SMTP_PASS="..."
SMTP_FROM="AIRisk Dashboard <noreply@company.com>"

# Optional: Virus Scanning (Phase 16)
CLAMAV_ENABLED="false"  # Set to "true" if ClamAV service available
CLAMAV_HOST="localhost"
CLAMAV_PORT="3310"

# Optional: Cron Jobs (Phase 17)
CRON_SECRET="$(openssl rand -base64 32)"  # For secure cron triggers
```

### Production (.env)
```bash
# Database (connection pooling recommended)
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/airm_ip?sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="<generate-strong-secret>"
NEXTAUTH_URL="https://airisk.example.com"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="https://airisk.example.com"
NEXT_PUBLIC_APP_ENV="production"

# Security
ALLOWED_ORIGINS="https://airisk.example.com"
CORS_CREDENTIALS="true"

# Logging
LOG_LEVEL="info"

# Cache (if using Redis)
REDIS_URL="redis://user:pass@redis.example.com:6379/0"
```

### Staging (.env.staging)
```bash
# Similar to production but with staging domain
NEXTAUTH_URL="https://staging-airisk.example.com"
NEXT_PUBLIC_API_BASE_URL="https://staging-airisk.example.com"
```

### Environment Variable Descriptions
| Variable | Purpose | Example |
|----------|---------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| NEXTAUTH_SECRET | JWT signing secret (32+ chars) | Generated via `openssl rand -base64 32` |
| NEXTAUTH_URL | Deployment URL for auth callbacks | http://localhost:3000 |
| NEXT_PUBLIC_API_BASE_URL | API base URL (public, safe to expose) | http://localhost:3000 |
| LOG_LEVEL | Logging verbosity | debug, info, warn, error |

---

## Database Setup

### PostgreSQL Installation

```bash
# macOS (Homebrew)
brew install postgresql@15 && brew services start postgresql@15 && createdb airm_ip

# Ubuntu/Debian
sudo apt-get update && sudo apt-get install postgresql-15
sudo systemctl start postgresql && sudo -u postgres createdb airm_ip

# Docker (or use docker-compose, see Docker Deployment section)
docker run -d --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=airm_ip -p 5432:5432 postgres:15
```

### Database Schema Management

```bash
npm run db:push           # Initial migration: creates all tables
npm run db:migrate        # Create new migration (dev): --name add_table
npm run db:reset          # Reset database (dev only): deletes all data
npm run db:seed           # Seed orgs, users, frameworks
npm run db:seed:frameworks  # Seed frameworks only
```

### Backup & Restore

```bash
# Backup (full)
pg_dump -h localhost -U postgres -d airm_ip > backup.sql
pg_dump -h localhost -U postgres -d airm_ip | gzip > backup.sql.gz  # compressed

# Restore
psql -h localhost -U postgres -d airm_ip < backup.sql
gunzip < backup.sql.gz | psql -h localhost -U postgres -d airm_ip  # from compressed
```

---

## Build & Testing

### Development Build
```bash
npm run dev
# Starts dev server with hot reload on port 3000
```

### Production Build
```bash
npm run build
# Creates optimized build in .next/
npm run start
# Starts production server
```

### Type Checking
```bash
npm run type-check
# Checks TypeScript without emitting files
```

### Linting
```bash
npm run lint
# Runs ESLint on codebase
npm run lint -- --fix
# Auto-fixes linting issues
```

### Testing

```bash
# Unit & integration
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:coverage     # With coverage

# E2E
npm run test:e2e          # Headless
npm run test:e2e:headed   # Browser visible
npm run test:e2e -- --debug  # Debug mode

# Performance
npx tsx scripts/performance-benchmark.ts  # Page load + API response times
```

### Pre-Deployment Checklist
```bash
#!/bin/bash
npm run type-check    # TypeScript check
npm run lint          # Code linting
npm run test:run      # Unit tests
npm run test:e2e      # E2E tests
npm run build         # Production build
echo "✅ All checks passed"
```

---

## Production Deployment

### Requirements
- Managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
- Node.js hosting (Vercel, AWS EC2, Google Cloud Run, etc.)
- TLS/SSL certificate
- Domain name
- Environment variables configured

### Vercel Deployment (Recommended)

```bash
# Setup: Push to GitHub → Import in Vercel → Set env vars → Deploy
npm i -g vercel && vercel --prod  # CLI deployment
```

vercel.json:
```json
{
  "env": [
    { "key": "DATABASE_URL", "value": "@db_url" },
    { "key": "NEXTAUTH_SECRET", "value": "@nextauth_secret" }
  ],
  "buildCommand": "npm run build"
}
```

### AWS EC2 Deployment

```bash
ssh -i key.pem ubuntu@instance-ip
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql-client

git clone https://github.com/yourorg/airisk-dashboard.git && cd airisk-dashboard
npm install && npm run build

# Create systemd service
sudo tee /etc/systemd/system/airisk.service > /dev/null <<EOF
[Unit]
Description=AIRisk Dashboard
After=network.target
[Service]
User=ubuntu
ExecStart=/usr/bin/npm start
WorkingDirectory=/home/ubuntu/airisk-dashboard
Restart=always
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable airisk && sudo systemctl start airisk
```

## Docker Deployment

### Quick Start

```bash
# Copy environment configuration
cp .env.docker.example .env.docker

# Edit .env.docker with your values
nano .env.docker

# Start development environment (hot-reload)
make dev

# Or start production environment (nginx + resource limits)
make ssl-self-signed  # Generate self-signed certs for nginx
make prod
```

### Architecture

**3-stage Dockerfile** (109L, final image: 421MB)
- **Stage 1 (deps):** Install all dependencies (dev + prod)
- **Stage 2 (builder):** TypeScript compilation + Next.js build
- **Stage 3 (runner):** Minimal runtime with prod deps only

**3 Compose files:**
- `docker-compose.yml` — Base configuration (PostgreSQL, Redis, app)
- `docker-compose.dev.yml` — Dev overrides (source mount, auto-seed, debug ports)
- `docker-compose.prod.yml` — Prod overrides (nginx reverse proxy, resource limits, log rotation)

### Configuration Files

#### .env.docker (Required)
```bash
# Copy example and configure
cp .env.docker.example .env.docker

# Key variables:
DATABASE_URL=postgresql://airisk:password@db:5432/airm_ip
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000  # or https://yourdomain.com
REDIS_URL=redis://redis:6379
NODE_ENV=production
```

### Makefile Targets

| Command | Purpose |
|---------|---------|
| `make dev` | Start dev with hot-reload (port 3000) |
| `make prod` | Start prod with nginx (ports 80/443) |
| `make build` | Build Docker images |
| `make up` | Start containers (detached) |
| `make down` | Stop containers |
| `make logs` | Follow all container logs |
| `make logs-app` | Follow app logs only |
| `make shell` | Bash shell into app container |
| `make db-shell` | psql shell into database |
| `make clean` | Remove containers + volumes |
| `make backup` | Backup database to ./backups/ |
| `make restore FILE=<path>` | Restore database from backup |
| `make ssl-self-signed` | Generate self-signed SSL certs |
| `make migrate` | Run Prisma migrations |
| `make seed` | Seed database |
| `make test` | Run tests in container |

### Development Mode

**Features:**
- Source code mounted at `/app` (hot-reload enabled)
- Auto-seed on first run
- Debug ports exposed: 3000 (app), 5432 (db), 6379 (redis)
- Verbose logging

```bash
# Start dev environment
make dev

# View logs
make logs-app

# Access database
make db-shell

# Run migrations
make migrate
```

### Production Mode

**Features:**
- Nginx reverse proxy (SSL termination, gzip, rate limiting, static caching)
- Resource limits: app (512MB-1GB), db (256MB-512MB), redis (128MB-256MB)
- JSON log rotation (10MB × 3 files)
- Internal-only db/redis ports
- Backup service (pg_dump to /backups)

```bash
# Generate SSL certificates (self-signed for testing)
make ssl-self-signed

# Or copy your real certs to:
# docker/nginx/ssl/server.crt
# docker/nginx/ssl/server.key

# Start production stack
make prod

# Access via:
# - HTTP: http://localhost:80 (redirects to HTTPS)
# - HTTPS: https://localhost:443
```

**Nginx Configuration:**
- SSL/TLS 1.2-1.3, modern cipher suite
- Gzip compression for text assets
- Static asset caching (1 year for immutable, 1 hour for HTML)
- Rate limiting: 10 req/s burst 20
- Reverse proxy to app:3000 with keepalive

### Critical Configuration Notes

**1. Health Check Uses curl + 127.0.0.1**
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/health || exit 1
```
- **Do NOT use** `localhost` or `wget` (Alpine busybox wget lacks required flags)
- `curl` installed in runner stage specifically for health checks

**2. Prisma Uses Local CLI**
```dockerfile
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && exec npm start"]
```
- **Do NOT use** `npx prisma` or `npm run` in CMD (breaks in Alpine)
- Direct node execution ensures consistent behavior

**3. Prisma Binary Targets**
```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
}
```
- Required for Alpine Linux (musl libc) compatibility
- Regenerate client after changes: `make migrate`

### Dockerfile Structure

```dockerfile
# Stage 1: Install all dependencies (dev + prod)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runtime (minimal)
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl  # For health checks
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/src ./src
EXPOSE 3000
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && exec npm start"]
```

### Docker Compose Services

**app:**
- Build context: `.`
- Depends on: db, redis
- Env file: `.env.docker`
- Health check: `/api/health` endpoint

**db (PostgreSQL 15):**
- Volume: `postgres_data` → `/var/lib/postgresql/data`
- Default user: `airisk` / `password` (change in .env.docker)
- Internal port: 5432 (exposed only in dev)

**redis:**
- Volume: `redis_data` → `/data`
- Internal port: 6379 (exposed only in dev)

**nginx (prod only):**
- Ports: 80, 443
- Volumes: `./docker/nginx/nginx-reverse-proxy.conf`, `./docker/nginx/ssl/`

**backup (prod only):**
- Runs pg_dump daily at 2 AM (configure with cron)
- Saves to `./backups/`

### Troubleshooting

**Issue: Health check failing**
```bash
# Check logs
make logs-app

# Verify database connection
make db-shell
# Then: \l to list databases

# Test health endpoint manually
docker exec -it airisk-app curl http://127.0.0.1:3000/api/health
```

**Issue: Prisma client errors**
```bash
# Regenerate client
make migrate

# Or inside container:
make shell
node ./node_modules/prisma/build/index.js generate
```

**Issue: Port conflicts**
```bash
# Check what's using port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.override.yml:
services:
  app:
    ports:
      - "3001:3000"
```

**Issue: Database connection refused**
```bash
# Verify db service is running
docker ps | grep db

# Check DATABASE_URL in .env.docker
# Must use service name "db" as hostname: postgresql://user:pass@db:5432/airm_ip
```

### Deployment Workflow

**Development:**
```bash
cp .env.docker.example .env.docker
make dev          # Start all services
make logs-app     # Monitor logs
make migrate      # Run migrations
make seed         # Seed data
```

**Production:**
```bash
# Setup
cp .env.docker.example .env.docker
# Edit .env.docker with production values
make ssl-self-signed  # Or copy real certs

# Deploy
make build
make prod
make backup  # Verify backup works

# Monitor
make logs
docker stats  # Check resource usage
```

**CI/CD Integration:**
```bash
# In GitHub Actions or GitLab CI
docker build -t airisk-dashboard:$VERSION .
docker tag airisk-dashboard:$VERSION registry.example.com/airisk:$VERSION
docker push registry.example.com/airisk:$VERSION
```

### SSL/TLS Setup (nginx)
```nginx
server {
    listen 443 ssl http2;
    server_name airisk.example.com;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
server { listen 80; server_name airisk.example.com; return 301 https://$server_name$request_uri; }
```

---

## Monitoring & Maintenance

### Health Checks
```bash
curl https://airisk.example.com/api/health  # API health
npm run db:studio  # Database connectivity via Prisma Studio
```

### Logs
```bash
journalctl -u airisk -f  # Follow systemd service logs
tail -f /var/log/application.log  # Server logs
```

### Performance Monitoring
```bash
npx tsx scripts/performance-benchmark.ts  # Benchmarks
npm run build && ls -lh .next/  # Build size
```

### Database Maintenance
```bash
# In psql:
ANALYZE; VACUUM ANALYZE;  # Query optimization + cleanup
SELECT * FROM pg_stat_activity;  # Monitor connections
```

### Backup Schedule
Daily backups to S3/GCS, test restore weekly, keep 30 days, document recovery procedure.

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution:
- Check PostgreSQL is running: systemctl status postgresql
- Verify DATABASE_URL in .env.local
- Test connection: psql $DATABASE_URL
```

#### 2. NextAuth Configuration Error
```
Error: NEXTAUTH_SECRET not configured

Solution:
- Generate secret: openssl rand -base64 32
- Add to .env.local: NEXTAUTH_SECRET="value"
- Restart dev server
```

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000

Solution:
- Kill process: lsof -ti:3000 | xargs kill -9
- Or use different port: PORT=3001 npm run dev
```

#### 4. Module Not Found
```
Error: Cannot find module '@/lib/db'

Solution:
- Run: npm install
- Check path aliases in tsconfig.json
- Verify file exists at path
```

#### 5. Prisma Migration Conflict
```
Error: Migration history and schema are out of sync

Solution:
- Reset database (dev only): npm run db:reset
- Or resolve conflict manually in prisma/schema.prisma
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Run with node inspector
node --inspect ./node_modules/.bin/next dev
# Then open chrome://inspect in Chrome
```

### Performance Issues
```bash
# Check slow API endpoints
npm run test:coverage  # Identify untested endpoints

# Profile build time
npm run build -- --profile

# Analyze bundle size
npm install -D @next/bundle-analyzer
# Configure in next.config.ts
```

---

## Security Checklist

### Pre-Deployment
- [ ] Environment variables configured securely
- [ ] Database credentials not in repository
- [ ] TLS/SSL certificate installed
- [ ] CORS configuration correct
- [ ] Rate limiting enabled
- [ ] Secrets rotated
- [ ] Backup strategy tested
- [ ] Monitoring configured

### Post-Deployment
- [ ] Verify HTTPS working
- [ ] Test auth flows
- [ ] Monitor error rates
- [ ] Check database backup
- [ ] Review access logs
- [ ] Validate performance metrics

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run linting |
| `npm run type-check` | Check TypeScript |
| `npm run test` | Run tests (watch mode) |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run with coverage report |
| `npm run test:e2e` | Run E2E tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

**Deployment Guide Version:** 2.2 | **Last Updated:** 2026-02-10 | **Maintained By:** docs-manager agent
