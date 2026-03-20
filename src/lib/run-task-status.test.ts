import { describe, it, expect } from "vitest";
import { taskRowToDispatched } from "./run-task-status";

describe("taskRowToDispatched", () => {
  it("maps building to generating", () => {
    expect(
      taskRowToDispatched({
        tool_id: "v0",
        adapter_tier: 1,
        status: "building",
        error_message: null,
      })
    ).toEqual({ toolId: "v0", tier: 1, status: "generating" });
  });

  it("maps failed to error with message", () => {
    expect(
      taskRowToDispatched({
        tool_id: "v0",
        adapter_tier: 1,
        status: "failed",
        error_message: "timeout",
      })
    ).toEqual({ toolId: "v0", tier: 1, status: "error", error: "timeout" });
  });

  it("maps queued to generating", () => {
    expect(
      taskRowToDispatched({
        tool_id: "v0",
        adapter_tier: 1,
        status: "queued",
        error_message: null,
      })
    ).toEqual({ toolId: "v0", tier: 1, status: "generating" });
  });

  it("maps benchmark", () => {
    expect(
      taskRowToDispatched({
        tool_id: "bolt",
        adapter_tier: 4,
        status: "benchmark",
        error_message: null,
      })
    ).toEqual({ toolId: "bolt", tier: 4, status: "benchmark" });
  });
});
