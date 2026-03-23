# GitHub Actions — staging E2E (`staging-e2e-v0`)

Workflow: [`.github/workflows/staging-e2e.yml`](../.github/workflows/staging-e2e.yml)  
Script: [`scripts/staging-e2e-v0.mjs`](../scripts/staging-e2e-v0.mjs)

## When to use

- Manually after backend (Supabase) deploy, **not** on every PR (costs v0 calls).
- Trigger: **Actions** → **staging-e2e-v0** → **Run workflow**.

## Repository secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description |
|--------|-------------|
| `E2E_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `E2E_ANON_KEY` | Anon public key (same as frontend client). |
| `E2E_USER_JWT` | Test user `access_token` (experiment owner). |
| `E2E_EXPERIMENT_ID` | UUID row in `public.experiments` for that user. |

JWTs expire — refresh the secret or use a dedicated service account / longer session per policy.

## Locally (without GitHub)

```bash
set E2E_SUPABASE_URL=...
set E2E_ANON_KEY=...
set E2E_USER_JWT=...
set E2E_EXPERIMENT_ID=...
npm run test:e2e-staging
```

## Expected result

Script exits `0` when `builder_results` for `v0` reaches `completed` or `error` within the time limit.

## Related

- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
