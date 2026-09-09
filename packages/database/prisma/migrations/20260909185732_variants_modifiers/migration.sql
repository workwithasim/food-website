-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "sku" VARCHAR,
    "price_minor" BIGINT NOT NULL,
    "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifier_groups" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "min_select" INTEGER NOT NULL DEFAULT 0,
    "max_select" INTEGER NOT NULL DEFAULT 1,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "modifier_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifiers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "modifier_group_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "price_delta_minor" BIGINT NOT NULL DEFAULT 0,
    "status" "VariantStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "modifiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_modifier_groups" (
    "tenant_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "modifier_group_id" UUID NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_modifier_groups_pkey" PRIMARY KEY ("tenant_id","product_id","modifier_group_id")
);

-- CreateIndex
CREATE INDEX "product_variants_tenant_id_product_id_status_idx" ON "product_variants"("tenant_id", "product_id", "status");

-- CreateIndex
CREATE INDEX "modifier_groups_tenant_id_status_idx" ON "modifier_groups"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "modifiers_tenant_id_modifier_group_id_status_idx" ON "modifiers"("tenant_id", "modifier_group_id", "status");

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier_groups" ADD CONSTRAINT "modifier_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifiers" ADD CONSTRAINT "modifiers_modifier_group_id_fkey" FOREIGN KEY ("modifier_group_id") REFERENCES "modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_modifier_groups" ADD CONSTRAINT "product_modifier_groups_modifier_group_id_fkey" FOREIGN KEY ("modifier_group_id") REFERENCES "modifier_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
