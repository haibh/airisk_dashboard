#!/bin/sh
set -e

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*\/\/\(.*\):.*/\1/p')

# Default to standard PostgreSQL port if extraction fails
DB_PORT=${DB_PORT:-5432}

echo "Checking PostgreSQL connection to ${DB_HOST}:${DB_PORT}..."

# Wait for PostgreSQL to be ready (max 60 seconds)
MAX_ATTEMPTS=30
ATTEMPT=0

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; do
  ATTEMPT=$((ATTEMPT + 1))

  if [ $ATTEMPT -ge $MAX_ATTEMPTS ]; then
    echo "❌ Database connection failed after ${MAX_ATTEMPTS} attempts"
    exit 1
  fi

  echo "⏳ Waiting for database (attempt ${ATTEMPT}/${MAX_ATTEMPTS})..."
  sleep 2
done

echo "✅ Database is ready!"
