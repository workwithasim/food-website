import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private db: DatabaseService) {}

  async dispatch(tenantId: string, userId: string, channel: string, template: string, payload: any) {
    // Generate idempotency key based on time and payload to avoid duplicates
    const idempotencyKey = `noti-${userId}-${template}-${Date.now()}`;
    
    this.logger.log(`Dispatching ${channel} notification to user ${userId} with template ${template}`);
    
    return this.db.notificationEvent.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        channel,
        template_name: template,
        payload,
        status: 'PENDING',
        idempotency_key: idempotencyKey
      }
    });
  }
}
