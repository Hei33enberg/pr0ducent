# Front: Vercel + direct Supabase (post-MVP)

## Goal

Move the web app off the Lovable-hosted bundle to **Vercel** (or any static/edge host) while keeping **Supabase** as the system of record for auth, Postgres, Realtime, Storage, and Edge Functions.

## Why it is low-risk after MVP

- Clients already talk to Supabase via the public URL + anon key and invoke Edge Functions by name.
- Orchestrator state lives in Postgres (`run_jobs`, `run_tasks`, `run_events`, `builder_results`), not in the front host.

## Checklist

1. **Environment**
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (or your framework’s `NEXT_PUBLIC_*` equivalents).
   - No secrets for provider APIs in the browser—those stay in Edge Function env (e.g. `V0_API_KEY`).

2. **Auth**
   - Configure Supabase Auth redirect URLs for the Vercel domain.
   - Same email/OAuth providers as today.

3. **CORS / Functions**
   - Supabase Edge Functions already allow browser invocation with the user JWT.
   - Re-verify `config.toml` `verify_jwt` per function after any auth changes.

4. **Realtime**
   - Confirm `supabase_realtime` publication includes `builder_results`, `run_events`, `run_tasks` in the target project.

5. **CI**
   - `npm run build` on Vercel; run `vitest` / Playwright in GitHub Actions (or Vercel’s CI) before promote.

6. **Cutover**
   - Point DNS to Vercel; keep Lovable origin as fallback until traffic drains.
   - Monitor Edge Function error rates and `run_events` for orchestration regressions.

## Not required for migration

- Rewriting the orchestrator domain model.
- Changing RLS policies unless you introduce new clients (e.g. mobile).
