import { describe, it, expect } from "vitest";
import { ApiClient } from "../index";

describe("ApiClient", () => {
  it("should initialize with baseUrl", () => {
    const client = new ApiClient({ baseUrl: "http://localhost:4000" });
    expect(client).toBeDefined();
  });
});
