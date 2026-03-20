# Prompt dla Lovable (Sprint 3 AG — benchmark + social)

Skopiuj poniżej do czatu z Lovable / ticketu dla operatora hostingu frontu.

---

**Sprint 3 backend jest na `main`:** migracja `20260328120000_sprint3_benchmark_social.sql`, rozszerzony `score-builder-output` (Grupa A → `builder_benchmark_scores`). Szczegóły techniczne: [`AG-SPRINT3-HANDOFF.md`](./AG-SPRINT3-HANDOFF.md).

**Twoje kroki:**

1. W Lovable: **projekt → Settings → GitHub → Pull** z brancha **`main`** (wciągnij najnowsze commity z GitHub).
2. Poczekaj na **build**; napraw ewentualne błędy TS jeśli AG ma lokalne zmiany do zmergowania później.
3. **Publish** dopiero po akceptacji PM.
4. **Supabase (osobno od Lovable):** wdrożyć migracje (`supabase db push` / Dashboard) + **deploy Edge Functions** (`score-builder-output` się zmienił).
5. Opcjonalnie SQL w Supabase: `pg_cron` + `REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard` — fragment w [`AG-SPRINT3-HANDOFF.md`](./AG-SPRINT3-HANDOFF.md).
6. Smoke: [`PM-RUN-CHECKLIST.md`](./PM-RUN-CHECKLIST.md). `/leaderboard` może być puste do czasu pierwszych score’ów — OK.

---

*Plik utworzony żeby prompt był w jednym miejscu w repo; nie zastępuje pełnego handoffu.*
