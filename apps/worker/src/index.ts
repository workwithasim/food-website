import * as dotenv from "dotenv";
import { BackgroundWorker } from "./worker";
import { appLogger } from "@restaurant/observability";
import { OutboxPoller } from "./outbox/outbox.poller";

dotenv.config({ path: "../../.env" });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const worker = new BackgroundWorker({
  redisUrl,
  queueName: "food-platform-events"
});
const outboxPoller = new OutboxPoller(redisUrl, "food-platform-events");

async function main() {
  await worker.start();
  await outboxPoller.start();
  appLogger.info("Worker process initialized and listening for events");

  const shutdown = async () => {
    appLogger.info("Received shutdown signal, closing worker...");
    await outboxPoller.stop();
    await worker.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    appLogger.error(`Worker failed to start: ${err.message}`);
    process.exit(1);
  });
}

export { worker };
