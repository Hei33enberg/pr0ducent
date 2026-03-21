-- Catch-up: add VBP/generic-REST columns to builder_integration_config (from repo migrations)

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS integration_type TEXT NOT NULL DEFAULT 'manual';

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS api_base_url TEXT;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS auth_type TEXT;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS request_template JSONB;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS response_id_path TEXT;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS poll_url_template TEXT;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS poll_status_path TEXT;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS poll_completed_values TEXT[] NOT NULL DEFAULT ARRAY['completed', 'done', 'finished']::text[];

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS poll_result_paths JSONB;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS phantom_ttl_hours INTEGER NOT NULL DEFAULT 24;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS circuit_opened_at TIMESTAMPTZ;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS poll_failed_values TEXT[] NOT NULL DEFAULT ARRAY['failed', 'error', 'timeout', 'cancelled']::text[];

-- v0 integration_type
UPDATE public.builder_integration_config
SET integration_type = 'rest_api'
WHERE tool_id = 'v0' AND (integration_type IS NULL OR integration_type = 'manual');

-- run_tasks: next_retry_at for scheduled retry
ALTER TABLE public.run_tasks
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

-- builder_crawl_sources
CREATE TABLE IF NOT EXISTS public.builder_crawl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'docs',
  enabled BOOLEAN NOT NULL DEFAULT true,
  crawl_frequency_hours INTEGER NOT NULL DEFAULT 24,
  last_crawled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Circuit state constraint (ignore if exists)
DO $c$ BEGIN
  ALTER TABLE public.builder_integration_config
    ADD CONSTRAINT builder_integration_config_circuit_state_chk
    CHECK (circuit_state IN ('closed', 'open', 'half_open'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $c$;