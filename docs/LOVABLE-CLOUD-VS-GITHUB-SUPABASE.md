# Lovable Cloud vs GitHub Actions vs Supabase — what works and what does not

Short guide so you do not spin in circles: **where `SUPABASE_ACCESS_TOKEN` comes from**, why **it is not in Lovable Secrets**, and when **you do not need to paste anything into GitHub**.

## Three separate things

1. **Secrets in Lovable Cloud** (`V0_API_KEY`, `STRIPE_*`, etc.) — go to **Edge Functions** hosted with your project. That is not the same as the Supabase Management API token.
2. **`SUPABASE_SERVICE_ROLE_KEY`** — Supabase **injects** it automatically into functions; it must not reach the frontend or a public repo.
3. **`SUPABASE_ACCESS_TOKEN` (Personal Access Token)** — a **user account** token on [supabase.com](https://supabase.com/dashboard/account/tokens). Used for CLI and automation on **projects that account can access**.

## Why you cannot “pull” a PAT out of Lovable

When **Lovable manages the Supabase backend for you**, you often **do not** have classic login to the same project in the Supabase dashboard or membership under your email. Then:

- You **cannot** log in to supabase.com for “that” project to generate a PAT with access to it.
- The workflow [.github/workflows/supabase-deploy.yml](../.github/workflows/supabase-deploy.yml) from [GITHUB-ACTIONS-SUPABASE-DEPLOY.md](./GITHUB-ACTIONS-SUPABASE-DEPLOY.md) is **not mandatory for you** — it is an alternative when **you** own the Supabase project under your account.

**Conclusion:** if **Lovable** deploys migrations and Edge Functions after pull from GitHub, you **can skip** adding `SUPABASE_*` secrets in GitHub. Nothing is “broken” because they are missing.

## Database password (`SUPABASE_DB_PASSWORD`)

Only needed when the **CLI** asks during `supabase db push`. With Lovable hosting the password is often **not shown** in the UI — again: **database deploy goes through Lovable**, not Actions.

## `run_tasks` queue without the Supabase Dashboard

- **`dispatch-builders`** after inserting tasks **still calls** `process-task-queue` (service role) and has an **inline fallback**, so the basic flow works without a Database Webhook.
- **Database Webhook** or **pg_net** trigger adds reliability / faster queue draining. If Lovable says it added a trigger in the database, ensure **the same logic lives in the repo** (SQL migration in `supabase/migrations/`) — otherwise you get **drift** between cloud and `main`.

Webhook setup from the dashboard: [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md).

## Next steps if you want full control (PAT + password + webhook in UI)

1. **New Supabase project** under your account (or project transfer — depends on Lovable policy).
2. Wire the frontend (Vercel etc.) and `VITE_SUPABASE_*` — outline: [VERCEL-SUPABASE-MIGRATION.md](./VERCEL-SUPABASE-MIGRATION.md).
3. Then a **PAT in GitHub** + optional `supabase-deploy` workflow makes sense.

## Related

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [BUILDERS-101.md](./BUILDERS-101.md)
