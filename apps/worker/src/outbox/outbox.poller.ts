import { PrismaClient } from '@restaurant/database';
import { Queue } from 'bullmq';
import { createClient } from 'redis';
import { appLogger } from '@restaurant/observability';

export class OutboxPoller {
  private db = new PrismaClient();
  private redisPubSub: ReturnType<typeof createClient>;
  private queue: Queue;
  private interval: NodeJS.Timeout | null = null;
  private isPolling = false;

  constructor(redisUrl: string, queueName: string) {
    this.redisPubSub = createClient({ url: redisUrl });
    this.queue = new Queue(queueName, { connection: { url: redisUrl } });
  }

  async start() {
    await this.redisPubSub.connect();
    // Poll every 5 seconds
    this.interval = setInterval(() => this.poll(), 5000);
    appLogger.info('OutboxPoller started');
  }

  async stop() {
    if (this.interval) clearInterval(this.interval);
    await this.db.$disconnect();
    await this.redisPubSub.quit();
    await this.queue.close();
    appLogger.info('OutboxPoller stopped');
  }

  private async poll() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const events = await this.db.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 50,
        orderBy: { created_at: 'asc' }
      });

      for (const event of events) {
        try {
          // 1. Broadcast to Socket.IO via Redis adapter
          // The redis adapter uses specific channel formats, or we can just push a job to worker and let API handle it
          // Actually, Socket.io redis adapter is complex to emit to directly from a pure redis client.
          // The best way to trigger a websocket push without socket.io is pushing a job to bullmq 
          // or sending a specific message that the API listens to. 
          // For simplicity, we dispatch the event to the BullMQ queue which we can process for notifications
          // And we also emit it over a simple redis channel for the API to listen to and emit over websockets.
          
          await this.redisPubSub.publish('realtime:events', JSON.stringify(event));

          // 2. Add to BullMQ for reliable background tasks (emails, notifications)
          await this.queue.add('process_outbox_event', event, {
            jobId: `outbox-${event.id}`,
            removeOnComplete: true
          });

          // 3. Mark processed
          await this.db.outboxEvent.update({
            where: { id: event.id },
            data: { status: 'PROCESSED', processed_at: new Date() }
          });
        } catch (err: any) {
          appLogger.error(`Failed to process outbox event ${event.id}: ${err.message}`);
          await this.db.outboxEvent.update({
            where: { id: event.id },
            data: { status: 'FAILED', error: err.message }
          });
        }
      }
    } catch (e: any) {
      appLogger.error(`Outbox polling error: ${e.message}`);
    } finally {
      this.isPolling = false;
    }
  }
}
