# Queue — observability and alerts

## Migration order (important)

Function `builder_try_dispatch_slot` from **`20260325100000_builder_dispatch_slot_rpc.sql`** requires table **`builder_rate_limits`** (normally from **`20260322120000_vbp_orchestration.sql`**). If someone deployed only `25100000`, migration **`20260326120000_ensure_builder_rate_limits.sql`** creates the table idempotently.

## Source of truth: `max_per_minute` for `v0`

The repo seeds **`builder_rate_limits`** for `tool_id = 'v0'` with **`max_per_minute = 30`** (e.g. `20260322120000_vbp_orchestration.sql`, `20260326120000_ensure_builder_rate_limits.sql`). If the dashboard shows a different value, it was overridden manually — align with product and record in a migration or ops doc.

## Symptom: tasks stuck in `queued`

Worker [`process-task-queue`](../supabase/functions/process-task-queue/index.ts) should drain `run_tasks` with status `queued` or `retrying` (when `next_retry_at` has passed). [`dispatch-builders`](../supabase/functions/dispatch-builders/index.ts) also does **inline drain** — if tasks stay `queued` after worker calls, the issue is missing worker deploy, missing **`pg_net`** trigger, missing Vault secret, wrong **Database Webhook**, or an adapter error.

### Automatic checklist (`pg_net` trigger in repo)

Migration [`20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql`](../supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql) + Vault secret — details: [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md), SQL script: [`scripts/verify-queue-trigger.sql`](../scripts/verify-queue-trigger.sql).

### Webhook checklist (Supabase Dashboard)

1. Database Webhooks → trigger on `INSERT` (or `INSERT` + filter) on `public.run_tasks`.
2. URL: `https://<PROJECT_REF>.supabase.co/functions/v1/process-task-queue`
3. HTTP POST with header `Authorization: Bearer <SERVICE_ROLE_KEY>` (secret not in URL).
4. Payload: default JSON is enough; worker optionally reads `run_job_id` from body.

### SQL — how many `queued` tasks older than N minutes

```sql
SELECT count(*) AS stuck_queued,
       min(created_at) AS oldest
FROM run_tasks
WHERE status = 'queued'
  AND created_at < now() - interval '5 minutes';
```

### SQL — `retrying` with overdue `next_retry_at`

```sql
SELECT id, tool_id, experiment_id, next_retry_at, error_message
FROM run_tasks
WHERE status = 'retrying'
  AND (next_retry_at IS NULL OR next_retry_at < now() - interval '1 hour')
ORDER BY updated_at DESC
LIMIT 50;
```

## Metrics (proposal)

- **Supabase Log Explorer** / Edge Logs: frequency of `process-task-queue` 403 (missing Bearer), 200 with `processed: 0`.
- **External monitor** (e.g. cron + SQL via service role): alert when `stuck_queued > 0`.
- **Rate limit:** RPC `builder_try_dispatch_slot(tool_id)` (migration `20260325100000`) + `builder_rate_limits`. On slot rejection the task gets `retrying` and `error_message` prefix `rate_limit:`.

## Related docs

- [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) — function deploy
- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md) — product verification
- [REALTIME-GUARDRAILS.md](./REALTIME-GUARDRAILS.md) — channels and throttle (AG plan)
