import { Controller, Get, Request } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('banners')
  async listBanners(@Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.cmsService.listActiveBanners(tenantId);
  }

  @Get('public/banners')
  async listPublicBanners() {
    return this.cmsService.listActiveBanners();
  }
}
