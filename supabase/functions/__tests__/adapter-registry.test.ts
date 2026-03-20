import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { resolveAdapterKind } from "../_shared/adapter-registry.ts";
import type { IntegrationConfigRow } from "../_shared/adapters/types.ts";

function cfg(partial: Partial<IntegrationConfigRow> & Pick<IntegrationConfigRow, "tool_id">): IntegrationConfigRow {
  return {
    tool_id: partial.tool_id,
    tier: partial.tier ?? 4,
    enabled: partial.enabled ?? false,
    integration_type: partial.integration_type,
    api_base_url: partial.api_base_url,
    auth_type: partial.auth_type,
    request_template: partial.request_template,
    response_id_path: partial.response_id_path,
    poll_url_template: partial.poll_url_template,
    poll_status_path: partial.poll_status_path,
    poll_completed_values: partial.poll_completed_values,
    poll_result_paths: partial.poll_result_paths,
    phantom_ttl_hours: partial.phantom_ttl_hours,
    circuit_state: partial.circuit_state,
    circuit_opened_at: partial.circuit_opened_at,
    consecutive_failures: partial.consecutive_failures,
    api_secret_env: partial.api_secret_env,
  };
}

Deno.test("resolveAdapterKind: v0 tier1 enabled => v0_live", () => {
  assertEquals(
    resolveAdapterKind("v0", cfg({ tool_id: "v0", tier: 1, enabled: true, integration_type: "rest_api" })),
    "v0_live"
  );
});

Deno.test("resolveAdapterKind: v0 disabled => benchmark", () => {
  assertEquals(resolveAdapterKind("v0", cfg({ tool_id: "v0", tier: 1, enabled: false })), "benchmark");
});

Deno.test("resolveAdapterKind: vbp enabled tier1 => vbp_live", () => {
  assertEquals(
    resolveAdapterKind(
      "acme",
      cfg({ tool_id: "acme", tier: 1, enabled: true, integration_type: "vbp", api_base_url: "https://acme.dev/vbp/v1" })
    ),
    "vbp_live"
  );
});

Deno.test("resolveAdapterKind: generic rest tier2 => generic_rest_live", () => {
  assertEquals(
    resolveAdapterKind(
      "other",
      cfg({
        tool_id: "other",
        tier: 2,
        enabled: true,
        integration_type: "rest_api",
        api_base_url: "https://api.other.com",
        response_id_path: "id",
      })
    ),
    "generic_rest_live"
  );
});

Deno.test("resolveAdapterKind: missing config => benchmark", () => {
  assertEquals(resolveAdapterKind("unknown", undefined), "benchmark");
});
