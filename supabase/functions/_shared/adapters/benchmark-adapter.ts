import type { AdapterDispatchContext, DispatchedEntry } from "./types.ts";

/** Tier 4 / disabled: no live API call; benchmark UX path. */
export async function dispatchBenchmarkAdapter(ctx: AdapterDispatchContext): Promise<DispatchedEntry> {
  const { admin, experimentId, runJobId, runTaskId, toolId, traceId, config } = ctx;
  const tier = config?.tier ?? 4;

  await admin.from("run_tasks").update({ status: "benchmark" }).eq("id", runTaskId);

  await admin.from("run_events").insert({
    experiment_id: experimentId,
    run_job_id: runJobId,
    run_task_id: runTaskId,
    tool_id: toolId,
    event_type: "orchestrator.benchmark_skipped",
    payload: { reason: "tier_or_disabled", tier: config?.tier ?? null, traceId },
    trace_id: traceId,
  });

  return {
    toolId,
    tier,
    status: "benchmark",
  };
}
