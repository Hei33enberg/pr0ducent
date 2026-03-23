# QA — Phase E after type integration and Group B worker

## Pages

| Path | Expected |
|------|----------|
| `/leaderboard` | When MV has rows: real `avg_pvi`, `avg_ui_quality`, `avg_code_quality`, `total_runs` (no “k” for &lt; 1000). When empty: mock fallback (OK). |
| `/arena` | Vote saved to `builder_arena_votes`; tie = `winner_tool_id` null. |
| `/builders/:id` | Radar + histogram without runtime errors. |
| Compare | After `score-builder-output`: rows in `builder_benchmark_scores`; shortly after **Group B** (HTTP probe) updates B columns + `pvi_score`. |

## Smoke checklist

1. Run build with preview → invoke scoring (product flow to `score-builder-output`).
2. In Supabase check `builder_benchmark_scores`: `score_deploy_readiness`, `score_web_vitals`, … appear after probe.
3. Wait for MV cron (max ~10 min) or `REFRESH MATERIALIZED VIEW CONCURRENTLY` — `/leaderboard` should show real data instead of mocks.

## Known limitations

- Group B in Edge is a **light HTTP probe**, not full Lighthouse — target external runner (see [SCORE-BUILDER-OUTPUT-GROUP-B.md](./SCORE-BUILDER-OUTPUT-GROUP-B.md)).
- Group C: [`benchmark-ai-batch-skeleton`](../supabase/functions/benchmark-ai-batch-skeleton/index.ts) returns **501** until batch AI is implemented.
