import { describe, expect, it } from "vitest";
import { mergeBuilderCatalog } from "./builder-catalog";
import type { BuilderTool } from "@/config/tools";

const minimalDefault: BuilderTool = {
  id: "v0",
  name: "V0",
  logoUrl: "",
  featured: true,
  strengths: [],
  description: "",
  mockDelayRange: [1, 2],
  stack: "",
  hosting: "",
  pricing: "",
  category: "x",
};

describe("mergeBuilderCatalog", () => {
  it("overlays display_name from row over static catalog", () => {
    const out = mergeBuilderCatalog([minimalDefault], [
      { tool_id: "v0", tier: 1, enabled: true, display_name: "Display V0", capabilities: {} },
    ]);
    expect(out.find((t) => t.id === "v0")?.name).toBe("Display V0");
    expect(out.find((t) => t.id === "v0")?.integrationTier).toBe(1);
  });

  it("adds DB-only tool_id as minimal BuilderTool", () => {
    const out = mergeBuilderCatalog([minimalDefault], [
      { tool_id: "new_tool", tier: 2, enabled: true, capabilities: { displayName: "New", strengths: ["a"] } },
    ]);
    const nt = out.find((t) => t.id === "new_tool");
    expect(nt?.name).toBe("New");
    expect(nt?.integrationEnabled).toBe(true);
  });

  it("returns same count as defaults when no DB rows", () => {
    expect(mergeBuilderCatalog([minimalDefault], [])).toHaveLength(1);
  });

  it("does not mutate the original defaults array", () => {
    const copy = [{ ...minimalDefault }];
    mergeBuilderCatalog(copy, [{ tool_id: "v0", tier: 2, enabled: false }]);
    expect(copy[0].name).toBe("V0");
  });

  it("marks tool disabled when enabled=false", () => {
    const out = mergeBuilderCatalog([minimalDefault], [{ tool_id: "v0", tier: 1, enabled: false }]);
    expect(out.find((t) => t.id === "v0")?.integrationEnabled).toBe(false);
  });

  it("overlays circuitState", () => {
    const out = mergeBuilderCatalog([minimalDefault], [
      { tool_id: "v0", tier: 1, enabled: true, circuit_state: "open" },
    ]);
    expect(out.find((t) => t.id === "v0")?.circuitState).toBe("open");
  });

  it("falls back to capabilities.displayName when display_name is whitespace", () => {
    const out = mergeBuilderCatalog([minimalDefault], [
      { tool_id: "v0", tier: 1, enabled: true, display_name: "  ", capabilities: { displayName: "Cap Name" } },
    ]);
    expect(out.find((t) => t.id === "v0")?.name).toBe("Cap Name");
  });

  it("keeps original name when neither display_name nor cap override present", () => {
    const out = mergeBuilderCatalog([minimalDefault], [{ tool_id: "v0", tier: 1, enabled: true }]);
    expect(out.find((t) => t.id === "v0")?.name).toBe("V0");
  });

  it("new tool with tier<=2 gets featured=true", () => {
    const out = mergeBuilderCatalog([minimalDefault], [{ tool_id: "fresh", tier: 2, enabled: true }]);
    expect(out.find((t) => t.id === "fresh")?.featured).toBe(true);
  });

  it("new tool with tier>2 gets featured=false", () => {
    const out = mergeBuilderCatalog([minimalDefault], [{ tool_id: "bench", tier: 4, enabled: false }]);
    expect(out.find((t) => t.id === "bench")?.featured).toBe(false);
  });

  it("handles multiple DB rows — existing + new", () => {
    const out = mergeBuilderCatalog([minimalDefault], [
      { tool_id: "v0", tier: 1, enabled: false },
      { tool_id: "bolt", tier: 3, enabled: true, capabilities: { displayName: "Bolt.new" } },
    ]);
    expect(out).toHaveLength(2);
    expect(out.find((t) => t.id === "v0")?.integrationEnabled).toBe(false);
    expect(out.find((t) => t.id === "bolt")?.name).toBe("Bolt.new");
  });

  it("new tool picks up capabilities.logoUrl", () => {
    const out = mergeBuilderCatalog([minimalDefault], [
      { tool_id: "newco", tier: 1, enabled: true, capabilities: { logoUrl: "https://x.dev/logo.png" } },
    ]);
    expect(out.find((t) => t.id === "newco")?.logoUrl).toBe("https://x.dev/logo.png");
  });
});
