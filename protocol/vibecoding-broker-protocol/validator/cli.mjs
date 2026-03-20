#!/usr/bin/env node
/**
 * vbp-validate — probe a builder base URL for VBP-shaped endpoints.
 *
 * Usage: node cli.mjs <baseUrl> [--dry-dispatch]
 *
 * baseUrl examples:
 *   https://api.builder.com/vbp/v1
 *   http://127.0.0.1:3099/vbp/v1
 */
const args = process.argv.slice(2).filter((a) => a !== "--dry-dispatch");
const dryDispatch = process.argv.includes("--dry-dispatch");
const baseArg = args[0];

if (!baseArg) {
  console.error("Usage: vbp-validate <vbp_base_url> [--dry-dispatch]");
  process.exit(1);
}

function normalizeBase(s) {
  return s.replace(/\/$/, "");
}

async function probeDispatch(base) {
  const url = `${base}/dispatch`;
  const body = JSON.stringify({
    broker_id: "validate",
    run_id: "00000000-0000-4000-8000-000000000001",
    prompt: "validate",
    webhook_url: "https://example.com/webhook",
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer test" },
    body,
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { url, status: res.status, json, text: text.slice(0, 200) };
}

async function probeStatus(base) {
  const url = `${base}/status/00000000-0000-4000-8000-000000000002`;
  const res = await fetch(url, { method: "GET" });
  const text = await res.text();
  return { url, status: res.status, text: text.slice(0, 200) };
}

async function main() {
  const base = normalizeBase(baseArg);
  console.log("VBP validate — base:", base);

  const d = await probeDispatch(base);
  console.log("POST dispatch →", d.status, d.json?.provider_run_id ? `(provider_run_id ok)` : d.text);

  const s = await probeStatus(base);
  console.log("GET status →", s.status, s.text);

  const okShape =
    d.status !== 404 &&
    s.status !== 404 &&
    (d.status === 401 || d.status === 403 || d.status === 202 || d.status === 400 || d.status === 422);

  if (!okShape) {
    console.error("FAIL: unexpected responses (404 on core routes?)");
    process.exit(1);
  }

  if (dryDispatch && d.status === 202 && d.json?.provider_run_id) {
    console.log("dry-dispatch: builder accepted validate payload");
  }

  console.log("PASS: base responds on VBP routes (see docs/VBP-SPEC.md for full compliance).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
