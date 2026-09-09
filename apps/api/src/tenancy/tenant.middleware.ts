import { Injectable, NestMiddleware, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../database/database.service';
import { ClsService } from 'nestjs-cls';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(DatabaseService) private readonly db: DatabaseService,
    @Inject(ClsService) private readonly cls: ClsService<TenantContext>,
  ) {}

  use = async (req: Request, _res: Response, next: NextFunction) => {
    if (req.path.endsWith('/health')) {
      return next();
    }

    const hostHeader = req.headers['x-tenant-host'] || req.headers.host;
    
    if (!hostHeader) {
      throw new BadRequestException('Host header is missing');
    }

    const hostname = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;
    const cleanHostname = hostname?.split(':')[0]?.toLowerCase();

    if (!cleanHostname) {
      throw new BadRequestException('Host header is invalid');
    }

    // Look up domain
    let domain = await this.db.tenantDomain.findUnique({
      where: { hostname: cleanHostname },
      include: { tenant: true },
    });

    if (!domain && (cleanHostname === 'localhost' || cleanHostname === '127.0.0.1' || cleanHostname === '0.0.0.0')) {
      domain = await this.db.tenantDomain.findFirst({
        where: { is_primary: true },
        include: { tenant: true },
      }) || await this.db.tenantDomain.findFirst({
        include: { tenant: true },
      });
    }

    if (!domain) {
      throw new NotFoundException(`Unknown tenant domain: ${cleanHostname}`);
    }

    if (domain.tenant.status !== 'ACTIVE') {
      throw new BadRequestException('Tenant is not active');
    }

    // Set context
    this.cls.set('tenantId', domain.tenant_id);
    this.cls.set('domainId', domain.id);
    this.cls.set('hostname', domain.hostname);

    next();
  }
}
