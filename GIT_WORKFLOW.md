# Git & GitHub Workflow

Target repository:

`https://github.com/workwithasim/food-website.git`

## Initial Setup

If the repository already exists locally:

```bash
git remote -v
```

If `origin` is missing:

```bash
git remote add origin https://github.com/workwithasim/food-website.git
```

If `origin` is incorrect, do not overwrite it silently. Report it and ask before changing.

## Branch Strategy

Recommended:

- `main` — stable production-ready history.
- `develop` — optional integration branch.
- `phase/00-foundation`
- `phase/01-database`
- etc.

For a solo AI-assisted build, simplest safe flow:

1. Create a phase branch from latest `main`.
2. Complete one phase.
3. Run all phase checks.
4. Stop for user approval.
5. Commit.
6. Push phase branch.
7. Merge through GitHub PR or direct merge only if user requests.

## Conventional Commit Format

```text
type(scope): description
```

Types:

- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `build`
- `ci`
- `chore`
- `perf`
- `security`

Examples:

```text
build(core): initialize pnpm turborepo workspace
feat(tenancy): add tenant and custom domain resolution
feat(auth): add customer and staff session flows
feat(catalog): add products variants and modifiers
feat(orders): implement order state machine
feat(kitchen): add realtime kitchen display workflow
feat(delivery): add rider assignment and delivery lifecycle
test(tenancy): add cross-tenant isolation coverage
```

## Mandatory Approval Gate

Before every commit/push, show:

```text
Phase:
Branch:
Files changed:
Migrations:
Tests:
Suggested commit:
Known issues:
```

Then ask for explicit approval.

No approval = no commit and no push.

## Suggested Commands After Approval

```bash
git status
git diff --check
git add <intended files>
git commit -m "<approved commit message>"
git push -u origin <phase-branch>
```

Do not use `git add .` blindly if unrelated changes exist.

## Never

- force-push `main` without explicit instruction.
- rewrite published history without explicit instruction.
- commit `.env`, secrets or credentials.
- commit generated production secrets.
- skip tests solely to get a commit through.
