# Security Baseline

## Identity
- Argon2id for password hashing.
- Short-lived access tokens.
- Rotating refresh tokens.
- Secure hashed refresh-session storage.
- OTP expiration, attempt limits and resend limits.
- Session revocation.

## Multi-Tenant
- Tenant resolved from authenticated membership or verified hostname.
- Client payload cannot choose arbitrary tenant.
- Tenant-scoped service/repository APIs.
- Explicit cross-tenant tests.

## API
- Validation pipes/schema validation.
- Rate limits.
- CORS allowlist.
- Secure headers.
- CSRF protection when cookie-authenticated browser state requires it.
- No stack traces in production responses.

## Payments
- Signature-verified webhooks.
- Duplicate provider-event protection.
- No raw card storage.
- Idempotent payment transitions.
- Refund audit trail.

## Files
- MIME/extension/size validation.
- Randomized object keys.
- Signed upload flow where appropriate.
- Malware scanning can be added for higher-risk uploads.

## Logs
Never log passwords, OTPs, tokens, secrets or raw card credentials.

## Admin
- Least privilege.
- Audit all high-risk actions.
- Support impersonation requires explicit UI banner + audit.
