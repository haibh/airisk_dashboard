#!/bin/bash
set -e

# =============================================================================
# PostgreSQL Backup Script with Rotation
# =============================================================================
# Creates compressed database backups and retains only the last 30 days
# Usage: ./scripts/postgres-backup-with-rotation.sh
# =============================================================================

# Configuration from environment or defaults
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Parse DATABASE_URL
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*\/\/\(.*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*\/\/.*:\(.*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\(.*\)?.*/\1/p' | cut -d'?' -f1)

# Validate extraction
if [ -z "$DB_USER" ] || [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ]; then
  echo "❌ ERROR: Failed to parse DATABASE_URL"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/airm_${TIMESTAMP}.sql.gz"

echo "🔄 Starting backup of database: $DB_NAME"
echo "📁 Backup location: $BACKUP_FILE"

# Set password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create compressed backup
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --clean --if-exists | gzip > "$BACKUP_FILE"; then

  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup completed successfully (size: $BACKUP_SIZE)"
else
  echo "❌ Backup failed"
  exit 1
fi

# Clean up old backups
echo "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "airm_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
  echo "🗑️  Deleted $DELETED_COUNT old backup(s)"
else
  echo "ℹ️  No old backups to delete"
fi

# List current backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "airm_*.sql.gz" -type f | wc -l)
echo "📊 Current backup count: $BACKUP_COUNT"

# Unset password
unset PGPASSWORD

echo "✅ Backup process completed"
