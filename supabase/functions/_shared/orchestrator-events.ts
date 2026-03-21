import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/** Audit: which credential path was used for a live adapter dispatch (never log secrets). */
export async function emitCredentialSourceEvent(
  admin: SupabaseClient,
  params: {
    experimentId: string;
    runJobId: string;
    runTaskId: string;
    toolId: string;
    traceId: string;
    credentialSource: "byoa" | "broker";
  },
): Promise<void> {
  const { error } = await admin.from("run_events").insert({
    experiment_id: params.experimentId,
    run_job_id: params.runJobId,
    run_task_id: params.runTaskId,
    tool_id: params.toolId,
    event_type: "orchestrator.credential_source",
    payload: {
      credential_source: params.credentialSource,
      traceId: params.traceId,
    },
    trace_id: params.traceId,
  });
  if (error) {
    console.warn("run_events orchestrator.credential_source:", error.message);
  }
}
