import type { AdapterDispatchContext, DispatchedEntry } from "./types.ts";

/** Vibecoding Broker Protocol (VBP) v0.1 — POST {base}/dispatch */
export async function dispatchVbpAdapter(ctx: AdapterDispatchContext): Promise<DispatchedEntry> {
  const { admin, experimentId, runJobId, runTaskId, prompt, traceId, toolId, config } = ctx;
  const tier = config?.tier ?? 1;
  const base = (config?.api_base_url ?? "").replace(/\/$/, "");
  const secretEnv = config?.api_secret_env ?? "VBP_PARTNER_KEY";
  const partnerKey = Deno.env.get(secretEnv);

  if (!partnerKey || !base) {
    const msg = !partnerKey ? `Missing env ${secretEnv}` : "Missing api_base_url in builder_integration_config";
    await admin.from("run_tasks").update({ status: "failed", error_message: msg }).eq("id", runTaskId);
    await admin.from("builder_results").upsert(
      {
        experiment_id: experimentId,
        tool_id: toolId,
        run_task_id: runTaskId,
        status: "error",
        error_message: msg,
        execution_mode: "live",
        adapter_tier: tier,
        provenance: "vbp",
      },
      { onConflict: "experiment_id,tool_id" }
    );
    return { toolId, tier, status: "error", error: msg };
  }

  await admin.from("run_tasks").update({ status: "dispatched" }).eq("id", runTaskId);

  await admin.from("builder_results").upsert(
    {
      experiment_id: experimentId,
      tool_id: toolId,
      run_task_id: runTaskId,
      status: "generating",
      execution_mode: "live",
      adapter_tier: tier,
      provenance: "vbp",
      error_message: null,
    },
    { onConflict: "experiment_id,tool_id" }
  );

  await admin.from("run_events").insert({
    experiment_id: experimentId,
    run_job_id: runJobId,
    run_task_id: runTaskId,
    tool_id: toolId,
    event_type: "orchestrator.dispatched",
    payload: { traceId, protocol: "vbp" },
    trace_id: traceId,
  });

  const brokerId = Deno.env.get("VBP_BROKER_ID") ?? "pr0ducent";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const webhookUrl = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/pbp-webhook`;

  const dispatchUrl = base.includes("/vbp/") ? `${base}/dispatch` : `${base}/vbp/v1/dispatch`;

  try {
    const res = await fetch(dispatchUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${partnerKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        broker_id: brokerId,
        broker_auth_token: Deno.env.get("VBP_BROKER_OUTBOUND_SECRET") ?? "",
        run_id: runTaskId,
        prompt,
        user_context: { intent_id: experimentId, experiment_id: experimentId },
        webhook_url: webhookUrl,
      }),
      signal: AbortSignal.timeout(60000),
    });

    const text = await res.text();
    let data: Record<string, unknown> = {};
    try {
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      /* ignore */
    }

    if (!res.ok && res.status !== 202) {
      const msg = `VBP dispatch [${res.status}]: ${text.slice(0, 400)}`;
      await admin.from("run_tasks").update({ status: "failed", error_message: msg }).eq("id", runTaskId);
      await admin
        .from("builder_results")
        .update({ status: "error", error_message: msg })
        .eq("experiment_id", experimentId)
        .eq("tool_id", toolId);
      await admin.from("run_events").insert({
        experiment_id: experimentId,
        run_job_id: runJobId,
        run_task_id: runTaskId,
        tool_id: toolId,
        event_type: "orchestrator.vbp_error",
        payload: { message: msg, traceId },
        trace_id: traceId,
      });
      return { toolId, tier, status: "error", error: msg };
    }

    const providerRunId = typeof data.provider_run_id === "string" ? data.provider_run_id : "";
    const streamUrl = typeof data.stream_url === "string" ? data.stream_url : null;
    const claimToken = typeof data.claim_token === "string" ? data.claim_token : null;

    if (!providerRunId) {
      const msg = "VBP dispatch: missing provider_run_id";
      await admin.from("run_tasks").update({ status: "failed", error_message: msg }).eq("id", runTaskId);
      await admin
        .from("builder_results")
        .update({ status: "error", error_message: msg })
        .eq("experiment_id", experimentId)
        .eq("tool_id", toolId);
      return { toolId, tier, status: "error", error: msg };
    }

    await admin.from("run_tasks").update({ status: "building" }).eq("id", runTaskId);

    await admin
      .from("builder_results")
      .update({
        provider_run_id: providerRunId,
        chat_url: streamUrl,
        raw_response: { ...data, vbp_claim_token: claimToken } as Record<string, unknown>,
      })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      run_task_id: runTaskId,
      tool_id: toolId,
      event_type: "orchestrator.vbp_started",
      payload: { providerRunId, streamUrl, traceId },
      trace_id: traceId,
    });

    return { toolId, tier, status: "generating" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await admin.from("run_tasks").update({ status: "failed", error_message: message }).eq("id", runTaskId);
    await admin
      .from("builder_results")
      .update({ status: "error", error_message: message })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);
    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      run_task_id: runTaskId,
      tool_id: toolId,
      event_type: "orchestrator.vbp_error",
      payload: { message, traceId },
      trace_id: traceId,
    });
    return { toolId, tier, status: "error", error: message };
  }
}
