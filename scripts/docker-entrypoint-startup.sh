#!/bin/sh
set -e

echo "🚀 Starting AIRM-IP application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database..."
./scripts/wait-for-postgres-database-ready.sh

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Optional: Seed database if flag is set
if [ "$SEED_ON_START" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run db:seed
fi

# Start Next.js server
echo "✅ Starting Next.js server on port 3000..."
exec node server.js
