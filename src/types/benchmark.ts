export interface BenchmarkScores {
  speed: number | null;                 // 0-100
  reliability: number | null;           // 0-100
  costEfficiency: number | null;        // 0-100
  deployReadiness: number | null;       // 0-100
  mobileResponsiveness: number | null;  // 0-100
  accessibility: number | null;         // 0-100
  webVitals: number | null;             // 0-100
  uiQuality: number | null;             // 0-100
  completeness: number | null;          // 0-100
  codeQuality: number | null;           // 0-100
}

export interface BuilderBenchmarkScoreRow {
  id: string;
  experiment_id: string;
  builder_result_id: string;
  tool_id: string;
  
  score_speed: number | null;
  score_reliability: number | null;
  score_cost_efficiency: number | null;
  score_deploy_readiness: number | null;
  score_mobile_responsiveness: number | null;
  score_accessibility: number | null;
  score_web_vitals: number | null;
  score_ui_quality: number | null;
  score_completeness: number | null;
  score_code_quality: number | null;

  ai_reasoning: Record<string, string> | null;
  scoring_model: string | null;
  pvi_score: number | null;
  scored_at: string;
}

export interface UserVoteRow {
  id: string;
  user_id: string;
  builder_result_id: string;
  tool_id: string;
  vote: -1 | 1;
  rating: number | null; // 1-5
  /** `result` = simple up/down; `pairwise` reserved for future Arena (schema parking lot). */
  vote_kind?: "result" | "pairwise";
  created_at: string;
}

export interface UserCommentRow {
  id: string;
  user_id: string;
  builder_result_id: string;
  tool_id: string;
  body: string;
  sentiment: "positive" | "neutral" | "negative" | null;
  created_at: string;
  profiles?: {
    email: string;
    avatar_url: string | null;
  };
}
