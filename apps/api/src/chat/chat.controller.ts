import { Controller, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('threads')
  async createThread(@Request() req: any, @Body() body: { orderId: string }) {
    return this.chatService.createThread(req.user.tenantId, body.orderId);
  }

  @Post('threads/:id/messages')
  async sendMessage(@Request() req: any, @Param('id') id: string, @Body() body: { content: string }) {
    return this.chatService.sendMessage(req.user.tenantId, id, req.user.id, body.content);
  }
}
