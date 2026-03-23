# VBP — conformance profiles and production gate

Based on [protocol/vibecoding-broker-protocol/CONFORMANCE.md](../protocol/vibecoding-broker-protocol/CONFORMANCE.md). Levels **Verified / Partial / Experimental** describe integration quality; **Production gate** is the set of conditions to enable routing in production on the broker.

## Levels (builder implementation alignment)

| Profile | Requirements | Use |
|---------|--------------|-----|
| **Verified** | Validator (`npm run vbp-validate` / `validator/cli.mjs`) passes against `api_base_url`; required routes and response shapes match [VBP-SPEC.md](./VBP-SPEC.md). | Recommended list, badge in UI (product policy). |
| **Partial** | Dispatch + **one** completion path (poll **or** webhook); known gaps documented (e.g. no export = 501). | Early partner, clear disclaimer. |
| **Experimental** | In development; integration may be off or behind a flag. | Staging / demo. |

## **Production** gate (broker — pr0ducent)

Do not enable on production (`builder_integration_config.enabled`, tier ≤2) until:

| # | Condition | Notes |
|---|-----------|--------|
| 1 | **Webhook security** | `VBP_WEBHOOK_SECRET` set; `VBP_WEBHOOK_SECRET_REQUIRED=true` in production ([POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md)). |
| 2 | **Terminal states** | `completed` / `failed` mapped to `builder_results` + `run_tasks` without hangs. |
| 3 | **Idempotency** | Duplicate webhooks do not corrupt state (`pbp_webhook_deliveries`). |
| 4 | **Rate limits** | Row in `builder_rate_limits` aligned with partner agreement. |
| 5 | **Observability** | `run_events` with `trace_id` / `run_task_id` for audit path. |
| 6 | **Pilot** | Completed as Verified or Partial per [POP-PILOT-SUCCESS-CRITERIA.md](./POP-PILOT-SUCCESS-CRITERIA.md). |

## Security gate (short)

Full detail: [POP-SECURITY-MODEL.md](./POP-SECURITY-MODEL.md).  
**Rule:** missing webhook signatures when secret is required = **block** production routing.

## Spec conformance vs drift

On every change to [VBP-SPEC.md](./VBP-SPEC.md) or JSON schemas:

1. Update `protocol/vibecoding-broker-protocol/schemas/`.
2. Pass CI `vbp-protocol` (workflow in repo).
3. Update Edge adapters (`vbp-adapter`, `pbp-webhook`, `poll-builder-status`).

See [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md).
