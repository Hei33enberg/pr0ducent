import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildGroupBPartialScores, scoreDeployReadinessFromProbe } from "../_shared/benchmark-group-b-probe.ts";

Deno.test("scoreDeployReadinessFromProbe: 200 fast => high", () => {
  assertEquals(
    scoreDeployReadinessFromProbe({ ok: true, status: 200, durationMs: 200, finalUrl: "https://x" }),
    100
  );
});

Deno.test("buildGroupBPartialScores: failed fetch => zeros", () => {
  const s = buildGroupBPartialScores({ ok: false, status: 0, durationMs: 5000, finalUrl: "" });
  assertEquals(s.score_deploy_readiness, 0);
});
