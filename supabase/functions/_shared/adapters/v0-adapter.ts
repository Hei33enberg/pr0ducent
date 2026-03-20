import type { AdapterDispatchContext, DispatchedEntry } from "./types.ts";

const V0_API_BASE = "https://api.v0.dev/v1";
const V0_HANDSHAKE_TIMEOUT_MS = 25000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function postV0Chat(apiKey: string, prompt: string): Promise<Response> {
  const maxAttempts = Number(Deno.env.get("V0_DISPATCH_MAX_RETRIES") ?? "1");
  const attempts = Math.max(1, Math.min(3, Math.floor(maxAttempts) || 1));
  let last: Response | null = null;
  for (let i = 0; i < attempts; i++) {
    const chatResponse = await fetch(`${V0_API_BASE}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        modelConfiguration: {
          responseMode: "async",
          thinking: false,
          imageGenerations: false,
        },
      }),
      signal: AbortSignal.timeout(V0_HANDSHAKE_TIMEOUT_MS),
    });
    last = chatResponse;
    if (chatResponse.ok) return chatResponse;
    const retryable = chatResponse.status === 429 || chatResponse.status >= 500;
    if (!retryable || i === attempts - 1) return chatResponse;
    await sleep(400 * (i + 1));
  }
  return last!;
}

/** Live v0 API: lease, builder_results, events, handshake to api.v0.dev. */
export async function dispatchV0Adapter(ctx: AdapterDispatchContext): Promise<DispatchedEntry> {
  const { admin, experimentId, runJobId, runTaskId, prompt, traceId } = ctx;
  const toolId = "v0";
  const tier = 1;

  const V0_API_KEY = Deno.env.get("V0_API_KEY");
  if (!V0_API_KEY) {
    await admin
      .from("run_tasks")
      .update({ status: "failed", error_message: "V0_API_KEY is not configured" })
      .eq("id", runTaskId);
    await admin.from("builder_results").upsert(
      {
        experiment_id: experimentId,
        tool_id: toolId,
        run_task_id: runTaskId,
        status: "error",
        error_message: "V0_API_KEY is not configured",
        execution_mode: "live",
        adapter_tier: tier,
        provenance: "live_api",
      },
      { onConflict: "experiment_id,tool_id" }
    );
    return { toolId, tier, status: "error", error: "missing_v0_key" };
  }

  await admin.from("run_tasks").update({ status: "dispatched" }).eq("id", runTaskId);

  const { data: poolAcct } = await admin
    .from("broker_pool_accounts")
    .select("id")
    .eq("tool_id", "v0")
    .eq("label", "default")
    .maybeSingle();

  if (poolAcct?.id) {
    const { data: leaseRow } = await admin
      .from("broker_account_leases")
      .insert({
        pool_account_id: poolAcct.id,
        run_task_id: runTaskId,
      })
      .select("id")
      .single();
    if (leaseRow?.id) {
      await admin.from("run_tasks").update({ broker_lease_id: leaseRow.id }).eq("id", runTaskId);
    }
  }

  await admin.from("builder_results").upsert(
    {
      experiment_id: experimentId,
      tool_id: toolId,
      run_task_id: runTaskId,
      status: "generating",
      execution_mode: "live",
      adapter_tier: tier,
      provenance: "live_api",
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
    payload: { traceId },
    trace_id: traceId,
  });

  try {
    const chatResponse = await postV0Chat(V0_API_KEY, prompt);

    if (!chatResponse.ok) {
      const errorBody = await chatResponse.text();
      const msg =
        chatResponse.status === 429
          ? "v0 daily limit reached for this API key."
          : `v0 API error [${chatResponse.status}]: ${errorBody.slice(0, 300)}`;
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
        event_type: "orchestrator.v0_error",
        payload: { message: msg, traceId },
        trace_id: traceId,
      });
      return { toolId, tier, status: "error", error: msg };
    }

    const chatData = await chatResponse.json();
    const chatId = chatData.id || chatData.chat_id;
    const chatUrl = chatData.webUrl || (chatId ? `https://v0.dev/chat/${chatId}` : null);

    if (!chatId) {
      const msg = "No chatId returned from v0 API";
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
        provider_run_id: chatId,
        chat_url: chatUrl,
        raw_response: chatData as Record<string, unknown>,
      })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      run_task_id: runTaskId,
      tool_id: toolId,
      event_type: "orchestrator.v0_started",
      payload: { chatId, chatUrl, traceId },
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
      event_type: "orchestrator.v0_error",
      payload: { message, traceId },
      trace_id: traceId,
    });
    return { toolId, tier, status: "error", error: message };
  }
}
