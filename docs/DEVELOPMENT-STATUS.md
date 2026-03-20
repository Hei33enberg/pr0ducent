# pr0ducent — Development Status

## Date

2026-03-21

## Execution model (current)

- **Broker MVP:** runs use platform keys where integrated; **live API** only for **v0** today.
- **Orchestrator:** authenticated users with a DB `experiments.id` (UUID) call [`dispatch-builders`](../supabase/functions/dispatch-builders/index.ts). Guests / non-UUID flows still use legacy `run-on-v0` + poll.
- **Data plane:** `run_jobs`, `run_tasks`, `run_events`, extended `builder_results`, `builder_integration_config`, broker lease tables, `credit_transactions`, `referral_conversions`.
- **Realtime:** `builder_results`, `run_events`, `run_tasks` (after migrations) for Compare + Run Center.
- **Other builders** in the UI remain **benchmark** paths (tier 4 / disabled in config) until new adapters are registered.

## Migrations (orchestrator)

- [`20260321120000_orchestrator_core.sql`](../supabase/migrations/20260321120000_orchestrator_core.sql)
- [`20260321140000_run_jobs_tasks_workflow_pool.sql`](../supabase/migrations/20260321140000_run_jobs_tasks_workflow_pool.sql)

## Edge functions (orchestrator-related)

| Function | JWT (config.toml) | Notes |
|----------|-------------------|--------|
| `dispatch-builders` | `true` | User JWT; service role inside. |
| `poll-v0-status` | `false` | Called from browser with anon key + body. |
| `score-builder-output` | `true` | Manual / admin rescore. |
| `sync-builder-data` | `false` | Cron / service; Perplexity + knowledge chunks + ingest alerts. |

Secrets: `V0_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PERPLEXITY_API_KEY` (sync), Stripe keys for checkout/webhook.

## Frontend stack

- React + TypeScript + Vite + Tailwind + shadcn/ui
- Supabase client + `invoke` for Edge Functions
- i18n: EN/PL dictionaries

## Architecture reference

See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for sequence diagram and adapter layout.

## Sprint close notes

See [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) for audit summary, deploy prompts, and follow-ups.
