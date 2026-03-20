# Smoke test: orchestrator + v0 (manual)

Use this to verify **dispatch-builders → v0-adapter → poll-v0-status → completed** end-to-end with a real user JWT.

## Prerequisites

- Supabase project with migrations applied (`run_jobs`, `run_tasks`, `builder_results`, `builder_integration_config` with v0 tier 1 enabled).
- `V0_API_KEY` set in Edge Function secrets.
- A logged-in user with a row in `subscriptions` (`prompts_used` &lt; `prompts_limit`).

## 1. Get a user JWT

From the browser (logged-in app): DevTools → Application → Local Storage → Supabase session → copy `access_token`.

Or use Supabase Auth API with email/password (never commit credentials).

## 2. Create an experiment

Insert via app UI or SQL as that user; note `experiments.id` (UUID).

## 3. Invoke dispatch-builders

```bash
curl -sS -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/dispatch-builders" \
  -H "Authorization: Bearer YOUR_USER_JWT" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"Build a one-page landing with a hero and CTA\",\"experimentId\":\"EXPERIMENT_UUID\",\"selectedTools\":[\"v0\"],\"idempotencyKey\":\"smoke-$(date +%s)\"}"
```

Expect `200` with `ok: true`, `runJobId`, and `dispatched` containing v0 with status `generating` or `benchmark` / `error` depending on config.

## 4. Poll v0 (if live v0 returned generating)

Read `builder_results.provider_run_id` (chat id) for that experiment + tool `v0`, then:

```bash
curl -sS -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/poll-v0-status" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"chatId\":\"CHAT_ID_FROM_DB\",\"experimentId\":\"EXPERIMENT_UUID\"}"
```

Repeat until v0 reports completion or failure.

## 5. Verify DB

- `run_tasks`: status moves from `queued` → `building` → … → `completed` or `failed`.
- `builder_results`: `status`, `preview_url` / `chat_url` populated when successful.
- `run_events`: rows for `orchestrator.*` and `builder.*` / `score.*` as applicable.

## Automated tests

Deno unit tests live under `supabase/functions/__tests__/`. Run:

```bash
deno test --allow-env supabase/functions/__tests__/
```

Full live E2E requires secrets and is intentionally not run in CI by default.
