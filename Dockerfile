# ========================================
# Stage 1: Dependencies (all deps for build)
# ========================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

# Upgrade npm to match local version for lockfile compatibility
RUN npm install -g npm@11

WORKDIR /app

COPY package.json package-lock.json* ./

# Install ALL dependencies (dev + prod needed for build)
RUN npm ci

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

ARG COMMIT_SHA=unknown
ARG BUILD_DATE=unknown

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (includes linux-musl-arm64-openssl-3.0.x binary target)
RUN npx prisma generate

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ========================================
# Stage 3: Production Runtime
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install only runtime system deps (single layer)
# openssl required for Prisma query engine (libssl.so.3)
RUN apk add --no-cache postgresql-client curl openssl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Metadata labels
ARG COMMIT_SHA=unknown
ARG BUILD_DATE=unknown
LABEL org.opencontainers.image.source="https://github.com/airm-ip/airm-ip" \
      org.opencontainers.image.revision="${COMMIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="AIRM-IP" \
      org.opencontainers.image.description="AI Risk Management Intelligence Platform"

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone build output (includes node_modules with runtime deps)
# --chown avoids extra layer from chown -R
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma schema + client + CLI for migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint scripts
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Copy seed support: tsx + deps from builder (devDep, for TypeScript seed scripts)
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps

USER nextjs

EXPOSE 3000

# Health check using curl (IPv4 to avoid Alpine IPv6-first resolution)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD curl -sf http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["./scripts/docker-entrypoint-startup.sh"]
