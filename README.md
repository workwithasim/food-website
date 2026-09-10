<div align="center">

# 🍽️ Restaurant Platform

### White-Label Multi-Tenant Restaurant Ordering System

[![CI/CD](https://github.com/workwithasim/food-website/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/workwithasim/food-website/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js 20](https://img.shields.io/badge/node-20-green.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io)

A **production-ready**, full-stack restaurant ordering platform supporting multiple tenants, branches, customer ordering, kitchen display, real-time delivery tracking, and mobile apps — all in a single monorepo.

</div>

---

## 📦 Apps & Packages

### Applications

| App | Package | Description |
|-----|---------|-------------|
| `apps/api` | `@restaurant/api` | NestJS 11 REST API (core backend) |
| `apps/customer-web` | `@restaurant/customer-web` | Next.js customer-facing ordering site |
| `apps/ops-web` | `@restaurant/ops-web` | Next.js ops dashboard (admin, KDS, branch) |
| `apps/customer-app` | `@restaurant/customer-app` | Expo React Native customer mobile app |
| `apps/rider-app` | `@restaurant/rider-app` | Expo React Native rider delivery app |

### Shared Packages

| Package | Description |
|---------|-------------|
| `@restaurant/contracts` | Shared TypeScript types & Zod schemas |
| `@restaurant/api-client` | Typed HTTP client for API |
| `@restaurant/database` | Prisma schema, migrations, seed |
| `@restaurant/config` | Shared ESLint, TypeScript configs |
| `@restaurant/ui` | Shared React component library |
| `@restaurant/observability` | Logging & tracing utilities |
| `@restaurant/testing` | Shared test helpers and factories |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **API** | NestJS 11, TypeScript, Swagger |
| **Database** | PostgreSQL 16, Prisma ORM |
| **Cache / Queue** | Redis 7, BullMQ |
| **Real-time** | Socket.IO |
| **Web** | Next.js (App Router), Tailwind CSS |
| **Mobile** | Expo 51, React Native 0.74, expo-router |
| **Auth** | JWT + Refresh tokens, OTP via SMS |
| **Payments** | Stripe |
| **Push Notifications** | Firebase Cloud Messaging (FCM) |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions → GHCR → SSH deploy |
| **TLS / Proxy** | Nginx + Let's Encrypt (certbot) |
| **Testing** | Vitest (unit + integration), Playwright (E2E) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 1. Clone & Install
```bash
git clone https://github.com/workwithasim/food-website.git
cd food-website
pnpm install
```

### 2. Start Infrastructure (Postgres + Redis)
```bash
docker compose up -d
```

### 3. Set Up Environment
```bash
cp .env.example .env
# Fill in JWT_SECRET, DATABASE_URL, etc.
```

### 4. Run Database Migrations & Seed
```bash
pnpm --filter @restaurant/database migrate:deploy
pnpm --filter @restaurant/database db:seed
```

### 5. Start All Apps in Dev Mode
```bash
pnpm dev
```

| Service | URL | Notes |
|---------|-----|-------|
| API | http://localhost:4000 | NestJS REST API (`/api/v1`) |
| API Docs (Swagger) | http://localhost:4000/api/docs | Interactive OpenAPI documentation |
| Ops Web Portal | http://localhost:3001 | Restaurant Admin, Catalog CRUD, KDS |
| Customer Web Storefront | http://localhost:3002 | Cheezious UX/UI, Add-ons, Cart, Tracking |

---

## 🍕 Cheezious Dynamic Customer Storefront (`apps/customer-web`)

The Customer Web storefront replicates the exact layout, UX/UI, and ordering journey of **[Cheezious](https://cheezious.com/)**, while being 100% dynamic and connected to PostgreSQL and the NestJS REST API:

- **Cheezious Design System**: Signature `#F15B25` (Flame Orange) and `#FFC107` (Amber Gold) branding with responsive layout and micro-animations.
- **Delivery vs. Pickup Header**: Quick toggle with integrated location selector modal for branch and address selection.
- **Promotional Hero Banners**: Dynamic carousel fetching active campaigns from `/api/v1/cms/public/banners`.
- **Sticky Category Anchor Bar**: Smooth scroll-spy category navigation (*Somewhat Local*, *Pizza Deals*, *Cheezy Treats*, *Thin Crust Pizza*, *Burgers*, *Sides*, *Desserts*, *Beverages*).
- **Cheezious Product Cards**: 4:3 high-res imagery, favorites heart toggle, descriptions, base prices, and interactive `+ ADD TO CART`.
- **Interactive Add-ons & Customizer Dialog**:
  - Size variants (Small 7", Regular 10", Large 13", Jumbo 16").
  - Crust modifier groups (Deep Pan, Cheezy Stuffed Crust, Kabab Crust).
  - Multi-select add-on options (Extra Cheese, Mayo Garlic Dip, Fries, Soft Drinks).
  - Dynamic real-time price calculation updating on every selection.
  - Quantity stepper controls.
- **Slide-Out Cart Drawer**: Live modifier chips, promo code validation (`CHEEZY10`), dynamic delivery fee logic, and Checkout CTA.
- **Checkout & Real-Time Order Tracking**:
  - Delivery details collection (Name, Phone, Street Address, Delivery notes).
  - Multiple payment methods: Cash on Delivery (COD), Card on Delivery, Digital Wallets.
  - 5-step visual tracking stepper: `Order Placed` ➔ `Confirmed` ➔ `In the Kitchen` ➔ `Out for Delivery` ➔ `Delivered`.
  - Orders stored in PostgreSQL `orders`, `order_items`, and `order_status_history` tables with real-time API retrieval.

---

## 🧪 Testing

```bash
# Unit tests (all packages)
pnpm test

# API unit tests only
pnpm --filter @restaurant/api test

# API-client contract regression tests
pnpm --filter @restaurant/api-client test

# Integration tests (requires Docker DB)
pnpm --filter @restaurant/api test:integration

# E2E tests
pnpm --filter @restaurant/api test:e2e
```

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Nginx (TLS)                   │
└──────────────────┬──────────────────────────────┘
                   │
       ┌───────────▼───────────┐
       │    @restaurant/api    │  NestJS REST + Socket.IO
       │    (port 4000)        │
       └──┬────────┬───────────┘
          │        │
  ┌───────▼──┐  ┌──▼──────┐
  │PostgreSQL│  │  Redis  │  (+ BullMQ workers)
  └──────────┘  └─────────┘

Web Clients:                Mobile Clients:
  customer-web (Next.js)      customer-app (Expo)
  ops-web (Next.js)           rider-app (Expo)
```

### Multi-Tenancy
Every API request carries `X-Tenant-ID`. All data is scoped by `tenant_id` at the database level. No cross-tenant data leakage is possible.

### Key Modules
| Module | Responsibility |
|--------|---------------|
| `AuthModule` | JWT, refresh tokens, OTP login |
| `TenantsModule` | Tenant provisioning and domain resolution |
| `CatalogModule` | Menu, categories, products, variants, modifiers |
| `CartModule` | Guest + authenticated cart with session merging |
| `OrdersModule` | Order lifecycle, state machine, outbox events |
| `PaymentsModule` | Stripe charge + webhook handling |
| `DeliveriesModule` | Rider assignment, GPS tracking |
| `NotificationsModule` | FCM push + in-app notifications |
| `ReportingModule` | Sales, operational, and audit reports |
| `PromotionsModule` | Coupons, discounts, loyalty |
| `SupportModule` | Customer support tickets, CRM |

---

## 📱 Mobile Apps

Both mobile apps use `expo-secure-store` (iOS Keychain / Android Keystore) for token storage — **never** AsyncStorage.

### Customer App (`apps/customer-app`)
- Browse menu, add to cart, checkout, track order live
- Deep link: `restaurant://orders/:orderId`
- Push notifications for order status updates

### Rider App (`apps/rider-app`)
- Accept/reject deliveries, navigate to customer
- **Background location** via `expo-location` + `expo-task-manager`
  - Location tracked **only** during active delivery (privacy-first)
  - Android foreground service notification shown
- Deep link: `restaurant-rider://deliveries/:deliveryId`

See [`docs/mobile-readiness.md`](docs/mobile-readiness.md) for full design details.

---

## 🔒 Security

- **Helmet** — HTTP security headers on all responses
- **CORS** — strict origin whitelist (no wildcard in production)
- **JWT** — short-lived access tokens (15 min) + refresh tokens (30 days)
- **Argon2** — password hashing
- **Tenant isolation** — database-level `tenant_id` scoping on every query
- **Stripe webhook verification** — `stripe-signature` header checked on every webhook
- **Mobile tokens** — iOS Keychain / Android Keystore only (via expo-secure-store)
- **Non-root Docker** — API container runs as `appuser`

See [`docs/security.md`](docs/security.md) for full security design.

---

## 🚢 Production Deployment

See [`docs/production-runbook.md`](docs/production-runbook.md) for full deployment, rollback, and recovery steps.

### Quick Deploy
```bash
# SSH into server
ssh deploy@your-server

# Pull latest image & restart
export IMAGE_TAG=sha-$(git rev-parse --short HEAD)
docker compose -f docker-compose.prod.yml pull api
docker compose -f docker-compose.prod.yml up -d api

# Verify
curl -f https://api.yourrestaurant.com/api/v1/health
```

### CI/CD Pipeline
GitHub Actions (`.github/workflows/ci-cd.yml`) runs:
1. **Lint & Typecheck** — on every push
2. **Unit Tests** — on every push
3. **Integration Tests** — on every push (with Postgres + Redis services)
4. **Docker Build & Push** → GHCR — on `main` merge
5. **Deploy to Staging** — on `main` merge (SSH + health check)

### Rollback
```bash
./infra/scripts/rollback.sh sha-<previous_tag>
```

### Backups
```bash
# Manual
./infra/scripts/backup.sh

# Automated cron (daily at 2am)
0 2 * * * /opt/restaurant/infra/scripts/backup.sh
```

---

## 🗄️ Database Migrations

```bash
# Create a new migration
pnpm --filter @restaurant/database migrate:dev --name <migration_name>

# Apply migrations (production)
pnpm --filter @restaurant/database migrate:deploy

# Reset (dev only)
pnpm --filter @restaurant/database migrate:reset
```

---

## 📂 Repository Structure

```
food-website/
├── apps/
│   ├── api/              # NestJS API
│   ├── customer-web/     # Customer Next.js site
│   ├── ops-web/          # Ops dashboard (admin, KDS)
│   ├── customer-app/     # Expo customer mobile app
│   └── rider-app/        # Expo rider mobile app
├── packages/
│   ├── contracts/        # Shared types & Zod schemas
│   ├── api-client/       # Typed HTTP client
│   ├── database/         # Prisma schema & migrations
│   ├── config/           # ESLint, TypeScript configs
│   ├── ui/               # Shared React components
│   ├── observability/    # Logging utilities
│   └── testing/          # Test helpers
├── infra/
│   ├── nginx/            # Nginx reverse proxy config
│   └── scripts/          # backup.sh, rollback.sh, smoke-test.sh
├── docs/
│   ├── phases/           # Phase-by-phase implementation docs
│   ├── production-runbook.md
│   ├── mobile-readiness.md
│   ├── architecture.md
│   └── security.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml     # GitHub Actions CI/CD
├── docker-compose.yml          # Local dev (postgres + redis)
├── docker-compose.prod.yml     # Production compose
├── .env.production.template    # Env vars reference
└── turbo.json                  # Turborepo pipeline
```

---

## 📋 Phase History

| Phase | Feature |
|-------|---------|
| 00 | Foundation — monorepo, tooling, shared packages |
| 01 | Database — Prisma schema, migrations, seed |
| 02 | Tenancy — multi-tenant isolation, custom domains |
| 03 | Authentication — JWT, refresh, OTP |
| 04 | RBAC — roles, staff management |
| 05 | Branch Operations |
| 06 | Catalog Core — menu, categories, products |
| 07 | Variants & Modifiers |
| 08 | Customer Web Shell |
| 09 | Cart |
| 10 | Checkout & Pricing |
| 11 | Order Engine — state machine, lifecycle |
| 12 | Payments — Stripe |
| 13 | Real-time — Socket.IO + outbox pattern |
| 14 | Restaurant Admin |
| 15 | Branch Manager |
| 16 | Kitchen Display System (KDS) |
| 17 | Riders & Delivery |
| 18 | Customer Tracking — live order map |
| 19 | Chat & Push Notifications |
| 20 | Promotions & CMS |
| 21 | CRM, Reviews & Support |
| 22 | Reporting & Audit |
| 23 | Security & Performance |
| 24 | Mobile Readiness — Expo apps |
| 25 | Production Launch — Docker, CI/CD, runbook |

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development workflow, branch naming, and code standards.

---

## 📄 License

MIT © workwithasim
