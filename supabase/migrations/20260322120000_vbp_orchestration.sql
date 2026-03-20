-- VBP / orchestration: extended builder config, rate limits, task retry, crawl sources.

-- ---------------------------------------------------------------------------
-- builder_integration_config: VBP + generic REST + circuit breaker
-- ---------------------------------------------------------------------------
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
  ADD COLUMN IF NOT EXISTS circuit_state TEXT NOT NULL DEFAULT 'closed';

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS circuit_opened_at TIMESTAMPTZ;

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0;

DO $c$ BEGIN
  ALTER TABLE public.builder_integration_config
    ADD CONSTRAINT builder_integration_config_circuit_state_chk
    CHECK (circuit_state IN ('closed', 'open', 'half_open'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $c$;

-- v0 uses dedicated adapter; mark as REST for documentation (optional)
UPDATE public.builder_integration_config
SET integration_type = 'rest_api'
WHERE tool_id = 'v0' AND (integration_type IS NULL OR integration_type = 'manual');

-- ---------------------------------------------------------------------------
-- run_tasks: scheduled retry
-- ---------------------------------------------------------------------------
ALTER TABLE public.run_tasks
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS run_tasks_queued_retry_idx
  ON public.run_tasks (status, next_retry_at)
  WHERE status = 'queued' OR status = 'retrying';

-- ---------------------------------------------------------------------------
-- builder_rate_limits: per-tool broker throttling (MVP counters)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.builder_rate_limits (
  tool_id TEXT PRIMARY KEY,
  max_concurrent INTEGER NOT NULL DEFAULT 5,
  max_per_minute INTEGER NOT NULL DEFAULT 60,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requests_in_window INTEGER NOT NULL DEFAULT 0,
  active_dispatches INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_rate_limits ENABLE ROW LEVEL SECURITY;

INSERT INTO public.builder_rate_limits (tool_id, max_concurrent, max_per_minute)
VALUES ('v0', 5, 30)
ON CONFLICT (tool_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- builder_crawl_sources: docs / API pages for RAG crawler
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.builder_crawl_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'api_docs',
  crawl_interval_hours INTEGER NOT NULL DEFAULT 24,
  last_crawled_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tool_id, source_url)
);

CREATE INDEX IF NOT EXISTS builder_crawl_sources_tool_enabled_idx
  ON public.builder_crawl_sources (tool_id, enabled);

ALTER TABLE public.builder_crawl_sources ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Anyone can read builder crawl sources"
    ON public.builder_crawl_sources FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;
