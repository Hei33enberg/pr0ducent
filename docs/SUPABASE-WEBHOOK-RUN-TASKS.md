# Supabase: Database Webhook → `process-task-queue`

Cel: po **INSERT** do `public.run_tasks` worker Edge Function od razu zdejmuje kolejkę, zamiast polegać wyłącznie na wywołaniach z `dispatch-builders` (inline fallback).

## Wymagania

- Edge Function **`process-task-queue`** wdrożona z `verify_jwt = false` i wywoływana **tylko** z **Service Role** (nigdy z anon w przeglądarce).
- Sekret **`SUPABASE_SERVICE_ROLE_KEY`** znany tylko operatorowi (Dashboard → Settings → API).

**Schemat bazy:** aktualny kod `process-task-queue` zakłada kolumny z migracji `20260322120000_vbp_orchestration.sql` (m.in. `builder_integration_config.circuit_state`, `run_tasks.next_retry_at`). Jeśli Supabase zwraca błąd „column does not exist”, **zastosuj brakujące migracje** — nie upraszczaj funkcji Edge zamiast aktualizacji bazy.

## Kroki (Supabase Dashboard)

1. Zaloguj się do projektu → **Database**.
2. Otwórz **Webhooks** (lub **Integrations** → Database Webhooks — nazwa zależy od wersji UI).
3. **Create a new hook**:
   - **Table:** `public.run_tasks`
   - **Events:** `INSERT` (wystarczy; opcjonalnie też `UPDATE` jeśli kiedyś task wraca do `queued` przez update — dziś głównie INSERT).
   - **Type:** Supabase Edge Function *albo* **HTTP Request** (jeśli wybierasz surowy URL funkcji).

### Jeśli typ = HTTP Request

- **URL:**  
  `https://<PROJECT_REF>.supabase.co/functions/v1/process-task-queue`  
  (`PROJECT_REF` z Settings → API → Project URL.)
- **HTTP method:** `POST`
- **Headers:** dodaj dokładnie:
  - `Authorization`: `Bearer <SERVICE_ROLE_KEY>`  
  - `Content-Type`: `application/json`
- **Body:** może być pusty `{}` lub domyślny payload webhooka — worker i tak czyta opcjonalnie `run_job_id` z JSON, jeśli go wyślesz.

### Weryfikacja

1. Uruchom jeden dispatch (zalogowany user, v0) — patrz [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md).
2. **Edge Functions → Logs** → `process-task-queue`: powinny pojawić się wywołania po każdym nowym wierszu `run_tasks`.
3. SQL — brak „wiecznego” `queued`:

```sql
SELECT count(*) FROM run_tasks
WHERE status = 'queued' AND created_at < now() - interval '5 minutes';
```

## Bezpieczeństwo

- Nie wklejaj service role do repozytorium ani do Lovable jako publicznej zmiennej frontu.
- Webhook trzymaj wyłącznie po stronie Supabase (sekret w konfiguracji hooka).

## Powiązane

- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
