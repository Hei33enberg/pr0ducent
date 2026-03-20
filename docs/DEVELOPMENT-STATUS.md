# pr0ducent — Development Status

## Date

2026-03-25

## Execution model (current)

- **Broker MVP:** runs use platform keys where integrated; **live API** only for **v0** today.
- **Orchestrator:** authenticated users with a DB `experiments.id` (UUID) call [`dispatch-builders`](../supabase/functions/dispatch-builders/index.ts). Guests / non-UUID flows still use legacy `run-on-v0` + poll.
- **Data plane:** `run_jobs`, `run_tasks`, `run_events`, extended `builder_results`, `builder_integration_config`, broker lease tables, `credit_transactions`, `referral_conversions`.
- **Realtime:** `builder_results`, `run_events`, `run_tasks` (after migrations) for Compare + Run Center.
- **Other builders** in the UI remain **benchmark** paths (tier 4 / disabled in config) until new adapters are registered.
- **VBP (draft):** [`VBP-SPEC.md`](./VBP-SPEC.md) + `vbp-adapter`; builders can implement VBP to plug in without custom code per vendor.
- **Task queue:** `dispatch-builders` enqueues `run_tasks` (`queued`), calls `process-task-queue` (service role), then **inline fallback** if tasks remain queued (e.g. worker not deployed).
- **UI (AG cockpit):** `useRunTaskStream`, `BuilderProgressStream`, `DemoPreviewFrame`, `/marketplace`, `UserDashboard` plans/BYOA stub — see [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) for deploy order vs Lovable.
- **UI primitives (legacy hook):** `useOrchestrationRealtime`, `VbpClaimButton` — still available where used.

## Migrations (orchestrator)

- [`20260321120000_orchestrator_core.sql`](../supabase/migrations/20260321120000_orchestrator_core.sql)
- [`20260321140000_run_jobs_tasks_workflow_pool.sql`](../supabase/migrations/20260321140000_run_jobs_tasks_workflow_pool.sql)
- [`20260322120000_vbp_orchestration.sql`](../supabase/migrations/20260322120000_vbp_orchestration.sql) — VBP config columns, `builder_rate_limits`, `builder_crawl_sources`, `run_tasks.next_retry_at`.
- [`20260325100000_builder_dispatch_slot_rpc.sql`](../supabase/migrations/20260325100000_builder_dispatch_slot_rpc.sql) — `builder_try_dispatch_slot()` RPC for atomic rate window + inflight cap (`process-task-queue`).
- [`20260326120000_ensure_builder_rate_limits.sql`](../supabase/migrations/20260326120000_ensure_builder_rate_limits.sql) — idempotentne `CREATE TABLE` jeśli `22120000` było pominięte przed RPC.

## Edge functions (orchestrator-related)

| Function | JWT (config.toml) | Notes |
|----------|-------------------|--------|
| `dispatch-builders` | `true` | User JWT; service role inside. |
| `process-task-queue` | `false` | **Service role Bearer only** — drains `queued` tasks. |
| `pbp-webhook` | `false` | Optional VBP builder callbacks; verify `VBP_WEBHOOK_SECRET` when set. |
| `rag-crawl-builder` | `false` | Service role; see [CRON-RAG-CRAWL.md](./CRON-RAG-CRAWL.md). |
| `poll-v0-status` | `false` | Called from browser with anon key + body. |
| `score-builder-output` | `true` | Manual / admin rescore. |
| `sync-builder-data` | `false` | Cron / service; Perplexity + knowledge chunks + ingest alerts. |

Secrets: `V0_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PERPLEXITY_API_KEY` (sync), Stripe keys for checkout/webhook, optional `VBP_PARTNER_KEY` / `VBP_BROKER_OUTBOUND_SECRET` / `VBP_WEBHOOK_SECRET`.

## Frontend stack

- React + TypeScript + Vite + Tailwind + shadcn/ui
- Supabase client + `invoke` for Edge Functions
- i18n: EN/PL dictionaries

## Architecture reference

See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for sequence diagram and adapter layout.

## Sprint close notes

See [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) for audit summary, deploy prompts, and follow-ups.

## QA / protocol pointers

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md) — Lovable Publish, webhook, smoke, AG, CI (jedna strona startowa).
- [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md) — opcjonalny workflow Actions: migracje + `supabase functions deploy` (sekrety: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`).
- [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md) — kiedy nie masz PAT/hasła bazy (Lovable-managed Supabase) i co z tego wynika.
- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md) — how to verify a real orchestrated run (not `/compare`).
- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md) — stuck `queued`, webhooks.
- [SECOND-BUILDER-PLAYBOOK.md](./SECOND-BUILDER-PLAYBOOK.md) — next integrations.
- Staging E2E: `npm run test:e2e-staging` (requires env vars in script header).
- VBP OSS bundle: [protocol/vibecoding-broker-protocol/README.md](../protocol/vibecoding-broker-protocol/README.md).
