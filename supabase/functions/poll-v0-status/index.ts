import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildBaselineScoresReasoning } from "../_shared/orchestrator-scoring.ts";
import { corsHeadersForRequest } from "../_shared/cors.ts";

const V0_API_BASE = "https://api.v0.dev/v1";

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersForRequest(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const V0_API_KEY = Deno.env.get("V0_API_KEY");
    if (!V0_API_KEY) {
      throw new Error("V0_API_KEY is not configured");
    }

    const { chatId, experimentId } = await req.json();

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: "Missing chatId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pollResponse = await fetch(`${V0_API_BASE}/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${V0_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!pollResponse.ok) {
      const errorBody = await pollResponse.text();
      console.error(`v0 poll error [${pollResponse.status}]:`, errorBody);
      return new Response(
        JSON.stringify({ status: "error", error: `v0 API [${pollResponse.status}]` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatData = await pollResponse.json();
    console.log("poll response keys:", Object.keys(chatData));
    console.log("latestVersion:", JSON.stringify(chatData.latestVersion)?.slice(0, 200));

    const latestVersion = chatData.latestVersion || {};
    const versionStatus = latestVersion.status || "unknown";
    const demoUrl = latestVersion.demoUrl || chatData.demo || null;
    const screenshotUrl = latestVersion.screenshotUrl || null;
    const chatUrl = chatData.webUrl || `https://v0.dev/chat/${chatId}`;
    const files = latestVersion.files || chatData.files || [];

    // If no latestVersion yet, still generating
    const isCompleted = versionStatus === "completed";
    const isFailed = versionStatus === "failed" || versionStatus === "error";

    // Update DB if completed/failed and experimentId provided
    if ((isCompleted || isFailed) && experimentId) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from("builder_results").update({
          status: isCompleted ? "completed" : "error",
          preview_url: demoUrl,
          chat_url: chatUrl,
          files: files,
          raw_response: chatData,
          error_message: isFailed ? "v0 generation failed" : null,
        }).eq("experiment_id", experimentId).eq("tool_id", "v0");

        const { data: taskRef } = await supabase
          .from("run_tasks")
          .select("id, run_job_id")
          .eq("experiment_id", experimentId)
          .eq("tool_id", "v0")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (taskRef?.id) {
          await supabase
            .from("run_tasks")
            .update({
              status: isCompleted ? "artifact_ready" : "failed",
              error_message: isFailed ? "v0 generation failed" : null,
            })
            .eq("id", taskRef.id);
        }

        await supabase.from("run_events").insert({
          experiment_id: experimentId,
          run_job_id: taskRef?.run_job_id ?? null,
          run_task_id: taskRef?.id ?? null,
          tool_id: "v0",
          event_type: isCompleted ? "builder.poll_completed" : "builder.poll_error",
          payload: {
            versionStatus,
            previewUrl: demoUrl,
            screenshotUrl,
          },
        });

        if (isCompleted) {
          const { data: runRow } = await supabase
            .from("experiment_runs")
            .select("scores")
            .eq("experiment_id", experimentId)
            .eq("tool_id", "v0")
            .maybeSingle();

          const sc = (runRow?.scores as Record<string, number>) || {};
          const reasoning = buildBaselineScoresReasoning(
            {
              uiQuality: sc.uiQuality,
              backendLogic: sc.backendLogic,
              speed: sc.speed,
              easeOfEditing: sc.easeOfEditing,
            },
            { previewUrl: demoUrl, screenshotUrl, toolId: "v0" }
          );

          await supabase
            .from("experiment_runs")
            .update({ scores_reasoning: reasoning as unknown as Record<string, unknown> })
            .eq("experiment_id", experimentId)
            .eq("tool_id", "v0");

          await supabase
            .from("builder_results")
            .update({ scores_reasoning: reasoning as unknown as Record<string, unknown> })
            .eq("experiment_id", experimentId)
            .eq("tool_id", "v0");

          if (taskRef?.id) {
            await supabase.from("run_tasks").update({ status: "scored" }).eq("id", taskRef.id);
          }

          await supabase.from("run_events").insert({
            experiment_id: experimentId,
            run_job_id: taskRef?.run_job_id ?? null,
            run_task_id: taskRef?.id ?? null,
            tool_id: "v0",
            event_type: "score.baseline_attached",
            payload: { modelVersion: reasoning.modelVersion },
          });

          if (taskRef?.id) {
            await supabase.from("run_tasks").update({ status: "completed" }).eq("id", taskRef.id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        status: isCompleted ? "completed" : isFailed ? "error" : "generating",
        chatUrl,
        previewUrl: demoUrl,
        files: files.length,
        versionStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("poll-v0-status error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ status: "error", error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
