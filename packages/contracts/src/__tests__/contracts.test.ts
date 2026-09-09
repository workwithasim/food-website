import { describe, it, expect } from "vitest";
import { OrderStatus, PaymentStatus, DomainEventKeys, HealthStatusSchema } from "../index";

describe("Contracts", () => {
  it("should export defined domain enums", () => {
    expect(OrderStatus.PLACED).toBe("PLACED");
    expect(PaymentStatus.PAID).toBe("PAID");
  });

  it("should have correct domain event keys", () => {
    expect(DomainEventKeys.ORDER_CREATED).toBe("order.created");
    expect(DomainEventKeys.ORDER_DELIVERED).toBe("order.delivered");
  });

  it("should validate health status schema with Zod", () => {
    const valid = {
      status: "ok",
      uptime: 123.45,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "connected",
        redis: "connected"
      }
    };
    const parsed = HealthStatusSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });
});
