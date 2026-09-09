-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_DELIVERY');

-- CreateEnum
CREATE TYPE "PromotionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "promotions" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR NOT NULL,
    "type" "PromotionType" NOT NULL,
    "value" BIGINT NOT NULL,
    "status" "PromotionStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "usage_limit" INTEGER,
    "current_usage" INTEGER NOT NULL DEFAULT 0,
    "min_order_amount" BIGINT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_rules" (
    "id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "branch_id" UUID,
    "category_id" UUID,
    "product_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_promotions" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "promotion_id" UUID NOT NULL,
    "discount_minor" BIGINT NOT NULL,
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banners" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "title" VARCHAR NOT NULL,
    "image_url" VARCHAR NOT NULL,
    "target_url" VARCHAR,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMPTZ,
    "end_date" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotions_tenant_id_status_idx" ON "promotions"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_tenant_id_code_key" ON "promotions"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "promotion_rules_promotion_id_idx" ON "promotion_rules"("promotion_id");

-- CreateIndex
CREATE INDEX "order_promotions_order_id_idx" ON "order_promotions"("order_id");

-- CreateIndex
CREATE INDEX "order_promotions_promotion_id_idx" ON "order_promotions"("promotion_id");

-- CreateIndex
CREATE INDEX "banners_tenant_id_is_active_idx" ON "banners"("tenant_id", "is_active");

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_rules" ADD CONSTRAINT "promotion_rules_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_promotions" ADD CONSTRAINT "order_promotions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_promotions" ADD CONSTRAINT "order_promotions_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
