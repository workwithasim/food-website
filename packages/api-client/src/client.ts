import {
  ApiResponse,
  ApiErrorResponse,
  HealthStatus,
  AuthTokenDto,
  LoginWithEmailDto,
  LoginWithPhoneDto,
  CategoryWithProducts,
  CartDto,
  AddToCartDto,
  OrderSummary,
  RiderLocation,
  RiderAvailability,
  PushTokenDto,
  PaginatedResult,
  PaginationParams,
} from "@restaurant/contracts";

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  getTenantId?: () => string | null;
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  // ─── Core HTTP ──────────────────────────────────────────────────────────────

  private async getHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders,
    };

    if (this.config.getAccessToken) {
      const token = await this.config.getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    if (this.config.getTenantId) {
      const tenantId = this.config.getTenantId();
      if (tenantId) {
        headers["X-Tenant-ID"] = tenantId;
      }
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    return url.toString();
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>): Promise<ApiResponse<T>> {
    const finalHeaders = await this.getHeaders();
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, { method: "GET", headers: finalHeaders });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  async post<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const finalHeaders = await this.getHeaders();
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: "POST",
      headers: finalHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    const finalHeaders = await this.getHeaders();
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, {
      method: "PATCH",
      headers: finalHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const finalHeaders = await this.getHeaders();
    const url = this.buildUrl(endpoint);
    const response = await fetch(url, { method: "DELETE", headers: finalHeaders });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  // ─── Health ─────────────────────────────────────────────────────────────────

  async checkHealth(): Promise<HealthStatus> {
    const response = await this.get<HealthStatus>("/api/v1/health");
    return response.data;
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────

  readonly auth = {
    loginWithEmail: (dto: LoginWithEmailDto) =>
      this.post<AuthTokenDto>("/api/v1/auth/login", dto).then((r) => r.data),

    loginWithPhone: (dto: LoginWithPhoneDto) =>
      this.post<AuthTokenDto>("/api/v1/auth/login/otp", dto).then((r) => r.data),

    requestOtp: (phone: string) =>
      this.post<{ message: string }>("/api/v1/auth/otp/request", { phone }).then((r) => r.data),

    refreshToken: (refreshToken: string) =>
      this.post<AuthTokenDto>("/api/v1/auth/refresh", { refresh_token: refreshToken }).then((r) => r.data),

    logout: () => this.post<void>("/api/v1/auth/logout", {}).then(() => undefined),
  };

  // ─── Catalog ─────────────────────────────────────────────────────────────────

  readonly catalog = {
    getMenu: (branchId: string) =>
      this.get<CategoryWithProducts[]>("/api/v1/catalog/menu", { branch_id: branchId }).then((r) => r.data),

    getProduct: (productId: string) =>
      this.get<CategoryWithProducts>(`/api/v1/catalog/products/${productId}`).then((r) => r.data),
  };

  // ─── Cart ─────────────────────────────────────────────────────────────────────

  readonly cart = {
    getCart: () => this.get<CartDto>("/api/v1/cart").then((r) => r.data),

    addItem: (dto: AddToCartDto) => this.post<CartDto>("/api/v1/cart/items", dto).then((r) => r.data),

    updateItemQuantity: (itemId: string, quantity: number) =>
      this.patch<CartDto>(`/api/v1/cart/items/${itemId}`, { quantity }).then((r) => r.data),

    removeItem: (itemId: string) => this.delete<CartDto>(`/api/v1/cart/items/${itemId}`).then((r) => r.data),

    clearCart: () => this.delete<void>("/api/v1/cart").then(() => undefined),
  };

  // ─── Orders ──────────────────────────────────────────────────────────────────

  readonly orders = {
    getMyOrders: (params?: PaginationParams) =>
      this.get<PaginatedResult<OrderSummary>>("/api/v1/orders/me", {
        page: params?.page,
        limit: params?.limit,
      }).then((r) => r.data),

    getOrder: (orderId: string) =>
      this.get<OrderSummary>(`/api/v1/orders/${orderId}`).then((r) => r.data),

    placeOrder: (cartId: string, payload: unknown) =>
      this.post<OrderSummary>("/api/v1/orders", { cart_id: cartId, ...((payload as object) || {}) }).then(
        (r) => r.data
      ),
  };

  // ─── Rider ────────────────────────────────────────────────────────────────────

  readonly rider = {
    updateLocation: (location: RiderLocation) =>
      this.post<void>("/api/v1/riders/location", location).then(() => undefined),

    setAvailability: (state: RiderAvailability) =>
      this.patch<void>("/api/v1/riders/availability", { state }).then(() => undefined),

    getActiveDelivery: () =>
      this.get<unknown>("/api/v1/riders/active-delivery").then((r) => r.data),

    acceptDelivery: (deliveryId: string) =>
      this.post<void>(`/api/v1/riders/deliveries/${deliveryId}/accept`, {}).then(() => undefined),

    rejectDelivery: (deliveryId: string, reason: string) =>
      this.post<void>(`/api/v1/riders/deliveries/${deliveryId}/reject`, { reason }).then(() => undefined),
  };

  // ─── Push Notifications ───────────────────────────────────────────────────────

  readonly notifications = {
    registerPushToken: (dto: PushTokenDto) =>
      this.post<void>("/api/v1/notifications/push-token", dto).then(() => undefined),

    deregisterPushToken: (token: string) =>
      this.delete<void>(`/api/v1/notifications/push-token/${encodeURIComponent(token)}`).then(() => undefined),
  };
}
