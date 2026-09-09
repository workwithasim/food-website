import { ApiResponse, ApiErrorResponse, HealthStatus } from "@restaurant/contracts";

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

  private async getHeaders(customHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...customHeaders
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

  async get<T>(endpoint: string, headers: Record<string, string> = {}): Promise<ApiResponse<T>> {
    const finalHeaders = await this.getHeaders(headers);
    const url = `${this.config.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      method: "GET",
      headers: finalHeaders
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ApiErrorResponse;
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  async checkHealth(): Promise<HealthStatus> {
    const response = await this.get<HealthStatus>("/api/v1/health");
    return response.data;
  }
}
