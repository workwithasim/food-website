import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DeliveriesService {
  constructor(private db: DatabaseService) {}

  async assignRider(tenantId: string, orderId: string, riderId: string) {
    const existing = await this.db.deliveryAssignment.findUnique({ where: { order_id: orderId } });
    if (existing && existing.state !== 'CANCELLED') {
      throw new BadRequestException('Order already has an active assignment');
    }

    return this.db.deliveryAssignment.create({
      data: {
        tenant_id: tenantId,
        order_id: orderId,
        rider_id: riderId,
        state: 'ASSIGNED',
      },
    });
  }

  async acceptDelivery(assignmentId: string, riderId: string) {
    const assignment = await this.db.deliveryAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.rider_id !== riderId) {
      throw new NotFoundException('Assignment not found or unauthorized');
    }
    if (assignment.state !== 'ASSIGNED') {
      throw new BadRequestException('Can only accept ASSIGNED deliveries');
    }

    return this.db.deliveryAssignment.update({
      where: { id: assignmentId },
      data: { state: 'ACCEPTED', accepted_at: new Date() },
    });
  }

  async markDelivered(assignmentId: string, riderId: string) {
    const assignment = await this.db.deliveryAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment || assignment.rider_id !== riderId) {
      throw new NotFoundException('Assignment not found or unauthorized');
    }

    return this.db.deliveryAssignment.update({
      where: { id: assignmentId },
      data: { state: 'DELIVERED', delivered_at: new Date() },
    });
  }
}
