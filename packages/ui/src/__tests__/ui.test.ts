import { describe, it, expect } from "vitest";
import { Button, Card, Badge } from "../index";

describe("UI Components", () => {
  it("should export Button, Card, Badge components", () => {
    expect(Button).toBeDefined();
    expect(Card).toBeDefined();
    expect(Badge).toBeDefined();
  });
});
