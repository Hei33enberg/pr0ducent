# Front: Vercel + direct Supabase (post-MVP)

**Step-by-step walkthrough:** [VERCEL-SUPABASE-STEP-BY-STEP.md](./VERCEL-SUPABASE-STEP-BY-STEP.md)

## Goal

Move the web app off the Lovable-hosted bundle to **Vercel** (or any static/edge host) while keeping **Supabase** as the system of record for auth, Postgres, Realtime, Storage, and Edge Functions.

## Why it is low-risk after MVP

- Clients already talk to Supabase via the public URL + anon key and invoke Edge Functions by name.
- Orchestrator state lives in Postgres (`run_jobs`, `run_tasks`, `run_events`, `builder_results`), not in the front host.

## Checklist

1. **Environment**
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase anon/public key — see `src/integrations/supabase/client.ts`).
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

## Primary development stream (operating model)

Use this stack as the **default** place to evolve the product: feature work lands on `main`, ships from **GitHub → Vercel** for the web app, and talks to **your** Supabase project (dashboard access, secrets, migrations from this repo).

| Area | Rule |
|------|------|
| Source of truth | GitHub `main` in `Hei33enberg/pr0ducent` (or successor org) |
| Frontend host | Vercel project connected to the repo; production + preview deployments |
| Backend | Supabase project under the team account; Edge Functions deployed from `supabase/functions` |
| Environment | Set `VITE_*` in Vercel (including `VITE_VBP_PROTOCOL_URL` when the public protocol repo exists) |
| Auth | Supabase redirect URLs must list the Vercel production URL and `*.vercel.app` previews you use for QA |
| Cutover | When ready, point the product domain at Vercel; keep Lovable only as an optional editor for marketing sites — see [LOVABLE-SECONDARY-LP.md](./LOVABLE-SECONDARY-LP.md) |

**Staging:** Prefer a dedicated Supabase project or branch for pre-prod; mirror migrations from `supabase/migrations` before promoting Edge bundles.
