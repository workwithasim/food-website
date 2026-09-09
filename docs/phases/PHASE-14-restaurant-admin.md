# Phase 14 — Restaurant Admin

## Objective
Build tenant admin operations.

## Prerequisites
- Previous phase accepted and committed/pushed, unless this is Phase 00.
- Working tree reviewed.
- Relevant source-of-truth docs read.

## Scope
- [ ] Dashboard shell/KPIs foundation
- [ ] Orders list/detail
- [ ] Catalog management UI
- [ ] Branch management UI
- [ ] Staff/RBAC UI
- [ ] Payment/refund views
- [ ] Tenant settings/branding UI
- [ ] Feature flag-aware navigation
- [ ] Audit-sensitive confirmations

## Mandatory Engineering Rules
- Follow `PROJECT_RULES.md`.
- Do not implement later-phase features except minimal interfaces/placeholders required for this phase.
- Keep tenant/branch boundaries explicit.
- Add or update tests for every important business rule introduced.
- Update docs when APIs/schema/env behavior changes.

## Acceptance Criteria
- [ ] Tenant admin can manage own tenant
- [ ] No hidden-button-only authorization
- [ ] Lists paginated/filtered
- [ ] Dangerous actions require confirmation/reason

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
- [ ] All scoped tasks implemented.
- [ ] Database migration/seed handled if applicable.
- [ ] Tenant isolation verified.
- [ ] Branch authorization verified if applicable.
- [ ] Error/loading/empty states handled for UI.
- [ ] Security checks added.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Relevant E2E tests pass.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Build passes.
- [ ] Docs updated.
- [ ] No unrelated changes included.

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

`feat(restaurant-admin): complete phase 14 restaurant admin`

Then ask:

> Phase 14 is complete. Do you want me to commit and push this phase to `https://github.com/workwithasim/food-website.git`?

Do not commit or push before explicit approval.
