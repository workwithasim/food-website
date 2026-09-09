# Definition of Done

A feature/phase is DONE only when all applicable items are true.

## Product
- Acceptance criteria are implemented.
- Empty/loading/error states exist.
- Mobile/tablet/desktop requirements are satisfied where applicable.
- White-label behavior works without code fork.

## Backend
- DTO validation exists.
- Authorization exists.
- Tenant and branch scope enforced.
- Database constraints/indexes are reasonable.
- API behavior documented.
- Errors use stable error codes.

## Data
- Migration created and tested.
- Seed data updated if needed.
- Historical/financial data integrity preserved.
- No unsafe destructive migration.

## Realtime / Jobs
- Missed realtime events recover via source-of-truth API.
- Durable events use outbox/jobs if critical.
- Worker handlers are idempotent where required.

## Security
- Cross-tenant attempts tested.
- Sensitive actions audited.
- Secrets not exposed.
- Rate limits added where appropriate.
- Upload/webhook/provider inputs validated.

## Testing
- Unit tests pass.
- Integration tests pass.
- Relevant E2E tests pass.
- Lint passes.
- Typecheck passes.
- Build passes.

## Documentation
- Phase file checklist updated.
- API/schema docs updated if changed.
- Environment variables documented.
- Known limitations listed.

## Git Gate
- Clean phase scope.
- Suggested conventional commit ready.
- User explicitly approves before commit/push.
