# AGENTS.md

## Learned User Preferences

- Ship changes by committing and pushing to `main` (pull/rebase onto `origin/main` when the branch has diverged) so connected tools such as Lovable see updates; use GitHub identity aligned with `maciej.bialek.33@gmail.com` for this repo’s commits when working on behalf of this project owner.
- Keep product messaging aligned with what the system actually does: separate live builder integrations (e.g. v0) from benchmark-only tools, and present post-build benchmarking and PVI-style scoring as a first-class part of the product story—not only as placeholders or mocks.
- When the owner will not run a separate Supabase dashboard or repeated manual steps, prefer automatable delivery (CI, provision scripts, one-time GitHub secrets), Lovable-only operator prompts (Pull / build / Publish), and plain-language architecture explanations over runbooks that assume they will click through Supabase or Lovable for every release.
- When designing scale for many concurrent runs, plan explicitly for durable workflow engines and broker account isolation as layers beyond the first Supabase Edge–centric MVP if they are not already in place.
- In Supabase Edge Functions that use `@supabase/supabase-js` with the caller’s JWT, validate identity with supported APIs such as `auth.getUser()` (using the Bearer token or client global headers); do not rely on non-existent or undocumented client methods.
- Prefer sequencing that ships broker-mode orchestration and monetization on the current stack first, then infra moves (e.g. Vercel + direct Supabase) and BYOA-style user credentials in later phases unless the user directs otherwise.

## Learned Workspace Facts

- Frontend stack is React 18, TypeScript, Vite, Tailwind, shadcn/ui; routing is lazy-loaded in `src/App.tsx`; i18n uses `src/lib/i18n.tsx` with `src/locales/en.json` and `src/locales/pl.json`.
- Supabase powers Postgres, Auth, and Edge Functions under `supabase/functions/`; logged-in multi-builder dispatch goes through `dispatch-builders` with domain tables such as `run_jobs`, `run_tasks`, `run_events`, and `builder_integration_config` (see `docs/ORCHESTRATOR.md`); guests use `run-on-v0` outside that queue.
- Operational and handoff documentation includes `docs/DEVELOPMENT-STATUS.md`, `docs/SPRINT-CLOSE.md`, `docs/RAG-PHASE2.md`, `docs/BYOA-MIGRATION.md`, `docs/VERCEL-SUPABASE-MIGRATION.md`, and `docs/WORKFLOW-ENGINE.md`.
- Repository `.gitignore` excludes `.cursor`; avoid committing editor state or stray nested duplicate project trees (e.g. an extra top-level `pr0ducent/` folder).
- `supabase/config.toml` sets `verify_jwt` per function: for example `dispatch-builders` and `score-builder-output` expect user JWT; `poll-v0-status` is typically invoked with anon from the browser (`verify_jwt = false`).
- Typical split: Cursor drives the GitHub repo (migrations, Edge Functions, backend-heavy changes); Antigravity ships UI commits to `main`; Lovable hosts the deployed frontend and needs Pull from GitHub plus Publish when deploying UI changes.
- POP/VBP is the intended standard for third-party builders (telemetry, exports, partner APIs); benchmarking and scoring of built outputs are treated as core to the pr0duction pipeline alongside dispatch, not as an afterthought.
- If the hosted Supabase schema (e.g. Lovable-linked) is behind `main`, apply migrations from this repo instead of stripping Edge logic (circuit breaker, `next_retry_at`, VBP columns) to match an outdated live database.
- Avoid `as any` in `src/` for app code; experiment flows use `Database` / `Json` from `src/integrations/supabase/types.ts` and `satisfies` where introduced. PVI for benchmarks: `src/lib/pvi-engine.ts` and `PVIDimensions` / `score_*` in `builder_benchmark_scores`; marketing pricing UI uses `pvi-calculator.ts` only.
- Read-only UI contracts: `WinnerBanner` uses `avg_pvi` from `builder_leaderboard`; radar-style charts use `score_*` from `builder_benchmark_scores`. Changing the MV or columns requires a coordinated front + migration release. Map realtime `BuilderResultRow` (snake_case) to `BuilderResult` (camelCase) before props that expect `BuilderResult`.
- Runtime catalog: `BuilderCatalogProvider` loads `builder_integration_config` and merges with defaults in `src/config/tools.ts` (`mergeBuilderCatalog`). `useBuildersRegistry` is an alias of `useBuilderCatalog`—one implementation, two names for docs compatibility.
- Non-v0 completion: `poll-builder-status` (JWT) uses `poll_url_template` / VBP status URL and `poll_failed_values`; `pbp-webhook` updates `builder_results` and `run_tasks` for lifecycle events; Grupa B/C jobs update scores by `builder_result_id` with idempotent writes and `run_events` for audit.
