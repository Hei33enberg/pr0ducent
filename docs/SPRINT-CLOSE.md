# Sprint close — orchestrator + docs (2026-03-21)

## Shipped in this iteration

- **Adapter registry pattern:** `resolveAdapterKind` + `dispatchV0Adapter` + `dispatchBenchmarkAdapter`; slim [`dispatch-builders`](../supabase/functions/dispatch-builders/index.ts).
- **v0 reliability:** optional `V0_DISPATCH_MAX_RETRIES` (1–3) with backoff on 429/5xx; documented in [WORKFLOW-ENGINE.md](./WORKFLOW-ENGINE.md).
- **Supabase config:** `[functions.poll-v0-status] verify_jwt = false` aligned with browser invoke.
- **Documentation:** this file, [ORCHESTRATOR.md](./ORCHESTRATOR.md), updated [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md), [RAG-PHASE2.md](./RAG-PHASE2.md) (scope only).

## Audit

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Pass |
| `npm run test` (Vitest) | Pass |
| `npm run lint` (full repo) | **Fails** — pre-existing debt (`any`, ui shadcn patterns, duplicate `pr0ducent/` tree on some machines). New orchestrator paths lint clean: `eslint supabase/functions/_shared/adapters supabase/functions/_shared/adapter-registry.ts supabase/functions/dispatch-builders/index.ts` |
| Migrations order | Apply `20260321120000` before `20260321140000` on remote |

## Deploy prompt — Lovable / Supabase ops

Copy to operator (infra only; do not change product copy without PM):

```
Repository: pr0ducent. Supabase project_id in supabase/config.toml.

1) Migrations (remote): apply supabase/migrations in order; required orchestrator files:
   20260321120000_orchestrator_core.sql
   20260321140000_run_jobs_tasks_workflow_pool.sql
   If ALTER PUBLICATION supabase_realtime errors on duplicate table, skip (migrations use guarded DO block where applicable).

2) Deploy Edge Functions: dispatch-builders, poll-v0-status, score-builder-output, sync-builder-data.
   Secrets: V0_API_KEY, SUPABASE_SERVICE_ROLE_KEY, PERPLEXITY_API_KEY, Stripe secrets as before.
   JWT: dispatch-builders + score-builder-output verify_jwt=true; poll-v0-status verify_jwt=false (matches client).

3) Realtime: ensure publication includes public.builder_results, public.run_events, public.run_tasks.

4) Smoke:
   a) Logged-in user: invoke dispatch-builders with JWT, body { prompt, experimentId: UUID from experiments, selectedTools includes "v0", idempotencyKey } → 200, runJobId, dispatched.
   b) Repeat same idempotencyKey → idempotentReplay true, same shape.
   c) poll-v0-status with chatId from builder_results.provider_run_id for that experiment.
   d) DB: run_tasks.run_job_id / run_task_id consistent on run_events and builder_results for v0 row.

Report: applied migrations yes/no, functions deployed, smoke pass/fail, log excerpts on failure.
```

## Handoff prompt — Antigravity (parallel UI)

```
Backend context (Cursor repo) — do not duplicate:
- Live builder: v0 via dispatch-builders + poll-v0-status; other tools are benchmark unless builder_integration_config enables future Tier 1 adapters.
- Tables: run_jobs, run_tasks, run_events, builder_results (provenance, provider_run_id), referral_clicks + referral_conversions on handoff CTA.
- Client: useBuilderApi → dispatch-builders when user + UUID experiment; Run Center subscribes to run_events; Realtime on builder_results/run_tasks as needed.
- Docs: docs/ORCHESTRATOR.md, WORKFLOW-ENGINE.md, BYOA-MIGRATION.md, VERCEL-SUPABASE-MIGRATION.md.

Your lane: UI/layout/dashboard/marketplace/preview iframe/progress streams — do not change Edge JSON contracts or RLS without sync.
Out of scope for MVP: browser bridge worker host (Fly/Modal); pgvector RAG — see docs/RAG-PHASE2.md.
```

## Follow-ups (not this sprint)

- Full **eslint** cleanup repo-wide (or scope eslint to `src` + orchestrator only in CI).
- **Credit engine** granular costs, **remix marketplace** tables, **builder_crawl_sources** + embeddings — see [RAG-PHASE2.md](./RAG-PHASE2.md).
