# Edge Functions CORS (`EDGE_ALLOWED_ORIGINS`)

Sensitive and browser-callable functions use `corsHeadersForRequest` from `supabase/functions/_shared/cors.ts`.

## Configuration

Set the Supabase Edge secret / env:

- **`EDGE_ALLOWED_ORIGINS`** — comma-separated list, e.g. `https://app.example.com,https://www.example.com,http://localhost:5173`

If unset or empty, behavior falls back to `Access-Control-Allow-Origin: *` for local development.

When the allowlist is set, the response `Access-Control-Allow-Origin` echoes the request `Origin` if it is listed; otherwise the first entry is used (browser may block cross-origin use).

## Functions using the helper (non-exhaustive)

- `dispatch-builders`, `process-task-queue`, `pbp-webhook`
- `run-on-v0`, `poll-v0-status`, `create-checkout`

Deploy after changing env; no code change required for new origins beyond updating the secret.
