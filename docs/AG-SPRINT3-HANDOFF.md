# Sprint 3 AG — handoff (Cursor ↔ AG ↔ Lovable)

Source of truth for community benchmark and leaderboard: migration
`supabase/migrations/20260328120000_sprint3_benchmark_social.sql` (tables `builder_benchmark_scores`,
`user_votes`, `user_comments`, MV `builder_leaderboard`).

## Differences from the AG draft in Notion/Docs

- **MV `builder_leaderboard`:** simplified aggregate per `tool_id` (no LATERAL over votes in the MV — votes live in separate tables; the UI can join or add a second MV later). **UNIQUE (`tool_id`)** on the MV enables `REFRESH MATERIALIZED VIEW CONCURRENTLY`.
- **`user_votes`:** column `vote_kind` (`result` | `pairwise`) — insert RLS for now only for `vote_kind = 'result'`. **Pairwise Arena = parking lot** for stable E2/E3; full Arena may need a separate pair table or schema extension.
- **Marketing PVI** (`src/lib/pvi-calculator.ts`) vs **benchmark PVI** (`src/lib/pvi-engine.ts`, dimensions 1–10) — do not mix copy or labels in the UI.

## Group A / B / C in `score-builder-output`

- **Group A (now):** Edge Function `supabase/functions/score-builder-output/index.ts` writes partial dimensions + `pvi_score` to `builder_benchmark_scores` (pipeline + rubric).
- **Group B/C + Lighthouse:** outside a long Edge invoke — queue, cron, or worker (see `docs/PVI-ORCHESTRATION-MAP.md`).

## Operator: `pg_cron` + refreshing the MV

The `pg_cron` extension is in the project’s base migration. After Sprint 3 migrations are deployed, someone with Supabase access can schedule a job (adjust interval):

```sql
SELECT cron.schedule(
  'refresh-builder-leaderboard',
  '*/10 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard$$
);
```

**Repo:** migration `20260329100000_builder_arena_votes_leaderboard_cron.sql` tries to register this job (every **10 min**). If `cron.schedule` from the SQL migration is not allowed on your plan — run the same SQL manually in the SQL Editor (one-time).

Schema completeness audit (Sprint 3 + arena): [AG-PHASE-E-SCHEMA-AUDIT.md](./AG-PHASE-E-SCHEMA-AUDIT.md).

## Prompt for Lovable (after merge to `main`)

1. In the Lovable project: **Settings → GitHub → Pull** from `main` (commits: migration + optional AG UI + Edge).
2. **Build → Publish** after PM sign-off.
3. Supabase: `supabase db push` / CI migrations + **deploy Edge Functions** if `score-builder-output` changed.
4. Optionally: `pg_cron` job as above.
5. Smoke: `docs/PM-RUN-CHECKLIST.md` — `/leaderboard` may be empty until the first rows exist in `builder_benchmark_scores`; after `REFRESH`, the MV shows data.

## Phase 1 AG (A + C) on `main`

After tasks with no DB dependency are closed: merge UI → Lovable **Pull → Publish** (as above).

## Sprint 3 plan order (summary)

0. Migration + RLS  
1. Phase 1 AG (A + C)  
2. Extend scoring / workers (A fuller, B gradual)  
3. Phase 2 AG (E1–E2–E5) wired to tables  
4. `pg_cron` + Phase 3 (E3, E4)  
5. Phase 4 Marketplace  
6. Phase 5 (VBP + Arena pairwise — last)

## Links

- Sprint close / tests: [SPRINT-CLOSE.md](./SPRINT-CLOSE.md)  
- PVI orchestration: [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md)
