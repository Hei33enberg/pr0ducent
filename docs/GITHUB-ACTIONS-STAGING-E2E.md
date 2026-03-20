# GitHub Actions — staging E2E (`staging-e2e-v0`)

Workflow: [`.github/workflows/staging-e2e.yml`](../.github/workflows/staging-e2e.yml)  
Skrypt: [`scripts/staging-e2e-v0.mjs`](../scripts/staging-e2e-v0.mjs)

## Kiedy używać

- Ręcznie po deployu backendu (Supabase), **nie** na każdy PR (kosztuje wywołania v0).
- Trigger: **Actions** → **staging-e2e-v0** → **Run workflow**.

## Sekrety repozytorium

**Settings → Secrets and variables → Actions → New repository secret**

| Sekret | Opis |
|--------|------|
| `E2E_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `E2E_ANON_KEY` | Anon public key (jak w kliencie frontu). |
| `E2E_USER_JWT` | `access_token` użytkownika testowego (właściciel eksperymentu). |
| `E2E_EXPERIMENT_ID` | UUID wiersza z `public.experiments` dla tego użytkownika. |

JWT wygasa — odświeżaj sekret lub używaj dedykowanego konta service / długiej sesji zgodnie z polityką Auth.

## Lokalnie (bez GitHub)

```bash
set E2E_SUPABASE_URL=...
set E2E_ANON_KEY=...
set E2E_USER_JWT=...
set E2E_EXPERIMENT_ID=...
npm run test:e2e-staging
```

## Oczekiwany wynik

Skrypt kończy `exit 0`, gdy `builder_results` dla `v0` osiąga `completed` lub `error` w limicie czasu.

## Powiązane

- [PM-RUN-CHECKLIST.md](./PM-RUN-CHECKLIST.md)
- [OPERATIONS-RUNBOOK.md](./OPERATIONS-RUNBOOK.md)
