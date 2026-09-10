import { Controller, Get, Inject } from '@nestjs/common';
import { BranchesService } from '../services/branches.service';

@Controller('v1/branches')
export class PublicBranchesController {
  constructor(@Inject(BranchesService) private branchesService: BranchesService) {}

  @Get()
  async listPublicBranches() {
    return this.branchesService.listBranches(true);
  }
}
