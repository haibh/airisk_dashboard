# AIRisk Dashboard - Deployment Guide

**Version:** 2.0 | **Date:** 2026-02-04 | **Status:** Active
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

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb airm_ip
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql-15
sudo systemctl start postgresql
sudo -u postgres createdb airm_ip
```

#### Docker
```bash
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=airm_ip \
  -p 5432:5432 \
  postgres:15
```

### Database Schema Management

#### Initial Migration
```bash
npm run db:push
# Creates all tables and indexes
```

#### Create New Migration (Development)
```bash
npm run db:migrate -- --name add_new_table
# Creates migration file in prisma/migrations/
```

#### Reset Database (Development Only)
```bash
npm run db:reset
# Caution: Deletes all data and re-creates schema
```

#### Database Seeding
```bash
# Seed organizations, users, and frameworks
npm run db:seed

# Seed only frameworks
npm run db:seed:frameworks
```

### Backup & Restore

#### Backup
```bash
# Full database backup
pg_dump -h localhost -U postgres -d airm_ip > backup.sql

# With compression
pg_dump -h localhost -U postgres -d airm_ip | gzip > backup.sql.gz
```

#### Restore
```bash
# From backup file
psql -h localhost -U postgres -d airm_ip < backup.sql

# From compressed backup
gunzip < backup.sql.gz | psql -h localhost -U postgres -d airm_ip
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

#### Unit & Integration Tests
```bash
npm run test              # Watch mode
npm run test:run          # Run once
npm run test:coverage     # With coverage report
```

#### End-to-End Tests
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # With browser visible
npm run test:e2e -- --debug  # Debug mode
```

#### Performance Benchmarks
```bash
npx tsx scripts/performance-benchmark.ts
# Measures page load and API response times
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

### Vercel Deployment (Recommended for Next.js)

#### Setup
1. Push code to GitHub
2. Import project in Vercel console
3. Set environment variables
4. Deploy

```bash
# Command line deployment
npm i -g vercel
vercel --prod
```

#### Configuration (vercel.json)
```json
{
  "env": [
    { "key": "DATABASE_URL", "value": "@db_url" },
    { "key": "NEXTAUTH_SECRET", "value": "@nextauth_secret" },
    { "key": "NEXTAUTH_URL", "value": "@nextauth_url" }
  ],
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

### AWS EC2 Deployment

#### EC2 Setup
```bash
# Connect to instance
ssh -i key.pem ubuntu@instance-ip

# Install Node.js
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client
sudo apt-get install -y postgresql-client

# Clone repository
git clone https://github.com/yourorg/airisk-dashboard.git
cd airisk-dashboard

# Install dependencies
npm install
npm run build

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

# Start service
sudo systemctl enable airisk
sudo systemctl start airisk
```

### Docker Deployment

#### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/airm_ip
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: airm_ip
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name airisk.example.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Maintenance

### Health Checks
```bash
# API health endpoint
curl https://airisk.example.com/api/health

# Database connectivity
npm run db:studio  # Opens Prisma Studio for inspection
```

### Logs
```bash
# Application logs (if running on server)
journalctl -u airisk -f  # Follow logs for airisk service

# Check server logs
tail -f /var/log/application.log
```

### Performance Monitoring
```bash
# Run performance benchmarks
npx tsx scripts/performance-benchmark.ts

# Check build size
npm run build && ls -lh .next/
```

### Database Maintenance
```bash
# Analyze query performance
ANALYZE;

# Vacuum (cleanup dead rows)
VACUUM ANALYZE;

# Monitor connections
SELECT * FROM pg_stat_activity;
```

### Backup Schedule
- Daily automated backups to S3/GCS
- Test restore process weekly
- Keep 30 days of backups
- Document recovery procedure

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

**Deployment Guide Version:** 1.0 | **Last Updated:** 2026-02-03 | **Maintained By:** docs-manager agent
