import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { HealthModule } from "./health/health.module";
import { DatabaseModule } from "./database/database.module";
import { TenancyModule } from "./tenancy/tenancy.module";
import { TenantMiddleware } from "./tenancy/tenant.middleware";

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    HealthModule,
    DatabaseModule,
    TenancyModule,
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'api/v1/health', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.ALL }
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
