/**
 * Generic poll for non-v0 integrations (generic_rest / VBP) using builder_integration_config.
 * Requires user JWT; updates builder_results + run_tasks when terminal status is reached.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import type { IntegrationConfigRow } from "../_shared/adapters/types.ts";
import {
  defaultVbpStatusUrl,
  expandPollUrlTemplate,
  parsePollResponse,
} from "../_shared/poll-builder-core.ts";
import { touchBuilderIntegrationHeartbeat } from "../_shared/builder-heartbeat.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function rowToConfig(row: Record<string, unknown>): IntegrationConfigRow {
  return {
    tool_id: String(row.tool_id),
    tier: Number(row.tier) || 4,
    enabled: Boolean(row.enabled),
    integration_type: row.integration_type != null ? String(row.integration_type) : null,
    api_base_url: row.api_base_url != null ? String(row.api_base_url) : null,
    auth_type: row.auth_type != null ? String(row.auth_type) : null,
    request_template: row.request_template as Record<string, unknown> | null,
    response_id_path: row.response_id_path != null ? String(row.response_id_path) : null,
    poll_url_template: row.poll_url_template != null ? String(row.poll_url_template) : null,
    poll_status_path: row.poll_status_path != null ? String(row.poll_status_path) : null,
    poll_completed_values: Array.isArray(row.poll_completed_values)
      ? (row.poll_completed_values as string[])
      : null,
    poll_failed_values: Array.isArray(row.poll_failed_values)
      ? (row.poll_failed_values as string[])
      : null,
    poll_result_paths: row.poll_result_paths as Record<string, unknown> | null,
    api_secret_env: row.api_secret_env != null ? String(row.api_secret_env) : null,
    execution_modes: Array.isArray(row.execution_modes) ? (row.execution_modes as string[]) : null,
    capabilities: row.capabilities as Record<string, unknown> | null,
    polling_function: row.polling_function != null ? String(row.polling_function) : null,
    circuit_state: row.circuit_state != null ? String(row.circuit_state) : null,
    circuit_opened_at: row.circuit_opened_at != null ? String(row.circuit_opened_at) : null,
    consecutive_failures: row.consecutive_failures != null ? Number(row.consecutive_failures) : null,
    phantom_ttl_hours: row.phantom_ttl_hours != null ? Number(row.phantom_ttl_hours) : null,
  };
}

const RESULT_WHITELIST = new Set(["preview_url", "chat_url", "error_message", "files"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
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
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const admin = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({})) as { experimentId?: string; toolId?: string };
    const experimentId = typeof body.experimentId === "string" ? body.experimentId : "";
    const toolId = typeof body.toolId === "string" ? body.toolId : "";

    if (!isUuid(experimentId) || !toolId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing experimentId or toolId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (toolId === "v0") {
      return new Response(
        JSON.stringify({ ok: false, error: "Use poll-v0-status for v0", skipped: true }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: exp, error: expErr } = await admin
      .from("experiments")
      .select("id, user_id")
      .eq("id", experimentId)
      .single();

    if (expErr || !exp || exp.user_id !== userId) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: cfgRow, error: cfgErr } = await admin
      .from("builder_integration_config")
      .select("*")
      .eq("tool_id", toolId)
      .maybeSingle();

    if (cfgErr || !cfgRow) {
      return new Response(JSON.stringify({ ok: false, error: "Unknown tool" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const config = rowToConfig(cfgRow as Record<string, unknown>);

    const { data: br, error: brErr } = await admin
      .from("builder_results")
      .select("id, provider_run_id, status, experiment_id, tool_id")
      .eq("experiment_id", experimentId)
      .eq("tool_id", toolId)
      .maybeSingle();

    if (brErr || !br) {
      return new Response(JSON.stringify({ ok: false, error: "No builder_results row" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const providerRunId = typeof br.provider_run_id === "string" ? br.provider_run_id : "";
    if (!providerRunId) {
      return new Response(
        JSON.stringify({ ok: true, status: "waiting", detail: "no_provider_run_id" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    if (task?.status === "completed" || task?.status === "failed" || br.status === "completed" || br.status === "error") {
      return new Response(
        JSON.stringify({ ok: true, status: "terminal", builderStatus: br.status }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let pollUrl: string | null = null;
    if (config.poll_url_template?.trim()) {
      pollUrl = expandPollUrlTemplate(config.poll_url_template.trim(), providerRunId);
    } else if (config.integration_type === "vbp" && config.api_base_url?.trim()) {
      pollUrl = defaultVbpStatusUrl(config.api_base_url.trim(), providerRunId);
    } else {
      return new Response(
        JSON.stringify({ ok: true, status: "skipped", reason: "no_poll_url" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretEnv = config.api_secret_env;
    const apiKey = secretEnv ? Deno.env.get(secretEnv) : undefined;
    if (secretEnv && !apiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: `missing_secret:${secretEnv}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    if (apiKey) {
      if (config.auth_type === "api_key_header") {
        headers["X-Api-Key"] = apiKey;
      } else {
        headers.Authorization = `Bearer ${apiKey}`;
      }
    }

    const pollRes = await fetch(pollUrl, { method: "GET", headers, signal: AbortSignal.timeout(15000) });
    const text = await pollRes.text();
    let json: unknown = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!pollRes.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `poll_http_${pollRes.status}`,
          detail: text.slice(0, 300),
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await touchBuilderIntegrationHeartbeat(admin, toolId);

    const outcome = parsePollResponse(json, config);

    if (outcome.kind === "skipped") {
      return new Response(
        JSON.stringify({ ok: true, status: "skipped", reason: outcome.reason, pollUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (outcome.kind === "generating") {
      return new Response(
        JSON.stringify({ ok: true, status: "generating", rawStatus: outcome.rawStatus }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (outcome.kind === "failure") {
      await admin
        .from("builder_results")
        .update({
          status: "error",
          error_message: outcome.message,
          raw_response: json as Record<string, unknown>,
        })
        .eq("experiment_id", experimentId)
        .eq("tool_id", toolId);

      if (runTaskId) {
        await admin.from("run_tasks").update({ status: "failed", error_message: outcome.message }).eq("id", runTaskId);
      }

      await admin.from("run_events").insert({
        experiment_id: experimentId,
        run_job_id: runJobId ?? null,
        run_task_id: runTaskId ?? null,
        tool_id: toolId,
        event_type: "builder.poll_error",
        payload: { source: "poll-builder-status", message: outcome.message },
        trace_id: crypto.randomUUID(),
      });

      return new Response(
        JSON.stringify({ ok: true, status: "error", error: outcome.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updateBr: Record<string, unknown> = {
      status: "completed",
      error_message: null,
      raw_response: json as Record<string, unknown>,
    };
    if (outcome.previewUrl) updateBr.preview_url = outcome.previewUrl;
    if (outcome.chatUrl) updateBr.chat_url = outcome.chatUrl;
    for (const [k, v] of Object.entries(outcome.extra)) {
      if (RESULT_WHITELIST.has(k) && v !== undefined) {
        updateBr[k] = v;
      }
    }

    await admin.from("builder_results").update(updateBr).eq("experiment_id", experimentId).eq("tool_id", toolId);

    if (runTaskId) {
      await admin.from("run_tasks").update({ status: "completed", error_message: null }).eq("id", runTaskId);
    }

    await admin.from("run_events").insert({
      experiment_id: experimentId,
      run_job_id: runJobId ?? null,
      run_task_id: runTaskId ?? null,
      tool_id: toolId,
      event_type: "builder.poll_completed",
      payload: { source: "poll-builder-status", previewUrl: outcome.previewUrl ?? null },
      trace_id: crypto.randomUUID(),
    });

    return new Response(
      JSON.stringify({ ok: true, status: "completed", previewUrl: outcome.previewUrl ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("poll-builder-status:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
