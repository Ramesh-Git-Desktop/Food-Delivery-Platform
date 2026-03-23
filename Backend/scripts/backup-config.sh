#!/bin/bash
set -euo pipefail

S3_BUCKET="${S3_BUCKET:-your-bucket}"
CONFIG_FILE="${CONFIG_FILE:-.env}"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "Config file not found: ${CONFIG_FILE}"
  exit 1
fi

gpg --cipher-algo AES256 --symmetric "${CONFIG_FILE}"
aws s3 cp "${CONFIG_FILE}.gpg" "s3://${S3_BUCKET}/config/${CONFIG_FILE}.gpg"
