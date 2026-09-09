# Phase 00 — Foundation

## Objective
Initialize the reproducible monorepo and local development foundation.

## Prerequisites
- Previous phase accepted and committed/pushed, unless this is Phase 00.
- Working tree reviewed.
- Relevant source-of-truth docs read.

## Scope
- [x] Initialize pnpm workspace and Turborepo
- [x] Create apps/customer-web, apps/ops-web, apps/platform-web, apps/api, apps/worker
- [x] Create shared config/contracts/ui packages
- [x] Add strict TypeScript, ESLint and formatting configuration
- [x] Add Docker Compose for PostgreSQL/PostGIS and Redis
- [x] Add root scripts for dev/build/lint/typecheck/test
- [x] Create .env.example and environment validation
- [x] Configure repository remote safely if absent

## Mandatory Engineering Rules
- Follow `PROJECT_RULES.md`.
- Do not implement later-phase features except minimal interfaces/placeholders required for this phase.
- Keep tenant/branch boundaries explicit.
- Add or update tests for every important business rule introduced.
- Update docs when APIs/schema/env behavior changes.

## Acceptance Criteria
- [x] All workspaces install
- [x] All empty apps build
- [x] lint and typecheck pass
- [x] Docker services become healthy
- [x] No secret committed

## Required Verification
Run all applicable:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Also perform manual checks described by this phase.

## Deliverables
- Working implementation for this phase.
- Required migrations.
- Required tests.
- Updated environment/docs.
- Completed phase checklist.
- Completion report.

## Phase Checklist
- [x] All scoped tasks implemented.
- [x] Database migration/seed handled if applicable.
- [x] Tenant isolation verified.
- [x] Branch authorization verified if applicable.
- [x] Error/loading/empty states handled for UI.
- [x] Security checks added.
- [x] Unit tests pass.
- [x] Integration tests pass.
- [x] Relevant E2E tests pass.
- [x] Lint passes.
- [x] Typecheck passes.
- [x] Build passes.
- [x] Docs updated.
- [x] No unrelated changes included.

## Git Approval Gate

When all checks pass, STOP.

Report:

- completed work,
- changed files,
- migrations,
- APIs,
- tests/results,
- known issues,
- suggested commit.

Suggested commit:

`build(foundation): complete phase 00 foundation`

Then ask:

> Phase 00 is complete. Do you want me to commit and push this phase to `https://github.com/workwithasim/food-website.git`?

Do not commit or push before explicit approval.
