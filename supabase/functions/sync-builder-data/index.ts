import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUILDERS = [
  { id: "lovable", name: "Lovable", url: "https://lovable.dev" },
  { id: "v0", name: "Vercel v0", url: "https://v0.dev" },
  { id: "bolt", name: "Bolt.new", url: "https://bolt.new" },
  { id: "cursor", name: "Cursor", url: "https://cursor.sh" },
  { id: "replit", name: "Replit", url: "https://replit.com" },
  { id: "base44", name: "Base44", url: "https://www.base44.com" },
  { id: "antigravity", name: "Antigravity", url: "" },
  { id: "build0", name: "Build0", url: "" },
  { id: "orchids", name: "Orchids", url: "" },
  { id: "floot", name: "Floot", url: "" },
];

async function researchBuilder(
  builderName: string,
  perplexityKey: string
): Promise<any> {
  const prompt = `Research the AI app builder "${builderName}" and provide current information as of 2025-2026. Return a JSON object with these fields:
- pricing_tiers: array of {name (lowercase: free/pro/team/enterprise), monthly_price (number), annual_price (number or null), credits_included (number), credit_unit (string like "messages" or "generations"), overage_cost (number or null), features (array of feature strings)} for each plan
- features: array of key feature strings
- changelog: array of {date, title, description} for the 3 most recent updates/changes
- official_url: the official website URL
- docs_url: URL to their documentation
- status: "active" or "discontinued"
- ai_models: array of AI model names this builder uses (e.g. "GPT-4o", "Claude 3.5 Sonnet")
- dev_environment: string describing the development environment (e.g. "Cloud IDE", "VS Code fork", "WebContainer")
- active_promotions: array of {description, expires_at (ISO date or null)} for any current deals

Only return valid JSON, no markdown.`;

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
            "You are a research assistant. Return only valid JSON, no markdown formatting.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Perplexity API error [${response.status}]: ${errText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";

  try {
    const cleaned = content.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw: content };
  }
}

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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: { tool_id: string; success: boolean; error?: string }[] = [];
  const changes: { tool_id: string; field: string; old: any; new_val: any }[] = [];

  for (const builder of BUILDERS) {
    try {
      const research = await researchBuilder(builder.name, PERPLEXITY_API_KEY);

      // Get existing data for diff detection
      const { data: existing } = await supabase
        .from("builder_sync_data")
        .select("*")
        .eq("tool_id", builder.id)
        .single();

      const upsertData = {
        tool_id: builder.id,
        pricing_tiers: research.pricing_tiers || [],
        features: research.features || [],
        changelog: research.changelog || [],
        official_url: research.official_url || builder.url,
        docs_url: research.docs_url || null,
        status: research.status || "active",
        last_synced_at: new Date().toISOString(),
        raw_perplexity_response: research,
        updated_at: new Date().toISOString(),
      };

      // Detect changes
      if (existing) {
        const oldPricing = JSON.stringify(existing.pricing_tiers);
        const newPricing = JSON.stringify(upsertData.pricing_tiers);
        if (oldPricing !== newPricing) {
          changes.push({
            tool_id: builder.id,
            field: "pricing",
            old: existing.pricing_tiers,
            new_val: upsertData.pricing_tiers,
          });
        }
        const oldFeatures = JSON.stringify(existing.features);
        const newFeatures = JSON.stringify(upsertData.features);
        if (oldFeatures !== newFeatures) {
          changes.push({
            tool_id: builder.id,
            field: "features",
            old: existing.features,
            new_val: upsertData.features,
          });
        }
      }

      const { error } = await supabase
        .from("builder_sync_data")
        .upsert(upsertData, { onConflict: "tool_id" });

      if (error) throw error;

      // Populate builder_pricing_plans from research
      if (research.pricing_tiers && Array.isArray(research.pricing_tiers)) {
        for (const tier of research.pricing_tiers) {
          const planData = {
            tool_id: builder.id,
            plan_name: (tier.name || "free").toLowerCase(),
            monthly_price: tier.monthly_price ?? 0,
            annual_price: tier.annual_price ?? null,
            credits_included: tier.credits_included ?? 0,
            credit_unit: tier.credit_unit || "messages",
            overage_cost: tier.overage_cost ?? null,
            features: tier.features || [],
            ai_models: research.ai_models || [],
            dev_environment: research.dev_environment || null,
            promo_active: false,
            promo_description: null,
            promo_expires_at: null,
            updated_at: new Date().toISOString(),
          };

          // Check for promotions
          if (research.active_promotions && Array.isArray(research.active_promotions) && research.active_promotions.length > 0) {
            planData.promo_active = true;
            planData.promo_description = research.active_promotions[0].description || null;
            planData.promo_expires_at = research.active_promotions[0].expires_at || null;
          }

          await supabase
            .from("builder_pricing_plans")
            .upsert(planData, { onConflict: "tool_id,plan_name" });
        }

        // Record price history snapshot
        for (const tier of research.pricing_tiers) {
          await supabase.from("builder_price_history").insert({
            tool_id: builder.id,
            plan_name: (tier.name || "free").toLowerCase(),
            monthly_price: tier.monthly_price ?? 0,
            annual_price: tier.annual_price ?? null,
            credits_included: tier.credits_included ?? 0,
          });
        }
      }

      results.push({ tool_id: builder.id, success: true });
    } catch (err: any) {
      console.error(`Failed to sync ${builder.id}:`, err);
      results.push({
        tool_id: builder.id,
        success: false,
        error: err.message,
      });
    }
  }

  // Send notifications for changes
  if (changes.length > 0) {
    const { data: subs } = await supabase
      .from("notification_subscriptions")
      .select("*");

    if (subs && subs.length > 0) {
      const notifications: any[] = [];
      for (const sub of subs) {
        for (const change of changes) {
          const watchesThisBuilder =
            sub.tool_ids.length === 0 || sub.tool_ids.includes(change.tool_id);
          const wantsThisType =
            (change.field === "pricing" && sub.notify_pricing) ||
            (change.field === "features" && sub.notify_changelog);

          if (watchesThisBuilder && wantsThisType) {
            notifications.push({
              user_id: sub.user_id,
              title: `${change.tool_id} updated ${change.field}`,
              body: `${change.tool_id} has updated its ${change.field}. Check the dashboard for details.`,
              link: "/dashboard/updates",
            });
          }
        }
      }

      if (notifications.length > 0) {
        await supabase.from("user_notifications").insert(notifications);
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, results, changes_detected: changes.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
