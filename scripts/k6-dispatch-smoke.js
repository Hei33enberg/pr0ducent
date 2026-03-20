/**
 * k6 load sketch for dispatch-builders (requires real JWT + experiment id).
 *
 *   k6 run -e SUPABASE_URL=... -e ANON_KEY=... -e JWT=... -e EXPERIMENT_ID=... scripts/k6-dispatch-smoke.js
 *
 * Keep VUs low until queue + rate limits are tuned.
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 2,
  duration: "30s",
};

export default function () {
  const base = __ENV.SUPABASE_URL;
  const anon = __ENV.ANON_KEY;
  const jwt = __ENV.JWT;
  const exp = __ENV.EXPERIMENT_ID;
  if (!base || !anon || !jwt || !exp) {
    return;
  }

  const url = `${base.replace(/\/$/, "")}/functions/v1/dispatch-builders`;
  const body = JSON.stringify({
    prompt: "k6 smoke: build a tiny landing page",
    experimentId: exp,
    selectedTools: ["v0"],
    idempotencyKey: `k6-${__VU}-${__ITER}-${Date.now()}`,
  });

  const res = http.post(url, body, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: anon,
      "Content-Type": "application/json",
    },
  });

  check(res, { "2xx": (r) => r.status >= 200 && r.status < 300 });
  sleep(1);
}
