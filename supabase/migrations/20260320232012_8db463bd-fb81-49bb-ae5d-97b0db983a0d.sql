-- Sprint 3: builder_benchmark_scores table
CREATE TABLE IF NOT EXISTS public.builder_benchmark_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.experiments(id) ON DELETE CASCADE,
  builder_result_id UUID NOT NULL REFERENCES public.builder_results(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  score_speed NUMERIC,
  score_reliability NUMERIC,
  score_cost_efficiency NUMERIC,
  score_deploy_readiness NUMERIC,
  score_mobile_responsiveness NUMERIC,
  score_accessibility NUMERIC,
  score_web_vitals NUMERIC,
  score_ui_quality NUMERIC,
  score_completeness NUMERIC,
  score_code_quality NUMERIC,
  ai_reasoning JSONB DEFAULT '{}'::jsonb,
  scoring_model TEXT,
  pvi_score NUMERIC,
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT builder_benchmark_scores_speed_range CHECK (score_speed IS NULL OR (score_speed >= 0 AND score_speed <= 100)),
  CONSTRAINT builder_benchmark_scores_reliability_range CHECK (score_reliability IS NULL OR (score_reliability >= 0 AND score_reliability <= 100)),
  CONSTRAINT builder_benchmark_scores_cost_range CHECK (score_cost_efficiency IS NULL OR (score_cost_efficiency >= 0 AND score_cost_efficiency <= 100)),
  CONSTRAINT builder_benchmark_scores_deploy_range CHECK (score_deploy_readiness IS NULL OR (score_deploy_readiness >= 0 AND score_deploy_readiness <= 100)),
  CONSTRAINT builder_benchmark_scores_mobile_range CHECK (score_mobile_responsiveness IS NULL OR (score_mobile_responsiveness >= 0 AND score_mobile_responsiveness <= 100)),
  CONSTRAINT builder_benchmark_scores_a11y_range CHECK (score_accessibility IS NULL OR (score_accessibility >= 0 AND score_accessibility <= 100)),
  CONSTRAINT builder_benchmark_scores_vitals_range CHECK (score_web_vitals IS NULL OR (score_web_vitals >= 0 AND score_web_vitals <= 100)),
  CONSTRAINT builder_benchmark_scores_uiq_range CHECK (score_ui_quality IS NULL OR (score_ui_quality >= 0 AND score_ui_quality <= 100)),
  CONSTRAINT builder_benchmark_scores_complete_range CHECK (score_completeness IS NULL OR (score_completeness >= 0 AND score_completeness <= 100)),
  CONSTRAINT builder_benchmark_scores_code_range CHECK (score_code_quality IS NULL OR (score_code_quality >= 0 AND score_code_quality <= 100)),
  CONSTRAINT builder_benchmark_scores_pvi_range CHECK (pvi_score IS NULL OR (pvi_score >= 0 AND pvi_score <= 100)),
  UNIQUE (builder_result_id)
);

CREATE INDEX IF NOT EXISTS builder_benchmark_scores_tool_id_idx ON public.builder_benchmark_scores (tool_id);
CREATE INDEX IF NOT EXISTS builder_benchmark_scores_experiment_id_idx ON public.builder_benchmark_scores (experiment_id);
CREATE INDEX IF NOT EXISTS builder_benchmark_scores_scored_at_idx ON public.builder_benchmark_scores (scored_at DESC);

ALTER TABLE public.builder_benchmark_scores ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view benchmark scores for own experiments"
    ON public.builder_benchmark_scores FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.experiments e
      WHERE e.id = builder_benchmark_scores.experiment_id AND e.user_id = auth.uid()
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view benchmark scores for public experiments"
    ON public.builder_benchmark_scores FOR SELECT TO anon, authenticated
    USING (EXISTS (
      SELECT 1 FROM public.experiments e
      WHERE e.id = builder_benchmark_scores.experiment_id AND e.is_public = true
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

-- user_votes table
CREATE TABLE IF NOT EXISTS public.user_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_result_id UUID NOT NULL REFERENCES public.builder_results(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  vote_kind TEXT NOT NULL DEFAULT 'result' CHECK (vote_kind IN ('result', 'pairwise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_votes_user_result_kind_uidx ON public.user_votes (user_id, builder_result_id, vote_kind);
CREATE INDEX IF NOT EXISTS user_votes_builder_result_id_idx ON public.user_votes (builder_result_id);
CREATE INDEX IF NOT EXISTS user_votes_tool_id_idx ON public.user_votes (tool_id);

ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view votes on visible builder results"
    ON public.user_votes FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.builder_results br
      JOIN public.experiments e ON e.id = br.experiment_id
      WHERE br.id = user_votes.builder_result_id
        AND (e.user_id = auth.uid() OR e.is_public = true)
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view votes for public experiments"
    ON public.user_votes FOR SELECT TO anon, authenticated
    USING (EXISTS (
      SELECT 1 FROM public.builder_results br
      JOIN public.experiments e ON e.id = br.experiment_id
      WHERE br.id = user_votes.builder_result_id AND e.is_public = true
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Authenticated users can insert own votes on visible results"
    ON public.user_votes FOR INSERT TO authenticated
    WITH CHECK (
      auth.uid() = user_id
      AND vote_kind = 'result'
      AND EXISTS (
        SELECT 1 FROM public.builder_results br
        JOIN public.experiments e ON e.id = br.experiment_id
        WHERE br.id = builder_result_id
          AND (e.user_id = auth.uid() OR e.is_public = true)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Users can update own votes"
    ON public.user_votes FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id AND vote_kind = 'result');
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Users can delete own votes"
    ON public.user_votes FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

-- user_comments table
CREATE TABLE IF NOT EXISTS public.user_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_result_id UUID NOT NULL REFERENCES public.builder_results(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) <= 8000),
  sentiment TEXT CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_comments_builder_result_id_idx ON public.user_comments (builder_result_id);
CREATE INDEX IF NOT EXISTS user_comments_tool_id_idx ON public.user_comments (tool_id);

ALTER TABLE public.user_comments ENABLE ROW LEVEL SECURITY;

DO $p$ BEGIN
  CREATE POLICY "Users can view comments on visible builder results"
    ON public.user_comments FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.builder_results br
      JOIN public.experiments e ON e.id = br.experiment_id
      WHERE br.id = user_comments.builder_result_id
        AND (e.user_id = auth.uid() OR e.is_public = true)
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Anyone can view comments for public experiments"
    ON public.user_comments FOR SELECT TO anon, authenticated
    USING (EXISTS (
      SELECT 1 FROM public.builder_results br
      JOIN public.experiments e ON e.id = br.experiment_id
      WHERE br.id = user_comments.builder_result_id AND e.is_public = true
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Authenticated users can insert own comments on visible results"
    ON public.user_comments FOR INSERT TO authenticated
    WITH CHECK (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1 FROM public.builder_results br
        JOIN public.experiments e ON e.id = br.experiment_id
        WHERE br.id = builder_result_id
          AND (e.user_id = auth.uid() OR e.is_public = true)
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Users can update own comments"
    ON public.user_comments FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

DO $p$ BEGIN
  CREATE POLICY "Users can delete own comments"
    ON public.user_comments FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $p$;

CREATE TRIGGER update_user_comments_updated_at
  BEFORE UPDATE ON public.user_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Materialized leaderboard view
DROP MATERIALIZED VIEW IF EXISTS public.builder_leaderboard;

CREATE MATERIALIZED VIEW public.builder_leaderboard AS
SELECT
  bbs.tool_id,
  COUNT(*)::BIGINT AS total_runs,
  COUNT(*) FILTER (WHERE br.preview_url IS NOT NULL AND btrim(br.preview_url) <> '')::BIGINT AS runs_with_preview,
  ROUND(AVG(bbs.pvi_score) FILTER (WHERE bbs.pvi_score IS NOT NULL)::NUMERIC, 2) AS avg_pvi,
  MAX(bbs.pvi_score) AS best_pvi,
  MAX(bbs.scored_at) AS last_scored_at
FROM public.builder_benchmark_scores bbs
JOIN public.builder_results br ON br.id = bbs.builder_result_id
GROUP BY bbs.tool_id;

CREATE UNIQUE INDEX builder_leaderboard_tool_id_uidx ON public.builder_leaderboard (tool_id);

GRANT SELECT ON public.builder_leaderboard TO anon, authenticated;