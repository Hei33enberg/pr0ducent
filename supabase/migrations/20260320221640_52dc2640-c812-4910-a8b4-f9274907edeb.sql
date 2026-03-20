-- Add missing columns from 20260322120000_vbp_orchestration migration

ALTER TABLE public.builder_integration_config
  ADD COLUMN IF NOT EXISTS circuit_state text NOT NULL DEFAULT 'closed';

ALTER TABLE public.run_tasks
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz;

CREATE TABLE IF NOT EXISTS public.builder_crawl_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id text NOT NULL,
  source_url text NOT NULL,
  source_type text NOT NULL DEFAULT 'docs',
  enabled boolean NOT NULL DEFAULT true,
  crawl_frequency_hours integer NOT NULL DEFAULT 24,
  last_crawled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tool_id, source_url)
);

ALTER TABLE public.builder_crawl_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crawl sources" ON public.builder_crawl_sources
  FOR SELECT TO anon, authenticated USING (true);