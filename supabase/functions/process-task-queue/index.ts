import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { resolveAdapterKind } from "../_shared/adapter-registry.ts";
import { dispatchBenchmarkAdapter } from "../_shared/adapters/benchmark-adapter.ts";
import { dispatchGenericRestAdapter } from "../_shared/adapters/generic-rest-adapter.ts";
import { dispatchV0Adapter } from "../_shared/adapters/v0-adapter.ts";
import { dispatchVbpAdapter } from "../_shared/adapters/vbp-adapter.ts";
import type { AdapterDispatchContext, IntegrationConfigRow } from "../_shared/adapters/types.ts";
import { corsHeadersForRequest } from "../_shared/cors.ts";
import { fetchByoaApiKey } from "../_shared/byoa.ts";
import { timingSafeEqualString } from "../_shared/timing-safe.ts";

const MAX_TASKS_PER_INVOCATION = 40;
const DEADLINE_MS = 120_000;

function isServiceRoleRequest(req: Request): boolean {
  const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("Authorization");
  if (!expected || !auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  return timingSafeEqualString(token, expected);
}

/* ── Circuit breaker check ─────────────────────────────── */

function isCircuitOpen(cfg: IntegrationConfigRow | undefined): boolean {
  // circuit_state lives on builder_integration_config (migration 20260322120000)
  const state = (cfg as Record<string, unknown> | undefined)?.circuit_state;
  return state === "open";
}

/* ── Dispatch one task to the correct adapter ──────────── */

async function dispatchOne(
  admin: SupabaseClient,
  task: { id: string; tool_id: string; experiment_id: string; run_job_id: string },
  job: { trace_id: string; metadata: Record<string, unknown> | null; user_id: string },
  configByTool: Map<string, IntegrationConfigRow>,
): Promise<void> {
  const prompt = typeof job.metadata?.prompt === "string" ? job.metadata.prompt : "";
  if (!prompt) {
    await admin
      .from("run_tasks")
      .update({ status: "failed", error_message: "Missing prompt in run_jobs.metadata" })
      .eq("id", task.id);
    return;
  }

  const cfg = configByTool.get(task.tool_id);

  // Circuit breaker — don't dispatch if builder is in open state
  if (isCircuitOpen(cfg)) {
    await admin
      .from("run_tasks")
      .update({
        status: "retrying",
        error_message: "circuit_breaker:open",
        next_retry_at: new Date(Date.now() + 60_000).toISOString(),
      })
      .eq("id", task.id);
    return;
  }

  const byoaKey = await fetchByoaApiKey(admin, job.user_id, task.tool_id);
  const ctx: AdapterDispatchContext = {
    admin,
    experimentId: task.experiment_id,
    runJobId: task.run_job_id,
    traceId: job.trace_id,
    prompt,
    toolId: task.tool_id,
    runTaskId: task.id,
    config: cfg,
    byoaApiKeyOverride: byoaKey ?? undefined,
  };

  const kind = resolveAdapterKind(task.tool_id, cfg);
  if (kind === "v0_live") {
    await dispatchV0Adapter(ctx);
  } else if (kind === "vbp_live") {
    await dispatchVbpAdapter(ctx);
  } else if (kind === "generic_rest_live") {
    await dispatchGenericRestAdapter(ctx);
  } else {
    await dispatchBenchmarkAdapter(ctx);
  }
}

/* ── Pick next task from queue ─────────────────────────── */

type PickableTask = {
  id: string;
  tool_id: string;
  experiment_id: string;
  run_job_id: string;
  attempt_count: number;
};

async function pickNextQueuedOrRetrying(admin: SupabaseClient): Promise<PickableTask | null> {
  const { data: queued } = await admin
    .from("run_tasks")
    .select("id, tool_id, experiment_id, run_job_id, attempt_count")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);
  if (queued?.length) return queued[0] as PickableTask;

  // For retrying tasks, respect next_retry_at if set
  const { data: retrying } = await admin
    .from("run_tasks")
    .select("id, tool_id, experiment_id, run_job_id, attempt_count")
    .eq("status", "retrying")
    .or("next_retry_at.is.null,next_retry_at.lte." + new Date().toISOString())
    .order("updated_at", { ascending: true })
    .limit(1);
  return (retrying?.[0] as PickableTask) ?? null;
}

/* ── Main handler ──────────────────────────────────────── */

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersForRequest(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!isServiceRoleRequest(req)) {
    return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin: SupabaseClient = createClient(supabaseUrl, serviceKey);

  let body: { run_job_id?: string } = {};
  try {
    if (req.method === "POST" && req.headers.get("Content-Type")?.includes("json")) {
      body = (await req.json()) as { run_job_id?: string };
    }
  } catch {
    /* empty body */
  }

  const started = Date.now();
  let processed = 0;
  let partial = false;

  const { data: configs } = await admin.from("builder_integration_config").select("*");
  const configByTool = new Map(
    (configs || []).map((c: IntegrationConfigRow) => [c.tool_id, c as IntegrationConfigRow]),
  );

  while (processed < MAX_TASKS_PER_INVOCATION && Date.now() - started < DEADLINE_MS) {
    let task: PickableTask | null = null;
    if (body.run_job_id) {
      const { data: scoped } = await admin
        .from("run_tasks")
        .select("id, tool_id, experiment_id, run_job_id, attempt_count")
        .eq("run_job_id", body.run_job_id)
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(1);
      task = (scoped?.[0] as PickableTask) ?? null;
      if (!task) {
        const { data: scopedR } = await admin
          .from("run_tasks")
          .select("id, tool_id, experiment_id, run_job_id, attempt_count")
          .eq("run_job_id", body.run_job_id)
          .eq("status", "retrying")
          .or("next_retry_at.is.null,next_retry_at.lte." + new Date().toISOString())
          .order("updated_at", { ascending: true })
          .limit(1);
        task = (scopedR?.[0] as PickableTask) ?? null;
      }
    } else {
      task = await pickNextQueuedOrRetrying(admin);
    }
    if (!task) break;

    // ── Rate limiting via RPC ──
    let rateAllowed = true;
    let rateReason = "";
    const { data: slot, error: slotErr } = await admin.rpc("builder_try_dispatch_slot", {
      p_tool_id: task.tool_id,
    });
    if (slotErr) {
      console.warn("builder_try_dispatch_slot skipped:", slotErr.message);
      rateAllowed = true;
    } else {
      const slotObj = slot as { allowed?: boolean; reason?: string } | null;
      rateAllowed = slotObj?.allowed === true;
      rateReason = slotObj?.reason ?? "";
    }
    if (!rateAllowed) {
      const backoffMs = rateReason === "max_per_minute" ? 60_000 : 15_000;
      await admin
        .from("run_tasks")
        .update({
          status: "retrying",
          error_message: `rate_limit:${rateReason || "unknown"}`,
          attempt_count: (task.attempt_count ?? 0) + 1,
          next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
        })
        .eq("id", task.id);
      processed++;
      continue;
    }

    // ── Fetch job metadata ──
    const { data: job, error: jobErr } = await admin
      .from("run_jobs")
      .select("trace_id, metadata, user_id")
      .eq("id", task.run_job_id)
      .single();

    if (jobErr || !job) {
      await admin
        .from("run_tasks")
        .update({ status: "failed", error_message: "run_job not found" })
        .eq("id", task.id);
      processed++;
      continue;
    }

    const meta = (job.metadata ?? {}) as Record<string, unknown>;

    await dispatchOne(
      admin,
      task,
      {
        trace_id: job.trace_id as string,
        metadata: meta,
        user_id: job.user_id as string,
      },
      configByTool,
    );
    processed++;
  }

  if (body.run_job_id) {
    const { count, error: cErr } = await admin
      .from("run_tasks")
      .select("id", { count: "exact", head: true })
      .eq("run_job_id", body.run_job_id)
      .eq("status", "queued");

    partial = !cErr && (count ?? 0) > 0;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      processed,
      partial,
      timedOut: Date.now() - started >= DEADLINE_MS,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
