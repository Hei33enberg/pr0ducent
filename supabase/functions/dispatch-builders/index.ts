import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { resolveAdapterKind } from "../_shared/adapter-registry.ts";
import { dispatchBenchmarkAdapter } from "../_shared/adapters/benchmark-adapter.ts";
import { dispatchGenericRestAdapter } from "../_shared/adapters/generic-rest-adapter.ts";
import { dispatchV0Adapter } from "../_shared/adapters/v0-adapter.ts";
import { dispatchVbpAdapter } from "../_shared/adapters/vbp-adapter.ts";
import type { AdapterDispatchContext, IntegrationConfigRow } from "../_shared/adapters/types.ts";
import { taskRowToDispatched } from "../_shared/run-task-status.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();
  let runJobId: string | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized", code: "auth", traceId }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized", code: "auth", traceId }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { prompt, experimentId, selectedTools, idempotencyKey, workflowEngine } = body as {
      prompt?: string;
      experimentId?: string;
      selectedTools?: string[];
      idempotencyKey?: string;
      workflowEngine?: string;
    };

    if (!prompt || !experimentId || !Array.isArray(selectedTools) || selectedTools.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing prompt, experimentId, or selectedTools", traceId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isUuid(experimentId)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid experimentId", traceId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: exp, error: expErr } = await admin
      .from("experiments")
      .select("id, user_id")
      .eq("id", experimentId)
      .single();

    if (expErr || !exp || exp.user_id !== userId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Experiment not found", code: "forbidden", traceId }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (idempotencyKey && typeof idempotencyKey === "string" && idempotencyKey.length > 0) {
      const { data: priorJob } = await admin
        .from("run_jobs")
        .select("id, trace_id, experiment_id, status")
        .eq("user_id", userId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (priorJob) {
        if (priorJob.experiment_id !== experimentId) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "Idempotency key already used for a different experiment",
              code: "idempotency_conflict",
              traceId,
            }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: tasks } = await admin
          .from("run_tasks")
          .select("tool_id, adapter_tier, status, error_message")
          .eq("run_job_id", priorJob.id);
        const dispatched = (tasks || []).map((t) =>
          taskRowToDispatched(t as { tool_id: string; adapter_tier: number | null; status: string; error_message: string | null })
        );
        return new Response(
          JSON.stringify({
            ok: true,
            experimentId,
            dispatched,
            traceId: priorJob.trace_id,
            runJobId: priorJob.id,
            idempotentReplay: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { data: sub, error: subErr } = await admin
      .from("subscriptions")
      .select("prompts_used, prompts_limit")
      .eq("user_id", userId)
      .maybeSingle();

    if (subErr || !sub) {
      return new Response(
        JSON.stringify({ ok: false, error: "Subscription not found", traceId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if ((sub.prompts_used ?? 0) >= (sub.prompts_limit ?? 0)) {
      await admin.from("run_events").insert({
        experiment_id: experimentId,
        event_type: "orchestrator.job_rejected",
        payload: { reason: "prompt_limit", traceId },
        trace_id: traceId,
      });
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Prompt limit reached for your plan",
          code: "limit_exceeded",
          traceId,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: configs, error: cfgErrEarly } = await admin.from("builder_integration_config").select("*");
    if (cfgErrEarly) {
      throw new Error(cfgErrEarly.message);
    }
    const configByTool = new Map(
      (configs || []).map((c: IntegrationConfigRow) => [c.tool_id, c as IntegrationConfigRow])
    );

    const { count: existingResults } = await admin
      .from("builder_results")
      .select("*", { count: "exact", head: true })
      .eq("experiment_id", experimentId);

    const firstDispatch = (existingResults ?? 0) === 0;
    const willLiveDispatch = selectedTools.some((tid) => {
      const c = configByTool.get(tid);
      return c?.enabled && c?.tier === 1;
    });

    const wf =
      typeof workflowEngine === "string" && workflowEngine.length > 0 ? workflowEngine : "supabase_edge";

    const { data: jobRow, error: jobErr } = await admin
      .from("run_jobs")
      .insert({
        experiment_id: experimentId,
        user_id: userId,
        status: "running",
        idempotency_key: idempotencyKey && idempotencyKey.length > 0 ? idempotencyKey : null,
        trace_id: traceId,
        workflow_engine: wf,
        metadata: { selectedTools, prompt },
      })
      .select("id")
      .single();

    if (jobErr || !jobRow) {
      throw new Error(jobErr?.message || "run_jobs insert failed");
    }
    runJobId = jobRow.id;

    if (firstDispatch && willLiveDispatch) {
      await admin
        .from("subscriptions")
        .update({ prompts_used: (sub.prompts_used ?? 0) + 1 })
        .eq("user_id", userId);
      await admin.from("credit_transactions").insert({
        user_id: userId,
        amount: -1,
        reason: "experiment_dispatch",
        experiment_id: experimentId,
        metadata: { traceId, run_job_id: runJobId },
      });
      await admin.from("run_events").insert({
        experiment_id: experimentId,
        run_job_id: runJobId,
        event_type: "orchestrator.credit_charged",
        payload: { prompts_used_after: (sub.prompts_used ?? 0) + 1, traceId },
        trace_id: traceId,
      });
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      event_type: "orchestrator.job_received",
      payload: { selectedTools, traceId, workflow_engine: wf },
      trace_id: traceId,
    });

    for (const toolId of selectedTools) {
      const cfg = configByTool.get(toolId);

      const { error: taskErr } = await admin.from("run_tasks").insert({
        run_job_id: runJobId,
        experiment_id: experimentId,
        tool_id: toolId,
        status: "queued",
        adapter_tier: cfg?.tier ?? 4,
      });

      if (taskErr) {
        throw new Error(taskErr.message || "run_tasks insert failed");
      }
    }

    const workerUrl = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/process-task-queue`;
    try {
      for (let wave = 0; wave < 10; wave++) {
        const wr = await fetch(workerUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ run_job_id: runJobId }),
        });
        if (!wr.ok) break;
        const wj = (await wr.json()) as { partial?: boolean; timedOut?: boolean };
        if (!wj.partial) break;
        if (wj.timedOut && wave > 0) break;
      }
    } catch (e) {
      console.error("process-task-queue invoke failed:", e);
    }

    const { data: finalTasks } = await admin
      .from("run_tasks")
      .select("tool_id, adapter_tier, status, error_message")
      .eq("run_job_id", runJobId);

    const dispatched = (finalTasks || []).map((t) =>
      taskRowToDispatched(t as { tool_id: string; adapter_tier: number | null; status: string; error_message: string | null })
    );

    let { count: queuedLeft } = await admin
      .from("run_tasks")
      .select("id", { count: "exact", head: true })
      .eq("run_job_id", runJobId)
      .eq("status", "queued");

    if ((queuedLeft ?? 0) > 0) {
      const { data: qrows } = await admin
        .from("run_tasks")
        .select("id, tool_id")
        .eq("run_job_id", runJobId)
        .eq("status", "queued");
      for (const row of qrows || []) {
        const cfg = configByTool.get(row.tool_id);
        const ctx: AdapterDispatchContext = {
          admin,
          experimentId,
          runJobId: runJobId!,
          traceId,
          prompt,
          toolId: row.tool_id,
          runTaskId: row.id as string,
          config: cfg,
        };
        const kind = resolveAdapterKind(row.tool_id, cfg);
        if (kind === "v0_live") await dispatchV0Adapter(ctx);
        else if (kind === "vbp_live") await dispatchVbpAdapter(ctx);
        else if (kind === "generic_rest_live") await dispatchGenericRestAdapter(ctx);
        else await dispatchBenchmarkAdapter(ctx);
      }
    }

    const { count: stillQueued } = await admin
      .from("run_tasks")
      .select("id", { count: "exact", head: true })
      .eq("run_job_id", runJobId)
      .eq("status", "queued");

    await admin
      .from("run_jobs")
      .update({ status: (stillQueued ?? 0) > 0 ? "failed" : "completed" })
      .eq("id", runJobId);

    return new Response(
      JSON.stringify({
        ok: true,
        experimentId,
        dispatched,
        traceId,
        runJobId,
      } satisfies Record<string, unknown>),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("dispatch-builders:", e);
    if (runJobId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const admin = createClient(supabaseUrl, serviceKey);
        await admin.from("run_jobs").update({ status: "failed" }).eq("id", runJobId);
      } catch {
        /* ignore */
      }
    }
    return new Response(
      JSON.stringify({ ok: false, error: message, traceId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
