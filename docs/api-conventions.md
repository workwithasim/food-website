# API Conventions

Base: `/api/v1`

## Standard Rules
- JSON over HTTPS.
- ISO-8601 UTC timestamps.
- Stable error codes.
- Request/correlation IDs.
- Pagination on collections.
- Idempotency keys on critical creates.
- DTOs are not direct database entities.

## Error Shape

```json
{
  "error": {
    "code": "ORDER_INVALID_TRANSITION",
    "message": "Order cannot move to that status.",
    "requestId": "req_..."
  }
}
```

## Pagination

Prefer cursor pagination for high-write streams such as orders/messages.

## Authentication
Bearer access token for API clients. Web refresh/session mechanics follow TRD.

## Versioning
Breaking changes require a new API version or explicitly reviewed migration path.
