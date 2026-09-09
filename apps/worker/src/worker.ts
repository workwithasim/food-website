import { Worker, Job } from "bullmq";
import Redis from "ioredis";
import { appLogger } from "@restaurant/observability";
import { handleNotificationJob } from "./notifications/notifications.processor";

export interface WorkerConfig {
  redisUrl: string;
  queueName: string;
}

export class BackgroundWorker {
  private worker: Worker | null = null;
  private redisUrl: string;
  private queueName: string;

  constructor(config: WorkerConfig) {
    this.queueName = config.queueName;
    this.redisUrl = config.redisUrl;
  }

  async start(): Promise<void> {
    const testRedis = new Redis(this.redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
    await testRedis.connect();
    await testRedis.ping();
    await testRedis.quit();

    appLogger.info(`Connected worker Redis for queue: ${this.queueName}`);

    const connection = new Redis(this.redisUrl, {
      maxRetriesPerRequest: null
    });

    this.worker = new Worker(
      this.queueName,
      async (job: Job) => {
        appLogger.info(`Processing job ${job.id} [${job.name}]`);
        if (job.name === 'process_outbox_event') {
          return handleNotificationJob(job);
        }
        return { processed: true, jobId: job.id };
      },
      {
        connection,
        concurrency: 5
      }
    );

    this.worker.on("completed", (job: Job) => {
      appLogger.info(`Job completed: ${job.id}`);
    });

    this.worker.on("failed", (job: Job | undefined, err: Error) => {
      appLogger.error(`Job failed: ${job?.id} - ${err.message}`);
    });
  }

  async stop(): Promise<void> {
    if (this.worker) {
      await this.worker.close();
      this.worker = null;
    }
    appLogger.info("Background worker stopped gracefully");
  }

  isRunning(): boolean {
    return this.worker !== null && this.worker.isRunning();
  }
}
