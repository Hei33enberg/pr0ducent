/**
 * VBP webhook receiver: builders POST build lifecycle events (optional path).
 * Verify X-PBP-Signature (HMAC-SHA256 of raw body) when VBP_WEBHOOK_SECRET is set.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-pbp-signature, x-supabase-client-platform",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const rawBody = await req.text();
  const secret = Deno.env.get("VBP_WEBHOOK_SECRET");
  if (secret) {
    const sig = req.headers.get("x-pbp-signature");
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

  function isUuid(s: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const expId = typeof payload.experiment_id === "string" ? payload.experiment_id : "";
  if (supabaseUrl && serviceKey && expId && isUuid(expId)) {
    const admin = createClient(supabaseUrl, serviceKey);
    await admin.from("run_events").insert({
      experiment_id: expId,
      event_type: "vbp.webhook",
      tool_id: typeof payload.tool_id === "string" ? payload.tool_id : null,
      payload: { ...payload, received_at: new Date().toISOString() },
      trace_id: typeof payload.trace_id === "string" ? payload.trace_id : crypto.randomUUID(),
    });
  }

  return new Response(JSON.stringify({ ok: true, received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
