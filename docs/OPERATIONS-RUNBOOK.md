# Operations runbook — pr0ducent pipeline (PM / Lovable / Supabase)

Single-page index: how to keep **frontend**, **backend**, and **queue** in sync.

## 1. After merge to `main` (frontend)

→ [LOVABLE-PUBLISH-CHECKLIST.md](./LOVABLE-PUBLISH-CHECKLIST.md)  
Pull from GitHub `main` → build → Publish; set `VITE_FF_*` and optionally `VITE_VBP_PROTOCOL_URL`.

## 2. Supabase backend (migrations + functions)

→ [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) (deploy section) and [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md) (migration list).  
Optional CI: [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md) (`supabase-deploy` workflow). Lovable without its own Supabase account: [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## 3. Queue webhook (critical for reliability)

→ [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md)

## 4. Product smoke test (5 min)

→ [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)

## 5. After frontend publish (Antigravity)

→ [AG-POST-PUBLISH-CHECKLIST.md](./AG-POST-PUBLISH-CHECKLIST.md)

## 6. CI / staging E2E (optional)

→ [GITHUB-ACTIONS-STAGING-E2E.md](./GITHUB-ACTIONS-STAGING-E2E.md)

## 7. Second builder / VBP

→ [SECOND-BUILDER-PLAYBOOK.md](./SECOND-BUILDER-PLAYBOOK.md), [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)

## 8. PVI / benchmark (AG) + Realtime

→ [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md), [REALTIME-GUARDRAILS.md](./REALTIME-GUARDRAILS.md)

## Architecture (short)

- **Guest:** `run-on-v0` — no full queue.
- **Signed-in:** `dispatch-builders` → `run_tasks` → `process-task-queue` → adapters → `builder_results`.

Details: [ORCHESTRATOR.md](./ORCHESTRATOR.md). Short intro (guest vs signed-in, v0 vs others): [BUILDERS-101.md](./BUILDERS-101.md).
