# Queue `run_tasks` → `process-task-queue` — what is in the repo

## Automated path (no Dashboard Webhook)

1. Trigger migration: [`supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql`](../supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql) — `pg_net.http_post` to Edge `process-task-queue`.
2. Vault secret `service_role_key` — **one-time** in Supabase (Vault UI or SQL), **never in git** — see [`20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql`](../supabase/migrations/20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql).
3. Verification: [`verify-queue-trigger.sql`](./verify-queue-trigger.sql).

## Alternative: Database Webhook (Dashboard)

Instructions: [docs/SUPABASE-WEBHOOK-RUN-TASKS.md](../docs/SUPABASE-WEBHOOK-RUN-TASKS.md).

## Management API (GitHub / CI)

The public Supabase REST API **does not** generally expose creating “Database Webhooks” like the UI — so the plan uses **migration + Vault** instead of a `provision-*` script with a token. Workflow [`.github/workflows/supabase-deploy.yml`](../.github/workflows/supabase-deploy.yml) covers migrations and Edge Functions, not webhook configuration in the dashboard.

## Fallback

`dispatch-builders` calls `process-task-queue` inline — the queue does not depend on the trigger alone if the worker is deployed.
