# AGENTS.md

## Learned User Preferences

- Ship changes by committing and pushing to `main` (pull/rebase onto `origin/main` when the branch has diverged) so connected tools such as Lovable see updates; use GitHub identity aligned with `maciej.bialek.33@gmail.com` for this repo’s commits when working on behalf of this project owner.
- Keep product messaging aligned with what the system actually does: separate live builder integrations (e.g. v0) from benchmark-only tools, and present post-build benchmarking and PVI-style scoring as a first-class part of the product story—not only as placeholders or mocks.
- When the owner says they will not perform repeated manual dashboard steps, prefer automatable delivery (CI, provision scripts, one-time GitHub secrets) and plain-language architecture explanations over runbooks that assume they will click through Supabase or Lovable for every release.
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

## Sprint 3.5 — typy, PVI, odczyty (ustalone z AG)

- **`as any` w `src/`:** traktuj jako regres architektury. Warstwa eksperymentów (`experiment-service.ts`, `ComparisonCanvas.tsx`, `PublicExperiment.tsx`) ma używać typów z `Database` / `Json` z `src/integrations/supabase/types.ts` oraz `satisfies` tam gdzie AG to wprowadził — nie wracaj do obejść typów bez uzasadnienia (wyjątek: biblioteki zewnętrzne).
- **Dwa silniki PVI:** `src/lib/pvi-engine.ts` + typ `PVIDimensions` + kolumny `score_*` w `builder_benchmark_scores` = **benchmark / analityka**. `src/lib/pvi-calculator.ts` = **marketing / kalkulator planów** (landing, cennik) — nie mieszaj ich w Edge Functions zapisujących benchmark.
- **Read-only kontrakty UI:** `WinnerBanner` opiera się na **`avg_pvi`** z widoku `builder_leaderboard`. Wykresy (radar itd.) biorą **`score_*`** z `builder_benchmark_scores` po `tool_id` / `builder_result_id`. Zmiany MV lub kolumn muszą zachować te ścieżki albo zostać zsynchronizowane z frontem w jednym PR.
- **Realtime / stream:** wiersze ze streamu (`BuilderResultRow`, snake_case) mapuj do **`BuilderResult`** (camelCase) przed przekazaniem do komponentów oczekujących `BuilderResult` — unikaj unionów `BuilderResult | BuilderResultRow` na propsach bez mapowania.

## Backend (Edge / migracje) — kierunek zapisu wymiarów

- Zapis do `builder_benchmark_scores` powinien używać **tych samych nazw kolumn** co `PVIDimensions` / `mapRowToScores` w `pvi-engine.ts` (`score_speed`, …, `score_code_quality`).
- **`pvi_score`:** licz zgodnie z wagami w `pvi-engine` (lub współdziel `computePartialPVI` w `supabase/functions/_shared/benchmark-group-a.ts` dla spójności Deno).
- **`ai_reasoning`:** JSONB; struktura zgodna z tym, co czyta UI (np. pola per wymiar / `summary` tam gdzie ComparisonCanvas je wyświetla).
- **Grupa B/C:** ciężkie joby (Lighthouse, batch AI) poza długim invoke — aktualizacja tego samego wiersza po `builder_result_id`, idempotencja, `run_events` do audytu; MV odświeżane przez `pg_cron` lub ręczny refresh po batchu.
