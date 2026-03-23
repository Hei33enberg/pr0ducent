# Second (and further) builders — playbook

SQL template (commented): [examples/second-builder-config.template.sql](./examples/second-builder-config.template.sql).

## Replit — path in the repository (generic REST)

Migration [20260421120000_replit_second_builder_generic_rest_path.sql](../supabase/migrations/20260421120000_replit_second_builder_generic_rest_path.sql) sets `tool_id = 'replit'` to **tier 2**, `integration_type = rest_api`, full fields for `generic-rest-adapter` + `poll-builder-status`, **`enabled = false`**. Before enabling:

1. Replace `api_base_url` and `poll_url_template` with **real** endpoints (full POST URL for dispatch).
2. Add a secret in Edge (`REPLIT_ORCHESTRATOR_API_KEY` or change `api_secret_env`).
3. `UPDATE ... SET enabled = true WHERE tool_id = 'replit'` (trigger validates required fields).
4. Smoke: [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md) with `selectedTools` containing `replit`.

Cloud operations: [LOVABLE-OPERATIONS.md](./LOVABLE-OPERATIONS.md).

## Decision order

1. **Does the partner have a public API or will they ship VBP?**  
   - Yes, VBP → `builder_integration_config.integration_type = 'vbp'`, `api_base_url`, `api_secret_env`, tier 1–2, `enabled = true`.  
   - Yes, REST but not VBP → `integration_type = 'rest_api'`, fill `request_template`, `response_id_path`, `poll_*` per [`generic-rest-adapter.ts`](../supabase/functions/_shared/adapters/generic-rest-adapter.ts).  
   - No → stays **benchmark** until partnership ([WIRE-BUILDERS.md](./WIRE-BUILDERS.md)).

2. **Secrets** — in Supabase Edge Secrets add the key pointed to by `api_secret_env` (e.g. `LOVABLE_PARTNER_KEY`).

3. **Rate limits** — insert or update a row in `builder_rate_limits` for `tool_id` (by default only `v0` has a row from migration).

4. **Test** — [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md) + [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md) with `selectedTools` containing the new `tool_id`.

5. **Frontend** — [`useBuilderApi`](../src/hooks/useBuilderApi.ts) for tools without a dedicated poll (non-v0) refreshes `builder_results` from the DB in the background; VBP may add SSE later instead of poll.

## Recommended next candidate (product)

- **Replit** — public agents API (verify ToS).  
- **Lovable / Bolt** — require a partner agreement or their **VBP** implementation on your standard ([VBP-SPEC.md](./VBP-SPEC.md)).

## Link to Open Protocol

When a builder ships VBP, you **do not** need a separate adapter in code — configuration + `vbp-adapter` is enough.
