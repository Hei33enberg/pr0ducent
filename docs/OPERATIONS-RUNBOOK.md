# Runbook operacyjny — pipeline pr0ducent (PM / Lovable / Supabase)

Jednostronicowy indeks: co zrobić, żeby **front**, **backend** i **kolejka** były zsynchronizowane.

## 1. Po merge na `main` (front)

→ [LOVABLE-PUBLISH-CHECKLIST.md](./LOVABLE-PUBLISH-CHECKLIST.md)  
Pull z GitHub `main` → build → Publish; ustaw `VITE_FF_*` i opcjonalnie `VITE_VBP_PROTOCOL_URL`.

## 2. Backend Supabase (migracje + funkcje)

→ [SPRINT-CLOSE.md](./SPRINT-CLOSE.md) (sekcja deploy) oraz [DEVELOPMENT-STATUS.md](./DEVELOPMENT-STATUS.md) (lista migracji).  
Opcjonalnie CI: [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md) (workflow `supabase-deploy`).

## 3. Webhook kolejki (krytyczne dla niezawodności)

→ [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md)

## 4. Smoke test produktowy (5 min)

→ [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)

## 5. Po publikacji frontu (Antigravity)

→ [AG-POST-PUBLISH-CHECKLIST.md](./AG-POST-PUBLISH-CHECKLIST.md)

## 6. CI / staging E2E (opcjonalnie)

→ [GITHUB-ACTIONS-STAGING-E2E.md](./GITHUB-ACTIONS-STAGING-E2E.md)

## 7. Drugi builder / VBP

→ [SECOND-BUILDER-PLAYBOOK.md](./SECOND-BUILDER-PLAYBOOK.md), [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md)

## Architektura (skrót)

- **Gość:** `run-on-v0` — bez pełnej kolejki.
- **Zalogowany:** `dispatch-builders` → `run_tasks` → `process-task-queue` → adaptery → `builder_results`.

Szczegóły: [ORCHESTRATOR.md](./ORCHESTRATOR.md). Wprowadzenie PL: [BUILDERS-101-PL.md](./BUILDERS-101-PL.md).
