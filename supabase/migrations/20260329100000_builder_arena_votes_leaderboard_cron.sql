-- Phase E follow-up: pairwise arena votes (anon OK) + pg_cron refresh MV every 10 min.
-- builder_benchmark_scores + builder_leaderboard unchanged (see 20260328120000_sprint3_benchmark_social.sql).

-- ---------------------------------------------------------------------------
-- builder_arena_votes: SWE-Arena style pair outcomes (UI: usePairwiseVote.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.builder_arena_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  tool_a_id TEXT NOT NULL,
  tool_b_id TEXT NOT NULL,
  winner_tool_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT builder_arena_votes_distinct_tools CHECK (tool_a_id <> tool_b_id),
  CONSTRAINT builder_arena_votes_winner CHECK (
    winner_tool_id IS NULL
    OR winner_tool_id = tool_a_id
    OR winner_tool_id = tool_b_id
  )
);

CREATE INDEX IF NOT EXISTS builder_arena_votes_experiment_id_idx
  ON public.builder_arena_votes (experiment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS builder_arena_votes_pair_idx
  ON public.builder_arena_votes (experiment_id, tool_a_id, tool_b_id);

ALTER TABLE public.builder_arena_votes ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view arena votes for public experiments"
    ON public.builder_arena_votes FOR SELECT TO anon, authenticated
    USING (EXISTS (
      SELECT 1 FROM public.experiments e
      WHERE e.id = builder_arena_votes.experiment_id AND e.is_public = true
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Users can view arena votes for own experiments"
    ON public.builder_arena_votes FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.experiments e
      WHERE e.id = builder_arena_votes.experiment_id AND e.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

-- Inserts: public experiment only; user_id NULL = anon; else must match auth.uid()
DO $p$ BEGIN
  CREATE POLICY "Insert arena votes on public experiments"
    ON public.builder_arena_votes FOR INSERT TO anon, authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.experiments e
        WHERE e.id = experiment_id AND e.is_public = true
      )
      AND (user_id IS NULL OR user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

COMMENT ON TABLE public.builder_arena_votes IS
  'Pairwise arena outcomes; winner_tool_id NULL = tie. Anonymous: user_id NULL.';

-- ---------------------------------------------------------------------------
-- pg_cron: refresh leaderboard MV every 10 minutes (CONCURRENTLY needs UNIQUE on MV)
-- ---------------------------------------------------------------------------
DO $c$
DECLARE
  jid BIGINT;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'refresh-builder-leaderboard' LIMIT 1;
  IF jid IS NOT NULL THEN
    PERFORM cron.unschedule(jid);
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
  WHEN OTHERS THEN
    RAISE WARNING 'cron unschedule refresh-builder-leaderboard skipped: %', SQLERRM;
END $c$;

DO $c$
BEGIN
  PERFORM cron.schedule(
    'refresh-builder-leaderboard',
    '*/10 * * * *',
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY public.builder_leaderboard$$
  );
EXCEPTION
  WHEN undefined_table THEN
    RAISE WARNING 'pg_cron not available; schedule REFRESH MV manually (see docs/AG-SPRINT3-HANDOFF.md)';
  WHEN OTHERS THEN
    RAISE WARNING 'cron.schedule failed (run in SQL editor as superuser if needed): %', SQLERRM;
END $c$;
