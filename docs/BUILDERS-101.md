# Builders and orchestration — short guide

For anyone who does not need the full stack: **what happens when you click run** and **how v0 differs** from other tools.

## Two user paths

- **Guest (no account):** the frontend calls **`run-on-v0`**. Simpler path: quick v0 test **without** `run_jobs` / `run_tasks` and without the full broker queue.
- **Signed in:** the frontend calls **`dispatch-builders`**. A **`run_job`** is created and one **`run_tasks`** row per selected tool. The **`process-task-queue`** worker (service role) drains the queue and calls the right **adapter**. Results land in **`builder_results`** among other places; the UI can use Realtime and poll status (e.g. v0 via **`poll-v0-status`**).

Technical detail: [ORCHESTRATOR.md](./ORCHESTRATOR.md).

## What is “v0” vs “other builders”

- **v0 (live):** dedicated adapter in code (`v0-adapter`) — direct v0 API calls, broker key in Edge secrets (`V0_API_KEY`). Config must have **`tool_id = 'v0'`**, enabled, and the right tier (see `adapter-registry.ts`).
- **Another builder with a contract / API:** can implement **[VBP](./VBP-SPEC.md)** — then the broker uses **`vbp-adapter`** and settings in **`builder_integration_config`** (API URL, secrets), **without** copying v0 logic.
- **Builder with generic REST only:** request/response template in config → **`generic-rest-adapter`**.
- **No integration:** tool goes down the **benchmark** path (placeholder / simulation) until you add live configuration.

## Queue and webhook

- After **INSERT** into **`run_tasks`**, a **Database Webhook** to **`process-task-queue`** should fire (faster and parallel to the user request). See [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md).
- If there is no webhook, **`dispatch-builders`** can still **inline** finish dispatch — the system is not “dead”, but the queue can be slower or less reliable under load.

## Migrations vs worker code

**`process-task-queue`** assumes the schema from migration **`20260322120000_vbp_orchestration.sql`**: e.g. **`builder_integration_config.circuit_state`** and **`run_tasks.next_retry_at`**. If the Supabase UI shows column errors, **deploy missing migrations** — do not remove those fields from code to silence errors on an old database.

## VBP (public bundle)

We publish spec, examples, and validator as **VBP** so partners can connect their own builder to the broker. Bundle publishing steps: [POP-PUBLIC-REPO-STEPS.md](./POP-PUBLIC-REPO-STEPS.md). Normative contract: [VBP-SPEC.md](./VBP-SPEC.md).

## What’s next operationally

One page with links: [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md). Smoke test: [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md). Deploy backend from CI: [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md). AG plan (PVI vs orchestration): [PVI-ORCHESTRATION-MAP.md](./PVI-ORCHESTRATION-MAP.md).
