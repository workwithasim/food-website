# White-Label Multi-Tenant Restaurant Platform
## Technical Requirements Document (TRD)

**Version:** 1.0.0  
**Date:** 2026-09-09  
**Architecture Style:** TypeScript monorepo + modular monolith, API-first, event-driven internally  
**Deployment Style:** Containerized and provider-agnostic

---

# 1. Technical Goal

Build a reliable, maintainable and scalable backend/frontend foundation that can run many restaurant tenants without code forks and can later power customer mobile apps, rider apps, kitchen systems and POS clients.

The initial architecture deliberately avoids microservice complexity. Boundaries are designed as modules so high-load components can later be extracted with minimal domain redesign.

---

# 2. Locked Technology Stack

## Runtime and Language

- **TypeScript** across web, backend and mobile.
- **Node.js 24 LTS** as production runtime.
- Strict TypeScript mode.
- `pnpm` workspaces for package management.
- Turborepo for monorepo task orchestration.

## Customer / Staff Web

- **Next.js 16.x**, App Router.
- React version provided/supported by selected Next.js release.
- **Tailwind CSS 4.x**.
- shadcn/ui-style local component ownership where useful.
- TanStack Query for client-side server-state where real-time/admin interactions need it.
- React Hook Form for complex forms.
- Zod at frontend/form/config boundaries.
- Socket.IO client for real-time updates.

## Backend

- **NestJS 11.x**.
- REST API as the primary external application API.
- OpenAPI/Swagger contract.
- Socket.IO gateway for real-time channels.
- Background worker process built from the same backend codebase.
- BullMQ for background jobs.
- Redis for cache, rate-limit counters, queues and cross-node socket fanout.
- Pino-compatible structured JSON logging.

## Database

- **PostgreSQL 18.x**.
- **Prisma 8.x** ORM/migrations for normal relational access.
- Raw SQL migrations/queries only where PostgreSQL/PostGIS features are not cleanly represented by ORM abstractions.
- PostGIS extension for branch proximity, delivery zones and geospatial operations.

## Mobile

- React Native with Expo for:
  - Customer Android/iOS app.
  - Rider Android/iOS app.
- Mobile apps are Phase 2 but API contracts must support them from v1.

## Media Storage

- S3-compatible object storage.
- Local development: MinIO or local mock.
- Production: Cloudflare R2, AWS S3, or another S3-compatible provider via adapter.
- CDN in front of public media.

## Testing

- Unit/integration: Vitest or Jest, standardized per workspace.
- Backend HTTP integration: Supertest.
- Browser E2E: Playwright.
- Mobile E2E may be added in Phase 2.
- Contract/schema tests for critical APIs.

## Observability

- Structured logs.
- OpenTelemetry-compatible tracing/metrics.
- Sentry or equivalent for exception tracking.
- Health/readiness endpoints.

---

# 3. Why This Stack

## TypeScript End-to-End
Benefits:

- Shared mental model.
- Shared types/utilities.
- Easier hiring/onboarding.
- Fewer serialization mismatches.
- Easier React Native expansion.
- No Python/PHP/Node mix for core application business logic.

## Next.js for Customer Web
Used for:

- SEO-capable public menu/product pages.
- Server rendering where useful.
- Custom domain routing.
- Responsive customer app.
- PWA support if desired.

Next.js is not the system-of-record backend. Business logic remains in NestJS.

## NestJS for Backend
Chosen because the system has many bounded modules:

- Auth.
- Tenancy.
- Catalog.
- Branches.
- Cart.
- Orders.
- Payments.
- Kitchen.
- Delivery.
- Promotions.
- Notifications.
- Reports.

Nest modules, guards, interceptors and dependency injection provide strong organization.

## PostgreSQL Instead of MongoDB
Restaurant ordering is strongly relational and transactional:

- Orders and order items.
- Payments and refunds.
- Products and modifiers.
- Customers and addresses.
- Branches and staff.
- Coupons and usage rules.

PostgreSQL also supports geospatial extension via PostGIS.

## Redis
Redis is used for fast/ephemeral infrastructure:

- Cache.
- Rate limiting.
- Background job queues.
- Socket.IO multi-node fanout.
- Temporary OTP/session metadata where appropriate.

Redis is never the authoritative store for orders or payments.

---

# 4. Version Policy

Do not use floating `latest` in production.

Rules:

- Pin major versions.
- Lock dependencies using `pnpm-lock.yaml`.
- Use Renovate/Dependabot for controlled updates.
- Apply patch/minor upgrades after CI passes.
- Major framework upgrades use a dedicated migration branch.
- Production Node.js must remain on an actively supported LTS release.

Recommended initial pins:

- Node.js 24 LTS.
- Next.js 16.
- NestJS 11.
- PostgreSQL 18.
- Prisma 8.
- Tailwind CSS 4.

---

# 5. Monorepo Structure

```text
restaurant-platform/
├── apps/
│   ├── customer-web/        # public white-label ordering website
│   ├── ops-web/             # restaurant admin + branch manager + kitchen web
│   ├── platform-web/        # SaaS/super-admin
│   ├── api/                 # NestJS HTTP + Socket.IO
│   ├── worker/              # BullMQ workers
│   ├── customer-mobile/     # Phase 2
│   └── rider-mobile/        # Phase 2
│
├── packages/
│   ├── ui/                  # reusable primitives/tokens
│   ├── config/              # lint/ts/build shared config
│   ├── api-client/          # generated typed API client
│   ├── contracts/           # shared public enums/event contracts
│   ├── auth-client/
│   ├── observability/
│   └── testing/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── infra/
│   ├── docker/
│   ├── nginx-or-caddy/
│   └── scripts/
│
├── docs/
│   ├── prd.md
│   ├── trd.md
│   ├── uiuxdesign.md
│   └── backendsecheme.md
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

`ops-web` initially houses admin, branch and KDS routes to reduce duplication. If KDS operational requirements later diverge significantly, it can become a separate app without backend redesign.

---

# 6. Backend Module Boundaries

Recommended NestJS modules:

```text
AuthModule
IdentityModule
TenancyModule
BranchModule
StaffModule
CustomerModule
AddressModule
CatalogModule
PricingModule
CartModule
CheckoutModule
OrderModule
PaymentModule
PromotionModule
KitchenModule
DeliveryModule
RiderModule
ChatModule
NotificationModule
MediaModule
CmsModule
ReviewModule
LoyaltyModule
WalletModule
ReportingModule
AuditModule
PlatformAdminModule
IntegrationModule
HealthModule
```

Rules:

- Modules communicate through defined services/domain events.
- No module directly reaches into another module's private repositories.
- Cross-module writes should use public domain/application services.
- Circular imports are prohibited except temporary migration cases with explicit technical debt ticket.

---

# 7. Request Architecture

```text
Client
  |
  v
CDN / Reverse Proxy
  |
  +--> Next.js apps
  |
  +--> /api/v1 -> NestJS API
                     |
                     +--> PostgreSQL
                     +--> Redis
                     +--> Object Storage
                     +--> External Providers
                     |
                     +--> Transactional Outbox
                              |
                              v
                           Worker
```

Realtime:

```text
Client <--Socket.IO--> API Node A
                        |
                        v
                      Redis
                        |
                        v
                     API Node B
```

Durable business processing does not rely only on Socket.IO/Redis Pub/Sub.

---

# 8. API Standards

Base path:

`/api/v1`

Examples:

```text
GET    /api/v1/public/tenant
GET    /api/v1/catalog/categories
GET    /api/v1/catalog/products
POST   /api/v1/auth/login
POST   /api/v1/carts
POST   /api/v1/checkout/quote
POST   /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders/:id/transitions
POST   /api/v1/payments/:id/refund
```

Standards:

- JSON over HTTPS.
- UTC ISO-8601 timestamps.
- Pagination on list APIs.
- Stable error envelope.
- Correlation/request IDs.
- Idempotency key on critical create/payment endpoints.
- OpenAPI generated and committed/published for client generation.
- Do not expose database models directly as API DTOs.

Example error:

```json
{
  "error": {
    "code": "ORDER_INVALID_TRANSITION",
    "message": "Order cannot move from READY to PREPARING.",
    "requestId": "req_..."
  }
}
```

---

# 9. API Client Strategy

Frontends must not hand-write duplicated API types.

Workflow:

1. NestJS produces OpenAPI.
2. Typed client is generated.
3. `packages/api-client` is consumed by customer/staff/mobile apps.
4. CI detects breaking contract changes.

This reduces web/mobile drift.

---

# 10. Authentication

## Customer Authentication

Supported methods:

- Email/password.
- Phone OTP.
- OAuth providers where configured.
- Guest checkout.

## Staff Authentication

- Email/password at minimum.
- Optional MFA later.
- Stronger session/device controls than customer flow.

## Token Strategy

Use:

- Short-lived access token.
- Rotating refresh token.
- Refresh tokens stored as secure hashes server-side.
- Web: refresh credentials in Secure, HttpOnly, SameSite-aware cookie where deployment/domain model permits.
- Mobile: secure OS credential storage.
- Access token supplied to API/Socket.IO.

Security:

- Passwords hashed with Argon2id or current approved equivalent.
- Login throttling.
- OTP throttling.
- Refresh token rotation and reuse detection.
- Device/session revocation.
- Tenant/staff state checked after authentication.

---

# 11. Authorization and Tenant Isolation

Authentication answers **who the user is**.

Authorization answers:

- Which tenant?
- Which branch(es)?
- Which role?
- Which permissions?
- Is this resource owned by that tenant/branch?

Every tenant-owned database query must be scoped.

Recommended request context:

```ts
{
  actorId,
  actorType,
  tenantId,
  branchIds,
  permissions,
  requestId
}
```

Rules:

- Never trust `tenant_id` supplied by ordinary client payloads.
- Resolve tenant from authenticated membership or public domain mapping.
- Repository/service methods require tenant context.
- Unique constraints for tenant-owned data include tenant scope where appropriate.
- Automated tests must attempt cross-tenant access.

PostgreSQL RLS may be added as defense-in-depth after connection-pooling/session strategy is fully validated; application-layer tenant scoping remains mandatory.

---

# 12. Domain Resolution

Public custom-domain request:

```text
burgerhouse.com
       |
       v
Domain Resolver
       |
       v
tenant_id
       |
       v
Tenant Config + Theme + Feature Flags
```

A domain table maps:

- Hostname.
- Tenant.
- Verification state.
- Primary/redirect state.

The public frontend must not choose tenant from untrusted query parameters when a mapped custom domain is being used.

---

# 13. Realtime Architecture

Use Socket.IO for:

- Order status updates.
- Kitchen queue changes.
- Rider assignment.
- Rider location updates.
- Chat messages.
- Staff dashboards.
- Presence/availability hints.

Room naming examples:

```text
tenant:{tenantId}
branch:{branchId}
order:{orderId}
customer:{customerId}
rider:{riderId}
```

Authorization is required before joining a room.

Redis adapter enables horizontal Socket.IO nodes.

Important distinction:

- Socket events are for live UX.
- PostgreSQL remains source of truth.
- Missed socket event is recovered by REST refetch.
- Critical durable workflows use outbox/jobs, not volatile pub/sub only.

---

# 14. Domain Events and Transactional Outbox

Critical state changes write:

1. Business transaction.
2. Outbox event.

in the same PostgreSQL transaction.

Example:

```text
Order READY
+
outbox_event(order.ready)
COMMIT
```

Worker then processes the outbox event for:

- Notifications.
- Analytics.
- Integration webhooks.
- Dispatch workflows.

Outbox consumers are idempotent.

---

# 15. Background Jobs

BullMQ job types may include:

- Send email.
- Send SMS.
- Send push.
- Process image.
- Deliver tenant webhook.
- Expire carts.
- Expire OTP.
- Scheduled promotion start/end.
- Scheduled order activation.
- Refund reconciliation.
- Outbox delivery.
- Reporting aggregation.

Requirements:

- Retry policy.
- Exponential backoff.
- Max attempts.
- Dead-letter/failure inspection strategy.
- Idempotent handlers.
- Correlation IDs.

---

# 16. Order Engine Requirements

Order state changes are centralized in `OrderService`/domain policy.

Never allow arbitrary status writes such as:

```ts
order.status = input.status
```

Instead:

```text
transition(orderId, action, actorContext)
```

Transition validation considers:

- Current order state.
- Fulfillment type.
- Payment state.
- Actor permission.
- Branch ownership.
- Required rider assignment.
- Cancellation policy.

Every transition creates `order_status_history`.

---

# 17. Checkout and Idempotency

Critical endpoint:

`POST /api/v1/orders`

Client sends:

`Idempotency-Key: <uuid>`

Backend:

1. Looks up `(tenant, actor/guest, operation, idempotency_key)`.
2. If completed, returns original response.
3. If processing, returns controlled conflict/pending response.
4. If new, starts transaction.
5. Validates server-side quote.
6. Creates order/payment intent.
7. Stores idempotent result.

Never trust totals sent from client.

---

# 18. Payment Architecture

Payment module defines an adapter interface:

```ts
interface PaymentProvider {
  createPayment(...): Promise<...>
  verifyWebhook(...): Promise<...>
  refund(...): Promise<...>
  getStatus(...): Promise<...>
}
```

Each provider has a dedicated adapter.

Webhook handling:

1. Read raw body where provider requires signature over raw bytes.
2. Verify signature.
3. Persist webhook event with provider event ID.
4. Reject/ignore already processed IDs.
5. Update payment inside transaction.
6. Emit outbox event.
7. Return provider-required success response.

Raw card data is never stored.

---

# 19. Money and Accounting

All monetary values are stored as integer minor units.

Example:

`PKR 1,250.50 -> 125050` if currency supports two minor units.

Never use JavaScript floating point for authoritative money calculations.

Order totals include explicit fields for:

- Subtotal.
- Item discount.
- Promotion discount.
- Coupon discount.
- Delivery fee.
- Service fee.
- Tax.
- Tip.
- Wallet credit.
- Grand total.
- Paid amount.
- Refunded amount.

A documented reconciliation formula must exist.

---

# 20. Geospatial Requirements

Use PostGIS for:

- Nearest eligible branch.
- Delivery radius.
- Polygon delivery zones.
- Rider location queries.
- Distance calculations.

Store:

- Branch point.
- Customer delivery point.
- Delivery zone polygon/multipolygon.
- Rider current point.

High-frequency rider history may use a separate retention strategy/table from the rider's current location.

---

# 21. Caching

Good cache candidates:

- Tenant public config.
- Domain mapping.
- Category lists.
- Menu catalog.
- Feature flags.
- Public CMS/banners.

Avoid caching volatile authoritative state without a clear invalidation strategy.

Cache keys include tenant/branch:

```text
tenant:{id}:config
tenant:{id}:branch:{id}:menu:v2
```

Cache is invalidated after relevant writes.

---

# 22. Search

MVP:

- PostgreSQL text search / indexed normalized columns.
- Search by product/category name.
- Tenant-scoped results.

Later, if catalog size/search requirements justify it:

- Meilisearch/OpenSearch/Elasticsearch adapter.

Do not introduce a separate search cluster in MVP without need.

---

# 23. Media Pipeline

Upload workflow:

1. Request signed upload URL or upload through media endpoint.
2. Validate MIME/size.
3. Store original.
4. Create optimized variants asynchronously if required.
5. Save media metadata.
6. Serve via CDN.

Media references are tenant-owned.

---

# 24. Notification Adapter Layer

Define channels:

```text
EmailProvider
SmsProvider
PushProvider
WhatsAppProvider
```

Notification template resolution:

```text
event
 -> tenant
 -> locale
 -> channel
 -> template
```

Keep delivery attempts/status in database for important notifications.

---

# 25. Chat Technical Model

- Persistent messages in PostgreSQL.
- Socket.IO for immediate delivery.
- REST for thread history/recovery.
- Message membership checked server-side.
- Customer-rider thread attached to order.
- Access disabled/read-only after configured period.
- Rate limit messages.
- Attachment support can be added through media service.

---

# 26. Security Requirements

Minimum:

- HTTPS only in production.
- Secure headers.
- CSP for web apps.
- CORS allowlist.
- CSRF protection where cookie-authenticated state-changing web routes require it.
- Server-side input validation.
- Output encoding by framework.
- SQL injection protection via ORM/prepared queries.
- Rate limits on auth, OTP, checkout and chat.
- File upload validation.
- Secret manager/env separation.
- No secrets in frontend bundles.
- Webhook signature verification.
- Audit logs.
- Dependency security updates.
- Principle of least privilege for DB/storage/cloud credentials.

Never log:

- Passwords.
- OTP codes.
- Raw payment credentials.
- Authorization tokens.
- Sensitive webhook secrets.

---

# 27. Performance Targets

Initial targets, validated with load testing:

- Public catalog cached response: p95 under 300 ms server-side where infrastructure permits.
- Normal authenticated API: p95 under 500 ms for non-reporting requests.
- Order write operations: prioritize correctness; target p95 under 1 second excluding third-party payment latency.
- Realtime order status propagation: typically under 2 seconds.
- Customer Core Web Vitals target: "good" ranges for primary public pages on representative mobile devices/connections.
- Admin large lists always paginated.

Do not make hard SLA promises until production infrastructure and traffic profile are known.

---

# 28. Database Performance

Requirements:

- Index foreign keys used for filtering.
- Composite indexes start with `tenant_id` when tenant-scoped queries require it.
- Branch/order status/date indexes for dashboards.
- Cursor pagination for very large high-write lists where appropriate.
- Avoid N+1 ORM queries.
- Use query plans for slow endpoints.
- Reporting queries may move to aggregates/read models later.

---

# 29. Availability and Reliability

MVP production:

- Stateless API nodes.
- Health/readiness probes.
- Graceful shutdown.
- Managed or properly backed-up PostgreSQL.
- Redis persistence/HA according to queue criticality.
- Retry external integrations.
- Timeouts on all external HTTP calls.
- Circuit-breaker behavior where repeated provider failures can cascade.
- Outbox for critical asynchronous side effects.

---

# 30. Backup and Disaster Recovery

At minimum:

- Automated PostgreSQL backups.
- Point-in-time recovery if production provider supports it.
- Backup retention policy.
- Object-storage durability/versioning strategy where required.
- Restore procedure tested periodically.
- Migration rollback/recovery runbook.

RPO/RTO targets must be defined before launch based on business plan.

---

# 31. Audit and Logging

Audit entries for:

- Order status override.
- Order cancellation.
- Refund.
- Product price change.
- Coupon/promotion creation/change.
- Branch setting change.
- Staff role change.
- Tenant suspension.
- Support impersonation.

Application logs include:

- Timestamp.
- Level.
- Service.
- Request ID.
- Tenant ID where safe.
- Actor ID where safe.
- Route/job.
- Error code.
- Duration.

---

# 32. CI/CD

Pull request pipeline:

1. Install locked dependencies.
2. Lint.
3. Typecheck.
4. Unit tests.
5. Integration tests.
6. Build all affected apps.
7. Validate Prisma schema/migrations.
8. API contract check.
9. Playwright smoke tests for critical flows.

Deployment:

- Build immutable container images.
- Run migration job before/with controlled rollout.
- Deploy API/worker/web.
- Verify health.
- Run post-deploy smoke checks.

Never run destructive schema migration automatically without a reviewed migration plan.

---

# 33. Environments

Required:

- Local.
- Development/shared.
- Staging.
- Production.

Each environment has isolated:

- Database.
- Redis.
- Object storage namespace/bucket.
- OAuth/payment credentials.
- domains.
- secrets.

Do not use production customer data in local development.

---

# 34. Local Development

Docker Compose should provide:

- PostgreSQL + PostGIS.
- Redis.
- MinIO optional.
- Mail catcher optional.

Apps run through pnpm/Turborepo.

Recommended commands:

```text
pnpm install
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

---

# 35. Seed Data

Seed script creates:

- Platform super admin.
- Demo tenant.
- Two branches.
- Staff roles.
- Sample categories.
- Products.
- Variants.
- Modifier groups.
- Demo customer.
- Demo rider.
- Feature flags.

Seeds must be deterministic enough for E2E tests.

---

# 36. Testing Strategy

## Unit
Business rules:

- Price calculations.
- Coupon eligibility.
- Order transitions.
- Delivery zone rules.
- RBAC policies.

## Integration
Database-backed:

- Tenant isolation.
- Checkout transaction.
- Idempotency.
- Payment webhook deduplication.
- Outbox.
- Rider assignment.

## E2E
Critical journeys:

- Customer places COD order.
- Admin accepts.
- Kitchen prepares.
- Rider delivers.
- Customer sees live status.
- Online payment success webhook.
- Cross-tenant access denied.

---

# 37. Feature Flags

Tenant-level feature flags:

- `online_payment`
- `loyalty`
- `wallet`
- `reviews`
- `chat`
- `live_rider_tracking`
- `scheduled_orders`
- `pos`
- `inventory`
- `qr_ordering`

Backend enforces flags; hiding UI alone is not sufficient.

---

# 38. Scalability Roadmap

Do not split services prematurely.

Possible extraction triggers:

- Notification delivery produces independent scaling pressure.
- Rider location volume becomes large.
- Reporting loads affect transactional DB.
- Search requires dedicated engine.
- Payment compliance/integration demands isolation.

Potential future services:

```text
notification-service
delivery-tracking-service
reporting-service
search-service
integration-webhook-service
```

The order database/source of truth should remain carefully controlled during any extraction.

---

# 39. Deployment Recommendation

## MVP
- Dockerized Next.js/NestJS workloads.
- Managed PostgreSQL if budget allows.
- Managed Redis if budget allows.
- S3-compatible object storage.
- CDN/WAF.
- Reverse proxy/load balancer.

## Scale
- Multiple API nodes.
- Multiple workers by queue.
- Redis HA.
- PostgreSQL replicas/connection pooling.
- Dedicated reporting/search components as measured need appears.
- ECS/Kubernetes only when operational scale justifies it.

---

# 40. Technical Decisions to Avoid

Do not start with:

- 10+ microservices.
- MongoDB as primary order store.
- Separate backend languages for each panel.
- Firebase as the authoritative order database.
- Direct frontend-to-database writes.
- Business logic inside React components.
- Hard-coded tenant names/colors/domains.
- Hard-coded branch IDs.
- Floating-point money.
- Arbitrary order status mutation.
- Volatile Socket.IO events as the only workflow trigger.
- One database table without tenant scoping for tenant-owned data.

---

# 41. Definition of Technical Ready for MVP

The engineering foundation is ready when:

- Monorepo builds in CI.
- Tenant resolution works by custom/subdomain.
- Auth + tenant + branch authorization is enforced.
- Core schema and migrations exist.
- OpenAPI client generation works.
- Order state machine is tested.
- Checkout idempotency is tested.
- Realtime room authorization is tested.
- Outbox/worker retries work.
- Payment adapter contract exists.
- Audit log exists.
- Cross-tenant integration tests pass.
- Local/staging environments can be reproduced.
