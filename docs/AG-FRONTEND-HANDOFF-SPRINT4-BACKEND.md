# AG — Sprint 4 backend contract (post–Sprint 4 frontend)

## What landed in the repo (backend)

- **`builder_integration_config`** now includes `display_name`, `last_heartbeat`, `config_validation_errors` (JSON array snapshot), and `last_config_validation_at`.
- **RPC** `validate_builder_integration_config(p_tool_id text)` — `SECURITY DEFINER`, **admin-only** (`has_role(..., 'admin')`). Updates the validation snapshot columns and returns `{ ok: boolean, errors: json }`.
- **Trigger** on `builder_integration_config`: when `enabled = true`, structural validation runs for live rows (tier 1–2): **vbp** needs `api_base_url`; **rest_api** needs `api_base_url`, `response_id_path`, and `poll_url_template` (generic poller). **v0** tier 1 is exempt (dedicated adapter).
- **`poll-builder-status`** bumps **`last_heartbeat`** after a successful HTTP response from the provider poll URL.
- **`pbp-webhook`** bumps **`last_heartbeat`** when a webhook payload is applied to `builder_results` / `run_tasks`, and merges **`raw_response.pbp_webhook_last`** (timestamp + envelope) on artifact / completed / failed paths.

## Suggested frontend follow-ups

- **`/admin/integrations`:** type-safe `select` on `builder_integration_config` (no `as any`); show `display_name` or `tool_id`; map `circuit_state` values `closed | open | half_open` for display; surface `config_validation_errors` when non-empty; optional **Validate** action for admins calling `supabase.rpc('validate_builder_integration_config', { p_tool_id })`.
- **`/docs`:** keep webhook JSON examples aligned with the envelope stored under `builder_results.raw_response.pbp_webhook_last.payload` and lifecycle events in `run_events`.

## Acceptance

- `npx tsc --noEmit` and `vite build` green.
- Admin can run validation RPC; non-admins receive `not authorized` from the RPC (expected).
