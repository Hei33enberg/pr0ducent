

# Fix v0 Integration: Async Polling + Guest Access

## Problem Analysis

Two root causes identified from logs and docs:

1. **504 Timeout**: The v0 API with `responseMode: "async"` still takes time to return the initial response (>25s in some cases), exceeding the Edge Function timeout. Even when it returns quickly, the function waits for the full generation.

2. **Incognito/Guest broken**: The Edge Function requires authentication (`getClaims`), and RLS policies on `builder_results` require `auth.uid()`. Guests can't use v0 at all.

## Solution: Two-Function Async Architecture

Split the single long-running edge function into two fast ones, both working without auth.

```text
Client                    Edge Functions              v0 API
  |                           |                         |
  |-- POST run-on-v0 ------->|                         |
  |   (prompt)                |-- POST /v1/chats ----->|
  |                           |   (async mode)         |
  |                           |<-- chatId, status -----| (~2-5s)
  |<-- { chatId } -----------|                         |
  |                           |                         |
  |  (poll every 3s)          |                         |
  |-- POST poll-v0-status --->|                         |
  |   (chatId)                |-- GET /v1/chats/id --->|
  |                           |<-- status: pending ----| (<1s)
  |<-- { status: pending } ---|                         |
  |                           |                         |
  |-- POST poll-v0-status --->|                         |
  |   (chatId)                |-- GET /v1/chats/id --->|
  |                           |<-- status: completed --| (<1s)
  |<-- { completed, urls } ---|                         |
```

## Implementation Steps

### Step 1: Rewrite `run-on-v0` Edge Function
- Remove auth requirement (allow guests)
- If user token provided, optionally save to `builder_results` via service role
- Call `POST /v1/chats` with `responseMode: "async"`
- Return immediately with `chatId` and `webUrl` (no waiting for generation)
- 10s timeout max (the async call should return in 2-5s)

### Step 2: Create `poll-v0-status` Edge Function
- New function: `supabase/functions/poll-v0-status/index.ts`
- Accepts `chatId` (and optional `experimentId` for DB updates)
- Calls `GET /v1/chats/{chatId}` with V0_API_KEY
- Returns `latestVersion.status`, `demoUrl`, `webUrl`, `files`
- If status is "completed" and `experimentId` provided, updates `builder_results`
- No auth required, fast response (<2s)

### Step 3: Update `supabase/config.toml`
- Add `poll-v0-status` function with `verify_jwt = false`

### Step 4: Rewrite `useBuilderApi` Hook
- `runOnV0`: Call `run-on-v0`, get `chatId`, then start polling interval
- Polling: Call `poll-v0-status` every 3 seconds with the `chatId`
- Stop polling when status is "completed" or "failed" (max 120s timeout)
- Update `BuilderResult` state at each poll (generating → completed/error)
- Remove session requirement — works for guests too
- Pass `experimentId` only when user is logged in (for DB persistence)

### Step 5: Update RLS on `builder_results`
- Add a service-role-only INSERT/UPDATE policy so the edge function can write results even for guest experiments
- Actually, since edge functions use service_role_key, RLS is bypassed — no migration needed

## Technical Details

**v0 API async flow** (from official docs at v0.app/docs/api/platform/reference/chats/create):
- `responseMode: "async"` returns chat object immediately with `latestVersion.status: "pending"`
- Poll `GET /v1/chats/{chatId}` — when `latestVersion.status` becomes `"completed"`, `demoUrl` and `files` are available

**Files to create/modify:**
- `supabase/functions/run-on-v0/index.ts` — simplify to async-only, no auth required
- `supabase/functions/poll-v0-status/index.ts` — new polling function
- `supabase/config.toml` — add new function config
- `src/hooks/useBuilderApi.ts` — implement client-side polling loop

