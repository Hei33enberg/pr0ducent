import { describe, it, expect } from "vitest";
import { isoToMs, shouldReplaceBuilderResultRow, shouldReplaceTaskRow } from "./realtime-merge";

describe("realtime-merge", () => {
  it("prefers newer updated_at", () => {
    const older = { updated_at: "2020-01-01T00:00:00.000Z" };
    const newer = { updated_at: "2025-01-01T00:00:00.000Z" };
    expect(shouldReplaceTaskRow(older, newer)).toBe(true);
    expect(shouldReplaceTaskRow(newer, older)).toBe(false);
  });

  it("replaces when prev missing", () => {
    expect(shouldReplaceTaskRow(undefined, { updated_at: "2025-01-01T00:00:00.000Z" })).toBe(true);
    expect(shouldReplaceBuilderResultRow(undefined, { updated_at: "2025-01-01T00:00:00.000Z" })).toBe(true);
  });

  it("isoToMs handles invalid", () => {
    expect(isoToMs(undefined)).toBe(0);
    expect(isoToMs("")).toBe(0);
  });
});
