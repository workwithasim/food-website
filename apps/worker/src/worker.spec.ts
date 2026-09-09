import { describe, it, expect } from "vitest";
import { BackgroundWorker } from "./worker";

describe("BackgroundWorker", () => {
  it("should instantiate with queue configuration", () => {
    const worker = new BackgroundWorker({
      redisUrl: "redis://localhost:6379",
      queueName: "test-queue"
    });
    expect(worker).toBeDefined();
    expect(worker.isRunning()).toBe(false);
  });
});
