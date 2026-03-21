import { describe, expect, it } from "vitest";
import { mapByoaRpcErrorMessage, parseByoaRpcPayload, throwIfByoaRpcFailed } from "./byoa-rpc";

describe("parseByoaRpcPayload", () => {
  it("parses ok object", () => {
    expect(parseByoaRpcPayload({ ok: true, vault_ref: "x" })).toEqual({
      ok: true,
      vault_ref: "x",
    });
  });

  it("returns empty for non-object", () => {
    expect(parseByoaRpcPayload(null)).toEqual({});
    expect(parseByoaRpcPayload("x")).toEqual({});
  });
});

describe("throwIfByoaRpcFailed", () => {
  it("throws when ok is false", () => {
    expect(() => throwIfByoaRpcFailed({ ok: false, error: "invalid_secret" })).toThrow(/8 and 8192/);
  });

  it("no throw when ok true", () => {
    expect(() => throwIfByoaRpcFailed({ ok: true })).not.toThrow();
  });

  it("no throw when payload empty", () => {
    expect(() => throwIfByoaRpcFailed({})).not.toThrow();
  });
});

describe("mapByoaRpcErrorMessage", () => {
  it("maps known codes", () => {
    expect(mapByoaRpcErrorMessage("invalid_secret")).toContain("8");
    expect(mapByoaRpcErrorMessage("not_authenticated")).toContain("signed in");
  });
});
