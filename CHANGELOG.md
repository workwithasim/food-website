# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-09-10 🍕 Cheezious Customer Storefront Replatforming

### 🎨 Storefront UX/UI (Cheezious Theme)
- Replatformed `apps/customer-web` with Cheezious design system (`#F15B25` flame orange, `#FFC107` amber, rounded 3xl cards, and modern typography).
- Added dynamic hero promotional banners carousel auto-fetching from `/api/v1/cms/public/banners`.
- Added sticky horizontal category anchor bar with smooth section scroll-spy.
- Added top bar header with Delivery vs. Pickup toggle, location selector modal, phone OTP auth modal, and animated cart pill.
- Added interactive Product Customization & Add-ons modal (`ProductModal.tsx`) with radio size selection, crust options, multi-select checkboxes, and dynamic live price calculations.
- Added slide-out cart drawer (`CartSidebar.tsx`) with itemized modifier chips, promo code validation (`CHEEZY10`), dynamic delivery fees, and Checkout CTA.
- Added `/checkout` flow with customer delivery details and payment options (Cash on Delivery, Card on Delivery, Digital Wallet).
- Added `/orders/[id]` real-time 5-step visual order tracking stepper (`Order Placed` ➔ `Confirmed` ➔ `In the Kitchen` ➔ `Out for Delivery` ➔ `Delivered`).

### 🗄️ Backend API & Database Hardening
- Populated complete authentic Cheezious menu seed (`packages/database/prisma/seed-cheezious-catalog.ts`) with 4 banners, 8 categories, 17 items, and modifier groups.
- Enhanced `CartService.getCart` to eagerly include product media, variants, and modifier relations.
- Implemented robust BigInt price serialization across `ProductsService`, `CartService`, and `OrdersService` preventing JSON serialization errors.
- Enhanced `OrdersService.getOrder` to safely support lookup by either internal UUID or human-readable `order_number` (`ORD-...`).
- Normalized API routing across checkout and order endpoints.

---

## [1.0.1] — 2026-09-10 🛡️ Repository Hardening & Fixes

### 🔒 Security & Repository
- Added `SECURITY.md` detailing responsible disclosure policy and core security safeguards.
- Added modern GitHub Issue Templates (`bug_report.yml`, `feature_request.yml`, `config.yml`).
- Added comprehensive `.github/pull_request_template.md` with security and QA checklists.
- Added automated `.github/workflows/release.yml` for GitHub Releases on version tags.

### 🐛 Bug Fixes
- Aligned `@nestjs/websockets` and `@nestjs/platform-socket.io` to `^11.2.3` to resolve package version mismatches.
- Added `@Global()` decorator to `AuthModule` and imported into `AuditModule` to ensure global dependency resolution for `JwtAuthGuard`.
- Added `test:unit` and `test:all` npm scripts to `apps/api/package.json` to ensure continuous integration compatibility.

---

## [1.0.0] — 2026-09-10 🎉 Production Launch

### ✨ New — Full Platform (Phases 00–25)

#### Platform Core
- Multi-tenant NestJS 11 REST API (`@restaurant/api`) with Swagger docs
- Prisma ORM with PostgreSQL 16 — full schema with tenant/branch isolation
- Redis 7 + BullMQ background job queue
- Real-time events via Socket.IO + transactional outbox pattern
- Shared TypeScript contracts (`@restaurant/contracts`) — Zod schemas + TS types
- Typed HTTP client (`@restaurant/api-client`) — 13 contract regression tests

#### Authentication & Authorization
- JWT access tokens (15 min) + refresh tokens (30 days)
- Phone OTP login flow
- Argon2 password hashing
- Full RBAC — SuperAdmin, TenantAdmin, BranchManager, Staff, Rider, Customer

#### Customer Features
- Multi-branch menu browsing with variants & modifiers
- Guest + authenticated cart with session merging
- Checkout with Stripe payment processing
- Real-time order status tracking with live map
- Push notifications (FCM) for order lifecycle events
- Support tickets & reviews system

#### Operations Features
- Restaurant Admin dashboard (tenant management, reporting)
- Branch Manager portal (branch settings, staff, hours)
- Kitchen Display System (KDS) with real-time order queue
- Rider assignment & dispatch
- CMS for promotions, coupons, banners
- CRM — customer profiles, segments, support tickets

#### Reporting & Analytics
- Sales reports (revenue, AOV, top products)
- Operational reports (order fulfilment times, rider performance)
- Audit log for all sensitive actions

#### Mobile Apps
- `@restaurant/customer-app` — Expo 51 customer app (expo-router, SecureStore auth, push)
- `@restaurant/rider-app` — Expo 51 rider app (background location, foreground service)
- Privacy-first location tracking — only active during assigned delivery

#### Security
- Helmet HTTP security headers
- Strict CORS (origin whitelist)
- Non-root Docker user
- Mobile tokens in iOS Keychain / Android Keystore only

#### Production Infrastructure
- Multi-stage Dockerfile (non-root, HEALTHCHECK)
- Docker Compose production stack (postgres, redis, nginx, certbot, api)
- GitHub Actions CI/CD pipeline (lint, unit, integration, Docker push, staging deploy)
- Nginx reverse proxy with TLS + Socket.IO WebSocket support
- Automated PostgreSQL backups → S3 with 30-day retention
- Rollback script with post-rollback health verification
- Smoke test script (5 critical journey checks)
- Full production runbook (deploy, rollback, DB restore)

---

## [0.1.0] — 2026-09-09

### Added
- **Phase 00 Foundation**:
  - Turborepo monorepo with pnpm workspaces
  - Docker Compose for PostgreSQL (PostGIS) + Redis with healthchecks
  - Shared packages: `@restaurant/config`, `@restaurant/contracts`, `@restaurant/observability`, `@restaurant/ui`, `@restaurant/auth-client`, `@restaurant/api-client`, `@restaurant/testing`
  - Applications: `@restaurant/customer-web` (Next.js), `@restaurant/ops-web` (Next.js), `@restaurant/api` (NestJS), `@restaurant/worker` (BullMQ)
  - Health check endpoint `GET /api/v1/health`
  - Strict TypeScript and ESLint configuration
  - Environment templates
