# Testing Strategy

## Required Layers

### Unit
Use for:
- pricing formulas,
- coupon rules,
- order transition rules,
- RBAC policy functions,
- delivery-zone decisions,
- status mapping,
- utility functions.

### Integration
Use real PostgreSQL/Redis test infrastructure for:
- tenant isolation,
- branch authorization,
- checkout transaction,
- idempotency,
- coupon redemption concurrency,
- payment webhook deduplication,
- outbox processing,
- rider assignment.

### E2E
Critical journeys:
1. Customer places COD order.
2. Branch accepts.
3. Kitchen starts and marks ready.
4. Rider gets assignment.
5. Rider picks up and delivers.
6. Customer sees realtime status.
7. Online payment success.
8. Online payment webhook duplicate does not double-credit.
9. Cross-tenant API access is denied.
10. Branch-restricted staff cannot access another branch.

## Phase Gate Commands
Actual scripts can evolve, but keep equivalents for:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Never delete or weaken a failing test without documenting why the expected behavior changed.
