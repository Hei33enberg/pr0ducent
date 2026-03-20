import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const V0_API_BASE = "https://api.v0.dev/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const V0_API_KEY = Deno.env.get("V0_API_KEY");
    if (!V0_API_KEY) {
      throw new Error("V0_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Validate auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const anonClient = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!
    );
    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Verify experiment belongs to user
    const { data: exp } = await supabase
      .from("experiments")
      .select("id")
      .eq("id", experimentId)
      .eq("user_id", user.id)
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

    // Call v0 Platform API — create a chat with the prompt
    const chatResponse = await fetch(`${V0_API_BASE}/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${V0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!chatResponse.ok) {
      const errorBody = await chatResponse.text();
      throw new Error(
        `v0 API error [${chatResponse.status}]: ${errorBody}`
      );
    }

    const chatData = await chatResponse.json();
    const generationTime = Date.now() - startTime;

    // Extract useful data from response
    const chatId = chatData.id || chatData.chat_id;
    const chatUrl = chatId ? `https://v0.dev/chat/${chatId}` : null;

    // Try to get files from the response
    const files = chatData.files || chatData.messages?.[0]?.files || [];
    const previewUrl = chatData.preview_url || chatData.deployment_url || null;

    // Update result in DB
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
