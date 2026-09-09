import { z } from "zod";

export interface ApiResponse<T> {
  data: T;
  meta?: {
    requestId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export const HealthStatusSchema = z.object({
  status: z.enum(["ok", "degraded", "error"]),
  uptime: z.number(),
  timestamp: z.string(),
  version: z.string(),
  services: z.object({
    database: z.enum(["connected", "disconnected"]),
    redis: z.enum(["connected", "disconnected"])
  })
});

export type HealthStatus = z.infer<typeof HealthStatusSchema>;
