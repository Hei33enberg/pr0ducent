# Vercel + Supabase — step-by-step (primary delivery path)

**How to think about it:** **GitHub `main`** is the source of truth for **application code**. **Supabase** is the data plane (Postgres, Auth, Edge Functions). **Vercel** only hosts the **frontend build** (static `dist/`). Deploy Edge Functions **from this repo** with the Supabase CLI — not via Vercel.

---

## Before you start

- **GitHub** account with access to the `pr0ducent` repo.
- **Supabase** account (your own — full control over migrations and Edge secrets).
- **Vercel** account (free tier is enough to start).
- Locally: `node`, `npm`, optional `supabase` CLI ([docs](https://supabase.com/docs/guides/cli)).

---

## Step 1 — Supabase: target project

1. In [Supabase Dashboard](https://supabase.com/dashboard) create a **new project** (region close to users) **or** use an existing one if you are migrating from Lovable-linked — then ensure **schema = migrations from this repo** ([AGENTS.md](../AGENTS.md): do not “dumb down” Edge code to match an old database).
2. Save:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** (Publishable) → this frontend uses **`VITE_SUPABASE_PUBLISHABLE_KEY`** ([`src/integrations/supabase/client.ts`](../src/integrations/supabase/client.ts)).

---

## Step 2 — Migrations and Edge Functions (backend)

1. Install CLI: `npm i -g supabase` (or `npx supabase`).
2. In the repo directory: `supabase link --project-ref <your_ref>` (token from Dashboard → Settings → API).
3. Apply migrations: `supabase db push` (or a pipeline that matches your process — important: DB state = `supabase/migrations/`).
4. Set Edge Function **secrets** in Dashboard → Edge Functions → Secrets (e.g. `V0_API_KEY`, `VBP_WEBHOOK_SECRET`, …) — these **do not** go to Vercel.
5. Deploy functions: `supabase functions deploy --project-ref <ref>` (or CI script / docs in `docs/`).

---

## Step 3 — Auth: redirects for Vercel

1. In Supabase: **Authentication → URL Configuration**.
2. Add to **Redirect URLs**:
   - production: `https://your-domain.com/**` and `https://<project>.vercel.app/**`
   - preview (optional): `https://*.vercel.app/**` if your security policy allows **or** specific Vercel preview URLs.
3. Set **Site URL** to the final production address (after cutover).

Without this, OAuth/email redirects land on the wrong host.

---

## Step 4 — Vercel: first deploy

1. [vercel.com](https://vercel.com) → **Add New… → Project** → Import **GitHub** → select `Hei33enberg/pr0ducent` (or a fork).
2. Framework: detects **Vite**; build: `npm run build`, output: `dist` (per [`vercel.json`](../vercel.json) in the repo).
3. **Environment Variables** (Production + Preview):

   | Variable | Source |
   |----------|--------|
   | `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → anon public |
   | `VITE_VBP_PROTOCOL_URL` | optional URL of the public protocol repo (GitHub) |
   | `VITE_FF_*` | as needed ([`featureFlags.ts`](../src/lib/featureFlags.ts)) |

4. **Deploy**. After a green build, open `*.vercel.app` and verify login + one flow (e.g. read from a table).

---

## Step 5 — Realtime (if you use it)

In Supabase, ensure Realtime publication covers tables used by the UI (`builder_results`, `run_events`, `run_tasks`, etc.) — see the Realtime section in [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md).

---

## Step 6 — DNS cutover (production)

1. When Vercel staging looks good: in your production domain **DNS**, set records per [Vercel → domain → DNS](https://vercel.com/docs/concepts/projects/domains) (usually CNAME to `cname.vercel-dns.com` or A records to listed IPs).
2. In Vercel, attach the **Custom Domain** to the project.
3. Update **Supabase Redirect URLs** again if the production URL changes.
4. Keep the old host (Lovable) as fallback until you are confident; then turn it off.

---

## Step 7 — Smoke after migration

- Login / logout.
- One write to the DB (e.g. an experiment).
- One Edge function that requires JWT (e.g. dispatch) — per [ORCHESTRATOR.md](./ORCHESTRATOR.md).
- Watch Edge logs and `run_events` on first production runs.

---

## What is already in this repo

- [`vercel.json`](../vercel.json): Vite build, `dist` output, **rewrite** for **React Router** (client-side routes do not 404).
- This doc + checklist fixes in [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md) (correct Vite key).

---

## Lovable after cutover

Occasional LP / murd0ch work — merge to `main`; deploy the pr0ducent app from **Vercel**, not as the only source of truth — [LOVABLE-SECONDARY-LP.md](./LOVABLE-SECONDARY-LP.md).
