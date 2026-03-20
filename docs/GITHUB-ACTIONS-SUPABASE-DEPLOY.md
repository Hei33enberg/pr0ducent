# GitHub Actions — deploy Supabase (migracje + Edge Functions)

Cel: po merge na `main` **jeden job** stosuje migracje i publikuje funkcje Edge, zamiast robić to wyłącznie z Lovable CLI lub ręcznie.

## Kiedy tego nie używasz (Lovable Cloud)

Jeśli backend Supabase jest **zarządzany przez Lovable** i **nie masz** własnego konta z dostępem do tego projektu na [supabase.com](https://supabase.com/dashboard), **nie wyciągniesz** sensownego `SUPABASE_ACCESS_TOKEN` ani hasła bazy — i **nie musisz**: zostaw workflow nieuruchomiony i polegaj na deployu z Lovable. Szczegóły: [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

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
3. Webhook **INSERT `run_tasks`** — w Dashboard lub innym mechanizmie (np. migracja z `pg_net`); patrz [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md) i [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## Powiązane

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [SPRINT-CLOSE.md](./SPRINT-CLOSE.md)
