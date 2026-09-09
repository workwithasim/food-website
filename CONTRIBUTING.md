# Contributing Guide

Thank you for contributing to the Restaurant Platform! This guide covers the development workflow, branching strategy, and code standards.

---

## Development Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Setup
```bash
git clone https://github.com/workwithasim/food-website.git
cd food-website
pnpm install
docker compose up -d            # start postgres + redis
cp .env.example .env            # fill in secrets
pnpm --filter @restaurant/database migrate:dev
pnpm dev                        # start all apps
```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code — protected, CI required |
| `phase/<N>-<name>` | Feature development per phase |
| `fix/<description>` | Bug fixes |
| `chore/<description>` | Tooling, deps, config |

### Rules
- **Never push directly to `main`** — always open a PR
- Branch names must be lowercase with hyphens
- One phase = one branch = one PR

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(scope): <short description>

[optional body]
```

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Tooling, deps, config |
| `docs` | Documentation |
| `test` | Tests only |
| `refactor` | Code refactor (no behaviour change) |
| `perf` | Performance improvement |
| `ci` | CI/CD changes |

**Examples:**
```
feat(auth): add phone OTP login flow
fix(cart): prevent duplicate item on concurrent add
docs(mobile): add background location privacy notes
test(orders): add state machine edge case tests
```

---

## Code Standards

### TypeScript
- **Strict mode** — no `any`, no implicit `any`
- All API inputs validated with Zod or class-validator DTOs
- All API responses typed with shared contracts from `@restaurant/contracts`
- No direct `any` casts — use `unknown` and narrow

### NestJS API
- Every endpoint must have a **Swagger decorator** (`@ApiOperation`, `@ApiResponse`)
- Every controller must have **RBAC guards** (`@Roles`, `@UseGuards`)
- Every mutation must have **tenant isolation** checked
- Business logic lives in **Services**, not Controllers
- Database access only via **Prisma in Services** — never in Controllers

### React / Next.js
- Use **Server Components** by default — Client Components only when needed
- Use **named exports** for components
- All forms validated with **Zod + react-hook-form**
- No inline styles — use Tailwind CSS classes

### Testing Requirements
Every PR must include:
- **Unit tests** for all new service methods with meaningful assertions
- **Integration tests** for all new API endpoints
- Tests must cover: happy path, auth failure (401), wrong tenant (403), validation failure (400)

```bash
# Run tests before opening PR
pnpm lint
pnpm typecheck
pnpm --filter @restaurant/api test
pnpm --filter @restaurant/api-client test
```

---

## Pull Request Checklist

Before opening a PR, ensure:

- [ ] Branch is up to date with `main`
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] New endpoints have Swagger docs
- [ ] New endpoints have RBAC guards
- [ ] Tenant isolation verified for all new queries
- [ ] Migration is included if schema changed
- [ ] `.env.production.template` updated if new env vars added
- [ ] `CHANGELOG.md` updated

---

## Adding a New Environment Variable

1. Add to `.env.example` with a placeholder
2. Add to `.env.production.template` with documentation
3. Add to `.github/workflows/ci-cd.yml` (as a secret if sensitive)
4. Update `docs/environment.md`

---

## Database Migrations

```bash
# Create a new migration after editing schema.prisma
pnpm --filter @restaurant/database migrate:dev --name <descriptive_name>

# Always review generated SQL before committing!
cat packages/database/prisma/migrations/<latest>/migration.sql
```

**Rules:**
- Migrations must be **backwards compatible** (no breaking changes without a deprecation period)
- Never edit an existing migration file after it has been pushed
- Add a `@@index` for every foreign key used in WHERE/JOIN clauses

---

## Getting Help

- Open an [Issue](https://github.com/workwithasim/food-website/issues)
- See [`docs/architecture.md`](docs/architecture.md) for system design
- See [`docs/production-runbook.md`](docs/production-runbook.md) for ops
