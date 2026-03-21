-- Explicit terminal failure states for generic REST / VBP polling (success uses poll_completed_values).
ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS poll_failed_values TEXT[] NOT NULL DEFAULT ARRAY['failed', 'error', 'timeout', 'cancelled']::text[];

COMMENT ON COLUMN public.builder_integration_config.poll_failed_values IS
  'Terminal failure status strings from GET poll JSON (e.g. VBP status failed/timeout/cancelled).';
