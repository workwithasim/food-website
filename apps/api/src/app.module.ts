import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";

if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
}
import { ClsModule } from "nestjs-cls";
import { HealthModule } from "./health/health.module";
import { DatabaseModule } from "./database/database.module";
import { TenancyModule } from "./tenancy/tenancy.module";
import { TenantMiddleware } from "./tenancy/tenant.middleware";
import { AuthModule } from "./auth/auth.module";
import { RbacModule } from "./rbac/rbac.module";
import { StaffModule } from "./staff/staff.module";
import { BranchesModule } from "./branches/branches.module";
import { CatalogModule } from "./catalog/catalog.module";
import { CartModule } from "./cart/cart.module";
import { ThrottlerModule } from "@nestjs/throttler";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerStorageRedisService } from "nestjs-throttler-storage-redis";

import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [{ name: 'short', ttl: 1000, limit: 3 }, { name: 'long', ttl: 60000, limit: 100 }],
        storage: new ThrottlerStorageRedisService(config.get<string>('REDIS_URL') as string || 'redis://localhost:6379'),
      }),
    }),
    HealthModule,
    DatabaseModule,
    TenancyModule,
    AuthModule,
    RbacModule,
    StaffModule,
    BranchesModule,
    CatalogModule,
    CartModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
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
