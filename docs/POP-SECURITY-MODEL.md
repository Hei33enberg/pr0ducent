# VBP — security model (broker and builder)

Normative API detail: [VBP-SPEC.md](./VBP-SPEC.md). Broker implementation: [ORCHESTRATOR.md](./ORCHESTRATOR.md), [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md).

## Identity and authentication

| Direction | Mechanism |
|-----------|-----------|
| Broker → Builder | `Authorization: Bearer <partner_api_key>` (key issued by builder for broker). Optional `broker_auth_token` in dispatch body for broker identity (`VBP_BROKER_OUTBOUND_SECRET`). |
| Builder → Broker (webhook) | HMAC-SHA256 over **raw** JSON body; headers `X-VBP-Signature` / aliases per spec. |

## Secrets and configuration (pr0ducent)

- `VBP_WEBHOOK_SECRET` — verify incoming webhooks to `pbp-webhook`.
- `VBP_WEBHOOK_SECRET_REQUIRED=true` — “fail closed” when secret not set (recommended for production).
- Builder partner keys: `VBP_PARTNER_KEY` or per-tool `api_secret_env` in `builder_integration_config`.

## Idempotency and replay

- `pbp_webhook_deliveries` table — dedupe by raw body hash (see Edge `pbp-webhook`).
- Partners should use stable payloads; broker rejects duplicates after successful parse.

## Correlation and audit

- `run_id` (broker task UUID) = `run_task_id`.
- `experiment_id`, `tool_id`, `provider_run_id` — mapping in `builder_results` / `run_events`.
- `trace_id` — optional end-to-end in events.

## User data

- `user_context` in dispatch is minimal (e.g. `intent_id` / `experiment_id`); we **do not** pass passwords or full profiles.
- Handoff: one-time `claim_token` on builder side (best practice).

## Threats and mitigation

| Threat | Mitigation |
|--------|------------|
| Fake webhook without HMAC | Require secret in prod; optional IP allowlist at partner. |
| Dispatch overload | Rate limits (`builder_rate_limits`), circuit breaker in config. |
| Key leak | Key rotation, separate staging/prod keys, BYOA separate (Vault). |

## Production gate

Before marking integration production-ready: [POP-CONFORMANCE-PROFILES.md](./POP-CONFORMANCE-PROFILES.md) (**Production** profile).
