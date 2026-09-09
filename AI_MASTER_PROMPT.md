# AI MASTER EXECUTION PROMPT

You are implementing a production-grade white-label, multi-tenant restaurant ordering and operations platform.

Repository target:
`https://github.com/workwithasim/food-website.git`

Before writing code, read completely:

- `README.md`
- `PROJECT_RULES.md`
- `docs/prd.md`
- `docs/trd.md`
- `docs/backendschema.md`
- `docs/uiuxdesign.md`
- `docs/implementation-plan.md`
- the current file under `docs/phases/`

Treat these documents as the source of truth.

## Working Mode

Work **one phase at a time**.

Do not jump forward because another feature looks easy.

For the active phase:

1. Read the relevant specifications.
2. Inspect all existing code affected by the phase.
3. Update the phase checklist if necessary without changing product scope.
4. Implement the phase.
5. Add database migrations when required.
6. Add/update tests.
7. Run lint.
8. Run TypeScript typecheck.
9. Run unit tests.
10. Run integration tests.
11. Run relevant E2E tests.
12. Fix regressions.
13. Update documentation.
14. Prepare a completion report.

## Completion Report

At the end of every phase output:

- Phase number and title.
- Completed scope.
- Changed files.
- Database migrations.
- New/changed API endpoints.
- Security/permission checks.
- Tests executed and their results.
- Manual checks performed.
- Remaining known issues.
- Suggested conventional commit message.

Then STOP and ask:

> Phase XX is complete and all required checks pass. Do you want me to commit and push this phase to `https://github.com/workwithasim/food-website.git`?

Do **not** commit or push until the user explicitly approves.

After approval:

1. Confirm the working tree only contains intended phase changes.
2. `git add` only intended files.
3. Commit using the approved conventional commit message.
4. Push to the configured phase branch / approved branch.
5. Report the commit hash and remote branch.
6. Then wait for instruction to begin the next phase unless the user already explicitly approved continuing.

## Architecture Locks

- TypeScript
- Node.js 24 LTS
- pnpm + Turborepo
- Next.js 16
- NestJS 11
- PostgreSQL 18 + PostGIS
- Prisma 8
- Redis
- BullMQ
- Socket.IO
- Tailwind CSS 4
- Docker
- Playwright
- React Native + Expo for mobile phases

Backend starts as a modular monolith.

Do not replace the architecture with Firebase-only, Supabase-direct-to-client, MongoDB, microservices, PHP, Python or another primary stack unless the user explicitly changes the TRD.

## Non-Negotiable Rules

- Never trust money totals from the frontend.
- Never trust a normal client's `tenant_id`.
- Never expose another tenant's data.
- Never update order state by arbitrary direct status assignment.
- Never use floating-point arithmetic for authoritative money.
- Never make Redis the order/payment source of truth.
- Never rely on Socket.IO alone for durable business processing.
- Never store raw payment-card data.
- Never silently weaken a test or permission to make a phase pass.
- Never mark UI-only work as a completed backend feature.

## Start

Start only the phase specifically requested by the user.

If no phase was named, start `PHASE-00-foundation.md`.
