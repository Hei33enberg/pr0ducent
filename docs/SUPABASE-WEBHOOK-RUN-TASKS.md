# Supabase: Auto-webhook `run_tasks` → `process-task-queue`

## Mechanizm (automatyczny od migracji)

Po **INSERT** do `public.run_tasks` trigger bazodanowy `trg_run_tasks_auto_dispatch` automatycznie wysyła POST do Edge Function `process-task-queue` przez rozszerzenie `pg_net`.

**Nie trzeba konfigurować niczego ręcznie w dashboardzie.**

Trigger używa klucza `service_role_key` z Supabase Vault (zapisany automatycznie przez migrację).

## Jak to działa

1. `dispatch-builders` insertuje wiersze do `run_tasks` (status `queued`).
2. Trigger `trg_run_tasks_auto_dispatch` odpala się per wiersz.
3. `pg_net.http_post` wysyła async POST do `process-task-queue` z `run_job_id`.
4. Worker zdejmuje zadanie z kolejki, sprawdza rate limit (RPC `builder_try_dispatch_slot`), circuit breaker (`builder_integration_config.circuit_state`), i dispatchuje do adaptera.
5. Fallback inline w `dispatch-builders` zostaje jako backup.

## Weryfikacja

```sql
-- Trigger istnieje?
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_run_tasks_auto_dispatch';

-- Vault secret istnieje?
SELECT name FROM vault.decrypted_secrets WHERE name = 'service_role_key';

-- Brak zawieszonych tasków?
SELECT count(*) FROM run_tasks
WHERE status = 'queued' AND created_at < now() - interval '5 minutes';
```

## Bezpieczeństwo

- Service role key jest w Supabase Vault (zaszyfrowany), nie w kodzie ani env frontu.
- Trigger function jest `SECURITY DEFINER` z `search_path = 'public'`.
- Edge Function `process-task-queue` ma `verify_jwt = false` ale sprawdza Bearer === service role.

## Powiązane

- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
