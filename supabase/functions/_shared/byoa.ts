import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/** Prefer user BYOA key when present; otherwise use broker (platform) key from env. */
export function preferByoaOverBroker(
  byoa: string | null | undefined,
  broker: string | undefined,
): string | undefined {
  if (byoa != null && byoa.length > 0) return byoa;
  return broker;
}

/**
 * Resolves decrypted BYOA API key via RPC (service_role only).
 * Returns null if no row or Vault miss (broker mode).
 */
export async function fetchByoaApiKey(
  admin: SupabaseClient,
  userId: string,
  toolId: string,
  credentialType = "api_key",
): Promise<string | null> {
  const { data, error } = await admin.rpc("get_byoa_api_key_for_dispatch", {
    p_user_id: userId,
    p_tool_id: toolId,
    p_credential_type: credentialType,
  });
  if (error) {
    console.warn("get_byoa_api_key_for_dispatch:", error.message);
    return null;
  }
  return typeof data === "string" && data.length > 0 ? data : null;
}
