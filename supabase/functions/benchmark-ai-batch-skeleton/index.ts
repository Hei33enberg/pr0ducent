/**
 * Grupa C — placeholder. Real batch AI (Gemini/GPT) runs out-of-band with token budget.
 * See docs/SCORE-BUILDER-OUTPUT-GROUP-B.md
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return new Response(
    JSON.stringify({
      ok: false,
      error: "benchmark-ai-batch-skeleton: not implemented",
      doc: "docs/SCORE-BUILDER-OUTPUT-GROUP-B.md",
    }),
    { status: 501, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
