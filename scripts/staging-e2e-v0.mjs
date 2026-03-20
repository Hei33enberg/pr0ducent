#!/usr/bin/env node
/**
 * Staging E2E: dispatch-builders → run_tasks / builder_results (v0).
 *
 * Required env:
 *   E2E_SUPABASE_URL    https://xxx.supabase.co
 *   E2E_ANON_KEY        project anon key
 *   E2E_USER_JWT        access_token of a user who owns E2E_EXPERIMENT_ID
 *   E2E_EXPERIMENT_ID   UUID from public.experiments
 *
 * Optional:
 *   E2E_POLL_MS         default 5000
 *   E2E_MAX_ROUNDS      default 36 (~3 min)
 *
 * GitHub Actions: workflow_dispatch with secrets (see .github/workflows/staging-e2e.yml).
 */

const base = process.env.E2E_SUPABASE_URL?.replace(/\/$/, "");
const anon = process.env.E2E_ANON_KEY;
const jwt = process.env.E2E_USER_JWT;
const exp = process.env.E2E_EXPERIMENT_ID;
const pollMs = Number(process.env.E2E_POLL_MS || 5000);
const maxRounds = Number(process.env.E2E_MAX_ROUNDS || 36);

function fail(msg, extra) {
  console.error(msg, extra ?? "");
  process.exit(1);
}

async function main() {
  if (!base || !anon || !jwt || !exp) {
    fail("Missing env: E2E_SUPABASE_URL, E2E_ANON_KEY, E2E_USER_JWT, E2E_EXPERIMENT_ID");
  }

  const headers = {
    Authorization: `Bearer ${jwt}`,
    apikey: anon,
    "Content-Type": "application/json",
  };

  const idem = `e2e-${Date.now()}`;
  console.log("dispatch-builders …", { experimentId: exp, idem });

  const disp = await fetch(`${base}/functions/v1/dispatch-builders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: "E2E staging: minimal landing with title and CTA button",
      experimentId: exp,
      selectedTools: ["v0"],
      idempotencyKey: idem,
    }),
  });

  const body = await disp.json().catch(() => ({}));
  if (!disp.ok || !body.ok) {
    fail("dispatch-builders failed", { status: disp.status, body });
  }
  console.log("dispatch ok", { runJobId: body.runJobId, dispatched: body.dispatched });

  for (let i = 0; i < maxRounds; i++) {
    await new Promise((r) => setTimeout(r, pollMs));

    const tRes = await fetch(
      `${base}/rest/v1/run_tasks?experiment_id=eq.${exp}&select=tool_id,status,error_message,updated_at&order=created_at.desc`,
      { headers: { Authorization: `Bearer ${jwt}`, apikey: anon } }
    );
    const tasks = await tRes.json();
    if (!tRes.ok) fail("run_tasks select failed", tasks);

    const v0 = tasks.find((t) => t.tool_id === "v0");
    console.log(`poll ${i + 1}/${maxRounds}`, v0 ?? tasks[0] ?? "(no rows)");

    if (v0 && v0.status !== "queued" && v0.status !== "retrying") {
      const brRes = await fetch(
        `${base}/rest/v1/builder_results?experiment_id=eq.${exp}&tool_id=eq.v0&select=status,preview_url,error_message`,
        { headers: { Authorization: `Bearer ${jwt}`, apikey: anon } }
      );
      const br = await brRes.json();
      if (!brRes.ok) fail("builder_results select failed", br);
      const row = br[0];
      console.log("builder_results v0", row);
      if (row?.status === "completed" || row?.status === "error") {
        console.log("E2E finished:", row.status);
        process.exit(0);
      }
    }
  }

  fail("timeout waiting for v0 terminal state");
}

main().catch((e) => fail(String(e), e));
