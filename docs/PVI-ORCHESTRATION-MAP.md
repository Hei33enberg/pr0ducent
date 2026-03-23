# PVI (10 dimensions) — mapping to the orchestration layer

Goal: one page tying the AG product benchmark plan to the existing broker (`run_tasks`, `builder_results`, VBP).

## Cost groups (as in the AG plan)

| Group | Dimensions (example names) | Where data comes from in the broker |
|-------|----------------------------|--------------------------------|
| **A — from pipeline** | Speed, Reliability, Cost efficiency | `run_tasks` (status timing, `attempt_count`), `run_events` (`orchestrator.*`, `builder.*`), `run_jobs.metadata`, VBP `billing_cost_tokens` / `compute_units_used` when the builder supplies them ([VBP-SPEC.md](./VBP-SPEC.md)) |
| **B — headless after build** | Deploy readiness, Mobile score, a11y, Web Vitals | URL from `builder_results.preview_url` / `deploy_url` after `artifact_ready` / `completed`; async job (Edge cron, worker, or GHA) writes results to a row keyed by `experiment_id`, `tool_id`, `run_task_id` |
| **C — AI batch** | UI quality, Completeness, Code quality | Batch queue (every N min, token budget), input: artifact + metadata; `score-builder-output` as baseline + reasoning, extend with per-dimension metrics table |

## VBP / POP contract

- VBP-compliant builders report telemetry and export in one model; the broker does not duplicate v0 logic — map fields to cost dimensions (Group A) and optionally event webhooks ([VBP-SPEC.md](./VBP-SPEC.md), public bundle: [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)).

## Tables and extensions (direction)

- Today: `experiment_runs.scores` (JSON), `builder_results`, `run_events`.
- **Sprint 3:** `builder_benchmark_scores`, `user_votes`, `user_comments`, MV `builder_leaderboard` — migration `20260328120000_sprint3_benchmark_social.sql`; Group A writes from `score-builder-output` (details: [AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md)).
- Later: optional `builder_metric_scores` (`experiment_id`, `tool_id`, `run_task_id`, `dimension`, `value`, `source`) if splitting columns into many rows is easier than one row per result.

## Related

- [ORCHESTRATOR.md](./ORCHESTRATOR.md)
- [AG-SPRINT3-HANDOFF.md](./AG-SPRINT3-HANDOFF.md)
- [score-builder-output](../supabase/functions/score-builder-output/index.ts)
