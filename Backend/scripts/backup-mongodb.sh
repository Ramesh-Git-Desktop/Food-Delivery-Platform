#!/bin/bash
set -euo pipefail

DATE=$(date +%Y-%m-%d)
BACKUP_ROOT="/backups/mongodb"
BACKUP_DIR="${BACKUP_ROOT}/${DATE}"
S3_BUCKET="${S3_BUCKET:-your-bucket}"

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI is not set"
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}"

aws s3 cp "${BACKUP_DIR}" "s3://${S3_BUCKET}/backups/mongodb/${DATE}" --recursive

find "${BACKUP_ROOT}" -type d -mtime +30 -exec rm -rf {} \;
