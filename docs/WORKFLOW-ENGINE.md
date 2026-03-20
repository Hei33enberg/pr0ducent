# Durable workflow engine (post-MVP bridge)

## MVP (today)

- `run_jobs.workflow_engine` defaults to `supabase_edge`.
- Long-running work is coordinated by **Edge Functions** (`dispatch-builders`, `poll-v0-status`) plus **Postgres** (`run_jobs`, `run_tasks`, `run_events`) and **Realtime** updates.
- Idempotent dispatch uses `(user_id, idempotency_key)` on `run_jobs`.

## Edge timeouts and v0 retries (MVP)

- `poll-v0-status` and v0 handshake use bounded `AbortSignal.timeout` (order of tens of seconds per request).
- **v0 live dispatch** (`supabase/functions/_shared/adapters/v0-adapter.ts`): optional retries on `429` and `5xx` via env `V0_DISPATCH_MAX_RETRIES` (default `1`, clamped 1–3) with short linear backoff. This is not a full circuit breaker; see post-MVP reliability work.

## Target: Temporal (or equivalent)

- **Run job** becomes a workflow ID; **run task** becomes a child workflow or activity per builder.
- Activities call adapter implementations (API, browser bridge, MCP) with retries, heartbeats, and cancellation.
- **Benefits:** automatic retries, visibility, timers for lease expiry, and clean separation from HTTP request/response limits.

## Integration path

1. Deploy Temporal (self-hosted or cloud) with a worker service that holds Supabase service role + provider secrets.
2. Replace synchronous v0 handshake (today in `v0-adapter.ts`, invoked from `dispatch-builders`) with `startWorkflow('RunJob', { experimentId, ... })` while keeping the same DB rows for UI compatibility.
3. Poll workers update `run_tasks` / `run_events` exactly as today so the front end does not change.

Until then, do not couple UI to “workflow engine specifics”—only to `run_tasks` and `run_events`.
