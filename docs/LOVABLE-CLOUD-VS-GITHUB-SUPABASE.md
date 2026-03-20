# Lovable Cloud vs GitHub Actions vs Supabase — co da się, a czego nie

Krótki przewodnik, żeby nie kręcić się w kółko: **skąd się bierze `SUPABASE_ACCESS_TOKEN`**, czemu **nie ma go w Secrets Lovable**, i kiedy **w ogóle nie musisz nic wklejać w GitHub**.

## Trzy osobne rzeczy

1. **Sekrety w Lovable Cloud** (`V0_API_KEY`, `STRIPE_*`, itd.) — idą do **Edge Functions** hostowanych przy Twoim projekcie. To nie jest to samo co token do API Supabase Management.
2. **`SUPABASE_SERVICE_ROLE_KEY`** — Supabase wstrzykuje go **automatycznie** do funkcji; nie powinien trafiać do frontu ani do publicznego repo.
3. **`SUPABASE_ACCESS_TOKEN` (Personal Access Token)** — to token **konta użytkownika** na [supabase.com](https://supabase.com/dashboard/account/tokens). Służy m.in. CLI i automatyzacji **na projektach, do których to konto ma dostęp**.

## Dlaczego nie „wyciągniesz” PAT z Lovable

W modelu **Lovable zarządza backendem Supabase za Ciebie** często **nie masz** klasycznego logowania do tego samego projektu w dashboardzie Supabase ani członkostwa pod swoim emailem. Wtedy:

- **Nie zalogujesz się** na supabase.com do „tego samego” projektu, żeby wygenerować PAT z dostępem do niego.
- **Workflow** [.github/workflows/supabase-deploy.yml](../.github/workflows/supabase-deploy.yml) z dokumentu [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md) **nie jest dla Ciebie obowiązkowy** — to alternatywa na moment, gdy **Ty** posiadasz projekt Supabase pod swoim kontem.

**Wniosek:** jeśli deploy migracji i Edge Functions robi **Lovable** po pullu z GitHub, **możesz pominąć** dodawanie sekretów `SUPABASE_*` w GitHubie. Nic nie jest „zepsute” przez ich brak.

## Hasło bazy (`SUPABASE_DB_PASSWORD`)

Potrzebne tylko wtedy, gdy **CLI** przy `supabase db push` o to poprosi. Przy hostingu przez Lovable hasło często **nie jest pokazywane** w UI — wtedy znowu: **deploy bazy idzie przez Lovable**, nie przez Actions.

## Kolejka `run_tasks` bez Dashboardu Supabase

- **`dispatch-builders`** po wstawieniu zadań **i tak woła** `process-task-queue` (service role) i ma **inline fallback**, więc podstawowy flow działa bez Database Webhook.
- **Database Webhook** lub trigger **pg_net** to dodatkowa niezawodność / szybsze zdejmowanie kolejki. Jeśli Lovable twierdzi, że dodał trigger w bazie, upewnij się, że **ta sama logika jest w repozytorium** (migracja SQL w `supabase/migrations/`) — inaczej masz **dryf** między chmurą a `main`.

Instrukcja webhooka z panelu: [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md).

## Co dalej, jeśli chcesz pełną kontrolę (PAT + hasło + webhook w UI)

1. **Nowy projekt Supabase** pod swoim kontem (lub transfer projektu — zależnie od polityki Lovable).
2. Podłączenie frontu (Vercel itd.) i zmienne `VITE_SUPABASE_*` — szkic: [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md).
3. Wtedy dopiero sens ma **PAT w GitHubie** + opcjonalnie workflow `supabase-deploy`.

## Powiązane

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [BUILDERS-101-PL.md](./BUILDERS-101-PL.md)
