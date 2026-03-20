import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  buildGroupABenchmarkScores,
  computePartialPVI,
  reliabilityFromRunTaskStatus,
  speedScoreFromRunTaskDurationSec,
} from "../_shared/benchmark-group-a.ts";

Deno.test("speedScoreFromRunTaskDurationSec: 0s => 100", () => {
  assertEquals(speedScoreFromRunTaskDurationSec(0), 100);
});

Deno.test("speedScoreFromRunTaskDurationSec: 600s => 0", () => {
  assertEquals(speedScoreFromRunTaskDurationSec(600), 0);
});

Deno.test("reliabilityFromRunTaskStatus: completed => 100", () => {
  assertEquals(reliabilityFromRunTaskStatus("completed"), 100);
});

Deno.test("reliabilityFromRunTaskStatus: failed => 0", () => {
  assertEquals(reliabilityFromRunTaskStatus("failed"), 0);
});

Deno.test("computePartialPVI: empty => null", () => {
  assertEquals(
    computePartialPVI({
      score_speed: null,
      score_reliability: null,
      score_cost_efficiency: null,
      score_deploy_readiness: null,
      score_mobile_responsiveness: null,
      score_accessibility: null,
      score_web_vitals: null,
      score_ui_quality: null,
      score_completeness: null,
      score_code_quality: null,
      pvi_score: null,
    }),
    null
  );
});

Deno.test("buildGroupABenchmarkScores: rubric only", () => {
  const row = buildGroupABenchmarkScores({
    rubricScores: { uiQuality: 80, backendLogic: 70, speed: 90, easeOfEditing: 85 },
    runTask: null,
  });
  assertEquals(row.score_ui_quality, 80);
  assertEquals(row.score_reliability, null);
  assertEquals(row.pvi_score != null, true);
});

Deno.test("buildGroupABenchmarkScores: overrides speed from run_task duration", () => {
  const created = new Date("2025-01-01T00:00:00Z").toISOString();
  const updated = new Date("2025-01-01T00:01:00Z").toISOString(); // 60s
  const row = buildGroupABenchmarkScores({
    rubricScores: { uiQuality: 50, speed: 99 },
    runTask: { status: "building", created_at: created, updated_at: updated },
  });
  assertEquals(row.score_reliability, 55);
  assertEquals(row.score_speed === 90, true); // 60/600 * 100 = 10% loss from 100
});
