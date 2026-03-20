/**
 * Sprint 3 — Grupa A: pipeline + rubric-derived dimensions only.
 * Grupa B (Lighthouse, axe, web vitals) and Grupa C (LLM batch) belong in async workers,
 * not inside long Edge Function invokes — see score-builder-output header comment.
 */

/** Aligned with `src/lib/pvi-engine.ts` PVI_WEIGHTS */
const PVI_WEIGHTS = {
  speed: 0.1,
  reliability: 0.1,
  costEfficiency: 0.05,
  deployReadiness: 0.1,
  mobileResponsiveness: 0.1,
  accessibility: 0.05,
  webVitals: 0.1,
  uiQuality: 0.15,
  completeness: 0.15,
  codeQuality: 0.1,
} as const;

export type BenchmarkScoreRow = {
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
  pvi_score: number | null;
};

function clamp100(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Wall-clock speed score from run_task lifecycle (seconds). Faster → higher. */
export function speedScoreFromRunTaskDurationSec(durationSec: number): number {
  if (!Number.isFinite(durationSec) || durationSec < 0) return 0;
  // 0s → 100; 10 min → ~0
  return clamp100(100 * (1 - Math.min(1, durationSec / 600)));
}

/** Reliability 0–100 from orchestrator run_task status. */
export function reliabilityFromRunTaskStatus(status: string): number {
  switch (status) {
    case "completed":
    case "scored":
      return 100;
    case "failed":
    case "cancelled":
    case "expired":
      return 0;
    case "retrying":
      return 40;
    default:
      return 55;
  }
}

/**
 * Maps rubric `experiment_runs.scores` (0–100) into benchmark columns.
 * Only four rubric keys exist today; remaining dimensions stay null until B/C.
 */
export function mapRubricToPartialScores(sc: Record<string, number | undefined>): Pick<
  BenchmarkScoreRow,
  "score_ui_quality" | "score_code_quality" | "score_speed" | "score_completeness"
> {
  return {
    score_ui_quality: sc.uiQuality != null ? clamp100(sc.uiQuality) : null,
    score_code_quality: sc.backendLogic != null ? clamp100(sc.backendLogic) : null,
    score_speed: sc.speed != null ? clamp100(sc.speed) : null,
    score_completeness: sc.easeOfEditing != null ? clamp100(sc.easeOfEditing) : null,
  };
}

export function computePartialPVI(row: BenchmarkScoreRow): number | null {
  const keys = Object.keys(PVI_WEIGHTS) as (keyof typeof PVI_WEIGHTS)[];
  const col: Record<string, keyof BenchmarkScoreRow> = {
    speed: "score_speed",
    reliability: "score_reliability",
    costEfficiency: "score_cost_efficiency",
    deployReadiness: "score_deploy_readiness",
    mobileResponsiveness: "score_mobile_responsiveness",
    accessibility: "score_accessibility",
    webVitals: "score_web_vitals",
    uiQuality: "score_ui_quality",
    completeness: "score_completeness",
    codeQuality: "score_code_quality",
  };
  let total = 0;
  let weightSum = 0;
  for (const k of keys) {
    const v = row[col[k]];
    if (v != null && Number.isFinite(v)) {
      total += v * PVI_WEIGHTS[k];
      weightSum += PVI_WEIGHTS[k];
    }
  }
  if (weightSum <= 0) return null;
  return Math.round((total / weightSum) * 100) / 100;
}

export function buildGroupABenchmarkScores(input: {
  rubricScores: Record<string, number | undefined>;
  runTask: { status: string; created_at: string; updated_at: string } | null;
}): BenchmarkScoreRow {
  const fromRubric = mapRubricToPartialScores(input.rubricScores);

  let score_speed = fromRubric.score_speed;
  let score_reliability: number | null = null;

  if (input.runTask) {
    score_reliability = reliabilityFromRunTaskStatus(input.runTask.status);
    const created = new Date(input.runTask.created_at).getTime();
    const updated = new Date(input.runTask.updated_at).getTime();
    const durSec = (updated - created) / 1000;
    if (Number.isFinite(durSec) && durSec >= 0) {
      const pipeSpeed = speedScoreFromRunTaskDurationSec(durSec);
      // Prefer pipeline wall-clock for speed when we have a task row
      score_speed = pipeSpeed;
    }
  }

  const row: BenchmarkScoreRow = {
    score_speed,
    score_reliability,
    score_cost_efficiency: null,
    score_deploy_readiness: null,
    score_mobile_responsiveness: null,
    score_accessibility: null,
    score_web_vitals: null,
    score_ui_quality: fromRubric.score_ui_quality,
    score_completeness: fromRubric.score_completeness,
    score_code_quality: fromRubric.score_code_quality,
    pvi_score: null,
  };
  row.pvi_score = computePartialPVI(row);
  return row;
}
