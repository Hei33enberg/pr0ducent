import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getByPath, getString } from "../_shared/jsonpath-lite.ts";

Deno.test("getByPath nested", () => {
  assertEquals(getByPath({ data: { id: "abc" } }, "data.id"), "abc");
});

Deno.test("getString", () => {
  assertEquals(getString({ x: { y: "z" } }, "x.y"), "z");
});
