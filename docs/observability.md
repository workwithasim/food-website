# Observability

## Logs
Structured JSON with:
- timestamp
- service
- environment
- request ID
- tenant ID when safe
- actor ID when safe
- route/job
- duration
- error code

## Metrics
Track:
- request latency/error rate
- DB pool saturation
- Redis health
- queue lag/failures
- order creation rate
- payment success/failure
- webhook failures
- socket connections
- notification failures

## Tracing
Use OpenTelemetry-compatible instrumentation for API -> DB -> queue -> worker -> external providers.

## Alerts
At minimum:
- API elevated 5xx
- database unavailable
- Redis unavailable
- queue backlog
- payment webhook failures
- order creation failures
