import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const VERCEL_API_KEY = Deno.env.get("VERCEL_API_KEY");
  if (!VERCEL_API_KEY) {
    return new Response(
      JSON.stringify({ error: "VERCEL_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { content, targetLanguage, contentType = "article" } = await req.json();

    if (!content || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: "content and targetLanguage are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const langNames: Record<string, string> = {
      en: "English",
      pl: "Polish",
      de: "German",
      fr: "French",
      es: "Spanish",
    };

    const targetLangName = langNames[targetLanguage] || targetLanguage;

    const response = await fetch("https://api.vercel.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VERCEL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: [
          {
            role: "system",
            content: `You are a professional translator specializing in tech content. Translate to ${targetLangName}. Preserve all markdown formatting, code blocks, and technical terms. Return only the translated text.`,
          },
          {
            role: "user",
            content: `Translate this ${contentType} to ${targetLangName}:\n\n${content}`,
          },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Vercel AI API error [${response.status}]: ${errText}`);
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ success: true, translated, targetLanguage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Translation error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
