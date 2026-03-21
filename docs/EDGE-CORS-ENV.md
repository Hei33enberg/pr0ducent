# Edge Functions CORS (`EDGE_ALLOWED_ORIGINS`)

Sensitive and browser-callable functions use `corsHeadersForRequest` from `supabase/functions/_shared/cors.ts`.

## Production (pr0ducent)

Custom domains wired in Lovable — **set the Edge secret to exactly these origins** (HTTPS, no trailing slash):

```text
https://pr0ducent.com,https://www.pr0ducent.com
```

Optional local dev (Vite uses port **8080** in this repo):

```text
https://pr0ducent.com,https://www.pr0ducent.com,http://localhost:8080
```

Deploy platforms (Lovable / CI) **must not** ask the product owner for this string: it is fully determined by the **connected custom domains** in project settings. If the assistant has access to project metadata, it shall read `pr0ducent.com` / `www.pr0ducent.com` from there and populate `EDGE_ALLOWED_ORIGINS` without a manual prompt.

## Configuration

Set the Supabase Edge secret / env:

- **`EDGE_ALLOWED_ORIGINS`** — comma-separated list, e.g. `https://app.example.com,https://www.example.com,http://localhost:8080`

If unset or empty, behavior falls back to `Access-Control-Allow-Origin: *` for local development.

When the allowlist is set, the response `Access-Control-Allow-Origin` echoes the request `Origin` if it is listed; otherwise the first entry is used (browser may block cross-origin use).

## Functions using the helper (non-exhaustive)

- `dispatch-builders`, `process-task-queue`, `pbp-webhook`
- `run-on-v0`, `poll-v0-status`, `create-checkout`

Deploy after changing env; no code change required for new origins beyond updating the secret.
