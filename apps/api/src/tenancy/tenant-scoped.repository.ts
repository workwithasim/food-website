import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from './tenant.context';
import { DatabaseService } from '../database/database.service';

@Injectable()
export abstract class TenantScopedRepository {
  constructor(
    protected readonly db: DatabaseService,
    protected readonly cls: ClsService<TenantContext>,
  ) {}

  protected get tenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new Error('Tenant context is missing. Cannot execute tenant-scoped repository action.');
    }
    return tenantId;
  }
}
