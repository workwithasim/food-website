# Environment Variables Guide

Do not commit real `.env` values.

Create `.env.example` with names only/default-safe development values.

Typical groups:

```text
NODE_ENV
APP_ENV

DATABASE_URL
DIRECT_URL

REDIS_URL

JWT_ACCESS_SECRET
REFRESH_TOKEN_PEPPER

PUBLIC_APP_URL
ADMIN_APP_URL
PLATFORM_APP_URL
API_BASE_URL

S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY

EMAIL_PROVIDER
EMAIL_FROM

SMS_PROVIDER

PAYMENT_PROVIDER
PAYMENT_WEBHOOK_SECRET

SENTRY_DSN
OTEL_EXPORTER_OTLP_ENDPOINT
```

Provider-specific variables are added through adapter documentation.
