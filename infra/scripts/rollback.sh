#!/usr/bin/env bash
# infra/scripts/rollback.sh
# ─────────────────────────────────────────────────────────────────────────────
# Rollback the API service to the previous Docker image tag.
# Usage: ./infra/scripts/rollback.sh <image_tag>
# Example: ./infra/scripts/rollback.sh sha-abc1234
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

IMAGE_TAG="${1:-}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

if [[ -z "${IMAGE_TAG}" ]]; then
  echo "Usage: $0 <image_tag>"
  echo "Available tags:"
  docker image ls "ghcr.io/${GITHUB_REPOSITORY:-workwithasim/food-website}/api" --format "{{.Tag}}"
  exit 1
fi

echo "[rollback] Rolling back API to image tag: ${IMAGE_TAG}"

export IMAGE_TAG
docker compose -f "${COMPOSE_FILE}" pull api
docker compose -f "${COMPOSE_FILE}" up -d --no-deps api

echo "[rollback] Waiting for health check..."
sleep 15

STATUS=$(curl -sf http://localhost:4000/api/v1/health | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null || echo "error")
if [[ "${STATUS}" == "ok" ]]; then
  echo "[rollback] ✅ API is healthy after rollback (status=${STATUS})"
else
  echo "[rollback] ❌ Health check failed (status=${STATUS}). Manual intervention required."
  exit 1
fi
