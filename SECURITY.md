# Security Policy

The Restaurant Platform team takes security seriously. We appreciate your efforts to responsibly disclose any vulnerabilities you find.

---

## Supported Versions

Only the latest released minor version and the `main` branch receive security patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities using one of the following methods:

1. **GitHub Private Security Advisory (Preferred):**
   Navigate to the [Security Advisories page](https://github.com/workwithasim/food-website/security/advisories/new) and click **"Report a vulnerability"**.

2. **Email Disclosure:**
   Send an email to **security@yourrestaurant.com** (or repository owner via GitHub profile).
   - Subject line: `[SECURITY] Vulnerability Report - <Brief Summary>`
   - Include a description of the issue, severity assessment, affected components, and detailed reproduction steps (e.g. proof of concept code, HTTP request/response captures).

### What to Expect

- **Initial Acknowledgment:** Within **48 hours** of submission.
- **Triage & Assessment:** Within **5 business days**, confirming reproduction and assigning a CVE/severity rating where applicable.
- **Fix & Disclosure Coordination:** We will coordinate with you on patch testing and a disclosure date. We ask that you give us a minimum of **30 days** to remediate the vulnerability before public disclosure.

---

## Core Security Safeguards

The platform is designed with multi-layered defense-in-depth:

### 1. Multi-Tenant Isolation
- Every database entity is scoped with `tenant_id`.
- Tenant context is resolved dynamically from subdomains or headers via `TenantInterceptor`.
- Direct query parameters cannot bypass tenant scoping.

### 2. Authentication & RBAC
- JWT access tokens with short lifetimes (15 minutes).
- Rotatable refresh tokens stored securely with hashing.
- Role-Based Access Control (RBAC) enforced via `@Roles()` guards across all administrative and operational endpoints.
- Argon2 password hashing.

### 3. API Hardening
- **Helmet**: Secures HTTP response headers.
- **CORS**: Strict origin whitelisting in production.
- **Rate Limiting**: ThrottlerGuard on all endpoints with heightened rate limits on auth and checkout routes.
- **Validation**: Strict DTO validation with NestJS `ValidationPipe` (whitelist, forbid non-whitelisted).

### 4. Data Protection & Secrets
- Never commit `.env` files or secret credentials to version control.
- In production, utilize environment secret managers (e.g. AWS Secrets Manager, Doppler, Vault).
- Database backups (`infra/scripts/backup.sh`) are encrypted and retained with strict access controls.
