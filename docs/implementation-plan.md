# Master Implementation Plan

The project is divided into gated phases. Do not begin a later phase before the current phase is accepted.

| Phase | Title | Primary Outcome |
|---:|---|---|
| 00 | Foundation | Reproducible monorepo + Docker + CI-quality scripts |
| 01 | Database Foundation | PostgreSQL/PostGIS + Prisma + migrations/seeds |
| 02 | Tenancy & Domains | Tenant isolation, domain resolution, theme config |
| 03 | Authentication | Customer/staff sessions, OTP/password, refresh rotation |
| 04 | RBAC & Staff | Roles, permissions, branch restrictions |
| 05 | Branch Operations | Branches, hours, special hours, delivery zones |
| 06 | Catalog Core | Categories, products, media |
| 07 | Variants & Modifiers | Configurable products and branch overrides |
| 08 | Customer Web Shell | White-label public UI, navigation, menu discovery |
| 09 | Cart | Persistent cart, item configuration, validation |
| 10 | Checkout & Pricing | Server quote, branch validation, totals |
| 11 | Order Engine | Order snapshots, numbering, state machine, history |
| 12 | Payments | COD + provider abstraction + webhooks + refunds |
| 13 | Realtime & Outbox | Socket rooms, durable events, workers |
| 14 | Restaurant Admin | Core admin dashboard and CRUD operations |
| 15 | Branch Manager | Branch-scoped operational dashboard |
| 16 | Kitchen KDS | Live order preparation workflow |
| 17 | Riders & Delivery | Rider profiles, assignment, delivery states, COD |
| 18 | Customer Tracking | Live order timeline, rider data/map contract |
| 19 | Chat & Notifications | Order chat and notification adapters/templates |
| 20 | Promotions & CMS | Coupons, deals, scheduled promos, banners |
| 21 | CRM, Reviews & Support | Customer insights, reviews, support foundation |
| 22 | Reporting & Audit | Operational reports, reconciliation, audit UI |
| 23 | Security & Performance | Hardening, load tests, indexes, caching |
| 24 | Mobile Readiness | API contract freeze, Expo app foundations |
| 25 | Production Launch | Staging, deployment, backups, smoke tests, launch |

Every phase has a dedicated file under `docs/phases/`.
