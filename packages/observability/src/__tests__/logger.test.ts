import { describe, it, expect } from "vitest";
import { StructuredLogger } from "../index";

describe("StructuredLogger", () => {
  it("should instantiate with context without errors", () => {
    const logger = new StructuredLogger({ service: "test-service", tenantId: "tenant-1" });
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("should create child loggers with inherited and extended context", () => {
    const parent = new StructuredLogger({ service: "api" });
    const child = parent.child({ requestId: "req-123" });
    expect(child).toBeDefined();
  });
});
