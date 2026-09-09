import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface CreateSupportTicketDto {
  subject: string;
  message: string;
  orderId?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
}

@Injectable()
export class SupportService {
  constructor(private db: DatabaseService) {}

  async createTicket(tenantId: string, customerId: string, dto: CreateSupportTicketDto) {
    if (!dto.subject || dto.subject.trim() === '') {
      throw new BadRequestException('Subject is required');
    }
    if (!dto.message || dto.message.trim() === '') {
      throw new BadRequestException('Initial message is required');
    }

    if (dto.orderId) {
      const order = await this.db.order.findFirst({
        where: { id: dto.orderId, tenant_id: tenantId, customer_id: customerId },
      });
      if (!order) {
        throw new NotFoundException('Associated order not found');
      }
    }

    return this.db.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          tenant_id: tenantId,
          customer_id: customerId,
          order_id: dto.orderId,
          subject: dto.subject.trim(),
          priority: dto.priority || 'NORMAL',
          status: 'OPEN',
        },
      });

      await tx.supportTicketMessage.create({
        data: {
          ticket_id: ticket.id,
          sender_type: 'CUSTOMER',
          sender_id: customerId,
          message: dto.message.trim(),
        },
      });

      return tx.supportTicket.findUnique({
        where: { id: ticket.id },
        include: {
          messages: { orderBy: { created_at: 'asc' } },
          customer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });
    });
  }

  async addMessage(
    tenantId: string,
    ticketId: string,
    sender: { senderType: 'CUSTOMER' | 'STAFF'; senderId: string },
    message: string,
  ) {
    if (!message || message.trim() === '') {
      throw new BadRequestException('Message cannot be empty');
    }

    const ticket = await this.db.supportTicket.findFirst({
      where: { id: ticketId, tenant_id: tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const msg = await this.db.supportTicketMessage.create({
      data: {
        ticket_id: ticketId,
        sender_type: sender.senderType,
        sender_id: sender.senderId,
        message: message.trim(),
      },
    });

    // If ticket was resolved/closed and customer messages, reopen
    if (sender.senderType === 'CUSTOMER' && (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')) {
      await this.db.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'OPEN', updated_at: new Date() },
      });
    } else {
      await this.db.supportTicket.update({
        where: { id: ticketId },
        data: { updated_at: new Date() },
      });
    }

    return msg;
  }

  async updateStatus(
    tenantId: string,
    ticketId: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  ) {
    const ticket = await this.db.supportTicket.findFirst({
      where: { id: ticketId, tenant_id: tenantId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return this.db.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }

  async listTickets(
    tenantId: string,
    filter?: {
      customerId?: string;
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
      page?: number;
      limit?: number;
    },
  ) {
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 20;
    const skip = (page - 1) * limit;

    const where: any = { tenant_id: tenantId };
    if (filter?.customerId) where.customer_id = filter.customerId;
    if (filter?.status) where.status = filter.status;

    const [tickets, total] = await Promise.all([
      this.db.supportTicket.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          order: {
            select: {
              id: true,
              order_number: true,
            },
          },
          _count: {
            select: { messages: true },
          },
        },
        skip,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      this.db.supportTicket.count({ where }),
    ]);

    return {
      items: tickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTicket(tenantId: string, ticketId: string) {
    const ticket = await this.db.supportTicket.findFirst({
      where: { id: ticketId, tenant_id: tenantId },
      include: {
        customer: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
        order: true,
        messages: {
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }
}
