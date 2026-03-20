import type { IntegrationConfigRow } from "./adapters/types.ts";

export type ResolvedAdapterKind = "v0_live" | "benchmark";

/**
 * Maps integration config + tool id to a dispatch implementation.
 * Extend with new live adapters (e.g. lovable_live) when Tier 1 is enabled for other tools.
 */
export function resolveAdapterKind(
  toolId: string,
  cfg: IntegrationConfigRow | undefined
): ResolvedAdapterKind {
  if (cfg?.enabled && cfg.tier === 1 && toolId === "v0") {
    return "v0_live";
  }
  return "benchmark";
}
