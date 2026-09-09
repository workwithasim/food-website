# White-Label Multi-Tenant Restaurant Platform
## Backend Schema and Data Model

**Version:** 1.0.0  
**Date:** 2026-09-09  
**Database:** PostgreSQL 18 + PostGIS  
**ORM:** Prisma 8 for standard relational access, with reviewed SQL for advanced PostgreSQL/PostGIS features  
**Model:** Shared database/schema with mandatory tenant isolation

---

# 1. Schema Goals

The schema must support:

- Many tenants.
- Many branches per tenant.
- Customer ordering.
- Product variants/modifiers.
- Branch pricing and availability.
- Promotions.
- Order snapshots.
- Payments/refunds.
- Kitchen.
- Riders.
- Realtime/chat persistence.
- Staff/RBAC.
- Audit.
- White-label configuration.
- Future mobile/POS/inventory modules.

---

# 2. Data Conventions

## IDs
Use UUIDs for public/internal entity IDs.

PostgreSQL 18 supports UUIDv7; UUIDv7 is preferred for new high-write entities where application/ORM compatibility is confirmed because it is time-ordered. Otherwise use secure UUIDv4 consistently.

Never expose incremental database IDs as the only public identifier.

## Timestamps
Use:

- `created_at timestamptz`
- `updated_at timestamptz`

Store in UTC. Format into tenant/user timezone at presentation layer.

## Money
Use integer minor units:

- `amount_minor bigint`
- `currency_code char(3)`

Never use floating point.

## Soft Delete
Use `deleted_at timestamptz null` for entities where historical references or restoration are useful.

Do not soft-delete financial ledger rows; use reversing/adjustment records.

## Tenant Scope
Every tenant-owned table includes:

`tenant_id uuid not null`

Branch-owned records additionally include:

`branch_id uuid`

Not every table needs branch scope.

---

# 3. Core Relationship Map

```text
platform_users
tenants
  |
  +-- tenant_domains
  +-- tenant_settings
  +-- tenant_features
  +-- branches
  |     +-- branch_hours
  |     +-- delivery_zones
  |     +-- branch_products
  |     +-- kitchen_stations
  |
  +-- users
  |     +-- user_tenant_memberships
  |     +-- user_branch_assignments
  |     +-- user_roles
  |
  +-- customers
  |     +-- customer_addresses
  |     +-- carts
  |     +-- orders
  |
  +-- categories
  +-- products
        +-- product_variants
        +-- product_modifier_groups
              +-- modifiers

orders
  +-- order_items
  +-- order_item_modifiers
  +-- order_status_history
  +-- payments
  |     +-- payment_attempts
  |     +-- refunds
  +-- rider_assignments
  +-- chat_threads
        +-- messages

outbox_events
audit_logs
idempotency_keys
```

---

# 4. Platform and Tenant Tables

## `tenants`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | tenant ID |
| name | varchar | legal/display name |
| slug | varchar | unique platform slug |
| status | enum | ACTIVE, SUSPENDED, TRIAL, CLOSED |
| default_currency | char(3) | e.g. PKR |
| default_locale | varchar | e.g. en-PK |
| timezone | varchar | IANA timezone |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes/constraints:

- unique `slug`.

## `tenant_domains`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| hostname | varchar |
| type | enum(SUBDOMAIN,CUSTOM) |
| status | enum(PENDING,VERIFIED,FAILED) |
| is_primary | boolean |
| verification_token_hash | varchar nullable |
| verified_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

Constraints:

- unique lowercase hostname.
- only one primary hostname per tenant via partial unique index.

## `tenant_settings`

Use strongly typed columns for critical settings and JSONB for low-risk extensible presentation configuration.

Suggested:

| Column | Type |
|---|---|
| tenant_id | uuid PK/FK |
| restaurant_display_name | varchar |
| support_phone | varchar nullable |
| support_email | varchar nullable |
| order_prefix | varchar |
| logo_media_id | uuid nullable |
| theme_json | jsonb |
| checkout_json | jsonb |
| notification_json | jsonb |
| seo_json | jsonb |
| updated_at | timestamptz |

Do not put core transactional rules entirely inside unvalidated arbitrary JSON.

## `tenant_features`

| Column | Type |
|---|---|
| tenant_id | uuid FK |
| feature_key | varchar |
| enabled | boolean |
| config_json | jsonb nullable |
| updated_at | timestamptz |

PK/unique:

- `(tenant_id, feature_key)`.

---

# 5. Branch Tables

## `branches`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| name | varchar |
| code | varchar |
| status | enum(ACTIVE,PAUSED,CLOSED) |
| phone | varchar nullable |
| address_line | varchar |
| city | varchar |
| timezone | varchar |
| location | geography(Point,4326) |
| min_order_minor | bigint nullable |
| default_delivery_fee_minor | bigint nullable |
| accepts_delivery | boolean |
| accepts_pickup | boolean |
| preparation_time_minutes | int nullable |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz nullable |

Constraints:

- unique `(tenant_id, code)`.
- geospatial index on `location`.
- `(tenant_id, status)` index.

## `branch_hours`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| branch_id | uuid FK |
| day_of_week | smallint |
| open_time | time |
| close_time | time |
| crosses_midnight | boolean |
| is_closed | boolean |

Support multiple intervals/day if lunch breaks are needed.

## `branch_special_hours`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| branch_id | uuid FK |
| date | date |
| open_time | time nullable |
| close_time | time nullable |
| is_closed | boolean |
| reason | varchar nullable |

## `delivery_zones`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| branch_id | uuid FK |
| name | varchar |
| zone_type | enum(RADIUS,POLYGON,AREA_CODE) |
| polygon | geography(MultiPolygon,4326) nullable |
| radius_meters | int nullable |
| center | geography(Point,4326) nullable |
| area_codes | text[] nullable |
| delivery_fee_minor | bigint |
| min_order_minor | bigint nullable |
| priority | int |
| active | boolean |

Use check constraints so fields match `zone_type`.

---

# 6. Identity and RBAC

## `users`

Represents staff/platform identities.

| Column | Type |
|---|---|
| id | uuid PK |
| email | citext nullable |
| phone | varchar nullable |
| password_hash | varchar nullable |
| display_name | varchar |
| status | enum(ACTIVE,INVITED,DISABLED) |
| created_at | timestamptz |
| updated_at | timestamptz |

Identity uniqueness policy must account for whether the same user may belong to multiple tenants.

Recommended: globally unique normalized verified email/phone identity, with tenant memberships separate.

## `tenant_memberships`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| user_id | uuid FK |
| status | enum(ACTIVE,INVITED,DISABLED) |
| created_at | timestamptz |

Unique `(tenant_id, user_id)`.

## `roles`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid nullable |
| key | varchar |
| name | varchar |
| is_system | boolean |

`tenant_id null` can represent platform/system role templates if desired.

## `permissions`

| Column | Type |
|---|---|
| id | uuid PK |
| key | varchar unique |
| description | varchar |

## `role_permissions`

- role_id.
- permission_id.
- unique pair.

## `membership_roles`

- membership_id.
- role_id.
- unique pair.

## `user_branch_assignments`

| Column | Type |
|---|---|
| tenant_id | uuid |
| user_id | uuid |
| branch_id | uuid |

Unique `(tenant_id,user_id,branch_id)`.

---

# 7. Customer Identity

Keep customer identity separate from staff membership even if both can eventually share an identity service.

## `customers`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| email | citext nullable |
| phone | varchar nullable |
| password_hash | varchar nullable |
| first_name | varchar nullable |
| last_name | varchar nullable |
| status | enum(ACTIVE,BLOCKED,DELETED) |
| marketing_opt_in | boolean |
| first_order_at | timestamptz nullable |
| last_order_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz nullable |

Potential unique indexes:

- `(tenant_id, email)` where email is not null and account active.
- `(tenant_id, normalized_phone)` where not null.

## `customer_addresses`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| customer_id | uuid FK |
| label | varchar |
| recipient_name | varchar |
| phone | varchar |
| address_line | varchar |
| area | varchar nullable |
| city | varchar |
| landmark | varchar nullable |
| location | geography(Point,4326) |
| instructions | text nullable |
| is_default | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

---

# 8. Authentication Sessions

## `refresh_sessions`

| Column | Type |
|---|---|
| id | uuid PK |
| subject_type | enum(STAFF,CUSTOMER) |
| subject_id | uuid |
| tenant_id | uuid nullable |
| token_hash | varchar |
| device_name | varchar nullable |
| ip_hash_or_metadata | varchar/jsonb nullable |
| expires_at | timestamptz |
| revoked_at | timestamptz nullable |
| rotated_from_id | uuid nullable |
| created_at | timestamptz |

Never store raw refresh token.

## `otp_challenges`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid nullable |
| destination_hash | varchar |
| purpose | enum(LOGIN,VERIFY_PHONE,RESET) |
| code_hash | varchar |
| attempts | int |
| expires_at | timestamptz |
| consumed_at | timestamptz nullable |
| created_at | timestamptz |

OTP records should have short retention.

---

# 9. Catalog

## `categories`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| parent_id | uuid nullable |
| name | varchar |
| slug | varchar |
| description | text nullable |
| image_media_id | uuid nullable |
| sort_order | int |
| status | enum(DRAFT,ACTIVE,ARCHIVED) |
| available_from | timestamptz nullable |
| available_until | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz nullable |

Unique `(tenant_id, slug)` among non-deleted rows.

## `products`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| category_id | uuid FK |
| name | varchar |
| slug | varchar |
| description | text nullable |
| base_price_minor | bigint |
| currency_code | char(3) |
| status | enum(DRAFT,ACTIVE,ARCHIVED) |
| preparation_time_minutes | int nullable |
| tax_class_id | uuid nullable |
| featured | boolean |
| metadata_json | jsonb nullable |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz nullable |

## `product_media`

- tenant_id.
- product_id.
- media_id.
- sort_order.
- is_primary.

## `product_variants`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| product_id | uuid FK |
| name | varchar |
| sku | varchar nullable |
| price_minor | bigint |
| status | enum(ACTIVE,INACTIVE) |
| sort_order | int |

## `modifier_groups`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| name | varchar |
| min_select | int |
| max_select | int |
| required | boolean |
| status | enum(ACTIVE,INACTIVE) |

Check:

- min >= 0.
- max >= min.
- required implies sensible min, usually >= 1.

## `modifiers`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| modifier_group_id | uuid FK |
| name | varchar |
| price_delta_minor | bigint |
| status | enum(ACTIVE,INACTIVE) |
| sort_order | int |

## `product_modifier_groups`

Many-to-many:

- tenant_id.
- product_id.
- modifier_group_id.
- sort_order.
- optional product-specific overrides.

Unique pair per product/group.

---

# 10. Branch Catalog Overrides

## `branch_products`

| Column | Type |
|---|---|
| tenant_id | uuid |
| branch_id | uuid |
| product_id | uuid |
| enabled | boolean |
| sold_out | boolean |
| price_override_minor | bigint nullable |
| preparation_time_override | int nullable |
| available_from | timestamptz nullable |
| available_until | timestamptz nullable |

Primary/unique:

`(tenant_id, branch_id, product_id)`.

## `branch_variants`
Optional if variant-level branch pricing/availability is required:

- tenant_id.
- branch_id.
- variant_id.
- enabled.
- price_override_minor.

## `branch_modifiers`
Optional:

- tenant_id.
- branch_id.
- modifier_id.
- enabled.
- price_override_minor.

---

# 11. Media

## `media_assets`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid nullable |
| storage_provider | varchar |
| bucket | varchar |
| object_key | varchar |
| mime_type | varchar |
| size_bytes | bigint |
| width | int nullable |
| height | int nullable |
| status | enum(UPLOADING,READY,FAILED,DELETED) |
| created_at | timestamptz |

No absolute provider URL needs to be permanently embedded if CDN host can change; derive or store stable public path when practical.

---

# 12. Cart

## `carts`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| customer_id | uuid nullable |
| guest_token_hash | varchar nullable |
| branch_id | uuid nullable |
| fulfillment_type | enum(DELIVERY,PICKUP) |
| currency_code | char(3) |
| expires_at | timestamptz |
| created_at | timestamptz |
| updated_at | timestamptz |

## `cart_items`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| cart_id | uuid |
| product_id | uuid |
| variant_id | uuid nullable |
| quantity | int |
| special_instructions | text nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

## `cart_item_modifiers`

- tenant_id.
- cart_item_id.
- modifier_id.
- quantity if needed.

Cart totals can be quoted dynamically rather than treated as immutable accounting.

---

# 13. Promotions and Coupons

## `promotions`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| name | varchar |
| type | enum(PERCENT,FIXED,FREE_DELIVERY,BUY_X_GET_Y,BUNDLE) |
| status | enum(DRAFT,SCHEDULED,ACTIVE,PAUSED,ENDED) |
| starts_at | timestamptz nullable |
| ends_at | timestamptz nullable |
| priority | int |
| stack_policy | enum(EXCLUSIVE,STACKABLE) |
| rules_json | jsonb |
| benefit_json | jsonb |
| created_at | timestamptz |
| updated_at | timestamptz |

Rules/benefits JSON must be validated through versioned schemas, not arbitrary unvalidated JSON.

## `coupons`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| code | citext |
| promotion_id | uuid |
| max_total_uses | int nullable |
| max_uses_per_customer | int nullable |
| current_uses | int |
| status | enum(ACTIVE,PAUSED,EXPIRED) |

Unique `(tenant_id, code)`.

## `coupon_redemptions`

- id.
- tenant_id.
- coupon_id.
- customer_id nullable.
- order_id.
- discount_minor.
- created_at.

Unique `(coupon_id, order_id)`.

Do not rely only on a mutable `current_uses` counter for correctness; enforce redemption transactionally.

---

# 14. Orders

## `orders`

Core fields:

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid FK |
| branch_id | uuid FK |
| customer_id | uuid nullable |
| order_number | varchar |
| channel | enum(WEB,MOBILE,POS,ADMIN,QR) |
| fulfillment_type | enum(DELIVERY,PICKUP,DINE_IN) |
| status | order_status enum |
| payment_status | payment_status enum |
| currency_code | char(3) |
| subtotal_minor | bigint |
| item_discount_minor | bigint |
| promotion_discount_minor | bigint |
| coupon_discount_minor | bigint |
| delivery_fee_minor | bigint |
| service_fee_minor | bigint |
| tax_minor | bigint |
| tip_minor | bigint |
| wallet_credit_minor | bigint |
| grand_total_minor | bigint |
| paid_minor | bigint |
| refunded_minor | bigint |
| customer_name_snapshot | varchar |
| customer_phone_snapshot | varchar |
| delivery_address_snapshot | jsonb nullable |
| delivery_location | geography(Point,4326) nullable |
| customer_note | text nullable |
| scheduled_for | timestamptz nullable |
| placed_at | timestamptz |
| confirmed_at | timestamptz nullable |
| ready_at | timestamptz nullable |
| delivered_at | timestamptz nullable |
| cancelled_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

Constraints/indexes:

- unique `(tenant_id, order_number)`.
- `(tenant_id, branch_id, status, created_at desc)`.
- `(tenant_id, customer_id, created_at desc)`.
- `(tenant_id, payment_status, created_at desc)`.
- check all monetary totals are internally valid according to calculation policy.
- geospatial index on delivery location if used for queries.

## `order_items`

Order items are snapshots.

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| order_id | uuid |
| product_id | uuid nullable |
| variant_id | uuid nullable |
| product_name | varchar |
| variant_name | varchar nullable |
| unit_price_minor | bigint |
| quantity | int |
| line_subtotal_minor | bigint |
| line_discount_minor | bigint |
| line_tax_minor | bigint |
| line_total_minor | bigint |
| special_instructions | text nullable |
| metadata_snapshot | jsonb nullable |

Product IDs can remain for analytics, but snapshot fields are authoritative for historical display.

## `order_item_modifiers`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| order_item_id | uuid |
| modifier_id | uuid nullable |
| modifier_name | varchar |
| unit_price_delta_minor | bigint |
| quantity | int |
| total_minor | bigint |

## `order_status_history`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| order_id | uuid |
| from_status | enum nullable |
| to_status | enum |
| actor_type | enum(CUSTOMER,STAFF,RIDER,SYSTEM) |
| actor_id | uuid nullable |
| reason_code | varchar nullable |
| reason_text | text nullable |
| source | varchar |
| created_at | timestamptz |

Append-only.

---

# 15. Recommended Order Enum

```text
PLACED
CONFIRMED
PREPARING
READY
RIDER_ASSIGNED
PICKED_UP
ON_THE_WAY
DELIVERED
REJECTED
CANCELLED
FAILED
```

If item-level/station prep is introduced, do not overload the order enum with every kitchen task state.

---

# 16. Payments

## `payments`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| order_id | uuid |
| provider | varchar |
| method | varchar |
| status | payment_status |
| amount_minor | bigint |
| currency_code | char(3) |
| provider_payment_id | varchar nullable |
| paid_at | timestamptz nullable |
| created_at | timestamptz |
| updated_at | timestamptz |

One order may have multiple payment records/attempts depending on retry/split requirements.

## `payment_attempts`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| payment_id | uuid |
| provider_attempt_id | varchar nullable |
| status | varchar |
| amount_minor | bigint |
| request_metadata | jsonb nullable |
| response_metadata | jsonb nullable |
| created_at | timestamptz |

Never store sensitive raw payment credentials.

## `payment_webhook_events`

| Column | Type |
|---|---|
| id | uuid PK |
| provider | varchar |
| provider_event_id | varchar |
| tenant_id | uuid nullable |
| event_type | varchar |
| payload_redacted | jsonb nullable |
| received_at | timestamptz |
| processed_at | timestamptz nullable |
| processing_status | enum(PENDING,PROCESSED,FAILED,IGNORED) |

Unique `(provider, provider_event_id)`.

## `refunds`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| payment_id | uuid |
| order_id | uuid |
| amount_minor | bigint |
| reason_code | varchar |
| reason_text | text nullable |
| status | enum(PENDING,SUCCEEDED,FAILED) |
| provider_refund_id | varchar nullable |
| initiated_by | uuid nullable |
| created_at | timestamptz |
| completed_at | timestamptz nullable |

Refunds are append-only financial records.

---

# 17. Kitchen

## `kitchen_stations`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| branch_id | uuid |
| name | varchar |
| code | varchar |
| sort_order | int |
| active | boolean |

## `product_kitchen_stations`

- tenant_id.
- branch_id optional depending on model.
- product_id.
- station_id.

## `kitchen_tasks`
Phase 1 can omit this if order-level prep is enough. Add when station/item-level prep is enabled.

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| branch_id | uuid |
| order_id | uuid |
| order_item_id | uuid nullable |
| station_id | uuid |
| status | enum(NEW,PREPARING,READY,CANCELLED) |
| started_at | timestamptz nullable |
| completed_at | timestamptz nullable |
| assigned_user_id | uuid nullable |

---

# 18. Riders

## `riders`

Could either extend staff identity or have a rider profile linked to user.

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| user_id | uuid |
| status | enum(ACTIVE,SUSPENDED) |
| created_at | timestamptz |

Unique `(tenant_id,user_id)`.

## `rider_branch_assignments`

- tenant_id.
- rider_id.
- branch_id.
- active.

## `rider_availability`

| Column | Type |
|---|---|
| tenant_id | uuid |
| rider_id | uuid PK |
| state | enum(OFFLINE,AVAILABLE,BUSY,PAUSED) |
| updated_at | timestamptz |

## `rider_current_locations`

| Column | Type |
|---|---|
| tenant_id | uuid |
| rider_id | uuid PK |
| location | geography(Point,4326) |
| accuracy_meters | numeric nullable |
| recorded_at | timestamptz |
| updated_at | timestamptz |

Geospatial index.

## `rider_location_history`

High-write table:

| Column | Type |
|---|---|
| id | bigint/uuid |
| tenant_id | uuid |
| rider_id | uuid |
| order_id | uuid nullable |
| location | geography(Point,4326) |
| accuracy_meters | numeric nullable |
| recorded_at | timestamptz |

Retention/partitioning required. Do not keep precise historical coordinates indefinitely without a defined business/privacy need.

## `rider_assignments`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| branch_id | uuid |
| order_id | uuid |
| rider_id | uuid |
| status | enum(ASSIGNED,ACCEPTED,REJECTED,PICKED_UP,COMPLETED,CANCELLED) |
| assigned_at | timestamptz |
| accepted_at | timestamptz nullable |
| picked_up_at | timestamptz nullable |
| completed_at | timestamptz nullable |
| assignment_method | enum(MANUAL,AUTO,POOL) |

Only one active assignment per order via partial unique index.

---

# 19. COD and Rider Cash

## `cash_ledger_entries`

Append-only.

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| branch_id | uuid |
| rider_id | uuid |
| order_id | uuid nullable |
| entry_type | enum(COD_COLLECTED,CASH_SUBMITTED,ADJUSTMENT) |
| amount_minor | bigint |
| reference_id | uuid nullable |
| note | text nullable |
| created_by | uuid nullable |
| created_at | timestamptz |

Rider cash balance is derived from ledger entries, not edited directly.

## `cash_settlements`

- id.
- tenant_id.
- branch_id.
- rider_id.
- amount_minor.
- period/start/end.
- processed_by.
- created_at.

---

# 20. Chat

## `chat_threads`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| order_id | uuid nullable |
| type | enum(CUSTOMER_RIDER,CUSTOMER_SUPPORT,INTERNAL) |
| status | enum(OPEN,READ_ONLY,CLOSED) |
| created_at | timestamptz |
| closed_at | timestamptz nullable |

## `chat_participants`

- thread_id.
- participant_type.
- participant_id.
- joined_at.
- left_at nullable.

## `messages`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| thread_id | uuid |
| sender_type | enum |
| sender_id | uuid nullable |
| message_type | enum(TEXT,SYSTEM,IMAGE,LOCATION) |
| body | text nullable |
| media_id | uuid nullable |
| metadata | jsonb nullable |
| created_at | timestamptz |
| edited_at | timestamptz nullable |
| deleted_at | timestamptz nullable |

Index `(tenant_id, thread_id, created_at)`.

---

# 21. Notifications

## `notification_templates`

- id.
- tenant_id nullable for platform defaults.
- event_key.
- channel.
- locale.
- subject/template data.
- active.
- version.

## `notifications`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| recipient_type | enum |
| recipient_id | uuid |
| event_key | varchar |
| channel | enum(IN_APP,PUSH,EMAIL,SMS,WHATSAPP) |
| status | enum(PENDING,SENT,FAILED,READ) |
| title | varchar nullable |
| body | text nullable |
| metadata | jsonb nullable |
| sent_at | timestamptz nullable |
| read_at | timestamptz nullable |
| created_at | timestamptz |

---

# 22. CMS/Banners

## `cms_banners`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| type | enum(HERO,CATEGORY,POPUP,ANNOUNCEMENT,APP_PROMO) |
| title | varchar nullable |
| body | text nullable |
| media_id | uuid nullable |
| cta_text | varchar nullable |
| cta_url | varchar nullable |
| starts_at | timestamptz nullable |
| ends_at | timestamptz nullable |
| active | boolean |
| sort_order | int |

## `banner_branches`

- banner_id.
- branch_id.

---

# 23. Reviews

## `reviews`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| order_id | uuid |
| customer_id | uuid |
| food_rating | smallint nullable |
| rider_rating | smallint nullable |
| comment | text nullable |
| status | enum(PUBLISHED,HIDDEN,PENDING) |
| created_at | timestamptz |

Checks rating 1..5.

Unique one review per order/customer unless business permits edits.

---

# 24. Loyalty

Use ledger model.

## `loyalty_accounts`

- tenant_id.
- customer_id.
- cached_balance_points.
- updated_at.

## `loyalty_transactions`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| customer_id | uuid |
| order_id | uuid nullable |
| type | enum(EARN,REDEEM,EXPIRE,ADJUST) |
| points | bigint |
| expires_at | timestamptz nullable |
| created_at | timestamptz |

Never overwrite historical point transactions.

---

# 25. Wallet

## `wallet_accounts`

- tenant_id.
- customer_id.
- currency_code.
- cached_balance_minor.
- updated_at.

## `wallet_transactions`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| customer_id | uuid |
| type | enum(CREDIT,DEBIT,REFUND,PROMO,ADJUSTMENT,EXPIRY) |
| amount_minor | bigint |
| order_id | uuid nullable |
| refund_id | uuid nullable |
| reference | varchar nullable |
| created_at | timestamptz |

Wallet balance is ledger-derived/cached, not arbitrary mutable money.

---

# 26. Idempotency

## `idempotency_keys`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid |
| actor_scope | varchar |
| operation | varchar |
| idempotency_key | varchar |
| request_hash | varchar nullable |
| status | enum(PROCESSING,COMPLETED,FAILED) |
| response_code | int nullable |
| response_body | jsonb nullable |
| resource_id | uuid nullable |
| expires_at | timestamptz |
| created_at | timestamptz |
| updated_at | timestamptz |

Unique:

`(tenant_id, actor_scope, operation, idempotency_key)`.

---

# 27. Transactional Outbox

## `outbox_events`

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid nullable |
| aggregate_type | varchar |
| aggregate_id | uuid |
| event_type | varchar |
| event_version | int |
| payload | jsonb |
| occurred_at | timestamptz |
| published_at | timestamptz nullable |
| attempts | int |
| last_error | text nullable |

Index pending events:

`WHERE published_at IS NULL`.

Payload must not contain unnecessary secrets/sensitive information.

---

# 28. Audit Logs

## `audit_logs`

Append-only.

| Column | Type |
|---|---|
| id | uuid PK |
| tenant_id | uuid nullable |
| actor_type | enum |
| actor_id | uuid nullable |
| action | varchar |
| entity_type | varchar |
| entity_id | uuid nullable |
| branch_id | uuid nullable |
| request_id | varchar nullable |
| before_json | jsonb nullable |
| after_json | jsonb nullable |
| metadata | jsonb nullable |
| created_at | timestamptz |

Redact sensitive values.

---

# 29. Customer Support

Optional Phase 2.

## `support_tickets`

- id.
- tenant_id.
- customer_id.
- order_id nullable.
- category.
- status.
- priority.
- subject.
- assigned_user_id.
- created_at.
- updated_at.
- closed_at.

Messages can use chat infrastructure or a dedicated support message table.

---

# 30. Tax Configuration

## `tax_classes`

- id.
- tenant_id.
- name.
- rate basis points / structured rules.
- inclusive/exclusive.
- active.

Tax computation details depend on jurisdiction and should be implemented behind a dedicated pricing/tax service.

Historical order tax is always snapshotted.

---

# 31. Optional Future Inventory Schema

Not MVP-critical.

```text
inventory_items
ingredients
recipes
recipe_items
branch_stock
stock_ledger
suppliers
purchase_orders
purchase_order_items
stock_transfers
stock_transfer_items
waste_entries
```

Use stock ledger rather than only mutable quantity.

---

# 32. Indexing Strategy

Typical indexes:

```text
orders(tenant_id, branch_id, status, created_at desc)
orders(tenant_id, customer_id, created_at desc)
payments(tenant_id, order_id)
customers(tenant_id, normalized_phone)
products(tenant_id, status, category_id)
branch_products(tenant_id, branch_id, enabled, sold_out)
messages(tenant_id, thread_id, created_at)
outbox_events(published_at) WHERE published_at IS NULL
```

PostGIS:

- GIST/SP-GiST index on branch location.
- GIST index on delivery polygons.
- GIST index on rider current location where query volume requires it.

Validate indexes with real query plans; do not index every column blindly.

---

# 33. Composite Tenant Safety

Where practical, use composite ownership validation.

Example problem:

An `order_items.order_id` points to an order from another tenant because application bug sends wrong ID.

Defense:

- Application scoping.
- Tests.
- Composite constraints/FKs where schema/ORM practicality allows.
- Database triggers/checks only for high-value invariants when ordinary constraints cannot express them.

At minimum, every write service verifies the parent resource belongs to request tenant.

---

# 34. Deletion and Retention

Never hard-delete completed orders or settled payment/refund records as a normal user action.

Suggested retention classes:

- OTP: minutes/hours.
- Idempotency keys: days based on endpoint risk.
- Rider exact location history: short business-defined period.
- Chat: business/legal retention policy.
- Audit: long-lived according to plan/compliance.
- Orders/payments: business/accounting requirements.

Privacy deletion requests should anonymize/remove customer PII where legally applicable without destroying financial/order integrity.

---

# 35. Example Order Creation Transaction

Within one database transaction:

1. Validate idempotency.
2. Lock/revalidate coupon usage if needed.
3. Validate branch/menu.
4. Calculate pricing.
5. Create order.
6. Create order items/modifier snapshots.
7. Create coupon redemption.
8. Create initial payment/payment intent metadata.
9. Create initial status history.
10. Create outbox `order.created`.
11. Mark idempotency completed.
12. Commit.

External network calls should not hold long DB transactions open unless provider workflow absolutely requires it. Use staged payment/order flows where necessary.

---

# 36. Example Order Status Transition Transaction

```text
BEGIN
  SELECT order FOR UPDATE
  validate tenant + branch + permission
  validate allowed transition
  UPDATE orders
  INSERT order_status_history
  INSERT audit if staff override
  INSERT outbox_event
COMMIT
```

After commit:

- Realtime broadcast.
- Notification job.
- Analytics/read-model update.

---

# 37. Example Payment Webhook Transaction

```text
verify provider signature
check payment_webhook_events unique provider_event_id

BEGIN
  insert webhook event
  select payment/order
  apply idempotent state transition
  update order payment summary if required
  insert outbox payment.*
  mark webhook processed
COMMIT
```

---

# 38. Reporting Strategy

MVP reports query transactional tables with safe indexes and bounded date ranges.

As volume grows:

- Daily aggregates.
- Materialized views.
- Reporting replica.
- Dedicated analytics warehouse.

Do not make operational checkout depend on analytical queries.

---

# 39. Schema Migration Rules

- Every schema change uses a committed migration.
- Migrations reviewed before production.
- Use expand/contract for breaking changes.
- Add nullable/new fields before code begins writing required data when rolling deployments need compatibility.
- Backfill asynchronously for large tables.
- Add `NOT NULL` only after backfill.
- Large index creation should use low-lock/concurrent techniques where supported and operationally appropriate.
- Never edit an already-applied production migration.

---

# 40. Minimal MVP Table Checklist

Required before first end-to-end order:

```text
tenants
tenant_domains
tenant_settings
tenant_features

branches
branch_hours
delivery_zones

users
tenant_memberships
roles
permissions
role_permissions
membership_roles
user_branch_assignments

customers
customer_addresses
refresh_sessions
otp_challenges

categories
products
product_variants
modifier_groups
modifiers
product_modifier_groups
branch_products

media_assets

carts
cart_items
cart_item_modifiers

promotions
coupons
coupon_redemptions

orders
order_items
order_item_modifiers
order_status_history

payments
payment_attempts
payment_webhook_events
refunds

riders
rider_availability
rider_current_locations
rider_assignments
cash_ledger_entries

chat_threads
chat_participants
messages

notifications
cms_banners

idempotency_keys
outbox_events
audit_logs
```

---

# 41. Schema Acceptance Criteria

- Tenant-owned records cannot be retrieved through another tenant's service context.
- Order totals are immutable snapshots after placement except controlled adjustment/refund records.
- Price/product edits do not alter historical orders.
- Duplicate checkout requests return/reuse the same logical order under the same idempotency key.
- Duplicate payment webhooks do not duplicate payment effects.
- Only valid order transitions are persisted.
- Rider assignment enforces one active assignment per order.
- COD cash changes are ledger entries.
- Every critical transaction emits an outbox event.
- Geospatial branch/zone queries can be indexed.
- High-write rider history has a retention/partition plan before launch.
