import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cms')
@UseGuards(JwtAuthGuard)
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('banners')
  async listBanners(@Request() req: any) {
    return this.cmsService.listActiveBanners(req.user.tenantId);
  }
}
