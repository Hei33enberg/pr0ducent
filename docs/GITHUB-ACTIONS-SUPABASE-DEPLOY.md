# GitHub Actions — deploy Supabase (migracje + Edge Functions)

Cel: po merge na `main` **jeden job** stosuje migracje i publikuje funkcje Edge, zamiast robić to wyłącznie z Lovable CLI lub ręcznie.

## Jednorazowa konfiguracja (sekrety repozytorium)

W **GitHub → Settings → Secrets and variables → Actions** dodaj:

| Sekret | Opis |
|--------|------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token z [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) (uprawnienia do projektu). |
| `SUPABASE_PROJECT_REF` | Krótki identyfikator projektu z URL: `https://<PROJECT_REF>.supabase.co`. |

Opcjonalnie, jeśli `supabase db push` w Twojej wersji CLI wymaga hasła bazy:

| Sekret | Opis |
|--------|------|
| `SUPABASE_DB_PASSWORD` | Hasło bazy z **Project Settings → Database** (nie commituj). |

Workflow ustawia je jako `env` dla kroków CLI (patrz [.github/workflows/supabase-deploy.yml](../.github/workflows/supabase-deploy.yml)).

## Zachowanie workflow

- Domyślnie: **`workflow_dispatch`** (ręczne uruchomienie w zakładce Actions) — bezpieczny start zanim zaufasz pełnej automatyzacji.
- Opcjonalnie odkomentuj trigger `push` / `branches: [main]` w pliku workflow, gdy chcesz deploy przy każdym merge.

## Po deployu

1. Sprawdź log joba w GitHub Actions.
2. W Supabase: **Edge Functions** i **Database** — czy wersje i migracje są na miejscu.
3. Webhook **INSERT `run_tasks`** nadal konfiguruje się w Dashboard (albo osobny proces); patrz [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md).

## Powiązane

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [SPRINT-CLOSE.md](./SPRINT-CLOSE.md)
