import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PromotionsService {
  constructor(private db: DatabaseService) {}

  async listPromotions(tenantId: string) {
    return this.db.promotion.findMany({
      where: { tenant_id: tenantId },
      include: { rules: true },
    });
  }
}
