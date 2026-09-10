import { Controller, Get, Post, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('banners')
  async listBanners(@Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.cmsService.listAllBanners(tenantId);
  }

  @Get('public/banners')
  async listPublicBanners() {
    return this.cmsService.listActiveBanners();
  }

  @Post('banners')
  async createBanner(@Body() body: any, @Request() req: any) {
    const tenantId = req.user?.tenantId;
    return this.cmsService.createBanner(body, tenantId);
  }

  @Put('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() body: any) {
    return this.cmsService.updateBanner(id, body);
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return this.cmsService.deleteBanner(id);
  }
}
