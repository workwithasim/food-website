# White-Label Multi-Tenant Restaurant Platform
## Product Requirements Document (PRD)

**Version:** 1.0.0  
**Status:** Master Development Specification  
**Date:** 2026-09-09  
**Product Type:** White-label, multi-tenant restaurant ordering and operations platform  
**Primary Market:** Restaurants, food chains, cloud kitchens, cafés, burger/pizza brands, and multi-branch food businesses  
**Primary Goal:** Build one reusable platform that can power many restaurant brands, branches, websites, mobile apps, kitchens, riders, and administrative systems from a shared codebase.

---

# 1. Product Vision

Build a production-grade restaurant technology platform in which business logic is reusable and tenant branding/configuration is dynamic.

The platform must be capable of supporting:

- Multiple restaurant brands/tenants.
- Multiple branches per tenant.
- Customer web ordering.
- Customer Android and iOS apps.
- Kitchen display system (KDS).
- Rider/delivery app.
- Branch manager dashboard.
- Restaurant admin dashboard.
- Platform super-admin dashboard.
- Real-time order state updates.
- Live rider tracking.
- Customer-to-rider/support chat.
- Online and cash payments.
- Promotions, coupons, bundles and scheduled offers.
- White-label branding and custom domains.
- Role-based staff permissions.
- Future POS, inventory, QR ordering and SaaS subscription modules.

The platform must not contain restaurant-specific business logic in the core application.

---

# 2. Product Principles

1. **API First** — web, mobile, rider, kitchen, POS and admin clients consume the same backend APIs.
2. **Multi-Tenant by Design** — every tenant-owned resource is isolated by `tenant_id`.
3. **Multi-Branch by Design** — branch-specific pricing, stock/availability, hours and delivery rules are first-class concepts.
4. **Configuration over Forking** — branding and behavior are controlled with tenant settings and feature flags.
5. **Real-Time Operations** — critical order, kitchen and delivery state changes update connected clients immediately.
6. **Mobile-Ready from Day One** — no backend behavior may depend exclusively on browser sessions.
7. **Auditability** — important admin, payment and order actions are recorded.
8. **Provider Abstraction** — payment, maps, storage, SMS, email and push providers can be replaced without rewriting business logic.
9. **Progressive Complexity** — launch as a modular monolith; extract services only when scale justifies it.
10. **Reliability over Novelty** — order/payment correctness is more important than using fashionable infrastructure.

---

# 3. Primary User Roles

## 3.1 Customer
Can browse menus, create an account, manage addresses, place orders, pay, track orders, communicate with support/rider, view order history, reorder and review completed orders.

## 3.2 Restaurant Owner / Tenant Admin
Controls the restaurant brand, branches, products, categories, prices, staff, promotions, reports, settings and operational policies.

## 3.3 Branch Manager
Controls day-to-day operations for assigned branches, including order acceptance, kitchen flow, rider assignment, product availability and staff.

## 3.4 Kitchen Staff
Views relevant orders, starts preparation, marks items/orders ready and sees preparation timers.

## 3.5 Rider / Delivery Staff
Accepts/receives assigned deliveries, navigates to customer, updates delivery state, chats with customer and completes proof/payment collection.

## 3.6 Cashier / POS Staff
Handles counter orders, payments and receipts when the POS module is enabled.

## 3.7 Support Agent
Handles customer issues, order-related chat/tickets and approved refund workflows.

## 3.8 Platform Super Admin
Creates and manages tenants, plans, feature access, domains, subscriptions, usage and platform-wide operations.

---

# 4. Tenant and Branch Model

A **tenant** represents one restaurant brand/company.

Example:

- Tenant: Burger House
  - Saddar Branch
  - Bahria Branch
  - F-10 Branch

Each tenant can have:

- Own logo, colors, fonts and domain.
- Own users and staff.
- Own menu and product catalog.
- Own branches.
- Own taxes, currency and policies.
- Own payment and notification configuration.
- Own customer base.
- Own reports.
- Own feature flags and subscription plan.

Each branch can override selected tenant defaults, including:

- Opening hours.
- Delivery zones.
- Minimum order.
- Delivery fee.
- Product price.
- Product availability.
- Preparation time.
- Tax/service charge where allowed.
- Branch-specific staff and riders.

---

# 5. Customer Web Application Requirements

## 5.1 Home Page

The customer-facing home page must support:

- Tenant logo and branding.
- Delivery/pickup mode selector.
- Current delivery location.
- Branch selection when required.
- Product/menu search.
- Category navigation.
- Promotional banners.
- Featured products.
- Best sellers.
- New products.
- Deals and bundles.
- Recommended products.
- Recently ordered items for authenticated customers.
- Reorder shortcuts.
- Restaurant open/closed state.
- Branch delivery availability.
- Footer pages and tenant contact information.

## 5.2 Customer Authentication

Supported authentication modes shall be configurable by tenant:

- Email/password.
- Phone/OTP.
- Google sign-in.
- Apple sign-in for mobile.
- Guest checkout if enabled.

Customer account must support:

- Profile.
- Saved addresses.
- Active orders.
- Order history.
- Favorites.
- Reorder.
- Wallet where enabled.
- Loyalty points where enabled.
- Coupons/rewards.
- Notifications.
- Support conversations.
- Logout from current/all devices.

## 5.3 Address Book

Each address stores:

- Label: Home/Office/Other.
- Recipient name.
- Phone number.
- Address line.
- Area/locality.
- City.
- Optional landmark.
- Latitude.
- Longitude.
- Delivery instructions.
- Default flag.

The platform must validate whether an address is serviceable by at least one eligible branch.

---

# 6. Menu and Catalog Requirements

## 6.1 Categories
Admin can:

- Create/edit/archive categories.
- Set category image/icon.
- Set display order.
- Schedule category visibility.
- Restrict category to selected branches.
- Set SEO data.
- Nest categories only if enabled by product configuration.

## 6.2 Products
Products support:

- Name.
- Slug.
- Description.
- Images.
- Base price.
- Tax class.
- Preparation time.
- Availability state.
- Dietary/allergen metadata.
- Branch assignment.
- Schedule.
- Featured/best-seller flags.
- SEO metadata.
- Variants.
- Modifier groups/add-ons.

## 6.3 Variants
Examples:

- Small / Medium / Large.
- Single / Double.
- Regular / Family.

Each variant can have:

- Price delta or absolute price.
- SKU/code.
- Availability.
- Branch override.
- Preparation-time override.

## 6.4 Modifier Groups
Examples:

- Choose crust.
- Choose drink.
- Add cheese.
- Add dip.

A modifier group supports:

- Required/optional.
- Minimum selections.
- Maximum selections.
- Single/multiple selection.
- Modifier price.
- Branch availability.

## 6.5 Branch Product Overrides
A branch can override:

- Price.
- Availability.
- Sold-out state.
- Preparation time.
- Ordering schedule.

---

# 7. Cart Requirements

Cart must support:

- Product and variant snapshot.
- Selected modifiers.
- Quantity.
- Item notes.
- Coupon.
- Promotion adjustments.
- Subtotal.
- Tax.
- Service fee.
- Delivery fee.
- Tip.
- Wallet credit.
- Final payable total.

Rules:

- Prices are revalidated at checkout.
- Unavailable items block checkout.
- Cart state can persist for authenticated customers.
- Cart belongs to one tenant.
- Cross-tenant carts are forbidden.
- A cart is evaluated against one fulfillment branch before order placement.

---

# 8. Checkout Requirements

Checkout flow:

1. Validate customer/guest identity.
2. Choose Delivery or Pickup.
3. Select/validate address for Delivery.
4. Resolve eligible branch.
5. Validate items against branch menu.
6. Calculate promotion/coupon.
7. Calculate tax/service/delivery charges.
8. Select payment method.
9. Review order.
10. Place order.
11. Process/confirm payment according to provider workflow.
12. Show order confirmation and tracking.

Checkout must be idempotent to prevent duplicate orders from repeat submissions.

---

# 9. Payment Requirements

Payment methods are tenant-configurable and implemented using provider adapters.

Supported categories:

- Cash on Delivery.
- Card/online gateway.
- Wallet credit.
- Bank/manual transfer if tenant enables it.
- Region-specific digital wallets/payment providers.

Order status and payment status are separate.

Payment statuses:

- `PENDING`
- `AUTHORIZED`
- `PAID`
- `FAILED`
- `CANCELLED`
- `PARTIALLY_REFUNDED`
- `REFUNDED`
- `COD_DUE`
- `COD_COLLECTED`

Requirements:

- Verify gateway webhooks.
- Prevent duplicate webhook processing.
- Store provider transaction IDs.
- Support full/partial refunds.
- Keep a payment attempt history.
- Never store raw card details.

---

# 10. Order Management

## 10.1 Core Order Lifecycle

Default fulfillment flow:

`PLACED -> CONFIRMED -> PREPARING -> READY -> RIDER_ASSIGNED -> PICKED_UP -> ON_THE_WAY -> DELIVERED`

Alternative terminal states:

- `REJECTED`
- `CANCELLED`
- `FAILED`

Each transition must:

- Be permission checked.
- Be validated against allowed state transitions.
- Record actor, timestamp and source.
- Create history.
- Publish required realtime/domain events.

## 10.2 Order Snapshot
Placed orders must keep immutable snapshots of:

- Product name.
- Product price.
- Variant.
- Modifiers.
- Tax.
- discounts.
- Delivery address.
- branch.
- customer contact details required for fulfillment.

Later catalog changes must never modify historical order totals.

## 10.3 Scheduled Orders
Tenant can enable future ordering with configurable:

- Lead time.
- Maximum days in advance.
- Allowed time slots.
- Branch capacity restrictions.

## 10.4 Pickup Orders
Pickup flow omits rider assignment and delivery fee, and notifies the customer when ready.

---

# 11. Real-Time Customer Tracking

The customer tracking page must show:

- Order number.
- Current status.
- Status timeline.
- Branch.
- Estimated preparation/delivery time.
- Rider details when assigned.
- Rider location when permitted and active.
- Chat/contact actions.
- Payment state.
- Order summary.

Customer clients receive real-time updates without manual refresh.

---

# 12. Kitchen Display System (KDS)

KDS is optimized for large screens/tablets and fast touch interaction.

Views:

- New.
- Preparing.
- Ready.
- Delayed.

Kitchen order cards show:

- Order number.
- Order age/timer.
- Channel: delivery/pickup/POS.
- Items.
- Modifiers.
- Item/customer notes that are relevant to preparation.
- Allergen warnings if configured.
- Action buttons.

Actions:

- Start preparing.
- Mark item ready if item-level workflow is enabled.
- Mark entire order ready.
- Escalate/report issue.
- Print kitchen ticket if configured.

## 12.1 Kitchen Stations
Future/advanced configuration supports:

- Burger station.
- Pizza station.
- Fry station.
- Beverage station.
- Packing station.

Menu items may route to one or more stations. An order becomes ready after all required preparation tasks complete.

---

# 13. Rider / Delivery Requirements

## 13.1 Rider Availability
Riders can be:

- Offline.
- Online/available.
- Assigned.
- Busy.
- Paused.

## 13.2 Assignment Modes
Tenant can choose:

- Manual assignment.
- Automatic assignment.
- Rider pool/first accept.

Automatic assignment may evaluate:

- Branch.
- Distance.
- Online status.
- Active workload.
- Rider capability/zone.
- Shift status.

## 13.3 Delivery Workflow

`ASSIGNED -> ACCEPTED -> ARRIVED_AT_BRANCH -> PICKED_UP -> ON_THE_WAY -> ARRIVED_AT_CUSTOMER -> DELIVERED`

## 13.4 Proof of Delivery
Configurable methods:

- Delivery OTP.
- Customer signature.
- Delivery photo where legally/operationally appropriate.
- Manager override with audit reason.

## 13.5 COD
Rider view shows:

- Amount to collect.
- Collection confirmation.
- Cash balance/settlement status.

Branch management supports rider cash settlement and reconciliation.

---

# 14. Chat and Support

Chat channels may include:

- Customer <-> Rider for an active order.
- Customer <-> Support.
- Manager <-> Rider.

Requirements:

- Order-scoped threads.
- Text messages.
- System messages.
- Quick replies.
- Delivery of unread counts.
- Timestamps.
- Message audit/retention policy.
- Optional image/location messages as a later feature.
- Chat access expires or becomes read-only after a configured period.

---

# 15. Notifications

Central notification engine supports adapters for:

- In-app.
- Web push.
- Mobile push.
- Email.
- SMS.
- WhatsApp where integrated.

Typical events:

- Order placed.
- Order confirmed/rejected.
- Preparation started.
- Order ready.
- Rider assigned.
- Order picked up.
- Rider nearby.
- Order delivered.
- Payment confirmed/failed.
- Refund processed.
- Promotion/coupon received.

Templates are tenant-aware and localizable.

---

# 16. Promotions, Coupons and Deals

## 16.1 Coupons
Rules can include:

- Fixed amount discount.
- Percentage discount.
- Free delivery.
- Minimum subtotal.
- Maximum discount.
- Start/end time.
- Usage limit.
- Per-customer limit.
- First-order only.
- Branch restrictions.
- Category/product restrictions.
- Customer segment restrictions.

## 16.2 Automatic Promotions
Examples:

- Buy one get one.
- Buy X get Y.
- Spend threshold reward.
- Happy hour.
- Weekend promotion.
- Free item over threshold.

## 16.3 Bundle/Deal Builder
Deals can require selections from groups such as:

- Choose 2 pizzas.
- Choose 1 side.
- Choose 1 drink.

Pricing and selection validation happen server-side.

---

# 17. CMS and Branding

Tenant admin can manage:

- Hero/home banners.
- Category banners.
- Announcement bar.
- Promotional popup.
- App promotion cards.
- Static content pages.
- Contact details.
- Footer content.
- Social links.

Each campaign can have:

- Start/end time.
- Target branches.
- Destination link.
- Image.
- Heading.
- CTA text.

---

# 18. Branch Management

Branch fields include:

- Name.
- Code.
- Address.
- Latitude/longitude.
- Contact phone.
- Manager.
- Timezone.
- Opening hours.
- Special hours/closures.
- Delivery mode.
- Delivery zones.
- Minimum order.
- Delivery fee strategy.
- Pickup availability.
- Default preparation time.
- Staff.
- Riders.

Delivery zones may be:

- Radius based.
- Polygon/geofence based.
- Area/postal-code based where relevant.

---

# 19. Staff and RBAC

Roles are permission-driven.

Example permissions:

- `orders.view`
- `orders.accept`
- `orders.cancel`
- `orders.refund`
- `menu.view`
- `menu.manage`
- `promotions.manage`
- `customers.view`
- `reports.view`
- `staff.manage`
- `riders.manage`
- `branch.settings.manage`
- `tenant.settings.manage`

Users may be restricted to selected branches.

Platform super-admin privileges are completely separate from tenant permissions.

---

# 20. Restaurant Admin Dashboard

Required modules:

- Dashboard.
- Orders.
- Menu.
- Categories.
- Variants/modifiers.
- Deals.
- Promotions/coupons.
- Branches.
- Customers.
- Staff.
- Riders.
- Kitchen configuration.
- Payments/refunds.
- Banners/CMS.
- Reviews.
- Notifications.
- Reports.
- Settings.
- Audit logs.

Dashboard KPI examples:

- Revenue.
- Orders.
- Average order value.
- New customers.
- Returning customers.
- Cancellation rate.
- Average preparation time.
- Delivery time.
- Top items.
- Top branches.

---

# 21. Branch Manager Dashboard

Branch-restricted capabilities:

- Today's orders.
- Order queues.
- Accept/reject order.
- Kitchen status.
- Assign rider.
- Product availability.
- Temporary sold out.
- Branch open/close.
- Rider online state.
- COD settlement.
- Branch performance.

---

# 22. Platform Super Admin

The platform owner can:

- Create/suspend tenants.
- Create plans.
- Control feature flags.
- Control branch/user/order limits.
- Manage tenant domains.
- View subscription status.
- View tenant usage.
- Inspect system health.
- Impersonation/support access only via audited, explicitly controlled workflow.
- View platform-level operational metrics without violating tenant data access policies.

---

# 23. White-Label Requirements

Tenant configuration controls:

- Restaurant name.
- Logo.
- Light/dark logo.
- Favicon.
- Primary/secondary colors.
- Typography.
- Radius/button style tokens.
- Email branding.
- Receipt/invoice branding.
- App name/icon/splash configuration.
- SEO defaults.
- Custom domain.
- Locale.
- Currency.
- Timezone.

No code fork shall be required to onboard a new standard tenant.

---

# 24. Customer CRM

Customer profile may contain:

- Contact details.
- Total orders.
- Total spend.
- Average order value.
- First/last order.
- Preferred branch.
- Favorite products.
- Tags/segments.
- Loyalty summary.
- Support history.

Segments may include:

- New.
- Repeat.
- VIP.
- High spender.
- Inactive.
- At-risk.

---

# 25. Loyalty, Wallet and Reviews

These are feature-flagged modules.

## Loyalty
- Earn rules.
- Redeem rules.
- Expiry rules.
- Ledger-based points accounting.

## Wallet
- Wallet credits.
- Refund credits.
- Promotional credits.
- Transaction ledger.
- Expiry where allowed.

## Reviews
- Food rating.
- Rider rating.
- Comment.
- Admin moderation/reply policy.

---

# 26. Reporting Requirements

Minimum reports:

- Daily/weekly/monthly/yearly sales.
- Revenue by branch.
- Revenue by product/category.
- Revenue by payment method.
- Orders by status.
- Average order value.
- Discounts.
- Coupon use.
- Refunds.
- Cancellation reasons.
- Kitchen preparation time.
- Rider delivery performance.
- Customer retention.
- New vs returning customers.
- Peak order hours.

Reports must respect tenant and branch permissions.

---

# 27. SEO and Public Web Requirements

Customer website must support:

- Indexable category/product pages where desired.
- Metadata.
- Canonical URLs.
- Open Graph.
- JSON-LD/schema.
- Sitemap.
- robots controls.
- Custom domain.
- Tenant-level SEO configuration.
- Server-rendered public pages where beneficial.

---

# 28. Future Modules

Not required for initial MVP unless prioritized:

- Customer Android/iOS apps.
- Native rider app.
- POS/cashier.
- QR table ordering.
- Dine-in.
- Inventory.
- Ingredients and recipes.
- Suppliers.
- Purchase orders.
- Warehouses.
- Stock transfers.
- Advanced CRM automations.
- SaaS subscription billing.
- Franchise/head-office reporting.
- Call-center/manual order entry.

The backend must not block these additions.

---

# 29. MVP Scope

## Phase 1 — Commercial Web MVP

Must include:

- Multi-tenant.
- Multi-branch.
- White-label customer web.
- Customer authentication.
- Address book.
- Catalog/categories.
- Products, variants and modifiers.
- Cart.
- Checkout.
- COD and payment abstraction.
- Order engine.
- Customer order history.
- Real-time order tracking.
- Restaurant admin.
- Branch manager.
- KDS.
- Rider web/PWA operational flow.
- Manual rider assignment.
- Coupons.
- Deals.
- Banners/CMS.
- Staff/RBAC.
- Notifications.
- Basic reports.
- Audit logs.

## Phase 2 — Mobile and Delivery

- Customer mobile app.
- Rider mobile app.
- Background/live location.
- Auto rider assignment.
- Order chat.
- Push notifications.
- Loyalty.
- Wallet.
- Reviews.
- Support tickets.
- Advanced reporting.

## Phase 3 — Restaurant ERP

- POS.
- QR/dine-in.
- Inventory.
- Recipes.
- Suppliers/purchasing.
- Stock transfers.
- Warehouses.
- Marketing automations.
- Subscription billing.

---

# 30. Product-Level Non-Functional Requirements

- Tenant data must not leak across tenants.
- Checkout/order creation must be idempotent.
- Payment webhooks must be verified and idempotent.
- Real-time loss must not corrupt source-of-truth order state.
- Customer web must remain usable on common mobile screen sizes.
- Critical operations must have loading, error and retry states.
- All money calculations happen server-side.
- All permission checks happen server-side.
- All important order/payment/admin actions produce audit/history records.
- System must support horizontal API/realtime scaling.
- Images must be optimized and CDN-delivered.
- Accessibility target: WCAG 2.2 AA for standard customer/admin interfaces where practical.
- Production data must be backed up.
- APIs must be versioned.

---

# 31. Core Product Events

The platform shall define stable domain events, including:

- `order.created`
- `order.confirmed`
- `order.rejected`
- `order.preparing`
- `order.ready`
- `rider.assigned`
- `order.picked_up`
- `order.on_the_way`
- `order.delivered`
- `order.cancelled`
- `payment.paid`
- `payment.failed`
- `payment.refunded`
- `message.created`

Events may trigger:

- WebSocket updates.
- Notifications.
- Jobs.
- Analytics.
- External integrations.

---

# 32. MVP Acceptance Criteria

The MVP is considered commercially usable when:

1. A platform admin can create a new tenant without code changes.
2. Tenant admin can create at least two branches and configure separate menus/prices/availability.
3. A customer can register/login, save an address, browse a menu, configure items and place an order.
4. Customer receives an order number and live status updates.
5. Branch staff can accept and route an order to kitchen.
6. Kitchen can move the order through preparing to ready.
7. Manager can assign a rider.
8. Rider can move the delivery through pickup to delivered.
9. Customer sees the delivery state update in real time.
10. COD/online payment states are tracked independently of fulfillment state.
11. Admin can create a coupon and banner without developer intervention.
12. Tenant A users cannot access Tenant B data using UI or direct API calls.
13. Branch-restricted users cannot access unauthorized branches.
14. Critical actions appear in audit/history.
15. Reports reconcile against completed/refunded payment/order data according to documented accounting rules.

---

# 33. Product Decisions Locked for v1

- Platform starts as a modular monolith, not microservices.
- PostgreSQL is the system of record.
- Redis is not the source of truth for orders/payments.
- Customer web is SEO-capable Next.js.
- Backend is a dedicated API, not Next.js server actions as the primary business backend.
- Mobile apps consume the same APIs.
- Order and payment state are separate.
- Tenant and branch are first-class database concepts.
- Historical orders use snapshots.
- Feature flags control optional modules.
- Provider integrations use adapters.
