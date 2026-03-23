# GitHub Actions — deploy Supabase (migrations + Edge Functions)

Goal: after merge to `main`, **one job** applies migrations and publishes Edge Functions, instead of doing it only via Lovable CLI or manually.

## When you do not use this (Lovable Cloud)

If Supabase backend is **managed by Lovable** and you **do not** have your own account access to that project on [supabase.com](https://supabase.com/dashboard), you **cannot** obtain a usable `SUPABASE_ACCESS_TOKEN` or DB password — and **you do not need to**: leave the workflow disabled and rely on Lovable deploy. Details: [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## One-time setup (repository secrets)

In **GitHub → Settings → Secrets and variables → Actions** add:

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token from [Supabase Dashboard](https://supabase.com/dashboard/account/tokens) (project access). |
| `SUPABASE_PROJECT_REF` | Short project id from URL: `https://<PROJECT_REF>.supabase.co`. |

Optionally, if `supabase db push` in your CLI version requires the DB password:

| Secret | Description |
|--------|-------------|
| `SUPABASE_DB_PASSWORD` | Database password from **Project Settings → Database** (do not commit). |

The workflow exposes these as `env` for CLI steps (see [.github/workflows/supabase-deploy.yml](../.github/workflows/supabase-deploy.yml)).

## Workflow behavior

- Default: **`workflow_dispatch`** (manual run in Actions) — safe before you trust full automation.
- Optionally uncomment `push` / `branches: [main]` in the workflow file when you want deploy on every merge.

## After deploy

1. Check the job log in GitHub Actions.
2. In Supabase: **Edge Functions** and **Database** — confirm versions and migrations.
3. Webhook **INSERT `run_tasks`** — in Dashboard or another mechanism (e.g. migration with `pg_net`); see [SUPABASE-WEBHOOK-RUN-TASKS.md](./SUPABASE-WEBHOOK-RUN-TASKS.md) and [LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md](./LOVABLE-CLOUD-VS-GITHUB-SUPABASE.md).

## Related

- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
- [SPRINT-CLOSE.md](./SPRINT-CLOSE.md)
