# Post-MVP: Bring Your Own Account (BYOA)

See also: [Vercel + direct Supabase cutover](./VERCEL-SUPABASE-MIGRATION.md).

## Goal

After broker-mode MVP, allow users to connect **their own** builder accounts (OAuth or API keys) so runs execute on their quotas while pr0ducent still orchestrates prompts, comparison, scoring, and referrals.

## Database

Table `public.user_builder_credentials` (see migration `20260321120000_orchestrator_core.sql`):

- `user_id`, `tool_id`, `credential_type`, `vault_ref`
- **Never** store raw secrets in plaintext; `vault_ref` points to Supabase Vault / external KMS / sealed blob.

### Vault RPCs (migration `20260422130000_byoa_vault_credentials_rpc.sql`)

- **`public.save_user_builder_api_key(p_tool_id text, p_credential_type text, p_plaintext_secret text) → jsonb`**  
  - `SECURITY DEFINER`; **`authenticated`** only.  
  - Writes the secret with `vault.create_secret`, stores the returned secret **UUID** in `vault_ref`, and upserts `user_builder_credentials`.  
  - On replace, deletes the previous `vault.secrets` row by id when rotating.

- **`public.get_byoa_api_key_for_dispatch(p_user_id uuid, p_tool_id text, p_credential_type text default 'api_key') → text`**  
  - `SECURITY DEFINER`; **`service_role` only** (not callable by anon/authenticated).  
  - Used by Edge (`dispatch-builders`, `process-task-queue`) to read `vault.decrypted_secrets` for the stored UUID. Returns `NULL` when no BYOA row exists (broker mode).

- **`public.disconnect_user_builder_api_key(p_tool_id text, p_credential_type text default 'api_key') → jsonb`** (migration `20260423120000_disconnect_user_builder_api_key.sql`)  
  - `SECURITY DEFINER`; **`authenticated`** only.  
  - Deletes matching `vault.secrets` by id and stable name, then deletes the `user_builder_credentials` row. Returns `{ ok: true, removed: true|false }`.

## Observability

- Live adapter dispatches (non-benchmark) emit **`run_events.event_type = 'orchestrator.credential_source'`** with `payload.credential_source` of **`byoa`** or **`broker`** (no secrets in payload).

## Execution routing

- `builder_integration_config` gains per-user override or separate `user_adapter_routes` mapping:
  - `broker` vs `byoa` per `(user_id, tool_id)`.
- `dispatch-builders` and `process-task-queue` choose credential source per `(user_id, tool_id)`:
  - **broker**: platform keys from `builder_integration_config.api_secret_env` / env (existing behavior).
  - **byoa**: when a row exists in `user_builder_credentials`, `get_byoa_api_key_for_dispatch` resolves the Vault secret and adapters receive `byoaApiKeyOverride` (preferred over env).

## Security

- Encrypt at rest, rotate keys, audit every credential use with `run_events`.
- RLS: users only read their own credential rows.
- Legal: explicit consent when acting on user-owned accounts.

## UI

- Settings → Connected builders: connect / disconnect / test.
- Compare tiles show execution badge: `Your account` vs `Broker`.

## Billing

- Broker runs consume pr0ducent credits / subscription.
- BYOA runs may be cheaper or metered differently (policy TBD).

## Rollback / operations (Sprint C)

1. **Disable a builder integration** without touching Vault: `UPDATE builder_integration_config SET enabled = false WHERE tool_id = '…';` then redeploy Edge if needed.
2. **Emergency BYOA off for a user+tool**: run `disconnect_user_builder_api_key` as the user (UI) or delete the row + Vault secret via SQL as superuser (same logic as disconnect RPC).
3. **Revert Edge** to a prior deployment if orchestration changes misbehave; DB RPCs are backward-compatible if migrations are not rolled back.
4. **Never** log `byoaApiKeyOverride`, RPC plaintext arguments, or `vault.decrypted_secrets` contents in application logs.
