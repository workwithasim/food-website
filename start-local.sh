#!/usr/bin/env bash
# ==============================================================================
# Restaurant Platform — Quick Local Development Startup Script
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "🚀 Checking Docker containers (PostgreSQL & Redis)..."
docker compose up -d postgres redis

echo "⏳ Verifying Database connection..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

pnpm --filter @restaurant/database migrate:deploy

echo "--------------------------------------------------------"
echo "✅ All database migrations up to date."
echo "Starting application servers in parallel..."
echo "  • API:          http://localhost:4000/docs"
echo "  • Customer Web: http://localhost:3002"
echo "  • Ops & KDS:    http://localhost:3001"
echo "--------------------------------------------------------"

# Run servers in dev mode
pnpm dev
