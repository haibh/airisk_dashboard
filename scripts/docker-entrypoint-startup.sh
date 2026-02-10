#!/bin/sh
set -e

# Use local Prisma CLI (standalone build doesn't create .bin symlinks)
PRISMA_CLI="node ./node_modules/prisma/build/index.js"

echo "Starting AIRM-IP application..."

# Wait for PostgreSQL to be ready
echo "Waiting for database..."
./scripts/wait-for-postgres-database-ready.sh

# Run database migrations
echo "Running database migrations..."
$PRISMA_CLI migrate deploy

# Optional: Seed database if flag is set
if [ "$SEED_ON_START" = "true" ]; then
  echo "Seeding database..."
  node ./node_modules/tsx/dist/cli.mjs prisma/seed.ts
fi

# Start Next.js server
echo "Starting Next.js server on port 3000..."
exec node server.js
