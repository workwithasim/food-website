import { describe, it, expect } from "vitest";
import { BackgroundWorker } from "../src/worker";

describe("BackgroundWorker (Integration)", () => {
  it("should start and stop against live Redis in Docker", async () => {
    const worker = new BackgroundWorker({
      redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
      queueName: "integration-test-queue"
    });

    await worker.start();
    expect(worker.isRunning()).toBe(true);

    await worker.stop();
    expect(worker.isRunning()).toBe(false);
  });
});
