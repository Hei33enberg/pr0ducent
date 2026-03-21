import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

function mergeWebhookRaw(
  previous: unknown,
  payload: Record<string, unknown>
): Record<string, unknown> {
  const base =
    previous && typeof previous === "object" && !Array.isArray(previous)
      ? (previous as Record<string, unknown>)
      : {};
  return {
    ...base,
    pbp_webhook_last: {
      received_at: new Date().toISOString(),
      payload,
    },
  };
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

function pickPreview(payload: Record<string, unknown>): string | undefined {
  return (
    str(payload.final_preview_url) ||
    str(payload.preview_url) ||
    str(payload.deploy_url) ||
    str(payload.url)
  );
}

function pickNestedPreview(nested: Record<string, unknown> | undefined): string | undefined {
  if (!nested) return undefined;
  return str(nested.url) || str(nested.preview_url) || str(nested.final_preview_url);
}

function normalizeEvent(payload: Record<string, unknown>): string {
  const raw =
    str(payload.event) ||
    str(payload.type) ||
    str(payload.event_type) ||
    str(payload.status) ||
    "";
  return raw.toLowerCase();
}

/**
 * Maps VBP / builder webhook payloads to builder_results + run_tasks updates.
 * Best-effort across payload shapes; returns whether DB rows were updated.
 */
export async function applyVbpWebhookPayload(
  admin: SupabaseClient,
  payload: Record<string, unknown>
): Promise<{ applied: boolean; detail: string; experimentId?: string; toolId?: string }> {
  const nested =
    payload.payload && typeof payload.payload === "object" && payload.payload !== null
      ? (payload.payload as Record<string, unknown>)
      : undefined;

  let experimentId = str(payload.experiment_id) || (nested ? str(nested.experiment_id) : undefined) || "";
  let toolId = str(payload.tool_id) || (nested ? str(nested.tool_id) : undefined) || "";
  const providerRunId = str(payload.provider_run_id) || (nested ? str(nested.provider_run_id) : undefined) || "";

  if ((!experimentId || !toolId) && providerRunId) {
    const { data: br } = await admin
      .from("builder_results")
      .select("experiment_id, tool_id")
      .eq("provider_run_id", providerRunId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (br) {
      experimentId = String(br.experiment_id);
      toolId = String(br.tool_id);
    }
  }

  if (!isUuid(experimentId) || !toolId) {
    return { applied: false, detail: "missing_experiment_or_tool" };
  }

  const event = normalizeEvent(payload) || (nested ? normalizeEvent(nested) : "");

  const { data: brRow } = await admin
    .from("builder_results")
    .select("id, experiment_id, tool_id, status, raw_response")
    .eq("experiment_id", experimentId)
    .eq("tool_id", toolId)
    .maybeSingle();

  if (!brRow) {
    return { applied: false, detail: "no_builder_results", experimentId, toolId };
  }

  const { data: task } = await admin
    .from("run_tasks")
    .select("id, run_job_id, status")
    .eq("experiment_id", experimentId)
    .eq("tool_id", toolId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const runTaskId = task?.id as string | undefined;
  const runJobId = task?.run_job_id as string | undefined;

  const preview =
    pickPreview(payload) || pickNestedPreview(nested) || (nested ? pickPreview(nested) : undefined);

  const errMsg =
    str(payload.message) ||
    str(payload.error) ||
    (nested ? str(nested.message) || str(nested.error) : undefined) ||
    "builder failed";

  if (
    event === "artifact_ready" ||
    event === "artifact" ||
    event === "preview_ready" ||
    event === "deploy_ready"
  ) {
    if (!preview) {
      return { applied: false, detail: "artifact_ready_without_url", experimentId, toolId };
    }
    await admin
      .from("builder_results")
      .update({
        preview_url: preview,
        status: "generating",
        error_message: null,
        raw_response: mergeWebhookRaw(brRow?.raw_response, payload),
      })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    if (runTaskId && task?.status !== "failed" && task?.status !== "completed") {
      await admin.from("run_tasks").update({ status: "building" }).eq("id", runTaskId);
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId ?? null,
      run_task_id: runTaskId ?? null,
      tool_id: toolId,
      event_type: "vbp.webhook_artifact",
      payload: { preview_url: preview, source: "pbp-webhook" },
      trace_id: str(payload.trace_id) ?? crypto.randomUUID(),
    });

    return { applied: true, detail: "artifact_ready", experimentId, toolId };
  }

  if (event === "completed" || event === "success" || event === "done") {
    const upd: Record<string, unknown> = {
      status: "completed",
      error_message: null,
      raw_response: mergeWebhookRaw(brRow?.raw_response, payload),
    };
    if (preview) upd.preview_url = preview;
    await admin.from("builder_results").update(upd).eq("experiment_id", experimentId).eq("tool_id", toolId);

    if (runTaskId) {
      await admin.from("run_tasks").update({ status: "completed", error_message: null }).eq("id", runTaskId);
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId ?? null,
      run_task_id: runTaskId ?? null,
      tool_id: toolId,
      event_type: "vbp.webhook_completed",
      payload: { preview_url: preview ?? null, source: "pbp-webhook" },
      trace_id: str(payload.trace_id) ?? crypto.randomUUID(),
    });

    return { applied: true, detail: "completed", experimentId, toolId };
  }

  if (event === "failed" || event === "error" || event === "cancelled" || event === "timeout") {
    await admin
      .from("builder_results")
      .update({
        status: "error",
        error_message: errMsg,
        raw_response: mergeWebhookRaw(brRow?.raw_response, payload),
      })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    if (runTaskId) {
      await admin.from("run_tasks").update({ status: "failed", error_message: errMsg }).eq("id", runTaskId);
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId ?? null,
      run_task_id: runTaskId ?? null,
      tool_id: toolId,
      event_type: "vbp.webhook_failed",
      payload: { message: errMsg, source: "pbp-webhook" },
      trace_id: str(payload.trace_id) ?? crypto.randomUUID(),
    });

    return { applied: true, detail: "failed", experimentId, toolId };
  }

  return { applied: false, detail: `unhandled_event:${event || "unknown"}`, experimentId, toolId };
}
