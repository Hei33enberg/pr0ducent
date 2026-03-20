# Supabase: `run_tasks` → `process-task-queue` (trigger `pg_net`)

## Mechanizm w repozytorium

Po **INSERT** do `public.run_tasks` może działać trigger **`trg_run_tasks_auto_dispatch`**, który wysyła asynchroniczny POST do Edge Function **`process-task-queue`** przez **`pg_net`** (migracja [`20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql`](../supabase/migrations/20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql)).

Trigger czyta Bearer token z:

1. `current_setting('supabase.service_role_key', true)` (gdy dostępne), albo  
2. **`vault.decrypted_secrets`** o nazwie **`service_role_key`**.

**Sekret Vault ustawia się poza gitem** (UI Vault lub jednorazowe SQL) — patrz komentarz w [`20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql`](../supabase/migrations/20260320222502_85ade99a-2c89-4b30-bd3d-edbc091341f7.sql). **Nigdy nie commituj service_role JWT do repozytorium.**

**Bez triggera / bez sekretu w Vault:** `dispatch-builders` nadal woła `process-task-queue` i ma **inline fallback**.

**Lovable Cloud / brak własnego Supabase:** [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## Jak to działa (gdy trigger jest aktywny i Vault ma sekret)

1. `dispatch-builders` wstawia wiersze do `run_tasks` (status `queued`).
2. Trigger `trg_run_tasks_auto_dispatch` odpala się dla każdego wiersza.
3. `net.http_post` wysyła POST do `process-task-queue` z `{"run_job_id": "..."}`.
4. Worker woła RPC `builder_try_dispatch_slot`, uwzględnia `circuit_state`, dispatchuje adapter.
5. Inline fallback w `dispatch-builders` zostaje jako zapas.

**Schemat:** pełna logika workerów wymaga m.in. `20260322120000_vbp_orchestration.sql` (`circuit_state`, `next_retry_at`).

**URL Edge w triggerze** jest powiązany z hostem projektu w migracji — przy nowym projekcie zaktualizuj funkcję lub użyj ręcznego Database Webhook poniżej.

## Weryfikacja

```sql
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_run_tasks_auto_dispatch';

SELECT name FROM vault.decrypted_secrets WHERE name = 'service_role_key';

SELECT count(*) FROM run_tasks
WHERE status = 'queued' AND created_at < now() - interval '5 minutes';
```

## Ręczna alternatywa: Database Webhook (Dashboard)

1. **Database** → **Webhooks** → nowy hook.  
2. Tabela `public.run_tasks`, zdarzenie **INSERT**.  
3. URL: `https://<PROJECT_REF>.supabase.co/functions/v1/process-task-queue`  
4. Nagłówki: `Authorization: Bearer <SERVICE_ROLE_KEY>`, `Content-Type: application/json`.

## Bezpieczeństwo

- Service role tylko po stronie serwera (Vault, webhook, sekrety Edge).
- `process-task-queue`: `verify_jwt = false`, walidacja nagłówka Authorization w kodzie.

## Powiązane

- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- [scripts/README-queue-worker.md](../scripts/README-queue-worker.md) — skrypt weryfikacji SQL + podsumowanie ścieżek
