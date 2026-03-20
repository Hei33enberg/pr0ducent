import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { resolveAdapterKind } from "../_shared/adapter-registry.ts";
import { dispatchBenchmarkAdapter } from "../_shared/adapters/benchmark-adapter.ts";
import { dispatchGenericRestAdapter } from "../_shared/adapters/generic-rest-adapter.ts";
import { dispatchV0Adapter } from "../_shared/adapters/v0-adapter.ts";
import { dispatchVbpAdapter } from "../_shared/adapters/vbp-adapter.ts";
import type { AdapterDispatchContext, IntegrationConfigRow } from "../_shared/adapters/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_TASKS_PER_INVOCATION = 40;
const DEADLINE_MS = 120_000;
const RATE_LIMIT_BACKOFF_MS = 15_000;

function isServiceRoleRequest(req: Request): boolean {
  const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("Authorization");
  if (!expected || !auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === expected;
}

async function dispatchOne(
  admin: ReturnType<typeof createClient>,
  task: { id: string; tool_id: string; experiment_id: string; run_job_id: string },
  job: { trace_id: string; metadata: Record<string, unknown> | null },
  configByTool: Map<string, IntegrationConfigRow>
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
  if (cfg?.circuit_state === "open") {
    await admin
      .from("run_tasks")
      .update({ status: "failed", error_message: "Builder circuit is open (rate/errors)" })
      .eq("id", task.id);
    return;
  }

  const ctx: AdapterDispatchContext = {
    admin,
    experimentId: task.experiment_id,
    runJobId: task.run_job_id,
    traceId: job.trace_id,
    prompt,
    toolId: task.tool_id,
    runTaskId: task.id,
    config: cfg,
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

type PickableTask = {
  id: string;
  tool_id: string;
  experiment_id: string;
  run_job_id: string;
  attempt_count: number;
};

async function pickNextQueuedOrRetrying(
  admin: ReturnType<typeof createClient>
): Promise<PickableTask | null> {
  const { data: queued } = await admin
    .from("run_tasks")
    .select("id, tool_id, experiment_id, run_job_id, attempt_count")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);
  if (queued?.length) return queued[0] as PickableTask;

  const iso = new Date().toISOString();
  const { data: retrying } = await admin
    .from("run_tasks")
    .select("id, tool_id, experiment_id, run_job_id, attempt_count")
    .eq("status", "retrying")
    .or(`next_retry_at.is.null,next_retry_at.lte.${iso}`)
    .order("next_retry_at", { ascending: true, nullsFirst: true })
    .limit(1);
  return (retrying?.[0] as PickableTask) ?? null;
}

Deno.serve(async (req) => {
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
  const admin = createClient(supabaseUrl, serviceKey);

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
    (configs || []).map((c: IntegrationConfigRow) => [c.tool_id, c as IntegrationConfigRow])
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
        const iso = new Date().toISOString();
        const { data: scopedR } = await admin
          .from("run_tasks")
          .select("id, tool_id, experiment_id, run_job_id, attempt_count")
          .eq("run_job_id", body.run_job_id)
          .eq("status", "retrying")
          .or(`next_retry_at.is.null,next_retry_at.lte.${iso}`)
          .order("next_retry_at", { ascending: true, nullsFirst: true })
          .limit(1);
        task = (scopedR?.[0] as PickableTask) ?? null;
      }
    } else {
      task = await pickNextQueuedOrRetrying(admin);
    }
    if (!task) break;

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
      await admin
        .from("run_tasks")
        .update({
          status: "retrying",
          next_retry_at: new Date(Date.now() + RATE_LIMIT_BACKOFF_MS).toISOString(),
          error_message: `rate_limit:${rateReason || "unknown"}`,
          attempt_count: (task.attempt_count ?? 0) + 1,
        })
        .eq("id", task.id);
      processed++;
      continue;
    }

    const { data: job, error: jobErr } = await admin
      .from("run_jobs")
      .select("trace_id, metadata")
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
      admin as any,
      task,
      { trace_id: job.trace_id as string, metadata: meta },
      configByTool
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
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
