# Data Retention & Privacy

Define retention before production.

Suggested categories:
- OTP challenges: short-lived.
- Idempotency records: limited days according to operation risk.
- Rider exact location history: minimum business-required period.
- Chat: tenant/legal policy.
- Audit logs: long-lived.
- Orders/payments/refunds: accounting/legal retention.
- Application logs: limited operational retention.

Privacy deletion should anonymize removable PII while preserving accounting/order integrity where required.
