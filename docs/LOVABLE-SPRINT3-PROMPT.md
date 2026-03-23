# Prompt for Lovable (Sprint 3 AG — benchmark + social)

**Note:** **Pull from GitHub** is done in the **Lovable UI** (Settings → GitHub → Pull). Neither the Lovable chat nor Cursor can click it for you.

Copy the block below into a **ticket / operator runbook** (do not expect the Lovable assistant to sync the repo for you).

---

**Sprint 3 backend is on `main`:** migration `20260328120000_sprint3_benchmark_social.sql`, extended `score-builder-output` (Group A → `builder_benchmark_scores`). Technical details: [`AG-SPRINT3-HANDOFF.md`](./AG-SPRINT3-HANDOFF.md).

**Your steps:**

1. In Lovable: **project → Settings → GitHub → Pull** from branch **`main`** (pull latest commits from GitHub).
2. Wait for **build**; fix any TS errors if AG has local changes to merge later.
3. **Publish** only after PM approval.
4. **Supabase (separate from Lovable):** deploy migrations (`supabase db push` / Dashboard) + **deploy Edge Functions** (`score-builder-output` changed).
5. Optional SQL in Supabase: `pg_cron` + `REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard` — snippet in [`AG-SPRINT3-HANDOFF.md`](./AG-SPRINT3-HANDOFF.md).
6. Smoke: [`PM-RUN-CHECKLIST.md`](./PM-RUN-CHECKLIST.md). `/leaderboard` may be empty until the first scores — OK.

---

*This file exists so the prompt lives in one place in the repo; it does not replace the full handoff.*
