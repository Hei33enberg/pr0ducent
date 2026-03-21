# Lovable / prod: Sprint C BYOA (deploy checklist)

Sprint C adds disconnect RPC, typed client RPCs, dashboard rotate/disconnect UI, `orchestrator.credential_source` run events, and rollback notes in [BYOA-MIGRATION.md](./BYOA-MIGRATION.md).

## Migrations (apply in order on Supabase)

If not already applied:

1. `20260422130000_byoa_vault_credentials_rpc.sql` — `save_user_builder_api_key`, `get_byoa_api_key_for_dispatch`
2. `20260423120000_disconnect_user_builder_api_key.sql` — `disconnect_user_builder_api_key`
3. `20260424120000_byoa_rpc_grants_hardening.sql` — explicit `REVOKE` from `anon` / `authenticated` where needed (aligns with prod hardening)

Grant sanity:

- `save_user_builder_api_key` → `authenticated` only (not `anon`)
- `get_byoa_api_key_for_dispatch` → `service_role` only (not `anon` / `authenticated`)
- `disconnect_user_builder_api_key` → `authenticated` only (not `anon`). Uses `auth.uid()`; do **not** rely on `service_role` for this RPC from Edge (no user context).

Note: If a deploy checklist mentions `service_role` on `disconnect`, treat it as redundant or a misread — the function is designed for logged-in users only.

## Edge Functions (redeploy)

Redeploy at least:

- `dispatch-builders`
- `process-task-queue`

Shared helpers: `_shared/byoa.ts`, `_shared/orchestrator-events.ts` (credential_source audit).

## Smoke (after deploy)

1. Dashboard → My Builders: Connect key → success; Rotate → success; Disconnect → confirm → list updates.  
2. Optional: one dispatch with BYOA and check `run_events` for `event_type = orchestrator.credential_source` and `payload.credential_source` in (`byoa`, `broker`).  
3. No API keys or Vault plaintext in logs.

## Frontend

Uses typed `supabase.rpc` for save/disconnect; no secrets in `window` events — only `pr0ducent:byoa` with `{ action, toolId }`.
