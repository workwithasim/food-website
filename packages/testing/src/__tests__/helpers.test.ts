import { describe, it, expect } from "vitest";
import { createMockId } from "../index";

describe("Testing Helpers", () => {
  it("should generate a prefixed mock ID", () => {
    const id = createMockId("tenant");
    expect(id.startsWith("tenant_")).toBe(true);
  });
});
