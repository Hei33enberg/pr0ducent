
-- Migration 1: orchestrator_core
CREATE TABLE IF NOT EXISTS public.builder_integration_config (
  tool_id TEXT PRIMARY KEY,
  tier INTEGER NOT NULL DEFAULT 4 CHECK (tier >= 1 AND tier <= 4),
  enabled BOOLEAN NOT NULL DEFAULT false,
  execution_modes TEXT[] NOT NULL DEFAULT ARRAY['benchmark']::text[],
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  api_secret_env TEXT,
  polling_function TEXT,
  max_poll_time_ms INTEGER NOT NULL DEFAULT 120000,
  poll_interval_ms INTEGER NOT NULL DEFAULT 3000,
  browserbase_script TEXT,
  mcp_endpoint TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_integration_config ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Anyone can read builder integration config"
    ON public.builder_integration_config FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

INSERT INTO public.builder_integration_config (
  tool_id, tier, enabled, execution_modes, capabilities, api_secret_env, polling_function
) VALUES (
  'v0', 1, true, ARRAY['live']::text[],
  '{"livePreview": true, "files": true, "deployLink": true}'::jsonb,
  'V0_API_KEY', 'poll-v0-status'
) ON CONFLICT (tool_id) DO UPDATE SET
  tier = EXCLUDED.tier, enabled = EXCLUDED.enabled,
  execution_modes = EXCLUDED.execution_modes, capabilities = EXCLUDED.capabilities,
  api_secret_env = EXCLUDED.api_secret_env, polling_function = EXCLUDED.polling_function,
  updated_at = now();

INSERT INTO public.builder_integration_config (tool_id, tier, enabled, execution_modes)
SELECT t.id, 4, false, ARRAY['benchmark']::text[]
FROM (VALUES ('lovable'),('replit'),('cursor'),('base44'),('antigravity'),('build0'),('orchids'),('floot'),('bolt')) AS t(id)
ON CONFLICT (tool_id) DO NOTHING;

-- run_events
CREATE TABLE IF NOT EXISTS public.run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  tool_id TEXT,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  trace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS run_events_experiment_id_created_at_idx ON public.run_events (experiment_id, created_at DESC);
ALTER TABLE public.run_events ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view run events for own experiments"
    ON public.run_events FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = run_events.experiment_id AND e.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view run events for public experiments"
    ON public.run_events FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = run_events.experiment_id AND e.is_public = true));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

-- builder_results extensions
ALTER TABLE public.builder_results
  ADD COLUMN IF NOT EXISTS execution_mode TEXT NOT NULL DEFAULT 'benchmark',
  ADD COLUMN IF NOT EXISTS adapter_tier INTEGER,
  ADD COLUMN IF NOT EXISTS provenance TEXT NOT NULL DEFAULT 'benchmark',
  ADD COLUMN IF NOT EXISTS provider_run_id TEXT,
  ADD COLUMN IF NOT EXISTS scores_reasoning JSONB DEFAULT '{}'::jsonb;

-- experiment_runs extension
ALTER TABLE public.experiment_runs
  ADD COLUMN IF NOT EXISTS scores_reasoning JSONB DEFAULT '{}'::jsonb;

-- credit_transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  experiment_id UUID REFERENCES public.experiments(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_created_at_idx ON public.credit_transactions (user_id, created_at DESC);
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can read own credit transactions"
    ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

-- builder_knowledge_chunks
CREATE TABLE IF NOT EXISTS public.builder_knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  source_url TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  checksum TEXT,
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS builder_knowledge_chunks_tool_id_idx ON public.builder_knowledge_chunks (tool_id);
ALTER TABLE public.builder_knowledge_chunks ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Anyone can read builder knowledge chunks"
    ON public.builder_knowledge_chunks FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

-- user_builder_credentials (BYOA stub)
CREATE TABLE IF NOT EXISTS public.user_builder_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  credential_type TEXT NOT NULL,
  vault_ref TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tool_id, credential_type)
);
ALTER TABLE public.user_builder_credentials ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users manage own builder credentials"
    ON public.user_builder_credentials FOR ALL TO authenticated
    USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $trg$ BEGIN
  CREATE TRIGGER update_user_builder_credentials_updated_at
    BEFORE UPDATE ON public.user_builder_credentials
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $trg$;

-- Realtime for builder_results + run_events
DO $pub$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='builder_results') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.builder_results;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='run_events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.run_events;
  END IF;
END $pub$;
