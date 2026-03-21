import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/** Marks broker activity for a tool (poll / webhook / dispatch touchpoints). */
export async function touchBuilderIntegrationHeartbeat(
  admin: SupabaseClient,
  toolId: string
): Promise<void> {
  await admin
    .from("builder_integration_config")
    .update({ last_heartbeat: new Date().toISOString() })
    .eq("tool_id", toolId);
}
