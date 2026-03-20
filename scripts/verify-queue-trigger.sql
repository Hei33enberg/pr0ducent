-- Run in Supabase SQL Editor (service role / postgres) to verify queue automation.
-- Expected after migrations: 20260320222441 (trigger), 20260320222502 (vault instructions; secret set by operator).

SELECT tgname AS trigger_name
FROM pg_trigger
WHERE tgrelid = 'public.run_tasks'::regclass
  AND tgname = 'trg_run_tasks_auto_dispatch';

-- Vault (optional; schema name may differ by Supabase version):
-- SELECT name FROM vault.secrets WHERE name = 'service_role_key';
