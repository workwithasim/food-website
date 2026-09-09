import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ChatService {
  constructor(private db: DatabaseService) {}

  async createThread(tenantId: string, orderId: string) {
    const order = await this.db.order.findUnique({ where: { id: orderId } });
    if (!order || order.tenant_id !== tenantId) throw new NotFoundException('Order not found');

    return this.db.chatThread.create({
      data: { tenant_id: tenantId, order_id: orderId, status: 'OPEN' },
    });
  }

  async sendMessage(tenantId: string, threadId: string, senderId: string, content: string) {
    const thread = await this.db.chatThread.findUnique({ where: { id: threadId } });
    if (!thread || thread.tenant_id !== tenantId) throw new NotFoundException('Thread not found');
    if (thread.status === 'CLOSED') throw new BadRequestException('Thread is closed');

    return this.db.chatMessage.create({
      data: { thread_id: threadId, sender_id: senderId, content },
    });
  }
}
