# Partner onboarding (POP / VBP)

Use this for **technical discovery** with builder teams and for **pilot** tracking. Product/legal terms stay outside this doc.

## 30-minute discovery agenda

1. **Surfaces** — Confirm `api_base_url`, auth (Bearer partner key), and whether they prefer **webhooks** vs **polling** vs **SSE**.
2. **Dispatch** — `POST /vbp/v1/dispatch`: request/response fields (`provider_run_id`, optional `stream_url`, `claim_token`). Broker sends `run_id` = `run_task_id`, `webhook_url` = Supabase `pbp-webhook`.
3. **Completion** — How they signal **artifact_ready** / **completed** / **failed** (webhook event names or status JSON).
4. **Limits** — Rate limits, max concurrent runs, phantom TTL if applicable.
5. **Observability** — Trace id (`trace_id`) and correlation via `experiment_id` + `tool_id` + `provider_run_id`.

## Pilot (2 weeks) checklist

| Step | Owner | Done |
|------|--------|------|
| Staging partner key in Supabase secrets (`VBP_PARTNER_KEY` or per-tool `api_secret_env`) | Ops | |
| Row in `builder_integration_config` + `builder_rate_limits` | Backend | |
| Smoke: one dispatch → poll or webhook → `builder_results.status=completed` | QA | |
| Conformance: `validator/cli.mjs` against their `api_base_url` | DevRel | |
| Compatibility matrix row updated (Verified / Partial) | PM | |

## Compatibility matrix (template)

| Builder | Tier | Dispatch | Status | Webhook | Artifacts | Export | Notes |
|---------|------|----------|--------|---------|-----------|--------|-------|
| Example | 2 | OK | Poll | Planned | 501 | 501 | Pilot Q2 |

## Badges

- **POP Verified** — passes validator + successful pilot on staging.
- **Partial** — dispatch + one completion path; documented gaps.

## References

- [POP-INDEX.md](./POP-INDEX.md) — pełny indeks POP (pitch, bridge, legal, ROI)
- [VBP-SPEC.md](./VBP-SPEC.md)
- [SECOND-BUILDER-PLAYBOOK.md](./SECOND-BUILDER-PLAYBOOK.md)
- [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)
- Protocol bundle: [`protocol/vibecoding-broker-protocol/README.md`](../protocol/vibecoding-broker-protocol/README.md)
