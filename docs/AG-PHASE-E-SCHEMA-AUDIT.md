# Schema audit — Phase E (benchmark + leaderboard + arena)

## Migration `20260328120000_sprint3_benchmark_social.sql` (commit `0e96c74` / Sprint 3 baseline)

| Requirement | Status |
|---------------|--------|
| 10 `score_*` columns (0–100, NUMERIC + CHECK) | Yes: speed, reliability, cost_efficiency, deploy_readiness, mobile_responsiveness, accessibility, web_vitals, ui_quality, completeness, code_quality |
| `pvi_score`, `scoring_model`, `ai_reasoning` JSONB | Yes |
| `UNIQUE(builder_result_id)` | Yes |
| RLS read for **public** experiments (`anon` + `authenticated`) | Yes — policy “Anyone can view benchmark scores for public experiments” |
| RLS read for owner | Yes — “Users can view benchmark scores for own experiments” |
| MV `builder_leaderboard` + **UNIQUE (`tool_id`)** | Yes — `builder_leaderboard_tool_id_uidx` (required for `REFRESH … CONCURRENTLY`). Migration `20260330120000_extend_builder_leaderboard_mv.sql` adds `avg_speed`, `avg_ui_quality`, `avg_code_quality` (aggregates from `builder_benchmark_scores`). |
| `GRANT SELECT` on MV for `anon`, `authenticated` | Yes |

Edge write (`score-builder-output`) uses `SCORING_MODEL_VERSION` + JSON `ai_reasoning` per columns above.

## Migration `20260329100000_builder_arena_votes_leaderboard_cron.sql`

| Element | Description |
|---------|-------------|
| `builder_arena_votes` | `experiment_id`, `tool_a_id`, `tool_b_id`, `winner_tool_id` (NULL = tie), `user_id` **nullable** (anon), RLS INSERT/SELECT on **public** experiments + SELECT for owner |
| `pg_cron` | Job `refresh-builder-leaderboard` — `*/10 * * * *` → `REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard` |

If `cron.schedule` in the migration warns (e.g. permissions), run the same SQL in Supabase SQL Editor as superuser — see [AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md).

## Next iteration: Group B in `score-builder-output`

Plan details (Lighthouse / AI, outside long Edge): [SCORE-BUILDER-OUTPUT-GROUP-B.md](./SCORE-BUILDER-OUTPUT-GROUP-B.md).

## Pairwise — `user_votes` vs `builder_arena_votes`

- **Simple up/down** on a result: `user_votes` table (`vote_kind = 'result'`).
- **Arena (A/B pair):** `builder_arena_votes` — UI in `src/hooks/usePairwiseVote.ts`.
