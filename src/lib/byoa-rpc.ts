import type { Json } from "@/integrations/supabase/types";

export type ByoaRpcPayload = {
  ok?: boolean;
  error?: string;
  vault_ref?: string;
  removed?: boolean;
};

export function parseByoaRpcPayload(data: Json | null): ByoaRpcPayload {
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }
  return data as ByoaRpcPayload;
}

/** User-facing copy for `save_user_builder_api_key` / `disconnect_user_builder_api_key` JSON errors. */
export function mapByoaRpcErrorMessage(code: string | undefined): string {
  switch (code) {
    case "not_authenticated":
      return "You must be signed in.";
    case "invalid_tool_id":
      return "Invalid builder selection.";
    case "unsupported_credential_type":
      return "This credential type is not supported.";
    case "invalid_secret":
      return "Key must be between 8 and 8192 characters.";
    default:
      return code?.replace(/_/g, " ") ?? "Something went wrong. Try again.";
  }
}

export function throwIfByoaRpcFailed(data: Json | null): void {
  const p = parseByoaRpcPayload(data);
  if (p.ok === false) {
    throw new Error(mapByoaRpcErrorMessage(p.error));
  }
}
