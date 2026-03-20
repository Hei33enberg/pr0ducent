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

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Missing required environment variables");
    }

    // Validate auth using getClaims
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { prompt, experimentId } = await req.json();

    if (!prompt || !experimentId) {
      return new Response(
        JSON.stringify({ error: "Missing prompt or experimentId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify experiment belongs to user using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: exp } = await supabase
      .from("experiments")
      .select("id")
      .eq("id", experimentId)
      .eq("user_id", userId)
      .single();

    if (!exp) {
      return new Response(
        JSON.stringify({ error: "Experiment not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Insert pending result
    await supabase.from("builder_results").upsert(
      {
        experiment_id: experimentId,
        tool_id: "v0",
        status: "generating",
      },
      { onConflict: "experiment_id,tool_id" }
    );

    const startTime = Date.now();

    // Call v0 Platform API — use async response mode to avoid long edge-runtime blocking
    console.log("Calling v0 API with prompt length:", prompt.length);

    let chatResponse: Response;
    try {
      chatResponse = await fetch(`${V0_API_BASE}/chats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${V0_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: prompt,
          modelConfiguration: {
            responseMode: "async",
          },
        }),
        signal: AbortSignal.timeout(25000),
      });
    } catch (fetchError) {
      const isTimeout =
        fetchError instanceof DOMException && fetchError.name === "TimeoutError";
      const errorMessage = isTimeout
        ? "v0 API timeout (25s). Spróbuj krótszego promptu lub ponownie za chwilę."
        : `v0 API request failed: ${
            fetchError instanceof Error ? fetchError.message : "Unknown network error"
          }`;

      await supabase
        .from("builder_results")
        .update({
          status: "error",
          error_message: errorMessage,
        })
        .eq("experiment_id", experimentId)
        .eq("tool_id", "v0");

      return new Response(JSON.stringify({ success: false, error: errorMessage }), {
        status: isTimeout ? 504 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chatResponse.ok) {
      const errorBody = await chatResponse.text();
      console.error(`v0 API error [${chatResponse.status}]:`, errorBody);

      await supabase
        .from("builder_results")
        .update({
          status: "error",
          error_message: `v0 API error [${chatResponse.status}]: ${errorBody.slice(0, 500)}`,
        })
        .eq("experiment_id", experimentId)
        .eq("tool_id", "v0");

      return new Response(
        JSON.stringify({
          success: false,
          error: `v0 API error [${chatResponse.status}]: ${errorBody.slice(0, 200)}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const chatData = await chatResponse.json();
    const generationTime = Date.now() - startTime;
    console.log("v0 API response status:", chatResponse.status, "in", generationTime, "ms");

    console.log("v0 API response keys:", Object.keys(chatData));

    const chatId = chatData.id || chatData.chat_id;
    const chatUrl = chatData.webUrl || (chatId ? `https://v0.dev/chat/${chatId}` : null);
    const files = chatData.files || chatData.latestVersion?.files || chatData.messages?.[0]?.files || [];
    const previewUrl = chatData.latestVersion?.demoUrl || chatData.preview_url || chatData.deployment_url || null;

    await supabase
      .from("builder_results")
      .update({
        status: "completed",
        preview_url: previewUrl,
        chat_url: chatUrl,
        files: files,
        generation_time_ms: generationTime,
        raw_response: chatData,
      })
      .eq("experiment_id", experimentId)
      .eq("tool_id", "v0");

    return new Response(
      JSON.stringify({
        success: true,
        chatUrl,
        previewUrl,
        generationTimeMs: generationTime,
        files: files.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("run-on-v0 error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
