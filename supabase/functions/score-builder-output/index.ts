/**
 * Attaches baseline rubric reasoning and persists Grupa A benchmark dimensions into
 * `builder_benchmark_scores` (Sprint 3).
 *
 * Scope:
 * - Grupa A: pipeline (`run_tasks`) + rubric (`experiment_runs.scores`) → partial PVI.
 * - Grupa B (Lighthouse, axe, web vitals) and Grupa C (batched AI): async workers / queue —
 *   do not run heavy probes inside this Edge Function (timeout risk).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildGroupABenchmarkScores } from "../_shared/benchmark-group-a.ts";
import { buildBaselineScoresReasoning, SCORING_MODEL_VERSION } from "../_shared/orchestrator-scoring.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { experimentId, toolId } = await req.json();
    if (!experimentId || !toolId) {
      return new Response(JSON.stringify({ error: "Missing experimentId or toolId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: exp } = await admin
      .from("experiments")
      .select("user_id")
      .eq("id", experimentId)
      .single();
    if (!exp || exp.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: runRow } = await admin
      .from("experiment_runs")
      .select("scores")
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId)
      .maybeSingle();

    const { data: br } = await admin
      .from("builder_results")
      .select("id, preview_url, scores_reasoning, run_task_id")
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId)
      .maybeSingle();

    let runTaskRow: { status: string; created_at: string; updated_at: string; run_job_id: string | null } | null =
      null;
    if (br?.run_task_id) {
      const { data: t } = await admin
        .from("run_tasks")
        .select("status, created_at, updated_at, run_job_id")
        .eq("id", br.run_task_id)
        .maybeSingle();
      if (t) {
        runTaskRow = {
          status: t.status,
          created_at: t.created_at,
          updated_at: t.updated_at,
          run_job_id: t.run_job_id ?? null,
        };
      }
    }

    const sc = (runRow?.scores as Record<string, number>) || {};
    const reasoning = buildBaselineScoresReasoning(
      {
        uiQuality: sc.uiQuality,
        backendLogic: sc.backendLogic,
        speed: sc.speed,
        easeOfEditing: sc.easeOfEditing,
      },
      { previewUrl: br?.preview_url ?? null, toolId }
    );

    const bench = buildGroupABenchmarkScores({
      rubricScores: sc,
      runTask: runTaskRow
        ? { status: runTaskRow.status, created_at: runTaskRow.created_at, updated_at: runTaskRow.updated_at }
        : null,
    });

    await admin
      .from("experiment_runs")
      .update({ scores_reasoning: reasoning as unknown as Record<string, unknown> })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    await admin
      .from("builder_results")
      .update({ scores_reasoning: reasoning as unknown as Record<string, unknown> })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    if (br?.id) {
      const { error: benchErr } = await admin.from("builder_benchmark_scores").upsert(
        {
          experiment_id: experimentId,
          builder_result_id: br.id,
          tool_id: toolId,
          score_speed: bench.score_speed,
          score_reliability: bench.score_reliability,
          score_cost_efficiency: bench.score_cost_efficiency,
          score_deploy_readiness: bench.score_deploy_readiness,
          score_mobile_responsiveness: bench.score_mobile_responsiveness,
          score_accessibility: bench.score_accessibility,
          score_web_vitals: bench.score_web_vitals,
          score_ui_quality: bench.score_ui_quality,
          score_completeness: bench.score_completeness,
          score_code_quality: bench.score_code_quality,
          pvi_score: bench.pvi_score,
          ai_reasoning: reasoning as unknown as Record<string, unknown>,
          scoring_model: SCORING_MODEL_VERSION,
          scored_at: new Date().toISOString(),
        },
        { onConflict: "builder_result_id" }
      );
      if (benchErr) {
        console.error("builder_benchmark_scores upsert:", benchErr.message);
      }
    }

    const runJobId = runTaskRow?.run_job_id ?? null;
    if (br?.run_task_id) {
      await admin.from("run_tasks").update({ status: "scored" }).eq("id", br.run_task_id);
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      run_task_id: br?.run_task_id ?? null,
      tool_id: toolId,
      event_type: "score.baseline_attached",
      payload: { modelVersion: reasoning.modelVersion, manual: true, pvi_score: bench.pvi_score },
    });

    if (br?.run_task_id) {
      await admin.from("run_tasks").update({ status: "completed" }).eq("id", br.run_task_id);
    }

    return new Response(JSON.stringify({ ok: true, reasoning, benchmark: bench }), {
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
