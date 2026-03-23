# PM / QA — full orchestration run (5 min)

Operational index (Lovable, webhook, smoke): [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md).

## Important: `/compare` is not the run engine

The **Compare** page (`/compare`) is a marketing feature matrix. It **does not** launch builders or write `run_jobs`.

Full orchestration runs on the **home page** after sign-in when the experiment has a **UUID from the database** (`experiments.id`).

## Checklist

1. **Sign in** (account with active subscription / prompt limit).
2. On **Home**, enter a prompt, pick tools (e.g. v0), start generation.
3. Confirm the experiment is **synced to DB** (after `createExperimentInDb` the same experiment appears in history — `id` should be a real UUID, not only a mock).
4. **Expected in UI:** tiles / results for selected tools; for v0 status moves from generating to completed or error in reasonable time.
5. **Supabase (Table Editor or SQL):**
   - `run_jobs` — latest row for your `experiment_id`: final job status.
   - `run_tasks` — one row per tool; status should **not** stay **`queued`** forever (after a few minutes: `building`, `completed`, `failed`, `benchmark`, etc.).
   - `builder_results` — `status`, `preview_url` / `chat_url`, `provider_run_id` for v0.
   - `run_events` (optional) — `orchestrator.*`, `builder.*` events.

## SQL — quick view of last run

Replace `EXPERIMENT_UUID`:

```sql
SELECT id, status, created_at FROM run_jobs
WHERE experiment_id = 'EXPERIMENT_UUID'
ORDER BY created_at DESC LIMIT 3;

SELECT tool_id, status, error_message, updated_at FROM run_tasks
WHERE experiment_id = 'EXPERIMENT_UUID'
ORDER BY updated_at DESC;

SELECT tool_id, status, preview_url, chat_url, provider_run_id FROM builder_results
WHERE experiment_id = 'EXPERIMENT_UUID';
```

## Guest (not signed in)

Guests **do not** go through `dispatch-builders` / `run_jobs`. For v0 the **`run-on-v0`** function is used — a separate test path.

## Test curl (no UI)

Full procedure with JWT: [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md).

## Automation

- Deno unit: `npm run test:deno`
- Staging E2E: `npm run test:e2e-staging` — needs env vars from the header of [scripts/staging-e2e-v0.mjs](../scripts/staging-e2e-v0.mjs); GitHub: **staging-e2e-v0** workflow (`workflow_dispatch` + secrets).
