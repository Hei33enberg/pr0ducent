# Lovable Cloud — operations after backend changes

Checklist for deploy after merge to `main` when you touch Edge / secrets / migrations.

## Secrets (Edge)

- `EDGE_ALLOWED_ORIGINS` — `https://pr0ducent.com,https://www.pr0ducent.com,http://localhost:8080` (see [EDGE-CORS-ENV.md](./EDGE-CORS-ENV.md)).
- `V0_API_KEY` — required for `run-on-v0` / `poll-v0-status`.
- Second builder (Replit generic REST): after enabling the `replit` row, set `REPLIT_ORCHESTRATOR_API_KEY` per `api_secret_env` in `builder_integration_config`.

## Migrations

- `supabase db push` / `migrate deploy` on the target project.
- After migration `20260421120000_replit_second_builder_generic_rest_path.sql`: the `replit` row has the full REST path, **`enabled = false`** until a real API exists.

## Redeploy Edge

After changes under `supabase/functions/**` or secrets: deploy functions used by the orchestrator (`dispatch-builders`, `poll-builder-status`, `pbp-webhook`, `process-task-queue`, adapters invoked by dispatch).

## Verification

- Smoke: [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md).
- CORS: response must have `Access-Control-Allow-Origin` equal to the app origin (not `*`) when `EDGE_ALLOWED_ORIGINS` is set.
- Edge logs: adapter errors, 429, timeouts on `dispatch-builders`.

## Rollback second builder

- In SQL: `UPDATE builder_integration_config SET enabled = false WHERE tool_id = 'replit';` (without deleting the row).
