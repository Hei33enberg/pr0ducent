import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { fetchByoaApiKey, preferByoaOverBroker } from "../_shared/byoa.ts";

Deno.test("preferByoaOverBroker uses BYOA when non-empty", () => {
  assertEquals(preferByoaOverBroker("user-key", "platform-key"), "user-key");
});

Deno.test("preferByoaOverBroker falls back to broker when BYOA empty", () => {
  assertEquals(preferByoaOverBroker("", "platform-key"), "platform-key");
  assertEquals(preferByoaOverBroker(undefined, "platform-key"), "platform-key");
});

Deno.test("preferByoaOverBroker returns undefined when both absent", () => {
  assertEquals(preferByoaOverBroker(undefined, undefined), undefined);
});

Deno.test("fetchByoaApiKey returns decrypted string from RPC", async () => {
  const admin = {
    rpc: (name: string, args: Record<string, unknown>) => {
      assertEquals(name, "get_byoa_api_key_for_dispatch");
      assertEquals(args.p_user_id, "00000000-0000-0000-0000-000000000001");
      assertEquals(args.p_tool_id, "v0");
      assertEquals(args.p_credential_type, "api_key");
      return Promise.resolve({ data: "secret-from-vault", error: null });
    },
  } as unknown as SupabaseClient;
  const key = await fetchByoaApiKey(
    admin,
    "00000000-0000-0000-0000-000000000001",
    "v0",
  );
  assertEquals(key, "secret-from-vault");
});

Deno.test("fetchByoaApiKey returns null on RPC error (broker mode)", async () => {
  const admin = {
    rpc: () =>
      Promise.resolve({
        data: null,
        error: { message: "permission denied" },
      }),
  } as unknown as SupabaseClient;
  const key = await fetchByoaApiKey(admin, "00000000-0000-0000-0000-000000000002", "x");
  assertEquals(key, null);
});

Deno.test("fetchByoaApiKey returns null for empty string from RPC", async () => {
  const admin = {
    rpc: () => Promise.resolve({ data: "", error: null }),
  } as unknown as SupabaseClient;
  const key = await fetchByoaApiKey(admin, "00000000-0000-0000-0000-000000000003", "y");
  assertEquals(key, null);
});

/** Same chain as process-task-queue / dispatch-builders → adapters (v0, generic_rest, vbp). */
Deno.test("orchestration: Vault RPC result overrides missing broker env", async () => {
  const admin = {
    rpc: () => Promise.resolve({ data: "from-vault", error: null }),
  } as unknown as SupabaseClient;
  const byoa = await fetchByoaApiKey(
    admin,
    "00000000-0000-0000-0000-000000000004",
    "replit_second",
  );
  const brokerKey = undefined as string | undefined;
  assertEquals(preferByoaOverBroker(byoa ?? undefined, brokerKey), "from-vault");
});
