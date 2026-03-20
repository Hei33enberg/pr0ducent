-- Vault secret for pg_net trigger (see 20260320222441_ca9e4de6-a0d0-46ef-8df6-d68f1fc51696.sql).
-- Do NOT commit JWTs or service_role keys in SQL migrations.
--
-- One-time setup (SQL Editor in Supabase, or Vault UI):
--   SELECT vault.create_secret('<YOUR_SERVICE_ROLE_KEY>', 'service_role_key', 'pg_net → process-task-queue');
--
-- If a key was ever committed to git or pasted in chat, rotate it under Project Settings → API, then store the new value only in Vault.

SELECT 1;
