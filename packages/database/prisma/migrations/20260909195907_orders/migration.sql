-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('WEB', 'MOBILE', 'POS', 'ADMIN', 'QR');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'REJECTED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CUSTOMER', 'STAFF', 'RIDER', 'SYSTEM');

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "customer_id" UUID,
    "order_number" VARCHAR NOT NULL,
    "channel" "OrderChannel" NOT NULL,
    "fulfillment_type" "FulfillmentMethod" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "currency_code" CHAR(3) NOT NULL,
    "subtotal_minor" BIGINT NOT NULL,
    "item_discount_minor" BIGINT NOT NULL DEFAULT 0,
    "promotion_discount_minor" BIGINT NOT NULL DEFAULT 0,
    "coupon_discount_minor" BIGINT NOT NULL DEFAULT 0,
    "delivery_fee_minor" BIGINT NOT NULL DEFAULT 0,
    "service_fee_minor" BIGINT NOT NULL DEFAULT 0,
    "tax_minor" BIGINT NOT NULL DEFAULT 0,
    "tip_minor" BIGINT NOT NULL DEFAULT 0,
    "wallet_credit_minor" BIGINT NOT NULL DEFAULT 0,
    "grand_total_minor" BIGINT NOT NULL,
    "paid_minor" BIGINT NOT NULL DEFAULT 0,
    "refunded_minor" BIGINT NOT NULL DEFAULT 0,
    "customer_name_snapshot" VARCHAR NOT NULL,
    "customer_phone_snapshot" VARCHAR NOT NULL,
    "delivery_address_snapshot" JSONB,
    "delivery_location" geography(Point,4326),
    "customer_note" TEXT,
    "scheduled_for" TIMESTAMPTZ,
    "placed_at" TIMESTAMPTZ NOT NULL,
    "confirmed_at" TIMESTAMPTZ,
    "ready_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID,
    "variant_id" UUID,
    "product_name" VARCHAR NOT NULL,
    "variant_name" VARCHAR,
    "unit_price_minor" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_subtotal_minor" BIGINT NOT NULL,
    "line_discount_minor" BIGINT NOT NULL DEFAULT 0,
    "line_tax_minor" BIGINT NOT NULL DEFAULT 0,
    "line_total_minor" BIGINT NOT NULL,
    "special_instructions" TEXT,
    "metadata_snapshot" JSONB,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_modifiers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "modifier_id" UUID,
    "modifier_name" VARCHAR NOT NULL,
    "unit_price_delta_minor" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total_minor" BIGINT NOT NULL,

    CONSTRAINT "order_item_modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "from_status" "OrderStatus",
    "to_status" "OrderStatus" NOT NULL,
    "actor_type" "ActorType" NOT NULL,
    "actor_id" UUID,
    "reason_code" VARCHAR,
    "reason_text" TEXT,
    "source" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_tenant_id_branch_id_status_created_at_idx" ON "orders"("tenant_id", "branch_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_tenant_id_customer_id_created_at_idx" ON "orders"("tenant_id", "customer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "orders_tenant_id_payment_status_created_at_idx" ON "orders"("tenant_id", "payment_status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenant_id_order_number_key" ON "orders"("tenant_id", "order_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_item_modifiers_order_item_id_idx" ON "order_item_modifiers"("order_item_id");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history"("order_id");

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
