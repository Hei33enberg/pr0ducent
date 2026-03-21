/**
 * CORS for Edge Functions. Set EDGE_ALLOWED_ORIGINS to a comma-separated list
 * (e.g. https://app.example.com,http://localhost:5173). If unset, falls back to "*"
 * for local/dev compatibility.
 */
export function corsHeadersForRequest(req: Request): Record<string, string> {
  const raw = Deno.env.get("EDGE_ALLOWED_ORIGINS")?.trim();
  const allowList = raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const origin = req.headers.get("Origin");
  let allowOrigin = "*";
  if (allowList.length > 0) {
    allowOrigin = origin && allowList.includes(origin) ? origin : allowList[0]!;
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-pbp-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    Vary: "Origin",
  };
}
