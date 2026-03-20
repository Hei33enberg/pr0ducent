# Sprint close — orchestrator + VBP + AG cockpit UI (2026-03-22)

## Executive summary

| Lane | Owner | Status |
|------|--------|--------|
| **Backend / orchestration** | Cursor | Shipped on `main` (commit `6a667e0`+): queue worker, VBP/generic adapters, crawl + webhook stubs, docs/schemas. |
| **Cockpit UI** | Antigravity | Shipped in this commit: `useRunTaskStream`, `BuilderProgressStream`, Compare wiring, `/marketplace`, dashboard polish, nav + i18n. |
| **Infra** | You / Lovable Cloud | **Not automatic:** apply migration `20260322120000`, deploy new Edge Functions, wire DB Webhook → `process-task-queue`, set secrets. |

**Core business order:** stabilize **v0 end-to-end** on prod → enable **second builder** (config + adapter) → load tests → only then lean on Lovable for cosmetic polish. UI can ship first; **live multi-builder stream** needs backend deploy + `builder_integration_config` rows.

---

## Kolejność: kto pushuje, kiedy Lovable publish

1. **Cursor** merges backend first when touching `supabase/`, `docs/VBP-SPEC.md`, shared `src/config/tools.ts`, generated types.
2. **AG** rebases on `main`, merges UI-only (`src/pages/`, `src/components/`, hooks, locales). Avoid same-day edits to the same file without a ping.
3. **Single integration commit** (like this doc) can bundle AG UI + Cursor docs if conflicts were resolved locally.
4. **Lovable publish (cloud):** run **after** `git pull` on the branch Lovable tracks (usually `main`) **and** after Supabase migration + function deploy if the feature depends on new columns or workers. Otherwise the site will show UI that 404s or stalls on missing worker.
5. **Rule of thumb:** *DB + Edge first* (or feature-flag UI), *then* Lovable publish — or publish UI behind existing data shapes only.

---

## Shipped — backend (reference)

- **Migration:** [`20260322120000_vbp_orchestration.sql`](../supabase/migrations/20260322120000_vbp_orchestration.sql) — `builder_integration_config` extensions, `builder_rate_limits`, `builder_crawl_sources`, `run_tasks.next_retry_at`.
- **Functions:** `dispatch-builders` (enqueue + worker invoke + fallback), `process-task-queue`, `pbp-webhook`, `rag-crawl-builder`.
- **Adapters:** `vbp-adapter`, `generic-rest-adapter`, registry (`v0` | `vbp` | `generic_rest` | `benchmark`).
- **Docs:** [`VBP-SPEC.md`](./VBP-SPEC.md), [`BUILDER-CATALOG.md`](./BUILDER-CATALOG.md), [`ORCHESTRATOR.md`](./ORCHESTRATOR.md), [`CRON-RAG-CRAWL.md`](./CRON-RAG-CRAWL.md), [`WIRE-BUILDERS.md`](./WIRE-BUILDERS.md).

---

## Shipped — frontend (this sprint, AG lane)

- **`useRunTaskStream`** — loads `run_tasks` + `run_events` for a UUID `experimentId`, Realtime subscriptions.
- **`BuilderProgressStream`** — per-builder status UI during generation (Compare).
- **`DemoPreviewFrame`** — preview container (mobile/tablet/desktop) + fullscreen path as implemented.
- **`/marketplace`** — community demos grid + remix CTA (stub/data wiring when backend tables exist).
- **`UserDashboard`** — plans, usage counters, BYOA placeholder overlay (phase 2).
- **Nav + i18n** — EN/PL keys for Marketplace and related strings.

---

## Audit (local)

| Check | Result |
|-------|--------|
| `npm run build` | Pass |
| `npm run test:deno` | Run after backend edits; adapter + jsonpath tests in `supabase/functions/__tests__/` |
| ESLint full repo | May fail legacy debt; scope new paths in CI if needed |

---

## Deploy prompt — Lovable / Supabase (copy-paste)

```
Repo: pr0ducent (GitHub). Supabase: same project as supabase/config.toml.

A) MIGRATIONS (order matters)
Apply all pending files under supabase/migrations/, including:
- 20260321120000_orchestrator_core.sql
- 20260321140000_run_jobs_tasks_workflow_pool.sql
- 20260322120000_vbp_orchestration.sql
If ALTER PUBLICATION supabase_realtime complains about duplicate, skip duplicate adds (migrations use guards where noted).

B) EDGE FUNCTIONS — deploy these (supabase functions deploy <name>):
- dispatch-builders          (verify_jwt = true)
- poll-v0-status             (verify_jwt = false)
- process-task-queue         (verify_jwt = false)  ← NEW; service_role Bearer only
- pbp-webhook                (verify_jwt = false)  ← NEW; optional HMAC
- rag-crawl-builder          (verify_jwt = false)  ← NEW; cron/manual
- score-builder-output, sync-builder-data — as before

C) SECRETS (Dashboard → Edge Functions secrets)
- V0_API_KEY, SUPABASE_SERVICE_ROLE_KEY, PERPLEXITY_API_KEY, Stripe_* (existing)
- Optional VBP: VBP_WEBHOOK_SECRET, VBP_BROKER_OUTBOUND_SECRET / partner keys if used

D) DATABASE WEBHOOK (primary worker trigger)
- On INSERT into public.run_tasks WHERE status = 'queued' (or all inserts filtered in worker), HTTP POST to process-task-queue URL with Authorization: Bearer SERVICE_ROLE_KEY
- Optional fallback: pg_cron every 10s calling same function URL (NOT every 2s)

E) REALTIME
- Publication must include: builder_results, run_events, run_tasks (if not already)

F) SMOKE
1) Auth user: invoke dispatch-builders with JWT, body { prompt, experimentId: <experiments.uuid>, selectedTools includes "v0", idempotencyKey } → 200, runJobId.
2) DB: run_tasks rows move from queued → processing/completed; builder_results row for v0.
3) If process-task-queue deployed + webhook: tasks should drain without relying on dispatch inline fallback only.

Report back: migrations applied Y/N, functions list deployed, webhook Y/N, smoke pass/fail + error snippet.
```

---

## Handoff prompt — Antigravity (copy-paste)

```
Kontekst backend (Cursor) — już na main:
- Kolejka: run_tasks.status = queued → process-task-queue (webhook/cron) → adapter (v0 / vbp / generic_rest / benchmark).
- dispatch-builders kończy job po drain + ewentualnym inline fallback jeśli worker nie żyje.
- Tabele: run_jobs, run_tasks, run_events, builder_results, builder_integration_config, builder_rate_limits, builder_crawl_sources.
- VBP: docs/VBP-SPEC.md + vbp-adapter — claim_token / stream_url przychodzą gdy builder wdroży standard; do tego czas REST per builder.

Wasze UI (już zmergowane w repo): useRunTaskStream, BuilderProgressStream, DemoPreviewFrame, Marketplace, UserDashboard — podłączcie „prawdziwy ogień” gdy w builder_results / run_events pojawią się preview_url, claim_url, telemetria z completed.

Następne kroki Cursor/backend (nie duplikujcie):
- Wpiąć drugiego buildera (Lovable/Bolt) przez builder_integration_config + test E2E z flagą środowiskową.
- Twarde rate-limit + circuit w workerze (tabele już są).
- Rozszerzyć BUILDER-CATALOG + crawl sources dla każdego dostawcy.

Zasady merge: wy unikacie supabase/migrations i supabase/functions; Cursor unika src/pages bez sync. Shared: types/tools — Cursor pierwszy, wy rebase.

Publikacja Lovable: dopiero po deploy funkcji + migracji jeśli UI korzysta z nowych kolumn/workerów; inaczej publish tylko front bez zmiany kontraktu API.
```

---

## Follow-ups (next sprints)

- **Per-builder E2E** with `BUILDER_E2E_ENABLED` and secrets in CI/staging only.
- **k6** load script: `scripts/k6-dispatch-smoke.js` — wire to staging URL + service token policy.
- **Marketplace backend** — table or snapshot for public demos + remix lineage ([MARKETPLACE-REMIX.md](./MARKETPLACE-REMIX.md)).
- **OSS repo** — promote `protocol/vibecoding-broker-protocol` to `github.com/pr0ducent/vibecoding-broker-protocol` (OpenAPI + schemas + validator already in monorepo).

## Related docs (orchestration hardening)

- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)
- [QUEUE-OBSERVABILITY.md](./QUEUE-OBSERVABILITY.md)
- [SECOND-BUILDER-PLAYBOOK.md](./SECOND-BUILDER-PLAYBOOK.md)
- [VBP-POP-BRANDING.md](./VBP-POP-BRANDING.md)

---

## Historical note (2026-03-21 iteration)

Earlier sprint: adapter registry slimming, v0 retries, `poll-v0-status` JWT=false, orchestrator migrations 2026032112/14 — details remain valid in [WORKFLOW-ENGINE.md](./WORKFLOW-ENGINE.md).
