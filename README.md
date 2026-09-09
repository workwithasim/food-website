# Food Website — White-Label Multi-Tenant Restaurant Platform

Repository: `https://github.com/workwithasim/food-website.git`

This pack is the **master project execution specification** for building the platform from an empty repository through production launch.

## Source of Truth

Read these in this order:

1. `docs/prd.md`
2. `docs/trd.md`
3. `docs/backendschema.md`
4. `docs/uiuxdesign.md`
5. `docs/implementation-plan.md`
6. Current phase file in `docs/phases/`

## Core Stack

- TypeScript
- Node.js 24 LTS
- pnpm
- Turborepo
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
- React Native + Expo for later mobile phases

## Execution Rule

**Only one phase is active at a time.**

A phase is not complete until:
- implementation is done,
- migrations are correct,
- permissions/tenant isolation are validated,
- lint passes,
- typecheck passes,
- relevant unit/integration/E2E tests pass,
- documentation is updated,
- the phase checklist is complete.

After a phase passes all gates, the AI/developer must **STOP**, show:
- what was completed,
- files changed,
- migrations created,
- tests run and results,
- known limitations,
- suggested commit message,

and ask the user for approval before committing/pushing.

**Never commit or push automatically without explicit approval.**

## GitHub Target

Remote repository:

```bash
https://github.com/workwithasim/food-website.git
```

See `GIT_WORKFLOW.md`.

## Start Here

Give your coding agent the contents of:

`AI_MASTER_PROMPT.md`

Then tell it:

> Start Phase 00 only. Follow the current phase document and stop at the approval gate before any commit or push.
