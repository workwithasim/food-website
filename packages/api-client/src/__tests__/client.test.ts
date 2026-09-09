import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient } from "../client";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function makeClient(token?: string, tenantId?: string) {
  return new ApiClient({
    baseUrl: "http://api.test",
    getAccessToken: token ? () => token : undefined,
    getTenantId: tenantId ? () => tenantId : undefined,
  });
}

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data }),
  } as Response);
}

function mockError(status: number, message: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: { code: "ERR", message } }),
  } as unknown as Response);
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("ApiClient — contract regression", () => {
  // ─── Header injection ───────────────────────────────────────────────────────

  it("injects Authorization and X-Tenant-ID headers", async () => {
    const client = makeClient("tok_abc", "tenant-123");
    mockOk({ status: "ok", uptime: 1, timestamp: "t", version: "1.0.0", services: { database: "connected", redis: "connected" } });
    await client.checkHealth();
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toMatchObject({
      Authorization: "Bearer tok_abc",
      "X-Tenant-ID": "tenant-123",
    });
  });

  it("omits Authorization header when no token provided", async () => {
    const client = makeClient(undefined, "tenant-456");
    mockOk({ status: "ok" });
    await client.get("/api/v1/health");
    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit & { headers: Record<string, string> }).headers["Authorization"]).toBeUndefined();
  });

  // ─── Error handling ─────────────────────────────────────────────────────────

  it("throws with API error message on non-ok response", async () => {
    const client = makeClient("tok");
    mockError(404, "Not Found");
    await expect(client.get("/api/v1/missing")).rejects.toThrow("Not Found");
  });

  // ─── Health ─────────────────────────────────────────────────────────────────

  it("checkHealth returns unwrapped data", async () => {
    const client = makeClient("tok");
    const health = { status: "ok", uptime: 100, timestamp: "t", version: "1.0.0", services: { database: "connected", redis: "connected" } };
    mockOk(health);
    const result = await client.checkHealth();
    expect(result.status).toBe("ok");
  });

  // ─── Auth ────────────────────────────────────────────────────────────────────

  it("auth.loginWithEmail POSTs to /auth/login", async () => {
    const client = makeClient();
    mockOk({ access_token: "at", refresh_token: "rt", expires_in: 3600, token_type: "Bearer" });
    await client.auth.loginWithEmail({ email: "a@b.com", password: "password1" });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/api/v1/auth/login");
    expect(mockFetch.mock.calls[0][1].method).toBe("POST");
  });

  it("auth.requestOtp POSTs phone number", async () => {
    const client = makeClient();
    mockOk({ message: "OTP sent" });
    await client.auth.requestOtp("+923001234567");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.phone).toBe("+923001234567");
  });

  // ─── Catalog ─────────────────────────────────────────────────────────────────

  it("catalog.getMenu appends branch_id query param", async () => {
    const client = makeClient("tok");
    mockOk([]);
    await client.catalog.getMenu("branch-uuid-1");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("branch_id=branch-uuid-1");
  });

  // ─── Cart ─────────────────────────────────────────────────────────────────────

  it("cart.addItem sends correct body", async () => {
    const client = makeClient("tok");
    mockOk({ id: "cart-1", items: [], subtotal_minor: 0, delivery_fee_minor: 0, grand_total_minor: 0, currency_code: "PKR" });
    await client.cart.addItem({ product_id: "prod-1", quantity: 2 });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.product_id).toBe("prod-1");
    expect(body.quantity).toBe(2);
  });

  it("cart.removeItem sends DELETE request", async () => {
    const client = makeClient("tok");
    mockOk({ id: "cart-1", items: [] });
    await client.cart.removeItem("item-uuid");
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE");
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/cart/items/item-uuid");
  });

  // ─── Orders ──────────────────────────────────────────────────────────────────

  it("orders.getMyOrders appends pagination params", async () => {
    const client = makeClient("tok");
    mockOk({ items: [], total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false });
    await client.orders.getMyOrders({ page: 2, limit: 20 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("page=2");
    expect(url).toContain("limit=20");
  });

  // ─── Rider ───────────────────────────────────────────────────────────────────

  it("rider.updateLocation POSTs location", async () => {
    const client = makeClient("tok");
    mockOk(null);
    await client.rider.updateLocation({ latitude: 24.8, longitude: 67.0, timestamp: new Date().toISOString() });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.latitude).toBe(24.8);
    expect(body.longitude).toBe(67.0);
  });

  it("rider.setAvailability PATCHes availability", async () => {
    const client = makeClient("tok");
    mockOk(null);
    await client.rider.setAvailability("AVAILABLE");
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.state).toBe("AVAILABLE");
  });

  // ─── Notifications ────────────────────────────────────────────────────────────

  it("notifications.registerPushToken POSTs token", async () => {
    const client = makeClient("tok");
    mockOk(null);
    await client.notifications.registerPushToken({ token: "expo-token-xyz", platform: "ios" });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.token).toBe("expo-token-xyz");
    expect(body.platform).toBe("ios");
  });
});
