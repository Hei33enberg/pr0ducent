import { describe, it, expect } from "vitest";
import { computePVI, mapRowToScores, PVI_WEIGHTS } from "./pvi-engine";
import type { BuilderBenchmarkScoreRow } from "@/types/benchmark";

// ── helpers ─────────────────────────────────────────────────────────────────

function makeRow(overrides: Partial<BuilderBenchmarkScoreRow> = {}): Partial<BuilderBenchmarkScoreRow> {
  return {
    score_speed: 80,
    score_reliability: 70,
    score_cost_efficiency: 60,
    score_deploy_readiness: 75,
    score_mobile_responsiveness: 65,
    score_accessibility: 90,
    score_web_vitals: 85,
    score_ui_quality: 88,
    score_completeness: 72,
    score_code_quality: 78,
    ...overrides,
  };
}

function allScores(value: number) {
  return {
    speed: value,
    reliability: value,
    costEfficiency: value,
    deployReadiness: value,
    mobileResponsiveness: value,
    accessibility: value,
    webVitals: value,
    uiQuality: value,
    completeness: value,
    codeQuality: value,
  };
}

// ── PVI_WEIGHTS ──────────────────────────────────────────────────────────────

describe("PVI_WEIGHTS", () => {
  it("sums to exactly 1.0", () => {
    const total = Object.values(PVI_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it("every weight is positive", () => {
    for (const w of Object.values(PVI_WEIGHTS)) {
      expect(w).toBeGreaterThan(0);
    }
  });
});

// ── mapRowToScores ───────────────────────────────────────────────────────────

describe("mapRowToScores", () => {
  it("maps all 10 columns to BenchmarkScores keys", () => {
    const row = makeRow();
    const scores = mapRowToScores(row);
    expect(scores.speed).toBe(80);
    expect(scores.reliability).toBe(70);
    expect(scores.costEfficiency).toBe(60);
    expect(scores.deployReadiness).toBe(75);
    expect(scores.mobileResponsiveness).toBe(65);
    expect(scores.accessibility).toBe(90);
    expect(scores.webVitals).toBe(85);
    expect(scores.uiQuality).toBe(88);
    expect(scores.completeness).toBe(72);
    expect(scores.codeQuality).toBe(78);
  });

  it("returns null for missing fields", () => {
    const scores = mapRowToScores({});
    for (const v of Object.values(scores)) {
      expect(v).toBeNull();
    }
  });

  it("preserves null values from row", () => {
    const scores = mapRowToScores(makeRow({ score_speed: null }));
    expect(scores.speed).toBeNull();
  });
});

// ── computePVI ───────────────────────────────────────────────────────────────

describe("computePVI", () => {
  it("returns 0 for all-null scores", () => {
    const scores = allScores(null as unknown as number);
    expect(computePVI({ ...scores })).toBe(0);
  });

  it("returns 100 for all perfect scores with no votes/age", () => {
    expect(computePVI(allScores(100))).toBe(100);
  });

  it("returns 0 for all-zero scores", () => {
    expect(computePVI(allScores(0))).toBe(0);
  });

  it("is within [0, 100] range for any valid input", () => {
    const result = computePVI(allScores(50));
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it("partial scores normalize to same scale (not artificially penalised)", () => {
    // Only uiQuality = 100, rest null — should still yield 100 after normalization
    const partial = { ...allScores(null as unknown as number), uiQuality: 100 };
    expect(computePVI(partial)).toBe(100);
  });

  it("community boost: 100% upvotes adds ~5 points", () => {
    const base = computePVI(allScores(50));
    const boosted = computePVI(allScores(50), [
      { id: "1", user_id: "u", builder_result_id: "r", tool_id: "t", vote: 1, rating: null, created_at: "" },
      { id: "2", user_id: "u", builder_result_id: "r", tool_id: "t", vote: 1, rating: null, created_at: "" },
    ]);
    expect(boosted).toBeGreaterThan(base);
    expect(boosted - base).toBeCloseTo(5, 0);
  });

  it("community boost: 0% upvotes subtracts ~5 points", () => {
    const base = computePVI(allScores(50));
    const penalised = computePVI(allScores(50), [
      { id: "1", user_id: "u", builder_result_id: "r", tool_id: "t", vote: -1, rating: null, created_at: "" },
    ]);
    expect(penalised).toBeLessThan(base);
  });

  it("result is clamped to [0, 100] even with maximum penalties", () => {
    const allDownvotes = Array.from({ length: 10 }, (_, i) => ({
      id: String(i), user_id: "u", builder_result_id: "r", tool_id: "t",
      vote: -1 as -1 | 1, rating: null, created_at: "",
    }));
    const result = computePVI(allScores(0), allDownvotes);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("freshness decay: score decreases for old results", () => {
    const fresh = computePVI(allScores(80));
    const oldDate = new Date(Date.now() - 91 * 24 * 60 * 60 * 1000).toISOString(); // 91 days ago
    const stale = computePVI(allScores(80), [], oldDate);
    expect(stale).toBeLessThan(fresh);
  });

  it("no decay for results less than 30 days old", () => {
    const fresh = computePVI(allScores(80));
    const recentDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
    const recent = computePVI(allScores(80), [], recentDate);
    expect(recent).toBe(fresh);
  });

  it("rounds to 1 decimal place", () => {
    const result = computePVI(allScores(77));
    const str = result.toString();
    const decimals = str.includes(".") ? str.split(".")[1].length : 0;
    expect(decimals).toBeLessThanOrEqual(1);
  });
});
