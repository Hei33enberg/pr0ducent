-- Phase E: builder_arena_votes + pg_cron refresh leaderboard MV

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