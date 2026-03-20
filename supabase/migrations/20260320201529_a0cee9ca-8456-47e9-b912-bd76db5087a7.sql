
-- run_jobs
CREATE TABLE IF NOT EXISTS public.run_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('queued','running','completed','failed','cancelled','expired')),
  idempotency_key TEXT,
  trace_id TEXT NOT NULL,
  workflow_engine TEXT NOT NULL DEFAULT 'supabase_edge',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS run_jobs_user_idempotency_idx ON public.run_jobs (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS run_jobs_experiment_id_idx ON public.run_jobs (experiment_id DESC);
ALTER TABLE public.run_jobs ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view run_jobs for own experiments" ON public.run_jobs FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = run_jobs.experiment_id AND e.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view run_jobs for public experiments" ON public.run_jobs FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = run_jobs.experiment_id AND e.is_public = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $p$;

DO $trg$ BEGIN
  CREATE TRIGGER update_run_jobs_updated_at BEFORE UPDATE ON public.run_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $trg$;

-- broker_pool_accounts
CREATE TABLE IF NOT EXISTS public.broker_pool_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','draining','suspended')),
  health_score NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tool_id, label)
);
INSERT INTO public.broker_pool_accounts (tool_id, label, status, health_score) VALUES ('v0','default','active',1.0) ON CONFLICT (tool_id, label) DO NOTHING;

-- run_tasks
CREATE TABLE IF NOT EXISTS public.run_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_job_id UUID NOT NULL REFERENCES public.run_jobs(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','dispatched','auth_wait','building','artifact_ready','scored','completed','retrying','failed','cancelled','expired','benchmark')),
  adapter_tier INTEGER,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  broker_lease_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (run_job_id, tool_id)
);
CREATE INDEX IF NOT EXISTS run_tasks_experiment_tool_idx ON public.run_tasks (experiment_id, tool_id, created_at DESC);
CREATE INDEX IF NOT EXISTS run_tasks_run_job_id_idx ON public.run_tasks (run_job_id);
ALTER TABLE public.run_tasks ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view run_tasks for own experiments" ON public.run_tasks FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = run_tasks.experiment_id AND e.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view run_tasks for public experiments" ON public.run_tasks FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.experiments e WHERE e.id = run_tasks.experiment_id AND e.is_public = true));
EXCEPTION WHEN duplicate_object THEN NULL; END $p$;

DO $trg$ BEGIN
  CREATE TRIGGER update_run_tasks_updated_at BEFORE UPDATE ON public.run_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $trg$;

-- broker_account_leases
CREATE TABLE IF NOT EXISTS public.broker_account_leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_account_id UUID NOT NULL REFERENCES public.broker_pool_accounts(id) ON DELETE CASCADE,
  run_task_id UUID NOT NULL REFERENCES public.run_tasks(id) ON DELETE CASCADE,
  leased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '4 hours')
);
CREATE INDEX IF NOT EXISTS broker_account_leases_task_idx ON public.broker_account_leases (run_task_id);
ALTER TABLE public.broker_account_leases ENABLE ROW LEVEL SECURITY;

DO $cf$ BEGIN
  ALTER TABLE public.run_tasks ADD CONSTRAINT run_tasks_broker_lease_id_fkey
    FOREIGN KEY (broker_lease_id) REFERENCES public.broker_account_leases(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $cf$;

-- Link events + builder_results to job/task
ALTER TABLE public.run_events
  ADD COLUMN IF NOT EXISTS run_job_id UUID REFERENCES public.run_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS run_task_id UUID REFERENCES public.run_tasks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS run_events_run_job_id_idx ON public.run_events (run_job_id);
CREATE INDEX IF NOT EXISTS run_events_run_task_id_idx ON public.run_events (run_task_id);

ALTER TABLE public.builder_results
  ADD COLUMN IF NOT EXISTS run_task_id UUID REFERENCES public.run_tasks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS builder_results_run_task_id_idx ON public.builder_results (run_task_id);

-- referral_conversions
CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  conversion_type TEXT NOT NULL DEFAULT 'builder_handoff',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referral_conversions_user_created_idx ON public.referral_conversions (user_id, created_at DESC);
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view own referral conversions" ON public.referral_conversions FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $p$;

DO $p$ BEGIN
  CREATE POLICY "Users can insert own referral conversions" ON public.referral_conversions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $p$;

-- builder_ingest_alerts
CREATE TABLE IF NOT EXISTS public.builder_ingest_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS builder_ingest_alerts_tool_created_idx ON public.builder_ingest_alerts (tool_id, created_at DESC);
ALTER TABLE public.builder_ingest_alerts ENABLE ROW LEVEL SECURITY;

-- Realtime for run_tasks
DO $pub$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='run_tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.run_tasks;
  END IF;
END $pub$;
