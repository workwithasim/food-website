# Production Launch Runbook

> **Last updated**: Phase 25  
> **Maintainer**: Engineering team

---

## Pre-Launch Checklist

### Infrastructure
- [ ] PostgreSQL 16 provisioned with at least 20GB storage
- [ ] Redis 7 provisioned with persistence enabled (`save 60 1`)
- [ ] S3 bucket created for file/image uploads and database backups
- [ ] Custom domain(s) DNS records pointing to server IP
- [ ] TLS certificates issued via Let's Encrypt (`certbot`) or imported

### Secrets & Environment
- [ ] `.env.prod` populated from `.env.production.template` (all `REPLACE_ME` values filled)
- [ ] Secrets stored in secrets manager (AWS Secrets Manager / Vault / 1Password)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are distinct 64-byte random hex strings
- [ ] Stripe live keys configured and webhook endpoint registered
- [ ] FCM service account JSON loaded for push notifications

### Database
- [ ] `DATABASE_URL` points to production database
- [ ] `DIRECT_URL` points to direct (non-pooled) connection
- [ ] `pnpm --filter @restaurant/database migrate:deploy` run successfully
- [ ] Seed data loaded for initial tenants if required

### Docker
- [ ] Docker image built and pushed to GHCR: `ghcr.io/workwithasim/food-website/api:latest`
- [ ] `docker compose -f docker-compose.prod.yml up -d` completes without errors
- [ ] All services show `healthy` in `docker compose ps`

### Backups
- [ ] `infra/scripts/backup.sh` tested manually — backup file appears in S3
- [ ] Cron job scheduled: `0 2 * * * /opt/restaurant/infra/scripts/backup.sh`
- [ ] Retention policy verified (30-day default)

### Smoke Tests
- [ ] `BASE_URL=https://api.yourrestaurant.com ./infra/scripts/smoke-test.sh` → all pass
- [ ] `GET /api/v1/health` returns `{"status":"ok"}`
- [ ] Customer web (`https://yourrestaurant.com`) loads and can browse menu
- [ ] Ops web (`https://ops.yourrestaurant.com`) loads and staff can log in

### Alerts & Monitoring
- [ ] Uptime monitor configured for `/api/v1/health` (Uptime Robot / BetterUptime)
- [ ] Error tracking configured (Sentry DSN set in env)
- [ ] Log aggregation active (Datadog / Papertrail / Loki)
- [ ] Disk space alert at 80%

### Payments
- [ ] Stripe webhook URL configured: `https://api.yourrestaurant.com/api/v1/payments/webhook`
- [ ] Webhook secret matches `STRIPE_WEBHOOK_SECRET`
- [ ] Test transaction verified end-to-end in Stripe dashboard

---

## Deployment Steps

```bash
# 1. SSH into production server
ssh deploy@your-server-ip

# 2. Pull latest code
cd /opt/restaurant && git pull origin main

# 3. Set environment
export $(cat .env.prod | xargs)

# 4. Pull new image
export IMAGE_TAG=sha-$(git rev-parse --short HEAD)
docker compose -f docker-compose.prod.yml pull api

# 5. Run migrations (zero-downtime — Prisma migrate deploy)
docker compose -f docker-compose.prod.yml run --rm api \
  node node_modules/.bin/prisma migrate deploy \
  --schema packages/database/prisma/schema.prisma

# 6. Restart API with new image
docker compose -f docker-compose.prod.yml up -d --no-deps api

# 7. Verify
sleep 15
curl -f https://api.yourrestaurant.com/api/v1/health
```

---

## Rollback Steps

```bash
# Find the previous working image tag from GHCR or git history
# Example: sha-abc1234

./infra/scripts/rollback.sh sha-abc1234
```

The rollback script will:
1. Set `IMAGE_TAG` to the specified tag
2. Pull that image
3. Restart the API container
4. Wait 15 seconds and check `/api/v1/health`
5. Exit non-zero if unhealthy

> **Note**: Database migrations cannot be automatically rolled back. If a migration caused the failure, restore from backup using `pg_restore`.

---

## Database Restore from Backup

```bash
# 1. Download backup from S3
aws s3 cp s3://restaurant-backups/postgres/YYYYMMDD_HHMMSS.dump /tmp/restore.dump

# 2. Stop API to prevent writes
docker compose -f docker-compose.prod.yml stop api

# 3. Restore (drops and recreates DB)
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="${DATABASE_URL}" \
  /tmp/restore.dump

# 4. Restart API
docker compose -f docker-compose.prod.yml start api

# 5. Verify
curl -f https://api.yourrestaurant.com/api/v1/health
```

---

## Known Issues & Limitations

| Issue | Workaround |
|-------|-----------|
| `@nestjs/websockets` peer version mismatch (v12 vs v11) | Pin to v12 across all NestJS packages — integration tests use unit-test pattern |
| Mobile apps require EAS Build — not deployable from local machine | Use `eas build --platform all` after configuring `eas.json` |
| Stripe webhook delivery — retry on non-200 | Ensure idempotency keys on webhook handler |
| Redis failover — no sentinel/cluster configured | Plan Redis Sentinel or Upstash for high availability |
