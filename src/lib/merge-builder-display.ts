/**
 * Slice C — single precedence rule for Compare: prefer the row with newer `updated_at`
 * when both API props and Realtime stream have `builder_results` for a tool.
 */
import type { BuilderResult } from "@/hooks/useBuilderApi";
import type { BuilderResultRow } from "@/hooks/useRunTaskStream";
import { isoToMs } from "@/lib/realtime-merge";

function streamRowToBuilderResult(row: BuilderResultRow): BuilderResult {
  const st = String(row.status ?? "pending");
  const uiStatus: BuilderResult["status"] =
    st === "completed"
      ? "completed"
      : st === "error"
        ? "error"
        : st === "generating" || st === "dispatched"
          ? "generating"
          : "pending";

  return {
    id: row.id,
    toolId: row.tool_id,
    status: uiStatus,
    chatUrl: row.chat_url ?? undefined,
    previewUrl: row.preview_url ?? undefined,
    provenance: row.provenance,
    executionMode: row.execution_mode,
    updatedAt: row.updated_at,
  };
}

export function mergePreferredBuilderResult(
  fromProps: BuilderResult | undefined,
  fromStream: BuilderResultRow | undefined,
): BuilderResult | undefined {
  if (!fromStream) return fromProps;
  if (!fromProps) return streamRowToBuilderResult(fromStream);

  const tsP = isoToMs(fromProps.updatedAt);
  const tsS = isoToMs(fromStream.updated_at);
  if (tsS >= tsP) return streamRowToBuilderResult(fromStream);
  return fromProps;
}
