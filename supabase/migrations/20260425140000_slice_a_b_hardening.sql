-- Slice A: terminal status dead_letter (max retry attempts handled in process-task-queue).
-- Slice B: idempotent webhook deliveries by raw body SHA-256.

-- ---------------------------------------------------------------------------
-- run_tasks: add dead_letter to status CHECK (drop/recreate named constraint)
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  WHERE con.conrelid = 'public.run_tasks'::regclass
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%status%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.run_tasks DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE public.run_tasks ADD CONSTRAINT run_tasks_status_check CHECK (status IN (
  'queued', 'dispatched', 'auth_wait', 'building', 'artifact_ready',
  'scored', 'completed', 'retrying', 'failed', 'cancelled', 'expired', 'benchmark',
  'dead_letter'
));

-- ---------------------------------------------------------------------------
-- Deduplicate webhook POSTs (same body = same hash; second insert no-op)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pbp_webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  body_sha256 text NOT NULL UNIQUE,
  received_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.pbp_webhook_deliveries IS
  'Idempotency ledger for pbp-webhook: first POST with body SHA-256 wins; duplicates are rejected at insert.';

ALTER TABLE public.pbp_webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- No grants to anon/authenticated; Edge Functions use service role only.
