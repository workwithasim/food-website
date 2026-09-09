# Deployment & Release Requirements

## Environments
- local
- development
- staging
- production

Separate database, Redis, storage namespace, payment credentials and secrets per environment.

## Production Components
- CDN/WAF
- Next.js web apps
- NestJS API
- NestJS/BullMQ worker
- PostgreSQL + PostGIS
- Redis
- S3-compatible object storage
- monitoring/error tracking

## Release Gate
Before production:
- migrations reviewed,
- backup verified,
- staging smoke tests pass,
- secrets configured,
- health checks pass,
- rollback/recovery plan documented,
- no debug/test credentials remain.

## Launch Checklist
- custom domain and TLS
- payment provider production keys
- webhook endpoints
- email/SMS/push configuration
- storage/CDN
- DB backups/PITR
- rate limiting
- logs/alerts
- privacy/terms pages
- admin account security
- load test critical order flow
