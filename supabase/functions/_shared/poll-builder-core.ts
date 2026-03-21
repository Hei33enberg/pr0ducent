import { getByPath, getString } from "./jsonpath-lite.ts";
import type { IntegrationConfigRow } from "./adapters/types.ts";

export type PollParseResult =
  | { kind: "generating"; rawStatus: string }
  | { kind: "success"; previewUrl?: string; chatUrl?: string; extra: Record<string, unknown> }
  | { kind: "failure"; message: string }
  | { kind: "skipped"; reason: string };

const DEFAULT_FAILED = ["failed", "error", "timeout", "cancelled"];

/** Replace {{id}} / {{provider_run_id}} in poll URL template. */
export function expandPollUrlTemplate(template: string, providerRunId: string): string {
  return template
    .replace(/\{\{\s*id\s*\}\}/gi, encodeURIComponent(providerRunId))
    .replace(/\{\{\s*provider_run_id\s*\}\}/gi, encodeURIComponent(providerRunId))
    .replace(/\{\{\s*providerRunId\s*\}\}/gi, encodeURIComponent(providerRunId));
}

/** Default VBP GET /vbp/v1/status/{id} when poll_url_template is null. */
export function defaultVbpStatusUrl(apiBaseUrl: string, providerRunId: string): string {
  const b = apiBaseUrl.replace(/\/$/, "");
  if (b.includes("/vbp/")) {
    return `${b}/status/${encodeURIComponent(providerRunId)}`;
  }
  return `${b}/vbp/v1/status/${encodeURIComponent(providerRunId)}`;
}

function normalizeStatus(s: string): string {
  return s.trim().toLowerCase();
}

function getPrimitiveString(obj: unknown, path: string): string | undefined {
  const v = getByPath(obj, path);
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}

/**
 * Decide success/failure/in-progress from poll JSON using builder_integration_config.
 */
export function parsePollResponse(json: unknown, config: IntegrationConfigRow): PollParseResult {
  const statusPath = config.poll_status_path?.trim() || "status";
  const rawStatus = getPrimitiveString(json, statusPath);
  if (rawStatus === undefined || rawStatus === "") {
    return { kind: "skipped", reason: `no_status_at_path:${statusPath}` };
  }
  const norm = normalizeStatus(rawStatus);

  const successSet = new Set((config.poll_completed_values ?? ["completed", "done", "finished"]).map(normalizeStatus));
  const failSet = new Set((config.poll_failed_values ?? DEFAULT_FAILED).map(normalizeStatus));

  if (successSet.has(norm)) {
    const paths = (config.poll_result_paths ?? null) as Record<string, string> | null;
    const extra: Record<string, unknown> = {};
    let previewUrl: string | undefined;
    let chatUrl: string | undefined;

    if (paths && typeof paths === "object") {
      for (const [column, dotPath] of Object.entries(paths)) {
        if (typeof dotPath !== "string") continue;
        const val = getPrimitiveString(json, dotPath);
        if (val !== undefined) {
          extra[column] = val;
          if (column === "preview_url") previewUrl = val;
          if (column === "chat_url") chatUrl = val;
        }
      }
      if (!previewUrl && typeof extra.preview_url === "string") previewUrl = extra.preview_url;
      if (!chatUrl && typeof extra.chat_url === "string") chatUrl = extra.chat_url;
    } else {
      // VBP status schema often adds preview in additionalProperties
      previewUrl =
        getString(json, "final_preview_url") ||
        getString(json, "preview_url") ||
        getString(json, "deploy_url") ||
        undefined;
    }

    return { kind: "success", previewUrl, chatUrl, extra };
  }

  if (failSet.has(norm)) {
    return {
      kind: "failure",
      message: getString(json, "message") || getString(json, "error") || `builder status: ${rawStatus}`,
    };
  }

  return { kind: "generating", rawStatus };
}
