# White-Label Multi-Tenant Restaurant Platform
## UI/UX Design Specification

**Version:** 1.0.0  
**Date:** 2026-09-09  
**Products Covered:** Customer Web, Restaurant Operations Web, Kitchen Display, Rider App, Platform Admin  
**Design Goal:** Fast, clear, mobile-first customer ordering plus high-efficiency staff operations under a reusable white-label design system.

---

# 1. UX Principles

1. **Order fast** — minimize steps between menu discovery and checkout.
2. **Always show state** — customers and staff must know what is happening.
3. **Touch-friendly** — kitchen and rider surfaces use large tap targets.
4. **White-label, not cloned** — restaurant personality comes from tokens/content, not duplicated layouts/assets from another brand.
5. **Accessible** — color is never the only status indicator.
6. **Recoverable** — every error provides a next action.
7. **Role-focused** — kitchen UI does not look like admin UI; rider UI does not expose irrelevant admin controls.
8. **Responsive by default** — customer web is mobile-first; staff admin is responsive desktop-first; KDS is large-screen-first.
9. **Consistent status language** — the same business state uses the same wording and iconography across apps.
10. **Performance-aware design** — avoid heavy decorative UI that slows menu browsing.

---

# 2. Design System and White Label

Use semantic design tokens rather than hard-coded brand colors.

Example token categories:

```text
--color-brand-primary
--color-brand-secondary
--color-brand-on-primary
--color-surface
--color-surface-muted
--color-text
--color-text-muted
--color-border
--color-success
--color-warning
--color-danger
--radius-sm
--radius-md
--radius-lg
--font-body
--font-heading
```

Tenant-controlled:

- Logo.
- Light/dark logo.
- Primary color.
- Secondary color.
- Font family from approved supported set.
- Border-radius profile.
- Favicon.
- Hero/banner assets.
- App name.
- Email/receipt branding.

System-controlled semantic colors such as error/warning must maintain accessible contrast and must not be blindly replaced with brand colors.

---

# 3. Responsive Strategy

## Customer Web
Mobile-first.

Target layout classes:

- Small mobile: 320–479.
- Large mobile: 480–767.
- Tablet: 768–1023.
- Desktop: 1024–1439.
- Wide desktop: 1440+.

## Admin / Operations
- Desktop optimized.
- Fully usable on tablet.
- Emergency/basic management usable on mobile.

## KDS
- Tablet landscape and large displays.
- Large touch targets.
- No tiny menus.

## Rider
- Mobile-first/native-first.
- Critical actions reachable with one thumb where practical.

---

# 4. Accessibility

Target WCAG 2.2 AA for normal customer/admin interfaces where practical.

Requirements:

- Visible keyboard focus.
- Semantic labels.
- Form error association.
- Accessible dialog focus trapping.
- Sufficient contrast.
- 44x44 px-equivalent touch targets for critical mobile actions.
- Status text + icon, not color only.
- Reduced-motion support.
- Alt text for meaningful content images.
- Decorative images ignored by assistive technologies.
- Price and quantity controls keyboard usable.

---

# 5. Customer Information Architecture

Primary navigation:

```text
Home
Menu
Deals
Orders
Account
Cart
```

Desktop may show category navigation horizontally; mobile may use chips/sticky category navigation.

Account:

```text
Profile
Addresses
Active Orders
Order History
Favorites
Wallet        [feature]
Rewards       [feature]
Notifications
Support
Settings
```

---

# 6. Customer Home Screen

Recommended order:

1. Header.
2. Delivery/pickup + location control.
3. Hero/promo area.
4. Search.
5. Category shortcuts.
6. Deals/bundles.
7. Recommended/best seller sections.
8. Full menu entry point.
9. App/loyalty promotion if enabled.
10. Footer.

Header elements:

- Brand logo.
- Location.
- Search.
- Account.
- Cart badge.

Mobile bottom navigation can expose:

- Home.
- Menu.
- Orders.
- Account.
- Cart.

---

# 7. Location and Branch UX

First visit:

```text
Where should we deliver?
[Use current location]
[Enter address]
```

After address selection:

- Show serviceable branch automatically where rules allow.
- If multiple branches are selectable, clearly show why one is recommended.
- If outside delivery area, show pickup branches or a useful unavailable message.
- Never allow customer to complete checkout and only then discover that the branch cannot deliver.

Location component should show:

- Address label.
- Short address.
- Change action.
- Delivery/pickup mode.

---

# 8. Menu Browsing UX

Menu screen:

```text
[Search food...]

[Deals] [Burgers] [Pizza] [Sides] [Drinks]

--------------------------------
Product card
Image
Name
Short description
Price / From price
Badges
[Add]
--------------------------------
```

Product card rules:

- Do not overload with modifier details.
- Show `From Rs X` if variants change price.
- Sold-out state is obvious and non-clickable or opens explanation.
- Promotion badge is concise.
- Image ratio stays consistent.

Sticky category navigation is recommended on long menus.

---

# 9. Product Detail / Modifier UX

Product detail must display:

- Large product image.
- Name.
- Description.
- Base/from price.
- Required variant group.
- Modifier groups.
- Quantity.
- Special instructions.
- Dynamic total.
- Add to cart CTA.

Required group example:

```text
Choose Size *        Select 1
(o) Regular
( ) Large       + Rs 150
```

Optional group:

```text
Add-ons             Up to 3
[ ] Extra Cheese + Rs 100
[ ] Fries        + Rs 150
[ ] Dip          + Rs 50
```

Validation:

- Required choices highlighted before add.
- Error appears next to the missing group.
- CTA total updates instantly.

---

# 10. Cart UX

Cart shows:

- Items.
- Variants/modifiers.
- Quantity editor.
- Edit item.
- Remove.
- Instructions.
- Coupon.
- Price breakdown.
- Checkout CTA.

Mobile:

- Sticky checkout CTA.
- Avoid hiding fees until final screen.
- Changes recalculate immediately.

If branch/menu changes invalidate an item, display the affected item and required action.

---

# 11. Checkout UX

Prefer one focused checkout route with progressive sections instead of many slow page transitions.

Suggested sections:

1. Contact.
2. Fulfillment.
3. Address/branch.
4. Delivery instructions.
5. Payment.
6. Coupon/rewards.
7. Order summary.
8. Place order.

Rules:

- Guest can sign in without losing cart.
- Validation happens inline.
- Payment failure must not destroy the cart.
- Place-order button disables while submission is processing.
- Duplicate taps do not create duplicate orders.

CTA examples:

- `Place COD Order — Rs 2,150`
- `Pay Rs 2,150`

---

# 12. Order Confirmation UX

Immediately show:

- Success state.
- Order number.
- Amount/payment state.
- Branch.
- Estimated time.
- Track Order CTA.
- Receipt/order details.

Do not make the customer search through account history to find the new order.

---

# 13. Live Order Tracking UX

Primary screen:

```text
Order #BH-38271
Estimated arrival: 9:10 PM

✓ Order received
✓ Restaurant confirmed
● Preparing your food
○ Ready
○ Rider pickup
○ On the way
○ Delivered
```

When rider is assigned:

- Rider name/photo where configured.
- ETA.
- Map.
- Chat.
- Call/contact action subject to tenant policy.

Status updates should animate subtly but respect reduced-motion settings.

If realtime disconnects:

- Show a small reconnecting indicator.
- Continue to display last confirmed state.
- Refetch when connection returns.

---

# 14. Customer Order History

Tabs:

- Active.
- Past.

Order card:

- Order number.
- Date.
- Branch.
- Total.
- Status.
- Main items summary.
- Track for active orders.
- View details.
- Reorder for eligible past orders.

Reorder must revalidate current price/availability and never silently use historical price.

---

# 15. Authentication UX

Login screen supports configured methods without crowding.

Typical order:

- Phone/email input.
- Continue.
- OTP or password step.
- Social sign-in alternatives.
- Guest checkout on checkout context only.

OTP UX:

- Clear destination.
- Countdown/re-send state.
- Paste/autofill support.
- Error without wiping all input unnecessarily.

---

# 16. Restaurant Admin Information Architecture

Desktop sidebar:

```text
Dashboard
Orders
Menu
  Categories
  Products
  Modifier Groups
Deals & Promotions
Branches
Customers
Staff
Riders
Kitchen
Payments
CMS / Banners
Reviews
Reports
Settings
Audit Logs
```

Top bar:

- Tenant/branch context.
- Search.
- Notifications.
- User menu.

Never rely only on sidebar hiding for permissions; backend authorization remains authoritative.

---

# 17. Admin Dashboard

Cards:

- Revenue.
- Orders.
- Average order value.
- Pending.
- Preparing.
- Ready.
- Riders online.
- Cancellation rate.

Charts:

- Revenue trend.
- Orders by hour.
- Revenue by branch.
- Top products.

Operational widget:

```text
Needs Attention
3 orders delayed
1 payment requires review
2 branches temporarily closed
```

---

# 18. Orders Management UI

Order list filters:

- Branch.
- Date.
- Status.
- Fulfillment type.
- Payment status.
- Customer.
- Order number.

Columns:

- Order.
- Time.
- Customer.
- Branch.
- Type.
- Amount.
- Payment.
- Status.
- Assigned rider.
- Action.

Order drawer/detail:

- Customer.
- Address.
- Items.
- Pricing.
- Timeline.
- Payment attempts.
- Rider.
- Notes.
- Audit actions.

Dangerous/irreversible actions such as cancel/refund require confirmation and reason.

---

# 19. Menu Management UI

Product list:

- Image.
- Name.
- Category.
- Base price.
- Branch availability count.
- Status.
- Edit.

Editor sections:

1. Basic info.
2. Images.
3. Pricing.
4. Variants.
5. Modifier groups.
6. Branches.
7. Availability schedule.
8. SEO.
9. Advanced.

Use autosave only where conflict handling is clear; otherwise explicit Save with dirty-state warning.

---

# 20. Modifier Builder UX

Admin should be able to visually build:

```text
Group: Choose your drink
Required: Yes
Min: 1
Max: 1

Options:
Pepsi        +0
7up          +0
Water        +20
```

Warn if rules are impossible, e.g. `min=2` with only one active option.

---

# 21. Promotions UX

Promotion wizard:

1. Promotion type.
2. Benefit.
3. Eligibility.
4. Products/categories.
5. Branches.
6. Customer segment.
7. Usage limits.
8. Schedule.
9. Preview.
10. Publish.

A human-readable rule summary is required before publishing.

Example:

> 20% off up to Rs 500 on orders above Rs 1,500, first order only, Bahria and Saddar branches, until Sep 30.

---

# 22. Branch Management UX

Branch screen shows:

- Open/closed badge.
- Current order load.
- Staff/riders online.
- Delivery settings.
- Menu overrides.
- Hours.
- Special closures.

Emergency action:

`Pause New Orders`

Must require a reason/optional resume time and show a visible platform/tenant warning.

---

# 23. Kitchen Display System UX

KDS layout:

```text
NEW              PREPARING               READY
-------------------------------------------------
#1021             #1017                   #1012
5 min             11 min                  2 min
2x Zinger         1x Pizza                ...
1x Fries          ...
[START]           [READY]                 [HANDOFF]
```

Card requirements:

- Very large order number.
- Age timer.
- Clear channel.
- Item quantities emphasized.
- Modifiers indented.
- Notes visually distinct.
- One primary action.

Delay states:

- Normal.
- Approaching target.
- Late.

Use icons/text in addition to color.

KDS must not require precision mouse interactions.

---

# 24. Kitchen Station UX

If enabled, staff choose/are assigned station.

Station card displays only relevant preparation tasks.

Packing station sees aggregate state:

- Burger station complete.
- Fry station complete.
- Drinks pending.

Order becomes ready after all required tasks are complete.

---

# 25. Rider App Information Architecture

Bottom navigation:

```text
Home
Deliveries
Earnings/Cash
Profile
```

Home:

- Online/offline toggle.
- Active delivery.
- Available assignments if pool mode.
- Today's deliveries.
- Cash due.

Active delivery screen:

1. Order number.
2. Pickup branch.
3. Customer address.
4. Navigation action.
5. Payment/COD amount.
6. Contact/chat.
7. Large next-state CTA.

CTA progression:

```text
Accept
Arrived at Restaurant
Picked Up
Start Delivery
Arrived
Complete Delivery
```

Only valid next actions are shown.

---

# 26. Rider Location and Privacy UX

Customer sees rider map only during appropriate active fulfillment states.

Rider app should clearly show when active-delivery location sharing is in use.

Location permission denial must provide:

- Explanation.
- Retry/settings path.
- Operational fallback according to tenant rules.

---

# 27. COD Completion UX

For COD:

```text
Amount to collect
Rs 2,150

[Confirm Cash Collected]
```

Then proof-of-delivery step.

Do not let accidental double-tap create duplicate cash ledger entries.

---

# 28. Chat UX

Chat header:

- Order number.
- Other participant role/name.
- Current order state.

Quick replies for rider/customer:

- I am outside.
- Please come to the gate.
- I cannot find the address.
- One moment please.

System messages are visually distinct:

- Rider assigned.
- Rider arrived.
- Chat closed after delivery.

---

# 29. Platform Super Admin UX

Navigation:

```text
Overview
Tenants
Plans
Domains
Subscriptions
Usage
System Health
Audit
Settings
```

Tenant detail:

- Brand.
- Admin.
- Status.
- Plan.
- Domains.
- Branch count.
- User count.
- Feature flags.
- Subscription.
- Support actions.

Support impersonation, if implemented, must show an unmistakable persistent banner and be audited.

---

# 30. Loading, Empty and Error States

Every screen defines:

- Loading/skeleton.
- Empty state.
- Partial error.
- Full error.
- Offline/reconnecting.
- Permission denied.
- Not found.

Examples:

Empty cart:
- Friendly message.
- Browse Menu CTA.

No orders:
- Explain no order history.
- Start Order CTA.

Menu fetch error:
- Retry.
- Keep tenant branding.
- Do not show raw stack trace.

---

# 31. Form Standards

- Label always visible.
- Placeholder is not a replacement for label.
- Required fields identified.
- Inline validation after meaningful interaction/submit.
- Preserve valid input after errors.
- Disable submit only when needed.
- Show save success.
- Warn about unsaved changes for complex editors.

---

# 32. Table Standards

Admin tables require:

- Search where useful.
- Filters.
- Sorting where useful.
- Pagination.
- Column alignment.
- Sticky header on long lists.
- Mobile fallback to cards or horizontal scroll.
- Bulk actions only after explicit row selection.

---

# 33. Status Vocabulary

Order customer labels can differ slightly from internal enum wording, but mapping must be centralized.

Example:

| Internal | Customer Label | Staff Label |
|---|---|---|
| `PLACED` | Order received | New |
| `CONFIRMED` | Confirmed | Confirmed |
| `PREPARING` | Preparing your food | Preparing |
| `READY` | Ready for pickup | Ready |
| `PICKED_UP` | Rider picked up order | Picked up |
| `ON_THE_WAY` | On the way | On the way |
| `DELIVERED` | Delivered | Delivered |
| `CANCELLED` | Cancelled | Cancelled |

---

# 34. Notification UX

In-app notification center:

- Unread indicator.
- Order-related deep links.
- Mark read.
- Timestamp.
- Type icon.

Push notifications must deep-link to relevant screen where possible.

Avoid excessive notifications for tiny internal state changes.

---

# 35. Localization

Design must allow:

- English.
- Urdu/RTL.
- Additional locales.

Requirements:

- RTL-compatible layout primitives.
- No fixed-width text assumptions.
- Locale-aware dates.
- Locale-aware numbers.
- Currency formatting.
- Translatable validation/error/status copy.

---

# 36. Design Components

Shared component inventory:

Customer:
- Header.
- Mobile nav.
- Location selector.
- Search.
- Category chip.
- Product card.
- Product customizer.
- Cart item.
- Price summary.
- Promo code.
- Order status timeline.
- Rider card.
- Chat.
- Address card.

Admin:
- Sidebar.
- Context switcher.
- KPI card.
- Data table.
- Filter bar.
- Status badge.
- Drawer.
- Confirm dialog.
- Form sections.
- Branch selector.
- Audit timeline.

KDS:
- Kitchen card.
- Timer.
- Station filter.
- Action button.

Rider:
- Availability toggle.
- Delivery card.
- Navigation panel.
- COD panel.
- Delivery stepper.

---

# 37. Screen Inventory for Initial Design

## Customer Web
- Home.
- Menu.
- Search results.
- Product detail.
- Cart.
- Checkout.
- Login.
- OTP.
- Register/profile setup.
- Address list.
- Address editor/map.
- Order confirmation.
- Live tracking.
- Active orders.
- Order history.
- Order detail.
- Favorites.
- Support.
- Account settings.

## Ops Web
- Login.
- Dashboard.
- Orders list.
- Order detail.
- KDS.
- Products.
- Product editor.
- Categories.
- Modifiers.
- Coupons.
- Promotions.
- Banners.
- Branch list.
- Branch editor.
- Customers.
- Customer detail.
- Staff.
- Riders.
- Payments/refunds.
- Reports.
- Settings.
- Audit logs.

## Platform
- Login.
- Overview.
- Tenant list.
- Tenant create.
- Tenant detail.
- Plans.
- Domains.
- Usage/system health.

## Rider Phase 2
- Login.
- Permission onboarding.
- Home.
- Available jobs.
- Active delivery.
- Map/navigation handoff.
- Chat.
- Proof of delivery.
- Cash.
- History.
- Profile.

---

# 38. Design Handoff Requirements

Each designed screen should specify:

- Desktop/tablet/mobile states as relevant.
- Component states.
- Validation states.
- Empty states.
- Loading states.
- Error states.
- Permission states.
- Long text behavior.
- RTL behavior.
- Tokens used.
- Interaction notes.
- API data dependencies.
- Realtime events used.

No screen is considered design-complete if only the happy path is designed.

---

# 39. UI Acceptance Criteria

- A new tenant can receive a different brand theme without component code changes.
- Customer can place an order on mobile without horizontal scrolling.
- Required product modifiers are impossible to skip accidentally.
- Checkout fees are visible before final submission.
- Live tracking remains understandable if realtime temporarily disconnects.
- Kitchen primary actions can be used on touch screens.
- Rider only sees valid next fulfillment action.
- Admin actions clearly show tenant/branch context.
- Permission denial is handled cleanly.
- English and RTL layout can be supported without redesigning the component tree.

---

# 40. Cheezious Storefront UI/UX Specification

### 40.1 Brand Tokens & Styling
- **Primary Brand Color**: `#F15B25` (Cheezious Flame Orange)
- **Secondary Accent**: `#FFC107` (Warm Amber Gold)
- **Background Layer**: `#F8F9FA` (Soft warm neutral)
- **Card Background**: `#FFFFFF` with rounded-3xl (`border-radius: 1.5rem`) and soft elevation `shadow-xs` / `shadow-md` on hover.
- **Typography**: Modern Inter font, bold/black heading weights (700/900).

### 40.2 Component Hierarchy & Layout
1. **Top Bar Header (`Header.tsx`)**:
   - Left: Navigation drawer toggle + Cheezious brand badge.
   - Center: Delivery vs. Pickup pill toggle with branch selector modal.
   - Right: Live search input, phone OTP login button, and interactive cart badge with live quantity and subtotal.
2. **Hero Promo Carousel (`BannerCarousel.tsx`)**:
   - 16:9 / 21:9 responsive ratio with auto-slide timer and dot indicators.
   - Dynamic data loaded from `/api/v1/cms/public/banners`.
3. **Category Navigation Bar (`CategoryNav.tsx`)**:
   - Sticky top bar with horizontal scrollable pill buttons.
   - Smooth anchor scrolling to category sections (*Somewhat Local*, *Pizza Deals*, *Cheezy Treats*, *Thin Crust Pizza*, *Burgers*, *Sides*, *Desserts*, *Beverages*).
4. **Product Card Grid (`ProductCard.tsx`)**:
   - 4:3 high-resolution food photography.
   - Wishlist favorite heart toggle.
   - Item name, short ingredient description, starting price, and prominent `+ ADD TO CART` CTA.
5. **Interactive Customization Dialog (`ProductModal.tsx`)**:
   - Modal backdrop with smooth zoom-in animation.
   - Variant selection (Sizes) with required validation.
   - Modifier groups (Crust options, Add-on cheeses, dips, fries, drinks) with single-choice radio vs. multi-select checkbox controls.
   - Real-time dynamic pricing calculation updating instantly as modifiers are clicked.
   - Quantity stepper and `Add to Cart • PKR [Total]` action button.
6. **Slide-Out Cart Drawer (`CartSidebar.tsx`)**:
   - Slide-over drawer with itemized modifier chips.
   - Live quantity controls (+ / - / delete).
   - Promo coupon validation (`CHEEZY10`).
   - Dynamic delivery fee calculation (Free above PKR 2,000).
   - Sticky `Proceed to Checkout` button.
7. **Checkout Experience (`app/checkout/page.tsx`)**:
   - Multi-step customer delivery input (Name, Phone, Street address, Instructions).
   - Payment method toggle (Cash on Delivery, Card on Delivery, Digital Wallet).
   - Itemized order breakdown and total calculation.
8. **5-Step Visual Order Tracking Stepper (`app/orders/[id]/page.tsx`)**:
   - 5 visual steps: `Order Placed` ➔ `Confirmed` ➔ `In the Kitchen` ➔ `Out for Delivery` ➔ `Delivered`.
   - Live delivery ETA countdown, rider details card, item summary, and phone support hotline (`051 111 446 699`).

