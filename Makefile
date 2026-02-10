# =============================================================================
# AIRM-IP — Docker Workflow Commands
# =============================================================================
# Usage: make <target>
# =============================================================================

.PHONY: help dev prod build up down logs clean test backup ssl-self-signed status

COMPOSE_BASE = docker compose -f docker-compose.yml
COMPOSE_DEV  = $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD = $(COMPOSE_BASE) -f docker-compose.prod.yml

# Default target
help: ## Show available commands
	@echo "AIRM-IP Docker Workflow"
	@echo "======================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --------------------------------------------------
# Development
# --------------------------------------------------
dev: ## Start development stack (hot-reload)
	$(COMPOSE_DEV) up --build

dev-detach: ## Start development stack (background)
	$(COMPOSE_DEV) up --build -d

dev-down: ## Stop development stack
	$(COMPOSE_DEV) down

# --------------------------------------------------
# Production
# --------------------------------------------------
prod: ## Start production stack with nginx
	$(COMPOSE_PROD) up -d --build

prod-down: ## Stop production stack
	$(COMPOSE_PROD) down

# --------------------------------------------------
# General
# --------------------------------------------------
build: ## Build Docker image only
	docker build -t airm-ip:latest \
		--build-arg COMMIT_SHA=$$(git rev-parse --short HEAD 2>/dev/null || echo "unknown") \
		--build-arg BUILD_DATE=$$(date -u +%Y-%m-%dT%H:%M:%SZ) .

up: ## Start base stack (no overrides)
	$(COMPOSE_BASE) up -d --build

down: ## Stop all containers
	$(COMPOSE_BASE) down
	$(COMPOSE_DEV) down 2>/dev/null || true
	$(COMPOSE_PROD) down 2>/dev/null || true

logs: ## Tail all container logs
	$(COMPOSE_BASE) logs -f

logs-app: ## Tail app container logs only
	docker logs -f airm-ip-app

status: ## Show container status
	docker compose ps

# --------------------------------------------------
# Database
# --------------------------------------------------
db-migrate: ## Run database migrations inside container
	docker exec airm-ip-app npx prisma migrate deploy

db-seed: ## Seed database inside container
	docker exec airm-ip-app npm run db:seed

db-studio: ## Open Prisma Studio (local, not Docker)
	npm run db:studio

backup: ## Run database backup
	$(COMPOSE_PROD) run --rm backup

# --------------------------------------------------
# Testing
# --------------------------------------------------
test-build: ## Verify Docker build succeeds
	docker build -t airm-ip:test --target builder .
	@echo "Build verification passed"

test-health: ## Check health endpoint
	@curl -sf http://localhost:3000/api/health | python3 -m json.tool 2>/dev/null || \
		echo "Health check failed — is the app running?"

# --------------------------------------------------
# Cleanup
# --------------------------------------------------
clean: ## Remove containers, volumes, and images
	$(COMPOSE_BASE) down -v --rmi local
	$(COMPOSE_DEV) down -v --rmi local 2>/dev/null || true
	$(COMPOSE_PROD) down -v --rmi local 2>/dev/null || true
	docker image prune -f

clean-all: ## Full cleanup including named volumes
	$(COMPOSE_BASE) down -v --rmi all --remove-orphans
	docker volume prune -f
	docker image prune -af

# --------------------------------------------------
# SSL
# --------------------------------------------------
ssl-self-signed: ## Generate self-signed SSL cert for local testing
	mkdir -p docker/nginx/ssl
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout docker/nginx/ssl/key.pem \
		-out docker/nginx/ssl/cert.pem \
		-subj "/C=US/ST=Local/L=Local/O=AIRM-IP/CN=localhost"
	@echo "Self-signed certificate generated in docker/nginx/ssl/"
