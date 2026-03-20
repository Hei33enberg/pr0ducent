# PM / QA — jak sprawdzić pełny run orkiestracji (5 min)

Indeks operacyjny (Lovable, webhook, smoke): [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md).

## Ważne: `/compare` to nie silnik runów

Strona **Compare** (`/compare`) to tabela marketingowa funkcji. **Nie uruchamia** builderów ani nie zapisuje `run_jobs`.

Pełna orkiestracja działa na **stronie głównej** po zalogowaniu, gdy eksperyment ma **UUID z bazy** (`experiments.id`).

## Checklist

1. **Zaloguj się** (konto z aktywną subskrypcją / limitem promptów).
2. Na **Home** wpisz prompt, wybierz narzędzia (np. v0), uruchom generację.
3. Upewnij się, że powstał eksperyment **zsynchronizowany z DB** (po zapisie `createExperimentInDb` w UI widzisz ten sam eksperyment w historii — `id` powinien być prawdziwym UUID, nie tylko mock).
4. **Oczekiwane w UI:** kafelki / wyniki dla wybranych narzędzi; dla v0 status przechodzi z generowania w completed lub error w rozsądnym czasie.
5. **Supabase (Table Editor lub SQL):**
   - `run_jobs` — ostatni wiersz dla Twojego `experiment_id`: status końcowy joba.
   - `run_tasks` — po jednym wierszu na narzędzie; status **nie powinien wisieć wiecznie na `queued`** (po kilku minutach: `building`, `completed`, `failed`, `benchmark` itd.).
   - `builder_results` — `status`, `preview_url` / `chat_url`, `provider_run_id` dla v0.
   - `run_events` (opcjonalnie) — zdarzenia `orchestrator.*`, `builder.*`.

## SQL — szybki podgląd ostatniego runu

Zamień `EXPERIMENT_UUID`:

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

## Gość (bez logowania)

Gość **nie** przechodzi przez `dispatch-builders` / `run_jobs`. Dla v0 używana jest funkcja **`run-on-v0`** — to osobna ścieżka testowa.

## Test curl (bez UI)

Pełna procedura z JWT: [SMOKE-TEST-ORCHESTRATOR.md](./SMOKE-TEST-ORCHESTRATOR.md).

## Automatyzacja

- Deno unit: `npm run test:deno`
- Staging E2E: `npm run test:e2e-staging` — wymaga zmiennych z nagłówka [scripts/staging-e2e-v0.mjs](../scripts/staging-e2e-v0.mjs); GitHub: workflow **staging-e2e-v0** (`workflow_dispatch` + sekrety).
