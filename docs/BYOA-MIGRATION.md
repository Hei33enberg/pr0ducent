# Post-MVP: Bring Your Own Account (BYOA)

See also: [Vercel + direct Supabase cutover](./VERCEL-SUPABASE-MIGRATION.md).

## Goal

After broker-mode MVP, allow users to connect **their own** builder accounts (OAuth or API keys) so runs execute on their quotas while pr0ducent still orchestrates prompts, comparison, scoring, and referrals.

## Database

Table `public.user_builder_credentials` (see migration `20260321120000_orchestrator_core.sql`):

- `user_id`, `tool_id`, `credential_type`, `vault_ref`
- **Never** store raw secrets in plaintext; `vault_ref` points to Supabase Vault / external KMS / sealed blob.

## Execution routing

- `builder_integration_config` gains per-user override or separate `user_adapter_routes` mapping:
  - `broker` vs `byoa` per `(user_id, tool_id)`.
- `dispatch-builders` (or successor orchestrator) chooses credential source:
  - broker: pooled enterprise keys / browser sessions.
  - byoa: resolve `vault_ref` and attach to adapter.

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
