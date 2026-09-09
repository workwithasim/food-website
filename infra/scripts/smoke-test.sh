#!/usr/bin/env bash
# infra/scripts/smoke-test.sh
# ─────────────────────────────────────────────────────────────────────────────
# Critical journey smoke tests against a running API instance.
# Usage: BASE_URL=https://staging.yourrestaurant.com ./infra/scripts/smoke-test.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000}"
TENANT_ID="${SMOKE_TENANT_ID:-}"
PASS=0
FAIL=0

_check() {
  local name="$1"
  local status="$2"
  local expected="$3"
  if [[ "${status}" == "${expected}" ]]; then
    echo "  ✅ ${name} (HTTP ${status})"
    ((PASS++))
  else
    echo "  ❌ ${name} — expected ${expected}, got ${status}"
    ((FAIL++))
  fi
}

echo ""
echo "🔍 Running smoke tests against ${BASE_URL}"
echo "─────────────────────────────────────────"

# 1. Health endpoint
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/health")
_check "GET /api/v1/health" "${STATUS}" "200"

# 2. Auth — bad credentials should return 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@invalid.example","password":"wrong"}')
_check "POST /auth/login (bad creds → 401)" "${STATUS}" "401"

# 3. Catalog — unauthenticated catalog browse
if [[ -n "${TENANT_ID}" ]]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/catalog/menu" \
    -H "X-Tenant-ID: ${TENANT_ID}")
  _check "GET /catalog/menu (tenant=${TENANT_ID})" "${STATUS}" "200"
fi

# 4. Protected route without token → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/orders")
_check "GET /orders (no token → 401)" "${STATUS}" "401"

# 5. Unknown route → 404
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/v1/no-such-route-xyz")
_check "GET /no-such-route-xyz (→ 404)" "${STATUS}" "404"

echo "─────────────────────────────────────────"
echo "Results: ${PASS} passed, ${FAIL} failed"
echo ""

if [[ ${FAIL} -gt 0 ]]; then
  exit 1
fi
