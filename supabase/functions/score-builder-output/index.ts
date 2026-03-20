import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildBaselineScoresReasoning } from "../_shared/orchestrator-scoring.ts";

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
      .select("preview_url, scores_reasoning, run_task_id")
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId)
      .maybeSingle();

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

    let runJobId: string | null = null;
    if (br?.run_task_id) {
      const { data: t } = await admin.from("run_tasks").select("run_job_id").eq("id", br.run_task_id).maybeSingle();
      runJobId = t?.run_job_id ?? null;
      await admin.from("run_tasks").update({ status: "scored" }).eq("id", br.run_task_id);
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      run_task_id: br?.run_task_id ?? null,
      tool_id: toolId,
      event_type: "score.baseline_attached",
      payload: { modelVersion: reasoning.modelVersion, manual: true },
    });

    if (br?.run_task_id) {
      await admin.from("run_tasks").update({ status: "completed" }).eq("id", br.run_task_id);
    }

    return new Response(JSON.stringify({ ok: true, reasoning }), {
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
