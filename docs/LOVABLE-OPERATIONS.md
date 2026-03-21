# Lovable Cloud — operacje po zmianach backendu

Checklist dla deployu po merge na `main`, gdy dotykasz Edge / sekretów / migracji.

## Sekrety (Edge)

- `EDGE_ALLOWED_ORIGINS` — `https://pr0ducent.com,https://www.pr0ducent.com,http://localhost:8080` (patrz [EDGE-CORS-ENV.md](./EDGE-CORS-ENV.md)).
- `V0_API_KEY` — wymagany dla `run-on-v0` / `poll-v0-status`.
- Drugi builder (Replit generic REST): po włączeniu wiersza `replit` ustaw `REPLIT_ORCHESTRATOR_API_KEY` zgodnie z `api_secret_env` w `builder_integration_config`.

## Migracje

- `supabase db push` / `migrate deploy` na docelowym projekcie.
- Po migracji `20260421120000_replit_second_builder_generic_rest_path.sql`: wiersz `replit` ma pełną ścieżkę REST, **`enabled = false`** do czasu realnego API.

## Redeploy Edge

Po zmianie w `supabase/functions/**` lub sekretów: wdróż funkcje używane przez orchestrator (`dispatch-builders`, `poll-builder-status`, `pbp-webhook`, `process-task-queue`, adaptery wywoływane przez dispatch).

## Weryfikacja

- Smoke: [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md).
- CORS: odpowiedź musi mieć `Access-Control-Allow-Origin` równy originowi aplikacji (nie `*`), gdy `EDGE_ALLOWED_ORIGINS` jest ustawiony.
- Logi Edge: błędy adaptera, 429, timeouty przy `dispatch-builders`.

## Rollback drugiego buildera

- W SQL: `UPDATE builder_integration_config SET enabled = false WHERE tool_id = 'replit';` (bez usuwania wiersza).
