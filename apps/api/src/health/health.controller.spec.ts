import { describe, it, expect, vi } from "vitest";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

describe("HealthController", () => {
  it("should return health status envelope", async () => {
    const mockHealthService = {
      getHealth: vi.fn().mockResolvedValue({
        status: "ok",
        uptime: 10,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: { database: "connected", redis: "connected" }
      })
    } as unknown as HealthService;

    const controller = new HealthController(mockHealthService);
    const result = await controller.check();

    expect(result.data.status).toBe("ok");
    expect(result.data.services.database).toBe("connected");
  });
});
