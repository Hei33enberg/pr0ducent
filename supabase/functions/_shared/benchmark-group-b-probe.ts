/**
 * Grupa B — lightweight HTTP probe (no Lighthouse in Edge). Maps response to partial benchmark columns.
 * Full Lighthouse/axe belongs in an external runner; this fills deploy + rough perf proxies.
 */

export type HttpProbeResult = {
  ok: boolean;
  status: number;
  durationMs: number;
  finalUrl: string;
};

function clamp100(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Deploy readiness: 200 + fast TTFB proxy. */
export function scoreDeployReadinessFromProbe(r: HttpProbeResult): number {
  if (!r.ok || r.status >= 400) return 0;
  if (r.durationMs <= 800) return 100;
  if (r.durationMs <= 3000) return clamp100(100 - (r.durationMs - 800) / 40);
  return clamp100(60 - (r.durationMs - 3000) / 200);
}

/** Synthetic “web vitals” proxy from wall time (until real Lighthouse writes this column). */
export function scoreWebVitalsProxyFromProbe(r: HttpProbeResult): number {
  if (!r.ok) return 0;
  return clamp100(100 - Math.min(100, r.durationMs / 80));
}

/** Placeholder until axe-core in an external worker. */
export function scoreAccessibilityProxyFromProbe(r: HttpProbeResult): number {
  if (!r.ok) return 0;
  return clamp100(72 + Math.min(20, (3000 - Math.min(r.durationMs, 3000)) / 200));
}

/** Placeholder until Lighthouse mobile in an external worker. */
export function scoreMobileProxyFromProbe(r: HttpProbeResult): number {
  if (!r.ok) return 0;
  return clamp100(70 + Math.min(25, (2500 - Math.min(r.durationMs, 2500)) / 100));
}

export function buildGroupBPartialScores(r: HttpProbeResult): {
  score_deploy_readiness: number;
  score_web_vitals: number;
  score_accessibility: number;
  score_mobile_responsiveness: number;
} {
  return {
    score_deploy_readiness: scoreDeployReadinessFromProbe(r),
    score_web_vitals: scoreWebVitalsProxyFromProbe(r),
    score_accessibility: scoreAccessibilityProxyFromProbe(r),
    score_mobile_responsiveness: scoreMobileProxyFromProbe(r),
  };
}
