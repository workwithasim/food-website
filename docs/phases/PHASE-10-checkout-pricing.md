# Phase 10 — Checkout & Pricing

## Objective
Implement authoritative server-side quoting and checkout validation.

## Prerequisites
- Previous phase accepted and committed/pushed, unless this is Phase 00.
- Working tree reviewed.
- Relevant source-of-truth docs read.

## Scope
- [ ] Pricing service
- [ ] Tax/service/delivery fee calculations
- [ ] Branch resolution/revalidation
- [ ] Coupon hook points
- [ ] Checkout quote endpoint
- [ ] Address validation
- [ ] Scheduled order hooks
- [ ] Checkout UI
- [ ] Idempotency storage foundation

## Mandatory Engineering Rules
- Follow `PROJECT_RULES.md`.
- Do not implement later-phase features except minimal interfaces/placeholders required for this phase.
- Keep tenant/branch boundaries explicit.
- Add or update tests for every important business rule introduced.
- Update docs when APIs/schema/env behavior changes.

## Acceptance Criteria
- [ ] Client-supplied totals ignored
- [ ] Quote breakdown reconciles
- [ ] Unavailable items block checkout
- [ ] Duplicate quote/order submission policy tested

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

`feat(checkout-pricing): complete phase 10 checkout & pricing`

Then ask:

> Phase 10 is complete. Do you want me to commit and push this phase to `https://github.com/workwithasim/food-website.git`?

Do not commit or push before explicit approval.
