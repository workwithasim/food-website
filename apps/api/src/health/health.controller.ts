import { Controller, Get, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse as SwaggerApiResponse } from "@nestjs/swagger";
import { ApiResponse, HealthStatus } from "@restaurant/contracts";
import { HealthService } from "./health.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: "Service health check" })
  @SwaggerApiResponse({ status: 200, description: "Service status and dependencies" })
  async check(): Promise<ApiResponse<HealthStatus>> {
    const health = await this.healthService.getHealth();
    return {
      data: health,
      meta: {
        timestamp: new Date().toISOString()
      }
    };
  }
}
