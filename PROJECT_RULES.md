# PROJECT RULES

These rules apply to every phase.

## Architecture
- Use a modular monolith for the backend.
- Do not introduce microservices unless explicitly approved.
- PostgreSQL is the source of truth.
- Redis is cache/queue/realtime infrastructure, not authoritative order/payment storage.
- Use API-first design.
- Do not place core business rules inside frontend components.
- Do not hard-code tenant IDs, branch IDs, restaurant branding or provider-specific behavior.

## Multi-Tenancy
- Every tenant-owned read/write must be tenant-scoped.
- Every branch-owned operation must validate branch access.
- Never trust client-supplied tenant identity.
- Cross-tenant access tests are mandatory for relevant modules.

## Money and Orders
- Server calculates all authoritative totals.
- Money is stored in integer minor units.
- Order state and payment state remain separate.
- Order transitions go through one centralized state machine.
- Historical orders use snapshots.
- Checkout/order creation is idempotent.
- Payment webhooks are verified and deduplicated.

## Security
- No secrets in frontend bundles.
- No raw card data.
- No password, OTP, access token or refresh token logging.
- Sensitive admin actions are audited.
- Validate all input server-side.
- Rate-limit auth, OTP, checkout and chat.

## Quality
- Strict TypeScript.
- No `any` without justification.
- No disabled tests to make CI pass.
- No TODO left in critical logic without being listed in phase report.
- No phase may be marked complete with failing lint/typecheck/tests.

## Git
- One logical phase at a time.
- Use conventional commits.
- Do not push without explicit user approval after phase review.
