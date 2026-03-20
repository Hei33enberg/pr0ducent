-- Extend MV with per-dimension averages so /leaderboard can sort without mock-only columns.
DROP MATERIALIZED VIEW IF EXISTS public.builder_leaderboard;

CREATE MATERIALIZED VIEW public.builder_leaderboard AS
SELECT
  bbs.tool_id,
  COUNT(*)::BIGINT AS total_runs,
  COUNT(*) FILTER (WHERE br.preview_url IS NOT NULL AND btrim(br.preview_url) <> '')::BIGINT AS runs_with_preview,
  ROUND(AVG(bbs.pvi_score) FILTER (WHERE bbs.pvi_score IS NOT NULL)::NUMERIC, 2) AS avg_pvi,
  MAX(bbs.pvi_score) AS best_pvi,
  ROUND(AVG(bbs.score_speed) FILTER (WHERE bbs.score_speed IS NOT NULL)::NUMERIC, 2) AS avg_speed,
  ROUND(AVG(bbs.score_ui_quality) FILTER (WHERE bbs.score_ui_quality IS NOT NULL)::NUMERIC, 2) AS avg_ui_quality,
  ROUND(AVG(bbs.score_code_quality) FILTER (WHERE bbs.score_code_quality IS NOT NULL)::NUMERIC, 2) AS avg_code_quality,
  MAX(bbs.scored_at) AS last_scored_at
FROM public.builder_benchmark_scores bbs
JOIN public.builder_results br ON br.id = bbs.builder_result_id
GROUP BY bbs.tool_id;

CREATE UNIQUE INDEX builder_leaderboard_tool_id_uidx
  ON public.builder_leaderboard (tool_id);

GRANT SELECT ON public.builder_leaderboard TO anon, authenticated;

COMMENT ON MATERIALIZED VIEW public.builder_leaderboard IS
  'Aggregated PVI per tool. REFRESH CONCURRENTLY requires UNIQUE(tool_id).';
