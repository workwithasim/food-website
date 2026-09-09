import { ClsStore } from 'nestjs-cls';

export interface TenantContext extends ClsStore {
  tenantId: string;
  domainId: string;
  hostname: string;
}
