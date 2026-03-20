import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TOPIC_TEMPLATES = [
  // Comparisons
  { topic: "Lovable vs Bolt.new: Which AI Builder Wins in {year}?", category: "comparison", tags: ["lovable", "bolt", "comparison"] },
  { topic: "v0 vs Cursor: Best for Frontend Development in {year}", category: "comparison", tags: ["v0", "cursor", "comparison"] },
  { topic: "Replit vs Base44: Best for Business Apps in {year}", category: "comparison", tags: ["replit", "base44", "comparison"] },
  { topic: "Top 5 AI App Builders for Startups in {year}", category: "comparison", tags: ["ranking", "startups"] },
  { topic: "Best Free AI App Builders: Complete Guide {year}", category: "comparison", tags: ["free", "ranking"] },
  // Analysis
  { topic: "AI Builder Pricing Compared: Which Gives Best Value?", category: "blog", tags: ["pricing", "analysis"] },
  { topic: "How AI Builders Handle Backend Logic: A Deep Dive", category: "blog", tags: ["backend", "analysis"] },
  { topic: "The State of AI App Builders: Trends for {year}", category: "blog", tags: ["trends", "analysis"] },
  { topic: "Speed Test: Which AI Builder Ships Fastest?", category: "blog", tags: ["speed", "benchmarks"] },
  { topic: "AI Builder Credit Systems Explained: Hidden Costs Revealed", category: "blog", tags: ["pricing", "credits"] },
  // Use cases
  { topic: "Build a SaaS Dashboard with AI: Best Builder for the Job", category: "blog", tags: ["saas", "use-case"] },
  { topic: "E-commerce with AI Builders: From Prompt to Store in Minutes", category: "blog", tags: ["ecommerce", "use-case"] },
  { topic: "Building a Portfolio Site: AI Builder Showdown", category: "blog", tags: ["portfolio", "use-case"] },
  // Updates roundups
  { topic: "AI Builder Updates This Month: What's New?", category: "blog", tags: ["updates", "roundup"] },
  { topic: "New Features in AI Builders: Monthly Roundup", category: "blog", tags: ["features", "roundup"] },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Pick a random topic that hasn't been used recently
    const { data: recentPosts } = await supabase
      .from("blog_posts")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(10);

    const recentTitles = (recentPosts || []).map((p: any) => p.title.toLowerCase());
    const year = new Date().getFullYear();

    const availableTopics = TOPIC_TEMPLATES.filter((t) => {
      const resolved = t.topic.replace("{year}", String(year)).toLowerCase();
      return !recentTitles.some((rt: string) => rt.includes(resolved.slice(0, 30)));
    });

    const template = availableTopics.length > 0
      ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
      : TOPIC_TEMPLATES[Math.floor(Math.random() * TOPIC_TEMPLATES.length)];

    const resolvedTopic = template.topic.replace("{year}", String(year));

    // Call generate-blog-post function
    const generateUrl = `${supabaseUrl}/functions/v1/generate-blog-post`;
    const response = await fetch(generateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        topic: resolvedTopic,
        category: template.category,
        tags: template.tags,
        language: "en",
        autoTranslate: true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Blog generation failed");
    }

    return new Response(
      JSON.stringify({ success: true, topic: resolvedTopic, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Cron blog generator error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
