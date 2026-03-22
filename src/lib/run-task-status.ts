/**
 * Maps run_tasks.status → Compare / dispatch client shape.
 * Keep aligned with `supabase/functions/_shared/run-task-status.ts`.
 */
export function taskRowToDispatched(row: {
  tool_id: string;
  adapter_tier: number | null;
  status: string;
  error_message: string | null;
}): { toolId: string; tier: number; status: string; error?: string } {
  const tier = row.adapter_tier ?? 4;
  let status = row.status;
  if (row.status === "queued") {
    status = "generating";
  }
  if (
    row.status === "building" ||
    row.status === "dispatched" ||
    row.status === "auth_wait" ||
    row.status === "retrying" ||
    row.status === "artifact_ready"
  ) {
    status = "generating";
  }
  if (
    row.status === "failed" ||
    row.status === "dead_letter" ||
    row.status === "expired" ||
    row.status === "cancelled"
  ) {
    status = "error";
  }
  if (row.status === "benchmark") {
    status = "benchmark";
  }
  if (row.status === "completed" || row.status === "scored") {
    status = "completed";
  }
  const out: { toolId: string; tier: number; status: string; error?: string } = {
    toolId: row.tool_id,
    tier,
    status,
  };
  if (row.error_message) out.error = row.error_message;
  return out;
}
