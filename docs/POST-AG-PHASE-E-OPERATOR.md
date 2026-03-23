# Operator (Lovable) — after commit `e5b616d` and Cursor migrations

## You (human in Lovable UI)

1. **Settings → GitHub → Pull** from branch **`main`** (latest front + types).
2. Wait for **build** → **Publish** after PM approval.
3. **Do not** re-run migrations or redeploy Edge if Supabase is already in sync with the repo — unless Cursor added a **new** file under `supabase/migrations/` (then `db push` / pipeline).

## Cursor (repo)

- After adding migration **`20260330120000_extend_builder_leaderboard_mv.sql`**: apply it on the Supabase project, then optionally **refresh types** in [`src/integrations/supabase/types.ts`](../src/integrations/supabase/types.ts) if you generate from CLI.
- Deploy Edge: **`benchmark-probe-group-b`**, **`benchmark-ai-batch-skeleton`** (501 skeleton) together with existing functions.

Related: [POST-AG-PHASE-E-QA.md](./POST-AG-PHASE-E-QA.md), [SCORE-BUILDER-OUTPUT-GROUP-B.md](./SCORE-BUILDER-OUTPUT-GROUP-B.md).
