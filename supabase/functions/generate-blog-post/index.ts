import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BlogRequest {
  topic: string;
  category?: "blog" | "social_twitter" | "social_linkedin" | "comparison";
  language?: string;
  tags?: string[];
  autoTranslate?: boolean;
}

async function researchTopic(
  topic: string,
  perplexityKey: string
): Promise<string> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${perplexityKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [
        {
          role: "system",
          content:
            "You are a research assistant for a tech blog about AI app builders. Provide detailed, factual research.",
        },
        {
          role: "user",
          content: `Research the following topic thoroughly and provide key facts, statistics, and insights: ${topic}`,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API error [${response.status}]: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  vercelKey: string
): Promise<string> {
  const response = await fetch("https://api.vercel.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vercelKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Vercel AI API error [${response.status}]: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

const CATEGORY_PROMPTS: Record<string, string> = {
  blog: `Write an SEO-optimized blog post (1200-2000 words). Include:
- Compelling title with primary keyword
- Meta description (under 160 chars)
- Clear H2/H3 structure
- Actionable insights
- Conclusion with CTA
Return as JSON: {title, content (markdown), excerpt, seo_title, seo_description}`,

  social_twitter: `Write a Twitter/X thread (5-8 tweets). Each tweet under 280 chars.
Return as JSON: {title, content (each tweet on new line), excerpt (first tweet), seo_title, seo_description}`,

  social_linkedin: `Write a LinkedIn post (600-1000 words). Professional tone, storytelling format, with engagement hooks.
Return as JSON: {title, content, excerpt, seo_title, seo_description}`,

  comparison: `Write a detailed comparison article (1500-2500 words) about AI app builders. Include:
- Feature-by-feature comparison table (in markdown)
- Pros/cons for each builder
- Use case recommendations
- Pricing comparison
- Verdict
Return as JSON: {title, content (markdown), excerpt, seo_title, seo_description}`,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
  if (!PERPLEXITY_API_KEY) {
    return new Response(
      JSON.stringify({ error: "PERPLEXITY_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const VERCEL_API_KEY = Deno.env.get("VERCEL_API_KEY");
  if (!VERCEL_API_KEY) {
    return new Response(
      JSON.stringify({ error: "VERCEL_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify admin role
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      const { data: hasAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!hasAdmin) {
        return new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
  }

  try {
    const body: BlogRequest = await req.json();
    const { topic, category = "blog", language = "en", tags = [], autoTranslate = false } = body;

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Research with Perplexity
    const research = await researchTopic(topic, PERPLEXITY_API_KEY);

    // Step 2: Write with Claude via Vercel AI Gateway
    const categoryPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.blog;
    const writePrompt = `Topic: ${topic}\n\nResearch data:\n${research}\n\nWrite in: ${language}\n\n${categoryPrompt}\n\nIMPORTANT: Return ONLY valid JSON.`;

    const articleJson = await generateWithClaude(
      "You are an expert tech writer for pr0ducent.com, a platform that compares AI app builders. Write engaging, SEO-optimized content. Always return valid JSON only.",
      writePrompt,
      VERCEL_API_KEY
    );

    // Parse the generated content
    let article: any;
    try {
      const cleaned = articleJson.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      article = JSON.parse(cleaned);
    } catch {
      article = {
        title: topic,
        content: articleJson,
        excerpt: articleJson.substring(0, 200),
        seo_title: topic,
        seo_description: topic,
      };
    }

    const slug = generateSlug(article.title || topic);

    // Step 3: Store in DB
    const { data: post, error } = await supabase
      .from("blog_posts")
      .upsert(
        {
          slug,
          title: article.title || topic,
          content: article.content || "",
          excerpt: article.excerpt || "",
          category,
          tags,
          language,
          status: "draft",
          seo_title: article.seo_title || article.title,
          seo_description: article.seo_description || article.excerpt,
          ai_model_used: "claude-sonnet-4-via-vercel",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error) throw error;

    // Step 4: Auto-translate if requested
    let translatedPost = null;
    if (autoTranslate && language === "en") {
      const translatePrompt = `Translate this article to Polish. Keep markdown formatting. Return JSON: {title, content, excerpt, seo_title, seo_description}\n\nTitle: ${article.title}\n\nContent:\n${article.content}`;

      const translatedJson = await generateWithClaude(
        "You are a professional translator. Translate tech content from English to Polish. Return valid JSON only.",
        translatePrompt,
        VERCEL_API_KEY
      );

      try {
        const cleaned = translatedJson.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
        const translated = JSON.parse(cleaned);
        const plSlug = `${slug}-pl`;

        const { data: plPost } = await supabase
          .from("blog_posts")
          .upsert(
            {
              slug: plSlug,
              title: translated.title,
              content: translated.content,
              excerpt: translated.excerpt,
              category,
              tags,
              language: "pl",
              status: "draft",
              seo_title: translated.seo_title,
              seo_description: translated.seo_description,
              ai_model_used: "claude-sonnet-4-via-vercel",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "slug" }
          )
          .select()
          .single();

        translatedPost = plPost;
      } catch (e) {
        console.error("Translation failed:", e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, post, translatedPost }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Blog generation error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
