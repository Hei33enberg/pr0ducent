import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const V0_API_BASE = "https://api.v0.dev/v1";
const V0_HANDSHAKE_TIMEOUT_MS = 25000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const V0_API_KEY = Deno.env.get("V0_API_KEY");
    if (!V0_API_KEY) {
      throw new Error("V0_API_KEY is not configured");
    }

    const { prompt, experimentId } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing prompt" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to DB only for real DB experiment UUIDs (skip guest/local ids)
    const isUuid = typeof experimentId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(experimentId);
    if (isUuid) {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from("builder_results").upsert(
          { experiment_id: experimentId, tool_id: "v0", status: "generating" },
          { onConflict: "experiment_id,tool_id" }
        );
      }
    }

    // Call v0 API in async mode — allow longer handshake time under load
    console.log("Calling v0 API async with prompt length:", prompt.length);

    const chatResponse = await fetch(`${V0_API_BASE}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${V0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
        modelConfiguration: {
          responseMode: "async",
          thinking: false,
          imageGenerations: false,
        },
      }),
      signal: AbortSignal.timeout(V0_HANDSHAKE_TIMEOUT_MS),
    });

    if (!chatResponse.ok) {
      const errorBody = await chatResponse.text();
      console.error(`v0 API error [${chatResponse.status}]:`, errorBody);

      const normalizedError = chatResponse.status === 429
        ? "v0 daily limit reached for this API key."
        : `v0 API error [${chatResponse.status}]: ${errorBody.slice(0, 300)}`;

      return new Response(
        JSON.stringify({
          success: false,
          error: normalizedError,
          upstreamStatus: chatResponse.status,
          retryable: chatResponse.status >= 500,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const chatData = await chatResponse.json();
    console.log("v0 API response keys:", Object.keys(chatData));

    const chatId = chatData.id || chatData.chat_id;
    const chatUrl = chatData.webUrl || (chatId ? `https://v0.dev/chat/${chatId}` : null);

    if (!chatId) {
      return new Response(
        JSON.stringify({ success: false, error: "No chatId returned from v0 API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, chatId, chatUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("run-on-v0 error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";

    return new Response(
      JSON.stringify({
        success: false,
        error: isTimeout ? `v0 handshake timeout (${Math.round(V0_HANDSHAKE_TIMEOUT_MS / 1000)}s). Spróbuj ponownie za chwilę.` : message,
        retryable: isTimeout,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
