# ========================================
# Stage 1: Dependencies
# ========================================
FROM node:20-alpine AS deps

# Install build dependencies for native modules
RUN apk add --no-cache libc6-compat postgresql-client

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --omit=dev

# ========================================
# Stage 2: Builder
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ========================================
# Stage 3: Production Runtime
# ========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Copy standalone output from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy scripts for entrypoint
COPY --from=builder /app/scripts ./scripts
RUN chmod +x ./scripts/*.sh

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application via entrypoint script
ENTRYPOINT ["./scripts/docker-entrypoint-startup.sh"]
