#!/usr/bin/env bash
# infra/scripts/backup.sh
# ─────────────────────────────────────────────────────────────────────────────
# Automated PostgreSQL backup to S3-compatible storage.
# Run via cron: 0 2 * * * /opt/restaurant/infra/scripts/backup.sh >> /var/log/restaurant-backup.log 2>&1
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/tmp/restaurant_prod_${TIMESTAMP}.dump"
S3_BUCKET="${S3_BACKUP_BUCKET:-restaurant-backups}"
S3_PREFIX="${S3_BACKUP_PREFIX:-postgres}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

echo "[backup] Starting PostgreSQL backup at ${TIMESTAMP}"

# Dump (custom format, compressed)
pg_dump \
  --format=custom \
  --compress=9 \
  --no-password \
  --file="${BACKUP_FILE}" \
  "${DATABASE_URL}"

echo "[backup] Dump complete: ${BACKUP_FILE} ($(du -sh "${BACKUP_FILE}" | cut -f1))"

# Upload to S3
aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/${S3_PREFIX}/${TIMESTAMP}.dump" \
  --storage-class STANDARD_IA

echo "[backup] Uploaded to s3://${S3_BUCKET}/${S3_PREFIX}/${TIMESTAMP}.dump"

# Remove local file
rm -f "${BACKUP_FILE}"

# Prune old backups
echo "[backup] Pruning backups older than ${RETENTION_DAYS} days..."
aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | \
  awk '{print $4}' | \
  while read -r key; do
    file_date=$(echo "${key}" | grep -oP '^\d{8}')
    if [[ -n "${file_date}" ]]; then
      cutoff=$(date -d "-${RETENTION_DAYS} days" +%Y%m%d)
      if [[ "${file_date}" < "${cutoff}" ]]; then
        aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${key}"
        echo "[backup] Deleted old backup: ${key}"
      fi
    fi
  done

echo "[backup] Done at $(date +%Y%m%d_%H%M%S)"
