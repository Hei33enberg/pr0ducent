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
- **Task queue:** `dispatch-builders` enqueues `run_tasks` (`queued`), calls `process-task-queue` (service role), then **inline fallback** if tasks remain queued (e.g. worker not deployed). Per-tool caps: `builder_rate_limits` — seed repo dla `v0` ma **`max_per_minute = 30`** (patrz migracje `20260322120000`, `20260326120000`).
- **UI (AG cockpit):** `useRunTaskStream`, `BuilderProgressStream`, `DemoPreviewFrame`, `/marketplace`, `UserDashboard` plans/BYOA stub — see [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) for deploy order vs Lovable.
- **UI primitives (legacy hook):** `useOrchestrationRealtime`, `VbpClaimButton` — still available where used.

## Migrations (orchestrator)

- [`20260321120000_orchestrator_core.sql`](../supabase/migrations/20260321120000_orchestrator_core.sql)
- [`20260321140000_run_jobs_tasks_workflow_pool.sql`](../supabase/migrations/20260321140000_run_jobs_tasks_workflow_pool.sql)
- [`20260322120000_vbp_orchestration.sql`](../supabase/migrations/20260322120000_vbp_orchestration.sql) — VBP config columns, `builder_rate_limits`, `builder_crawl_sources`, `run_tasks.next_retry_at`.
- [`20260325100000_builder_dispatch_slot_rpc.sql`](../supabase/migrations/20260325100000_builder_dispatch_slot_rpc.sql) — `builder_try_dispatch_slot()` RPC for atomic rate window + inflight cap (`process-task-queue`).
- [`20260326120000_ensure_builder_rate_limits.sql`](../supabase/migrations/20260326120000_ensure_builder_rate_limits.sql) — idempotentne `CREATE TABLE` jeśli `22120000` było pominięte przed RPC.
- [`20260425140000_slice_a_b_hardening.sql`](../supabase/migrations/20260425140000_slice_a_b_hardening.sql) — `run_tasks.status` + `dead_letter`; tabela `pbp_webhook_deliveries` (idempotencja webhooka).

## Edge functions (orchestrator-related)

| Function | JWT (config.toml) | Notes |
|----------|-------------------|--------|
| `dispatch-builders` | `true` | User JWT; service role inside. |
| `process-task-queue` | `false` | **Service role Bearer only** — drains `queued` tasks. Env: `RUN_TASK_MAX_ATTEMPTS` (default 25) → terminal `dead_letter`. |
| `pbp-webhook` | `false` | VBP callbacks; HMAC when `VBP_WEBHOOK_SECRET` set; `x-pbp-signature` / `x-vbp-signature`; duplicate body dedupe (`pbp_webhook_deliveries`). Optional `VBP_WEBHOOK_SECRET_REQUIRED=true`. |
| `rag-crawl-builder` | `false` | Service role; see [CRON-RAG-CRAWL.md](./CRON-RAG-CRAWL.md). |
| `poll-v0-status` | `false` | Called from browser with anon key + body. |
| `score-builder-output` | `true` | Manual / admin rescore. |
| `sync-builder-data` | `false` | Cron / service; Perplexity + knowledge chunks + ingest alerts. |

Secrets: `V0_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PERPLEXITY_API_KEY` (sync), Stripe keys for checkout/webhook, optional `VBP_PARTNER_KEY` / `VBP_BROKER_OUTBOUND_SECRET` / `VBP_WEBHOOK_SECRET`.

## UI / brand parity (Lovable + murd0ch alignment)

- **Status i macierz:** [UI-PARITY-LOVABLE-SYNC.md](./UI-PARITY-LOVABLE-SYNC.md) — co weszło z Lovable, co domknięte w repo, prompt operatora dla migracji / Edge na cloud.
- **UI parity remediation (menu / LP rhythm):** [PR0DUCENT-PARITY-GAPS.md](./PR0DUCENT-PARITY-GAPS.md), deploy handoff [LOVABLE-DEPLOY-PARITY-REMEDIATION.md](./LOVABLE-DEPLOY-PARITY-REMEDIATION.md).
- Tokeny i guidelines: [DESIGN-TOKENS.md](./DESIGN-TOKENS.md), [BRAND-GUIDELINES.md](./BRAND-GUIDELINES.md).

## Builder pipeline — audyt hardeningowy (v0 + POP/VBP)

- **Pełny audyt:** [BUILDER-PIPELINE-HARDENING-AUDIT.md](./BUILDER-PIPELINE-HARDENING-AUDIT.md) — **Slice A–D** w repo: kolejka/webhook (A/B), stream Compare + dispatch/retry (C), OpenAPI/VBP-SPEC/CI walidacja `$ref` (D).

## Frontend stack

- React + TypeScript + Vite + Tailwind + shadcn/ui
- Supabase client + `invoke` for Edge Functions
- i18n: EN/PL dictionaries
- **Nav (hamburger):** `PageFrame` uses `.sticky-header` + `.menu-dropdown` in `src/index.css` (glass via `@supports(backdrop-filter)`, `maxHeight`/`overflowY` for tall grids, mobile `.menu-overlay-mobile` with blur budget) — see [PR0DUCENT-PARITY-GAPS.md](./PR0DUCENT-PARITY-GAPS.md).

## Architecture reference

See [ORCHESTRATOR.md](./ORCHESTRATOR.md) for sequence diagram and adapter layout.

## Sprint close notes

See [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) for audit summary, deploy prompts, and follow-ups.

## QA / protocol pointers

- [POP-INDEX.md](./POP-INDEX.md) — pr0ducent Open Protocol (POP/VBP): partner pitch, bridge registry, ROI, legal, conformance. Quick map: [POP-START-HERE.md](./POP-START-HERE.md).
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md) — Lovable Publish, webhook, smoke, AG, CI (jedna strona startowa).
- [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md) — opcjonalny workflow Actions: migracje + `supabase functions deploy` (sekrety: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`).
- [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md) — kiedy nie masz PAT/hasła bazy (Lovable-managed Supabase) i co z tego wynika.
- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md) — how to verify a real orchestrated run (not `/compare`).
- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md) — stuck `queued`, webhooks.
- [SECOND-BUILDER-PLAYBOOK.md](./SECOND-BUILDER-PLAYBOOK.md) — next integrations.
- Staging E2E: `npm run test:e2e-staging` (requires env vars in script header).
- VBP OSS bundle: [protocol/vibecoding-broker-protocol/README.md](../protocol/vibecoding-broker-protocol/README.md).
- PVI vs orkiestracja (AG): [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md), Realtime: [REALTIME-GUARDRAILS.md](./REALTIME-GUARDRAILS.md).
- Kolejka / trigger: [scripts/README-queue-worker.md](../scripts/README-queue-worker.md).
