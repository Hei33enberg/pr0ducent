import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { expandPollUrlTemplate, parsePollResponse, defaultVbpStatusUrl } from "../_shared/poll-builder-core.ts";
import type { IntegrationConfigRow } from "../_shared/adapters/types.ts";

Deno.test("expandPollUrlTemplate replaces id placeholder", () => {
  assertEquals(
    expandPollUrlTemplate("https://api.example.com/v1/jobs/{{id}}", "abc-123"),
    "https://api.example.com/v1/jobs/abc-123"
  );
});

Deno.test("defaultVbpStatusUrl appends v1 status path", () => {
  assertEquals(
    defaultVbpStatusUrl("https://builder.example.com", "run-1"),
    "https://builder.example.com/vbp/v1/status/run-1"
  );
});

Deno.test("parsePollResponse success maps preview from paths", () => {
  const cfg: IntegrationConfigRow = {
    tool_id: "x",
    tier: 2,
    enabled: true,
    poll_status_path: "data.status",
    poll_completed_values: ["done"],
    poll_result_paths: { preview_url: "data.previewUrl" },
  };
  const json = { data: { status: "done", previewUrl: "https://p.example" } };
  const r = parsePollResponse(json, cfg);
  assertEquals(r.kind, "success");
  if (r.kind === "success") {
    assertEquals(r.previewUrl, "https://p.example");
  }
});

Deno.test("parsePollResponse failure on failed status", () => {
  const cfg: IntegrationConfigRow = {
    tool_id: "x",
    tier: 2,
    enabled: true,
    poll_failed_values: ["failed"],
    poll_completed_values: ["completed"],
  };
  const r = parsePollResponse({ status: "failed", message: "nope" }, cfg);
  assertEquals(r.kind, "failure");
});
