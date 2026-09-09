import { Controller, Get, Query, Inject } from '@nestjs/common';
import { BranchResolverService } from '../services/branch-resolver.service';

@Controller('v1/branches/resolve')
export class BranchResolverController {
  constructor(@Inject(BranchResolverService) private branchResolverService: BranchResolverService) {}

  @Get()
  async resolveBranches(@Query('lat') lat: string, @Query('lng') lng: string) {
    if (!lat || !lng) {
      return { eligible_branches: [] };
    }
    
    return this.branchResolverService.resolveBranches(parseFloat(lat), parseFloat(lng));
  }
}
