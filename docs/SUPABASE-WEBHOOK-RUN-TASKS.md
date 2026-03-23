# Supabase: `run_tasks` → `process-task-queue` (trigger `pg_net`)

## Mechanism in the repo

On **INSERT** into `public.run_tasks`, trigger **`trg_run_tasks_auto_dispatch`** may send an async POST to Edge Function **`process-task-queue`** via **`pg_net`** (migration [`20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql`](../supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql)).

The trigger reads the Bearer token from:

1. `current_setting('supabase.service_role_key', true)` (when available), or  
2. **`vault.decrypted_secrets`** named **`service_role_key`**.

**Set the Vault secret outside git** (Vault UI or one-off SQL) — see the comment in [`20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql`](../supabase/migrations/20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql). **Never commit service_role JWT to the repo.**

**Without trigger / without Vault secret:** `dispatch-builders` still calls `process-task-queue` and has an **inline fallback**.

**Lovable Cloud / no own Supabase:** [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## How it works (when trigger is active and Vault has the secret)

1. `dispatch-builders` inserts rows into `run_tasks` (status `queued`).
2. Trigger `trg_run_tasks_auto_dispatch` fires for each row.
3. `net.http_post` sends POST to `process-task-queue` with `{"run_job_id": "..."}`.
4. Worker calls RPC `builder_try_dispatch_slot`, respects `circuit_state`, dispatches adapter.
5. Inline fallback in `dispatch-builders` remains as backup.

**Schema:** full worker logic needs e.g. `20260322120000_vbp_orchestration.sql` (`circuit_state`, `next_retry_at`).

**Edge URL in the trigger** is tied to the project host in the migration — for a new project, update the function or use the manual Database Webhook below.

## Verification

```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_run_tasks_auto_dispatch';

SELECT name FROM vault.decrypted_secrets WHERE name = 'service_role_key';

SELECT count(*) FROM run_tasks
WHERE status = 'queued' AND created_at < now() - interval '5 minutes';
```

## Manual alternative: Database Webhook (Dashboard)

1. **Database** → **Webhooks** → new hook.  
2. Table `public.run_tasks`, event **INSERT**.  
3. URL: `https://<PROJECT_REF>.supabase.co/functions/v1/process-task-queue`  
4. Headers: `Authorization: Bearer <SERVICE_ROLE_KEY>`, `Content-Type: application/json`.

## Security

- Service role only server-side (Vault, webhook, Edge secrets).
- `process-task-queue`: `verify_jwt = false`, validate `Authorization` header in code.

## Related

- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- [scripts/README-queue-worker.md](../scripts/README-queue-worker.md) — SQL verification script + path summary
