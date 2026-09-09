# Changelog

All notable project changes should be recorded here.

## [0.1.0] - 2026-09-09

### Added
- **Phase 00 Foundation**:
  - Turborepo monorepo with pnpm workspaces.
  - Docker Compose configuration for PostgreSQL with PostGIS (`postgis/postgis:17-3.5`) and Redis (`redis:7-alpine`) with healthchecks.
  - Shared packages: `@restaurant/config`, `@restaurant/contracts`, `@restaurant/observability`, `@restaurant/ui`, `@restaurant/auth-client`, `@restaurant/api-client`, `@restaurant/testing`.
  - Applications: `@restaurant/customer-web` (Next.js 16 App Router), `@restaurant/ops-web` (Next.js 16 App Router), `@restaurant/platform-web` (Next.js 16 App Router), `@restaurant/api` (NestJS 11 HTTP REST + Swagger), `@restaurant/worker` (BullMQ worker service).
  - Health check endpoint `GET /api/v1/health` verifying PostgreSQL and Redis connectivity.
  - Full test suites: unit tests, integration tests (against Docker containers), and E2E smoke tests.
  - Strict TypeScript and ESLint configuration.
  - Environment templates (`.env.example` and `.env`).
