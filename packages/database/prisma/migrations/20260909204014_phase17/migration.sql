-- CreateEnum
CREATE TYPE "RiderStatus" AS ENUM ('OFFLINE', 'AVAILABLE', 'ON_DELIVERY');

-- CreateEnum
CREATE TYPE "DeliveryState" AS ENUM ('ASSIGNED', 'ACCEPTED', 'AT_STORE', 'PICKED_UP', 'ON_THE_WAY', 'ARRIVED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CodLedgerType" AS ENUM ('COLLECTED', 'SETTLED');

-- CreateTable
CREATE TABLE "rider_profiles" (
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "current_branch_id" UUID,
    "status" "RiderStatus" NOT NULL DEFAULT 'OFFLINE',
    "vehicle_type" VARCHAR,
    "vehicle_plate" VARCHAR,
    "last_location" geography(Point,4326),
    "location_updated_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rider_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "delivery_assignments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "rider_id" UUID NOT NULL,
    "state" "DeliveryState" NOT NULL DEFAULT 'ASSIGNED',
    "assigned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMPTZ,
    "picked_up_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "notes" TEXT,
    "delivery_otp_hash" VARCHAR,

    CONSTRAINT "delivery_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_location_logs" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "location" geography(Point,4326) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "logged_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_location_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cod_ledgers" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "rider_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "order_id" UUID,
    "type" "CodLedgerType" NOT NULL,
    "amount_minor" BIGINT NOT NULL,
    "reference" VARCHAR,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_by_id" UUID,

    CONSTRAINT "cod_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rider_profiles_tenant_id_current_branch_id_status_idx" ON "rider_profiles"("tenant_id", "current_branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_assignments_order_id_key" ON "delivery_assignments"("order_id");

-- CreateIndex
CREATE INDEX "delivery_assignments_tenant_id_rider_id_state_idx" ON "delivery_assignments"("tenant_id", "rider_id", "state");

-- CreateIndex
CREATE INDEX "delivery_location_logs_assignment_id_logged_at_idx" ON "delivery_location_logs"("assignment_id", "logged_at" DESC);

-- CreateIndex
CREATE INDEX "cod_ledgers_tenant_id_rider_id_created_at_idx" ON "cod_ledgers"("tenant_id", "rider_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "rider_profiles" ADD CONSTRAINT "rider_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rider_profiles" ADD CONSTRAINT "rider_profiles_current_branch_id_fkey" FOREIGN KEY ("current_branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_assignments" ADD CONSTRAINT "delivery_assignments_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_location_logs" ADD CONSTRAINT "delivery_location_logs_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "delivery_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_ledgers" ADD CONSTRAINT "cod_ledgers_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_ledgers" ADD CONSTRAINT "cod_ledgers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cod_ledgers" ADD CONSTRAINT "cod_ledgers_settled_by_id_fkey" FOREIGN KEY ("settled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
