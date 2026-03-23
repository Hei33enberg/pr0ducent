# VBP — ROI metrics and attribution (broker + partner)

## Measurement goals

- Prove **channel value** to the partner (leads, handoff, conversions).
- Optimize **cost** of orchestration and bridges (bridge vs native VBP).

## Events in the product (pr0ducent)

| Event | Source | Table / code |
|-------|--------|----------------|
| CTA handoff click | Frontend | `referral_clicks` — [experiment-service.ts](../src/lib/experiment-service.ts) `logReferralClick` |
| Handoff recorded | Frontend | `referral_conversions` with `conversion_type: builder_handoff` — `logReferralHandoff` |
| Experiment / run | Orchestrator | `experiments`, `run_jobs`, `run_tasks`, `builder_results`, `run_events` — [ORCHESTRATOR.md](./ORCHESTRATOR.md) |

## Internal metrics (MVP)

| Metric | Definition | Use |
|--------|------------|-----|
| **Leads** | Count of `referral_clicks` per `tool_id` in a time window | Interest volume |
| **Handoffs** | Count of `referral_conversions` per `tool_id` | Deeper intent than a click alone |
| **CTA rate** | handoffs / unique experiments with that tool | UX fit quality |
| **Time-to-artifact** | `completed_at` − run start (from `run_tasks` / `builder_results`) | SLA per builder |

SQL queries: aggregate by `tool_id`, `created_at` — dashboard can be built in Supabase SQL / Metabase / internal panel.

## Partner metrics (negotiable)

| Metric | Description |
|--------|-------------|
| **Qualified leads** | Defined jointly (e.g. handoff + minimum session time at partner) |
| **Attributed signups** | Requires export or API from builder — beyond broker MVP alone |
| **Rev-share basis** | Revenue × rate × attribution window — [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md) |

## Dashboard (plan)

1. **Phase 1:** SQL queries + spreadsheet (CSV) for pilot partner.
2. **Phase 2:** Admin/partner read-only view on `referral_*` with aggregation.
3. **Phase 3:** Webhook or daily export to partner (requires contract).

## UTM / ref

- Consistent builder URL params: `utm_source=pr0ducent`, `utm_medium=broker`, `ref=<experiment_or_intent>` — align with partner.
- [VBP] Stay consistent with privacy policy (do not put PII in URLs unnecessarily).

## Related

- [POP-COMMERCIAL-MODELS.md](./POP-COMMERCIAL-MODELS.md)
- [POP-BRIDGE-REGISTRY.md](./POP-BRIDGE-REGISTRY.md)
