# Architecture Overview

## Runtime Topology

```text
Customer Web --------Ops Web --------------> NestJS API ---- PostgreSQL/PostGIS
Platform Web --------/       |                             Redis \---- S3/R2
                              |
                         Socket.IO/BullMQ
                              |
                            Worker
```

## Main Backend Modules
- tenancy
- identity/auth
- branches
- staff/RBAC
- customers
- catalog
- cart/checkout
- pricing/promotions
- orders
- payments/refunds
- kitchen
- delivery/riders
- chat
- notifications
- CMS/media
- reports
- audit
- platform admin

## Durable Event Pattern

Business transaction + outbox row commit together.
Workers process outbox rows after commit.
Socket.IO improves UX but does not replace durable state.
