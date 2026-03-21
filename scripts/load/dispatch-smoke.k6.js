/**
 * k6 load baseline for dispatch-builders (staging).
 *
 * Usage:
 *   k6 run -e SUPABASE_URL=https://xxx.supabase.co -e ANON_KEY=eyJ... -e USER_JWT=eyJ... -e EXPERIMENT_ID=uuid scripts/load/dispatch-smoke.k6.js
 *
 * Requires: experiment owned by USER_JWT; subscription with remaining prompts.
 * See docs/SMOKE-TEST-ORCHESTRATOR.md for JWT and experiment setup.
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 3,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<8000"],
  },
};

const url = `${__ENV.SUPABASE_URL}/functions/v1/dispatch-builders`;

export default function () {
  const body = JSON.stringify({
    prompt: "k6 smoke: one-line landing hero",
    experimentId: __ENV.EXPERIMENT_ID,
    selectedTools: ["v0"],
    idempotencyKey: `k6-${__VU}-${Date.now()}`,
  });

  const res = http.post(url, body, {
    headers: {
      Authorization: `Bearer ${__ENV.USER_JWT}`,
      apikey: __ENV.ANON_KEY,
      "Content-Type": "application/json",
    },
  });

  check(res, {
    "2xx": (r) => r.status >= 200 && r.status < 300,
  });
  sleep(1);
}
