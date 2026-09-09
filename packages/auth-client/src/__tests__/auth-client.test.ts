import { describe, it, expect } from "vitest";
import { AuthUser } from "../index";
import { ActorType, UserRole } from "@restaurant/contracts";

describe("Auth Client", () => {
  it("should validate AuthUser type shape correctly", () => {
    const mockUser: AuthUser = {
      id: "user-123",
      displayName: "John Doe",
      actorType: ActorType.STAFF,
      tenantId: "tenant-456",
      roles: [UserRole.BRANCH_MANAGER],
      permissions: ["orders.view"]
    };
    expect(mockUser.id).toBe("user-123");
    expect(mockUser.actorType).toBe(ActorType.STAFF);
  });
});
