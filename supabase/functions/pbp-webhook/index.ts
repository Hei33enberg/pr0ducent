/**
 * VBP webhook receiver: builders POST build lifecycle events (optional path).
 * Verify HMAC (SHA-256) over raw body when VBP_WEBHOOK_SECRET is set — headers: x-pbp-signature or x-vbp-signature (X-VBP-Signature).
 * Idempotency: pbp_webhook_deliveries (body SHA-256); ledger row removed if handler throws after claim.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { touchBuilderIntegrationHeartbeat } from "../_shared/builder-heartbeat.ts";
import { corsHeadersForRequest } from "../_shared/cors.ts";
import { applyVbpWebhookPayload } from "../_shared/vbp-webhook-apply.ts";
import { sha256HexUtf8 } from "../_shared/webhook-body-sha256.ts";

async function verifySignature(rawBody: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return signature === `sha256=${hex}` || signature === hex;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

/** Accepts `x-pbp-signature` (legacy) or `x-vbp-signature` (VBP-SPEC / X-VBP-Signature). Headers are case-insensitive. */
function getWebhookSignatureHeader(req: Request): string | null {
  return (
    req.headers.get("x-pbp-signature") ||
    req.headers.get("x-vbp-signature") ||
    null
  );
}

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersForRequest(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const rawBody = await req.text();

  const secretRequired = Deno.env.get("VBP_WEBHOOK_SECRET_REQUIRED") === "true";
  const secret = Deno.env.get("VBP_WEBHOOK_SECRET");
  if (secretRequired && !secret) {
    return new Response(
      JSON.stringify({ ok: false, error: "VBP_WEBHOOK_SECRET is required (VBP_WEBHOOK_SECRET_REQUIRED=true)" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (secret) {
    const sig = getWebhookSignatureHeader(req);
    const ok = await verifySignature(rawBody, sig, secret);
    if (!ok) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const bodySha256 = await sha256HexUtf8(rawBody);
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  let ledgerInserted = false;
  if (supabaseUrl && serviceKey) {
    const adminLedger = createClient(supabaseUrl, serviceKey);
    const { error: dedupeErr } = await adminLedger.from("pbp_webhook_deliveries").insert({
      body_sha256: bodySha256,
    });
    if (dedupeErr?.code === "23505") {
      return new Response(JSON.stringify({ ok: true, received: true, deduped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (dedupeErr) {
      console.error("pbp_webhook_deliveries insert:", dedupeErr.message);
      return new Response(JSON.stringify({ ok: false, error: "Dedupe ledger unavailable" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    ledgerInserted = true;
  }

  const expId = typeof payload.experiment_id === "string" ? payload.experiment_id : "";
  const providerRunId = typeof payload.provider_run_id === "string" ? payload.provider_run_id : "";

  let applyResult: {
    applied: boolean;
    detail: string;
    experimentId?: string;
    toolId?: string;
  } | null = null;

  try {
    const canApply =
      supabaseUrl &&
      serviceKey &&
      (isUuid(expId) || providerRunId.length > 0);

    if (canApply) {
      const admin = createClient(supabaseUrl!, serviceKey!);
      applyResult = await applyVbpWebhookPayload(admin, payload);
      if (applyResult.applied && applyResult.toolId) {
        await touchBuilderIntegrationHeartbeat(admin, applyResult.toolId);
      }
    }

    const logExperimentId =
      isUuid(expId) ? expId
      : applyResult?.experimentId && isUuid(applyResult.experimentId) ? applyResult.experimentId
      : "";

    if (supabaseUrl && serviceKey && logExperimentId) {
      const admin = createClient(supabaseUrl, serviceKey);
      await admin.from("run_events").insert({
        experiment_id: logExperimentId,
        event_type: "vbp.webhook",
        tool_id: applyResult?.toolId ?? (typeof payload.tool_id === "string" ? payload.tool_id : null),
        payload: {
          ...payload,
          received_at: new Date().toISOString(),
          apply: applyResult,
        },
        trace_id: typeof payload.trace_id === "string" ? payload.trace_id : crypto.randomUUID(),
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        received: true,
        apply: applyResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("pbp-webhook handler error:", err);
    if (ledgerInserted && supabaseUrl && serviceKey) {
      const admin = createClient(supabaseUrl, serviceKey);
      await admin.from("pbp_webhook_deliveries").delete().eq("body_sha256", bodySha256);
    }
    return new Response(JSON.stringify({ ok: false, error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
