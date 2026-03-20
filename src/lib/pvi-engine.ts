/**
 * @module PVI Benchmark Engine — 10-dim scoring (ComparisonCanvas, Leaderboard, BuilderProfile)
 */
import { BenchmarkScores, BuilderBenchmarkScoreRow, UserVoteRow } from "@/types/benchmark";

export type PVIDimensions =
  | "score_speed"
  | "score_reliability"
  | "score_cost_efficiency"
  | "score_deploy_readiness"
  | "score_mobile_responsiveness"
  | "score_accessibility"
  | "score_web_vitals"
  | "score_ui_quality"
  | "score_completeness"
  | "score_code_quality";

export const PVI_WEIGHTS: Record<keyof BenchmarkScores, number> = {
  speed: 0.10,
  reliability: 0.10,
  costEfficiency: 0.05,
  deployReadiness: 0.10,
  mobileResponsiveness: 0.10,
  accessibility: 0.05,
  webVitals: 0.10,
  uiQuality: 0.15,
  completeness: 0.15,
  codeQuality: 0.10
};

/**
 * Maps the flat database row into the structured BenchmarkScores object.
 */
export function mapRowToScores(row: BuilderBenchmarkScoreRow | Partial<BuilderBenchmarkScoreRow>): BenchmarkScores {
  return {
    speed: row.score_speed ?? null,
    reliability: row.score_reliability ?? null,
    costEfficiency: row.score_cost_efficiency ?? null,
    deployReadiness: row.score_deploy_readiness ?? null,
    mobileResponsiveness: row.score_mobile_responsiveness ?? null,
    accessibility: row.score_accessibility ?? null,
    webVitals: row.score_web_vitals ?? null,
    uiQuality: row.score_ui_quality ?? null,
    completeness: row.score_completeness ?? null,
    codeQuality: row.score_code_quality ?? null,
  };
}

/**
 * Computes the Producer Viability Index (PVI) for a single builder output.
 * 
 * PVI = Σ (dimension_i × weight_i) + community_boost + freshness_factor
 * 
 * @param scores Standardized 0-100 scores for the 10 dimensions
 * @param votes Array of user votes (-1 or 1) attached to this specific run
 * @param createdAt Date string of when the run was generated (for decay math)
 */
export function computePVI(
  scores: BenchmarkScores,
  votes: UserVoteRow[] = [],
  createdAt?: string
): number {
  let totalScore = 0;
  let weightSum = 0;

  // 1. Base Weighted Score
  const keys = Object.keys(PVI_WEIGHTS) as (keyof BenchmarkScores)[];
  for (const k of keys) {
    const val = scores[k];
    if (val !== null && val !== undefined) {
      totalScore += val * PVI_WEIGHTS[k];
      weightSum += PVI_WEIGHTS[k];
    }
  }

  // If we have partial data, we normalize the multiplier so it's still 0-100 scale.
  // Example: if only 50% of weight is available, we multiply by (1 / 0.5) = 2.
  let basePVI = weightSum > 0 ? (totalScore / weightSum) : 0;

  // 2. Community Boost
  let communityBoost = 0;
  if (votes.length > 0) {
    const upvotes = votes.filter(v => v.vote === 1).length;
    const ratio = upvotes / votes.length;
    
    // Scale: ratio 0.5 -> 0 boost. ratio 1.0 -> +5 boost. ratio 0.0 -> -5 boost
    communityBoost = (ratio - 0.5) * 10; 
  }

  // 3. Freshness Decay
  let decayFactor = 1.0;
  if (createdAt) {
    const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    // Decay: ~0.95 multiplier for every 30 days
    if (daysOld > 30) {
      const periods = Math.floor(daysOld / 30);
      decayFactor = Math.pow(0.95, periods);
    }
  }

  const finalPvi = (basePVI + communityBoost) * decayFactor;
  
  // Return clamped between 0 and 100, rounded to 1 decimal place
  return Math.round(Math.max(0, Math.min(100, finalPvi)) * 10) / 10;
}
