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
    let q = admin
      .from("run_tasks")
      .select("id, tool_id, experiment_id, run_job_id")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1);

    if (body.run_job_id) {
      q = q.eq("run_job_id", body.run_job_id);
    }

    const { data: tasks, error } = await q;
    if (error || !tasks?.length) break;

    const task = tasks[0] as {
      id: string;
      tool_id: string;
      experiment_id: string;
      run_job_id: string;
    };

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
      admin,
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
