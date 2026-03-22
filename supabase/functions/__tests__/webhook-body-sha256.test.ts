import { assertEquals, assertMatch } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { sha256HexUtf8 } from "../_shared/webhook-body-sha256.ts";

Deno.test("sha256HexUtf8 is stable 64-char hex", async () => {
  const h = await sha256HexUtf8('{"event":"completed"}');
  assertEquals(h.length, 64);
  assertMatch(h, /^[0-9a-f]+$/);
});

Deno.test("sha256HexUtf8 differs for different bodies", async () => {
  const a = await sha256HexUtf8("a");
  const b = await sha256HexUtf8("b");
  assertEquals(a === b, false);
});
