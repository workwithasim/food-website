import { Injectable } from "@nestjs/common";
import { HealthStatus } from "@restaurant/contracts";
import { Client } from "pg";
import Redis from "ioredis";

@Injectable()
export class HealthService {
  private startTime = Date.now();

  async getHealth(): Promise<HealthStatus> {
    let dbStatus: "connected" | "disconnected";
    let redisStatus: "connected" | "disconnected";

    const dbUrl =
      process.env.DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/food_platform";
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

    // Check Postgres
    try {
      const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 2000 });
      await client.connect();
      await client.query("SELECT 1;");
      await client.end();
      dbStatus = "connected";
    } catch {
      dbStatus = "disconnected";
    }

    // Check Redis
    try {
      const redis = new Redis(redisUrl, { connectTimeout: 2000, lazyConnect: true, maxRetriesPerRequest: 1 });
      await redis.connect();
      await redis.ping();
      await redis.quit();
      redisStatus = "connected";
    } catch {
      redisStatus = "disconnected";
    }

    const isHealthy = dbStatus === "connected" && redisStatus === "connected";

    return {
      status: isHealthy ? "ok" : "degraded",
      uptime: Math.round((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: dbStatus,
        redis: redisStatus
      }
    };
  }
}
