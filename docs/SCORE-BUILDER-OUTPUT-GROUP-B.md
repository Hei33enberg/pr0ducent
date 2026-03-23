# score-builder-output — next iteration (Group B)

**Goal:** add dimensions from headless probe / AI **outside** the critical Edge path (timeout, cost).

## State in repo (MVP)

- Edge [`benchmark-probe-group-b`](../supabase/functions/benchmark-probe-group-b/index.ts): after successful Group A write, invoked from [`score-builder-output`](../supabase/functions/score-builder-output/index.ts) (fire-and-forget). Does **GET** `preview_url`, computes deploy / web vitals / mobile / a11y heuristics (proxy), updates `builder_benchmark_scores` and `run_events` `score.group_b_probe`.
- Full Lighthouse / axe: still a **separate runner** (below).

## Lighthouse (batch or worker ≤ ~25 s per URL)

- **Input:** `builder_results.preview_url` after a stable build.
- **Output (columns):** `score_web_vitals`, `score_accessibility`, `score_mobile_responsiveness` (and optionally a fragment for deploy readiness).
- **Where to run:** separate worker (GHA scheduled, external runner, short queue job) — **not** full Lighthouse in one long `score-builder-output` invoke, unless hard time limit and small scope.

## AI scoring (screenshot / code)

- **Models:** GPT-4o / Gemini Vision (product decision: cost, quality).
- **Output (columns):** `score_ui_quality`, `score_code_quality`, `score_completeness` + extended `ai_reasoning` JSONB per dimension.
- **Batch:** every N minutes / token cap — per AG plan (Group C can partly share this path).

## Contract

- Update row in `builder_benchmark_scores` by `builder_result_id` / `run_task_id`.
- After write: next `REFRESH` MV (or rely on `pg_cron` every 10 min).

Related: [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md), [AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md).
