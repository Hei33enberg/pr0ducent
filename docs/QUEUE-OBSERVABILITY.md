# Kolejka — obserwowalność i alerty

## Kolejność migracji (ważne)

Funkcja `builder_try_dispatch_slot` z **`20260325100000_builder_dispatch_slot_rpc.sql`** wymaga tabeli **`builder_rate_limits`** (standardowo z **`20260322120000_vbp_orchestration.sql`**). Jeśli ktoś wdrożył tylko `25100000`, migracja **`20260326120000_ensure_builder_rate_limits.sql`** tworzy tabelę idempotentnie.

## Symptom: zadania wiszą w `queued`

Worker [`process-task-queue`](../supabase/functions/process-task-queue/index.ts) powinien zdejmować `run_tasks` ze statusem `queued` lub `retrying` (gdy `next_retry_at` minął). [`dispatch-builders`](../supabase/functions/dispatch-builders/index.ts) dodatkowo robi **inline drain** — jeśli po wywołaniach workera nadal są `queued`, problemem jest brak deployu workera, zły **Database Webhook**, lub błąd w adapterze.

### Checklist webhook (Supabase Dashboard)

1. Database Webhooks → trigger na `INSERT` (lub `INSERT` + filtr) na `public.run_tasks`.
2. URL: `https://<PROJECT_REF>.supabase.co/functions/v1/process-task-queue`
3. HTTP POST z nagłówkiem `Authorization: Bearer <SERVICE_ROLE_KEY>` (sekret nie w URL).
4. Payload: domyślny JSON wystarczy; worker czyta opcjonalnie `run_job_id` z body.

### SQL — ile zadań `queued` starszych niż N minut

```sql
SELECT count(*) AS stuck_queued,
       min(created_at) AS oldest
FROM run_tasks
WHERE status = 'queued'
  AND created_at < now() - interval '5 minutes';
```

### SQL — `retrying` z przeterminowanym `next_retry_at`

```sql
SELECT id, tool_id, experiment_id, next_retry_at, error_message
FROM run_tasks
WHERE status = 'retrying'
  AND (next_retry_at IS NULL OR next_retry_at < now() - interval '1 hour')
ORDER BY updated_at DESC
LIMIT 50;
```

## Metryki (propozycja)

- **Supabase Log Explorer** / Edge Logs: częstotliwość `process-task-queue` 403 (brak Bearer), 200 z `processed: 0`.
- **Zewnętrzny monitor** (np. cron + SQL przez service role): alert gdy `stuck_queued > 0`.
- **Rate limit:** RPC `builder_try_dispatch_slot(tool_id)` (migracja `20260325100000`) + `builder_rate_limits`. Przy odrzuceniu slotu zadanie dostaje `retrying` i `error_message` prefiks `rate_limit:`.

## Powiązane dokumenty

- [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) — deploy funkcji
- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md) — weryfikacja produktowa
