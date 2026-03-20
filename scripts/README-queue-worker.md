# Kolejka `run_tasks` → `process-task-queue` — co jest w repo

## Zautomatyzowana ścieżka (bez Dashboard Webhook)

1. Migracja triggera: [`supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql`](../supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql) — `pg_net.http_post` na Edge `process-task-queue`.
2. Sekret Vault `service_role_key` — **jednorazowo** w panelu Supabase (Vault UI lub SQL), **nigdy w commicie** — patrz [`20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql`](../supabase/migrations/20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql).
3. Weryfikacja: [`verify-queue-trigger.sql`](./verify-queue-trigger.sql).

## Alternatywa: Database Webhook (Dashboard)

Instrukcja: [docs/SUPABASE-WEBHOOK-RUN-TASKS.md](../docs/SUPABASE-WEBHOOK-RUN-TASKS.md).

## Management API (GitHub / CI)

Publiczne REST API Supabase **nie udostępnia** powszechnie tworzenia „Database Webhooks” jak w UI — dlatego w planie przyjęto **migrację + Vault** zamiast skryptu `provision-*` z tokenem. Workflow [`.github/workflows/supabase-deploy.yml`](../.github/workflows/supabase-deploy.yml) dotyczy migracji i Edge Functions, nie konfiguracji webhooków w panelu.

## Fallback

`dispatch-builders` woła `process-task-queue` inline — kolejka nie musi wisieć na samym triggerze, jeśli worker jest wdrożony.
