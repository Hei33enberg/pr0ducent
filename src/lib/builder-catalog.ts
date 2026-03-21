import type { BuilderTool } from "@/config/tools";
import type { Json } from "@/integrations/supabase/types";

/** Subset of `builder_integration_config` used to merge runtime integration state into the static catalog. */
export type BuilderCatalogRow = {
  tool_id: string;
  tier: number;
  enabled: boolean;
  circuit_state?: string;
  circuit_opened_at?: string | null;
  consecutive_failures?: number | null;
  integration_type?: string | null;
  display_name?: string | null;
  capabilities?: Json | null;
};

function capRecord(cap: Json | null | undefined): Record<string, unknown> {
  if (cap && typeof cap === "object" && !Array.isArray(cap)) return cap as Record<string, unknown>;
  return {};
}

/**
 * Static marketing metadata from `tools.ts` + live rows from `builder_integration_config`.
 * New tool_ids present only in the DB get a minimal `BuilderTool` (name/logo from `capabilities`).
 */
export function mergeBuilderCatalog(defaults: BuilderTool[], rows: BuilderCatalogRow[]): BuilderTool[] {
  const map = new Map(defaults.map((t) => [t.id, { ...t }]));

  for (const row of rows) {
    const cap = capRecord(row.capabilities);
    const displayName =
      typeof row.display_name === "string" && row.display_name.trim() !== ""
        ? row.display_name.trim()
        : typeof cap.displayName === "string"
          ? cap.displayName
          : undefined;
    const logoUrl = typeof cap.logoUrl === "string" ? cap.logoUrl : undefined;
    const featuredOverride = typeof cap.featured === "boolean" ? cap.featured : undefined;

    const existing = map.get(row.tool_id);
    const integrationOverlay = {
      integrationEnabled: row.enabled,
      integrationTier: row.tier,
      circuitState: row.circuit_state,
      circuitOpenedAt: row.circuit_opened_at ?? null,
      integrationType: row.integration_type ?? null,
    };

    if (existing) {
      map.set(row.tool_id, {
        ...existing,
        ...integrationOverlay,
        ...(displayName ? { name: displayName } : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(featuredOverride !== undefined ? { featured: featuredOverride } : {}),
      });
    } else {
      map.set(row.tool_id, {
        id: row.tool_id,
        name: displayName ?? row.tool_id,
        logoUrl: logoUrl ?? "",
        featured: featuredOverride ?? row.tier <= 2,
        strengths: typeof cap.strengths === "object" && Array.isArray(cap.strengths)
          ? (cap.strengths as string[])
          : [],
        description: typeof cap.description === "string" ? cap.description : "",
        mockDelayRange: [8, 20],
        stack: typeof cap.stack === "string" ? cap.stack : "",
        hosting: typeof cap.hosting === "string" ? cap.hosting : "",
        pricing: typeof cap.pricing === "string" ? cap.pricing : "",
        category: typeof cap.category === "string" ? cap.category : "Builder",
        referralUrl: typeof cap.referralUrl === "string" ? cap.referralUrl : undefined,
        ...integrationOverlay,
      });
    }
  }

  return Array.from(map.values());
}
