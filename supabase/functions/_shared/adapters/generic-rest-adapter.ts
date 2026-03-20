import { getString } from "../jsonpath-lite.ts";
import type { AdapterDispatchContext, DispatchedEntry } from "./types.ts";

function mergeTemplate(tpl: Record<string, unknown> | null | undefined, prompt: string): Record<string, unknown> {
  if (!tpl || typeof tpl !== "object") return { prompt };
  const raw = JSON.stringify(tpl).replace(/\{\{\s*prompt\s*\}\}/g, () =>
    JSON.stringify(prompt).slice(1, -1)
  );
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { ...tpl, prompt };
  }
}

/**
 * Parametric REST dispatch: POST to api_base_url with body from request_template
 * and read provider id from response_id_path (dot notation).
 */
export async function dispatchGenericRestAdapter(ctx: AdapterDispatchContext): Promise<DispatchedEntry> {
  const { admin, experimentId, runJobId, runTaskId, prompt, traceId, toolId, config } = ctx;
  const tier = config?.tier ?? 2;
  const url = (config?.api_base_url ?? "").trim();
  const path = config?.response_id_path ?? "id";
  const secretEnv = config?.api_secret_env;
  const authType = config?.auth_type ?? "bearer";

  if (!url) {
    const msg = "generic_rest: missing api_base_url";
    await admin.from("run_tasks").update({ status: "failed", error_message: msg }).eq("id", runTaskId);
    return { toolId, tier, status: "error", error: msg };
  }

  const apiKey = secretEnv ? Deno.env.get(secretEnv) : undefined;
  if (secretEnv && !apiKey) {
    const msg = `generic_rest: missing env ${secretEnv}`;
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
        provenance: "generic_rest",
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
      provenance: "generic_rest",
      error_message: null,
    },
    { onConflict: "experiment_id,tool_id" }
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    if (authType === "api_key_header") {
      headers["X-Api-Key"] = apiKey;
    } else {
      headers.Authorization = `Bearer ${apiKey}`;
    }
  }

  const body = mergeTemplate(config?.request_template ?? undefined, prompt);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    const text = await res.text();
    let json: unknown = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      const msg = `generic_rest [${res.status}]: ${text.slice(0, 400)}`;
      await admin.from("run_tasks").update({ status: "failed", error_message: msg }).eq("id", runTaskId);
      await admin
        .from("builder_results")
        .update({ status: "error", error_message: msg })
        .eq("experiment_id", experimentId)
        .eq("tool_id", toolId);
      return { toolId, tier, status: "error", error: msg };
    }

    const providerRunId = getString(json, path);
    if (!providerRunId) {
      const msg = `generic_rest: no id at path "${path}"`;
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
        raw_response: json as Record<string, unknown>,
      })
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId);

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId,
      run_task_id: runTaskId,
      tool_id: toolId,
      event_type: "orchestrator.generic_rest_started",
      payload: { providerRunId, traceId },
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
    return { toolId, tier, status: "error", error: message };
  }
}
