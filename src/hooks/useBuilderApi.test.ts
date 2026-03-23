/**
 * useBuilderApi — unit tests for exported pure helpers
 *
 * Tests isUuid (dispatch branching), mapBuilderRow (status/field mapping),
 * and v0 poll/timeout reducers (shared by guest + experiment polling).
 */
import { describe, it, expect } from "vitest";
import { copy } from "@/lib/copy";
import {
  isUuid,
  mapBuilderRow,
  mapV0PollToTerminalResult,
  reduceV0TimeoutError,
  type BuilderResult,
} from "./useBuilderApi";

// ── isUuid — controls guest vs authenticated dispatch path ────────────────────

describe("isUuid", () => {
  it("returns true for a valid v4 UUID", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("returns true for v1-v5 UUID variants", () => {
    // v1
    expect(isUuid("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toBe(true);
    // v3
    expect(isUuid("6ba7b810-9dad-31d1-80b4-00c04fd430c8")).toBe(true);
  });

  it("returns false for undefined", () => {
    expect(isUuid(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isUuid("")).toBe(false);
  });

  it("returns false for a plain string (guest path)", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
  });

  it("returns false for a partial UUID", () => {
    expect(isUuid("550e8400-e29b-41d4")).toBe(false);
  });

  it("returns false for a UUID with wrong variant byte", () => {
    // Variant byte 0 instead of 8-b
    expect(isUuid("550e8400-e29b-41d4-0016-446655440000")).toBe(false);
  });

  it("handles uppercase UUIDs (case-insensitive)", () => {
    expect(isUuid("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });
});

// ── mapBuilderRow — status mapping and field projection ───────────────────────

describe("mapBuilderRow", () => {
  const base = {
    id: "row-1",
    tool_id: "v0",
    status: "completed",
    chat_url: "https://v0.dev/chat/abc",
    preview_url: "https://preview.v0.dev/result",
    generation_time_ms: 4200,
    error_message: null,
    provenance: "live_api",
    execution_mode: "live",
    provider_run_id: "chat-abc",
  };

  it("maps completed status correctly", () => {
    const result = mapBuilderRow(base);
    expect(result.status).toBe("completed");
  });

  it("maps error status correctly", () => {
    const result = mapBuilderRow({ ...base, status: "error", error_message: "Timed out" });
    expect(result.status).toBe("error");
    expect(result.error).toBe("Timed out");
  });

  it("maps dispatched → generating", () => {
    const result = mapBuilderRow({ ...base, status: "dispatched" });
    expect(result.status).toBe("generating");
  });

  it("maps generating → generating", () => {
    const result = mapBuilderRow({ ...base, status: "generating" });
    expect(result.status).toBe("generating");
  });

  it("maps unknown status → pending", () => {
    const result = mapBuilderRow({ ...base, status: "queued" });
    expect(result.status).toBe("pending");
  });

  it("maps null status → pending", () => {
    const result = mapBuilderRow({ ...base, status: null });
    expect(result.status).toBe("pending");
  });

  it("projects all standard fields", () => {
    const result = mapBuilderRow(base);
    expect(result.id).toBe("row-1");
    expect(result.toolId).toBe("v0");
    expect(result.chatUrl).toBe("https://v0.dev/chat/abc");
    expect(result.previewUrl).toBe("https://preview.v0.dev/result");
    expect(result.generationTimeMs).toBe(4200);
    expect(result.provenance).toBe("live_api");
    expect(result.executionMode).toBe("live");
    expect(result.providerRunId).toBe("chat-abc");
  });

  it("undefined optional fields map to undefined (not null)", () => {
    const result = mapBuilderRow({ id: "x", tool_id: "v0", status: "pending" });
    expect(result.chatUrl).toBeUndefined();
    expect(result.previewUrl).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.provenance).toBeUndefined();
  });

  it("null error_message maps to undefined error field", () => {
    const result = mapBuilderRow({ ...base, error_message: null });
    expect(result.error).toBeUndefined();
  });

  it("result satisfies BuilderResult type shape", () => {
    const result: BuilderResult = mapBuilderRow(base);
    expect(result).toBeDefined();
  });
});

// ── mapV0PollToTerminalResult — poll-v0-status terminal mapping ─────────────

describe("mapV0PollToTerminalResult", () => {
  const ctxBase = {
    chatId: "chat-1",
    fallbackChatUrl: "https://v0.dev/chat/chat-1",
    startTime: 1000,
    nowMs: 5000,
  };

  it("returns null for non-terminal status", () => {
    expect(mapV0PollToTerminalResult({ status: "generating" }, ctxBase)).toBeNull();
    expect(mapV0PollToTerminalResult({}, ctxBase)).toBeNull();
  });

  it("maps completed with preview and generation time", () => {
    const r = mapV0PollToTerminalResult(
      { status: "completed", previewUrl: "https://p.example/x", chatUrl: "https://c.example" },
      ctxBase
    );
    expect(r?.status).toBe("completed");
    expect(r?.previewUrl).toBe("https://p.example/x");
    expect(r?.generationTimeMs).toBe(4000);
    expect(r?.providerRunId).toBe("chat-1");
    expect(r?.provenance).toBe("live_api");
  });

  it("maps error and falls back to translated v0 failure message", () => {
    const r = mapV0PollToTerminalResult({ status: "error", error: "boom" }, ctxBase);
    expect(r?.status).toBe("error");
    expect(r?.error).toBe("boom");
  });

  it("uses copy api.v0Failed when error field missing", () => {
    const r = mapV0PollToTerminalResult({ status: "error" }, ctxBase);
    expect(r?.error).toBe(copy["api.v0Failed"]);
  });
});

// ── reduceV0TimeoutError — MAX_POLL_TIME branch ──────────────────────────────

describe("reduceV0TimeoutError", () => {
  const gen: BuilderResult = {
    id: "x",
    toolId: "v0",
    status: "generating",
    providerRunId: "chat-1",
  };

  it("returns null if v0 is not generating", () => {
    expect(
      reduceV0TimeoutError(
        { v0: { ...gen, status: "completed" } },
        { chatId: "chat-1", chatUrl: "https://u", nowMs: 99 }
      )
    ).toBeNull();
  });

  it("sets error state when still generating", () => {
    const next = reduceV0TimeoutError({ v0: gen }, { chatId: "chat-1", chatUrl: "https://u", nowMs: 99 });
    expect(next?.v0.status).toBe("error");
    expect(next?.v0.error).toBe(copy["api.timeoutGenerating"]);
    expect(next?.v0.id).toBe("v0-99");
  });
});
