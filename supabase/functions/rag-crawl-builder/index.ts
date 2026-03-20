/**
 * Fetches enabled builder_crawl_sources due for refresh; stores one chunk per URL in builder_knowledge_chunks.
 * Invoke via pg_cron (e.g. every 6h) with service-role Authorization header.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CONTENT = 100_000;

function isServiceRole(req: Request): boolean {
  const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("Authorization");
  if (!expected || !auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === expected;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (!isServiceRole(req)) {
    return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, key);

  const { data: sources, error } = await admin
    .from("builder_crawl_sources")
    .select("id, tool_id, source_url, crawl_interval_hours, last_crawled_at")
    .eq("enabled", true)
    .limit(25);

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = Date.now();
  let crawled = 0;

  for (const s of sources || []) {
    const intervalH = s.crawl_interval_hours ?? 24;
    const last = s.last_crawled_at ? new Date(s.last_crawled_at as string).getTime() : 0;
    if (last && now - last < intervalH * 3600_000) continue;

    try {
      const res = await fetch(s.source_url as string, {
        signal: AbortSignal.timeout(25_000),
        headers: { "User-Agent": "pr0ducent-rag-crawl/1.0" },
      });
      const text = res.ok ? await res.text() : "";
      if (!text) continue;

      const content = text.slice(0, MAX_CONTENT);
      const checksum = await sha256Hex(content);

      const { data: prior } = await admin
        .from("builder_knowledge_chunks")
        .select("checksum")
        .eq("tool_id", s.tool_id as string)
        .eq("source_url", s.source_url as string)
        .eq("content_type", "crawl_doc")
        .maybeSingle();

      if (prior && (prior as { checksum: string | null }).checksum === checksum) {
        await admin
          .from("builder_crawl_sources")
          .update({ last_crawled_at: new Date().toISOString() })
          .eq("id", s.id as string);
        continue;
      }

      await admin
        .from("builder_knowledge_chunks")
        .delete()
        .eq("tool_id", s.tool_id as string)
        .eq("source_url", s.source_url as string)
        .eq("content_type", "crawl_doc");

      await admin.from("builder_knowledge_chunks").insert({
        tool_id: s.tool_id as string,
        source_url: s.source_url as string,
        content,
        content_type: "crawl_doc",
        checksum,
        metadata: { crawl_source_id: s.id, status: res.status },
      });

      await admin
        .from("builder_crawl_sources")
        .update({ last_crawled_at: new Date().toISOString() })
        .eq("id", s.id as string);
      crawled++;
    } catch (e) {
      console.error("crawl failed", s.source_url, e);
    }
  }

  return new Response(JSON.stringify({ ok: true, sources_scanned: (sources || []).length, crawled }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
