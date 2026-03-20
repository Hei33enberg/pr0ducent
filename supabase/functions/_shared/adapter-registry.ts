import type { IntegrationConfigRow } from "./adapters/types.ts";

export type ResolvedAdapterKind = "v0_live" | "vbp_live" | "generic_rest_live" | "benchmark";

/**
 * Maps integration config + tool id to a dispatch implementation.
 * - v0: dedicated handshake (async v0 API) — keep even if integration_type is rest_api.
 * - vbp: Vibecoding Broker Protocol compliant builders (POST /vbp/v1/dispatch, …).
 * - generic_rest: parametric REST from builder_integration_config (JSON templates + dot paths).
 */
export function resolveAdapterKind(
  toolId: string,
  cfg: IntegrationConfigRow | undefined
): ResolvedAdapterKind {
  if (!cfg?.enabled) return "benchmark";

  const t = cfg.integration_type ?? "manual";

  if (t === "vbp" && cfg.tier <= 2 && cfg.api_base_url) {
    return "vbp_live";
  }

  if (toolId === "v0" && cfg.tier === 1) {
    return "v0_live";
  }

  if (t === "rest_api" && cfg.api_base_url && cfg.response_id_path && cfg.tier <= 2) {
    return "generic_rest_live";
  }

  return "benchmark";
}
