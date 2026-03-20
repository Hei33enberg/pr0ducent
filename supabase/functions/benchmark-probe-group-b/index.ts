/**
 * Grupa B probe: HTTP fetch preview_url, write partial B columns + recomputed pvi_score.
 * Invoke with service role only (verify_jwt false). Triggered from score-builder-output after Grupa A upsert.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildGroupBPartialScores } from "../_shared/benchmark-group-b-probe.ts";
import { computePartialPVI, type BenchmarkScoreRow } from "../_shared/benchmark-group-a.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function rowToBenchmarkScoreRow(r: Record<string, unknown>): BenchmarkScoreRow {
  return {
    score_speed: r.score_speed as number | null,
    score_reliability: r.score_reliability as number | null,
    score_cost_efficiency: r.score_cost_efficiency as number | null,
    score_deploy_readiness: r.score_deploy_readiness as number | null,
    score_mobile_responsiveness: r.score_mobile_responsiveness as number | null,
    score_accessibility: r.score_accessibility as number | null,
    score_web_vitals: r.score_web_vitals as number | null,
    score_ui_quality: r.score_ui_quality as number | null,
    score_completeness: r.score_completeness as number | null,
    score_code_quality: r.score_code_quality as number | null,
    pvi_score: r.pvi_score as number | null,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (authHeader !== `Bearer ${serviceKey}`) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { builderResultId } = await req.json();
    if (!builderResultId) {
      return new Response(JSON.stringify({ error: "Missing builderResultId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: br, error: brErr } = await admin
      .from("builder_results")
      .select("id, preview_url, experiment_id, tool_id")
      .eq("id", builderResultId)
      .maybeSingle();

    if (brErr || !br?.preview_url || !String(br.preview_url).trim()) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "no_preview_url" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = String(br.preview_url).trim();
    const t0 = performance.now();
    let ok = false;
    let status = 0;
    let finalUrl = url;
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 12_000);
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
      });
      clearTimeout(to);
      ok = res.ok;
      status = res.status;
      finalUrl = res.url;
    } catch {
      ok = false;
      status = 0;
    }
    const durationMs = performance.now() - t0;

    const partial = buildGroupBPartialScores({ ok, status, durationMs, finalUrl });

    const { data: existing, error: exErr } = await admin
      .from("builder_benchmark_scores")
      .select("*")
      .eq("builder_result_id", builderResultId)
      .maybeSingle();

    if (exErr || !existing) {
      return new Response(JSON.stringify({ ok: false, error: "no_benchmark_row" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const merged = rowToBenchmarkScoreRow(existing as Record<string, unknown>);
    merged.score_deploy_readiness = partial.score_deploy_readiness;
    merged.score_web_vitals = partial.score_web_vitals;
    merged.score_accessibility = partial.score_accessibility;
    merged.score_mobile_responsiveness = partial.score_mobile_responsiveness;
    merged.pvi_score = computePartialPVI(merged);

    const { error: upErr } = await admin
      .from("builder_benchmark_scores")
      .update({
        score_deploy_readiness: merged.score_deploy_readiness,
        score_web_vitals: merged.score_web_vitals,
        score_accessibility: merged.score_accessibility,
        score_mobile_responsiveness: merged.score_mobile_responsiveness,
        pvi_score: merged.pvi_score,
        scoring_model: `${String(existing.scoring_model ?? "orchestra-baseline-1.0")}+group-b-http`,
      })
      .eq("builder_result_id", builderResultId);

    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("run_events").insert({
      experiment_id: br.experiment_id,
      tool_id: br.tool_id,
      event_type: "score.group_b_probe",
      payload: {
        builderResultId,
        durationMs,
        httpStatus: status,
        partial,
      },
    });

    return new Response(JSON.stringify({ ok: true, pvi_score: merged.pvi_score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
