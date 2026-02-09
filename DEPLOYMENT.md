# Deployment Guide

Quick reference for deploying AIRM-IP using Docker and GitHub Actions.

## Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- Node.js 20+ (for local development)
- PostgreSQL 15+ (or use docker-compose)

## Local Development with Docker

### Start Full Stack

```bash
# Build and start all services (app + postgres + redis + minio)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

Application accessible at: http://localhost:3000

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Access Services

- **Application**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (user: minioadmin, pass: minioadmin)
- **PostgreSQL**: localhost:5432 (user: airm, pass: airm_secret, db: airm_ip)
- **Redis**: localhost:6379

### Run Database Migrations

```bash
# Inside container
docker-compose exec app npx prisma migrate deploy

# Or rebuild container (migrations run on startup)
docker-compose up --build app
```

### Seed Database

```bash
# Set flag in .env.docker
SEED_ON_START=true

# Then rebuild
docker-compose up --build app
```

## Production Deployment

### Build Docker Image

```bash
# Build with buildx
docker buildx build \
  --platform linux/amd64 \
  --build-arg COMMIT_SHA=$(git rev-parse HEAD) \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  -t airm-ip:latest \
  .
```

### Run Production Container

```bash
docker run -d \
  --name airm-ip \
  -p 3000:3000 \
  --env-file .env.production \
  airm-ip:latest
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-09T...",
  "version": "1.0.0",
  "services": {
    "database": { "status": "up", "latencyMs": 15, "version": "15.3" },
    "redis": { "status": "up", "latencyMs": 2 },
    "storage": { "status": "up", "latencyMs": 45 }
  },
  "uptime": 3600
}
```

## GitHub Actions CI/CD

### CI Pipeline

Triggers on PR to main:
- ✅ Lint check (continue on error due to path spaces)
- ✅ TypeScript type check
- ✅ Unit tests with coverage
- ✅ Production build
- ⚠️ E2E tests (optional, can fail)

### Deploy Pipeline

Triggers on push to main:
- Builds Docker image
- Pushes to GitHub Container Registry (ghcr.io)
- Tags: `latest`, `main-{sha}`, `main`

### Pull Image from GHCR

```bash
# Login to GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull image
docker pull ghcr.io/OWNER/REPO:latest
```

## Database Backup

### Manual Backup

```bash
./scripts/postgres-backup-with-rotation.sh
```

Backups stored in `/backups` with 30-day retention.

### Automated Backup (Cron)

```bash
# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/scripts/postgres-backup-with-rotation.sh
```

### Restore from Backup

```bash
# Decompress and restore
gunzip < /backups/airm_20260209_020000.sql.gz | \
  psql -h localhost -U airm -d airm_ip
```

## Environment Variables

### Required (All Environments)

```bash
DATABASE_URL="postgresql://user:pass@host:5432/airm_ip"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="https://your-domain.com"
```

### Optional (Recommended)

```bash
REDIS_URL="redis://redis:6379"              # Cache (falls back to in-memory)
S3_ENDPOINT="https://s3.amazonaws.com"      # Evidence storage
S3_BUCKET="airm-evidence"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
```

### Docker Specific

```bash
SEED_ON_START="false"                       # Seed DB on container start
NODE_ENV="production"
```

See `.env.example` and `.env.docker` for full configuration.

## Monitoring

### Logs

Application outputs structured JSON logs in production:

```bash
# View logs
docker logs -f airm-ip

# JSON format example
{"level":"info","timestamp":"2026-02-09T...","message":"Server started","port":3000}
```

### Health Monitoring

Use `/api/health` for:
- Container orchestration (Kubernetes liveness/readiness probes)
- Load balancer health checks
- Monitoring dashboards (Datadog, New Relic)

Health check configuration in Dockerfile:
- Interval: 30s
- Timeout: 5s
- Start period: 60s (allows migrations to complete)
- Retries: 3

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Database not ready → wait-for-postgres-database-ready.sh retries for 60s
# - Migration failed → check DATABASE_URL
# - Port conflict → change port mapping in docker-compose.yml
```

### Database connection issues

```bash
# Test connection manually
docker-compose exec app npx prisma db execute --stdin < /dev/null

# Check PostgreSQL logs
docker-compose logs postgres
```

### Build fails

```bash
# Clear build cache
docker builder prune -af

# Rebuild without cache
docker-compose build --no-cache
```

### Performance issues

```bash
# Check resource usage
docker stats

# Increase memory limit in docker-compose.yml
services:
  app:
    mem_limit: 2g
    cpus: 2
```

## Cloud Deployment Examples

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT/airm-ip

# Deploy
gcloud run deploy airm-ip \
  --image gcr.io/PROJECT/airm-ip \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=... \
  --allow-unauthenticated
```

### AWS ECS

```bash
# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin ECR_URI
docker tag airm-ip:latest ECR_URI/airm-ip:latest
docker push ECR_URI/airm-ip:latest

# Update service
aws ecs update-service --cluster airm-cluster --service airm-service --force-new-deployment
```

### Kubernetes

```bash
# Apply manifests (create manifests first)
kubectl apply -f k8s/

# Check deployment
kubectl get pods -n airm
kubectl logs -f deployment/airm-ip -n airm
```

## Security Checklist

- [ ] Change default passwords in `.env.docker` for production
- [ ] Generate strong NEXTAUTH_SECRET (32+ bytes)
- [ ] Use managed database service (RDS, Cloud SQL) for production
- [ ] Enable SSL/TLS for database connections
- [ ] Set up firewall rules to restrict database access
- [ ] Configure CORS allowed origins (not `*`)
- [ ] Enable ClamAV virus scanning (`CLAMAV_ENABLED=true`)
- [ ] Set up log aggregation and monitoring
- [ ] Regular database backups (automated)
- [ ] Rotate API keys and secrets periodically
- [ ] Use secrets management (AWS Secrets Manager, GCP Secret Manager)

## Performance Optimization

### Build Time
- CI cache enabled (GitHub Actions cache)
- Multi-stage build reuses layers
- Expected: <5min cold, <2min warm

### Runtime
- Node.js standalone output (~150MB image)
- Health check <100ms
- Redis cache reduces DB load
- Static assets served by Next.js

### Scaling
- Horizontal: Run multiple containers behind load balancer
- Vertical: Increase container resources (CPU/memory)
- Database: Use connection pooling (Prisma default: 10 connections)

## Support

For issues or questions:
- Check health endpoint: `/api/health`
- Review application logs (JSON structured)
- Check database connectivity
- Verify environment variables
