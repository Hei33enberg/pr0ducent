/** Baseline scoring narrative (no external LLM). Version for audit trail. */
export const SCORING_MODEL_VERSION = "orchestra-baseline-1.0";

export function buildBaselineScoresReasoning(
  scores: {
    uiQuality?: number;
    backendLogic?: number;
    speed?: number;
    easeOfEditing?: number;
  },
  meta: { previewUrl?: string | null; screenshotUrl?: string | null; toolId?: string }
): Record<string, unknown> {
  return {
    modelVersion: SCORING_MODEL_VERSION,
    summary:
      "Baseline evaluation narrative tied to rubric scores. Replace with multi-agent orchestra when LLM pipeline is enabled.",
    toolId: meta.toolId ?? "v0",
    dimensions: {
      uiQuality: { score: scores.uiQuality ?? null, note: "Rubric dimension — UI polish and layout." },
      backendLogic: { score: scores.backendLogic ?? null, note: "Rubric dimension — backend/data depth." },
      speed: { score: scores.speed ?? null, note: "Rubric dimension — time-to-output." },
      easeOfEditing: { score: scores.easeOfEditing ?? null, note: "Rubric dimension — maintainability." },
    },
    artifacts: {
      previewUrl: meta.previewUrl ?? null,
      screenshotUrl: meta.screenshotUrl ?? null,
    },
    generatedAt: new Date().toISOString(),
  };
}
