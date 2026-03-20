import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const V0_API_BASE = "https://api.v0.dev/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const V0_API_KEY = Deno.env.get("V0_API_KEY");
    if (!V0_API_KEY) {
      throw new Error("V0_API_KEY is not configured");
    }

    const { chatId, experimentId } = await req.json();

    if (!chatId) {
      return new Response(
        JSON.stringify({ error: "Missing chatId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pollResponse = await fetch(`${V0_API_BASE}/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${V0_API_KEY}` },
      signal: AbortSignal.timeout(10000),
    });

    if (!pollResponse.ok) {
      const errorBody = await pollResponse.text();
      console.error(`v0 poll error [${pollResponse.status}]:`, errorBody);
      return new Response(
        JSON.stringify({ status: "error", error: `v0 API [${pollResponse.status}]` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatData = await pollResponse.json();

    const latestVersion = chatData.latestVersion || {};
    const versionStatus = latestVersion.status || "unknown";
    const demoUrl = latestVersion.demoUrl || null;
    const chatUrl = chatData.webUrl || `https://v0.dev/chat/${chatId}`;
    const files = latestVersion.files || chatData.files || [];

    const isCompleted = versionStatus === "completed";
    const isFailed = versionStatus === "failed" || versionStatus === "error";

    // Update DB if completed/failed and experimentId provided
    if ((isCompleted || isFailed) && experimentId) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from("builder_results").update({
          status: isCompleted ? "completed" : "error",
          preview_url: demoUrl,
          chat_url: chatUrl,
          files: files,
          raw_response: chatData,
          error_message: isFailed ? "v0 generation failed" : null,
        }).eq("experiment_id", experimentId).eq("tool_id", "v0");
      }
    }

    return new Response(
      JSON.stringify({
        status: isCompleted ? "completed" : isFailed ? "error" : "generating",
        chatUrl,
        previewUrl: demoUrl,
        files: files.length,
        versionStatus,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("poll-v0-status error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ status: "error", error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
