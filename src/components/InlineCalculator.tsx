import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { supabase } from "@/integrations/supabase/client";
import { calculatePVI, getPVILabel, type PVIPlan } from "@/lib/pvi-calculator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calculator, Trophy, ArrowRight } from "lucide-react";

interface PricingPlan {
  tool_id: string;
  plan_name: string;
  monthly_price: number | null;
  credits_included: number | null;
  credit_unit: string | null;
  ai_models: string[] | null;
  features: any;
  dev_environment: string | null;
}

export function InlineCalculator() {
  const { tools } = useBuilderCatalog();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [budget, setBudget] = useState(25);

  useEffect(() => {
    supabase
      .from("builder_pricing_plans")
      .select("*")
      .then(({ data }) => { if (data) setPlans(data as PricingPlan[]); });
  }, []);

  const results = tools.map((tool) => {
    const toolPlans = plans.filter((p) => p.tool_id === tool.id);
    const bestPlan = toolPlans.find((p) => p.plan_name === "pro") || toolPlans[0];
    const price = bestPlan?.monthly_price || 0;
    const withinBudget = price <= budget;

    const pvi = bestPlan
      ? calculatePVI({
          tool_id: tool.id,
          plan_name: bestPlan.plan_name,
          monthly_price: price,
          credits_included: bestPlan.credits_included || 0,
          credit_unit: bestPlan.credit_unit || "messages",
          ai_models: bestPlan.ai_models || [],
          features: Array.isArray(bestPlan.features) ? bestPlan.features.map((f: any) => typeof f === "string" ? f : "") : [],
          dev_environment: bestPlan.dev_environment || "",
        })
      : 0;

    return { tool, pvi, price, withinBudget };
  })
    .filter((r) => r.withinBudget)
    .sort((a, b) => b.pvi - a.pvi)
    .slice(0, 5);

  return (
    <section id="calculator" className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2
          className="font-serif font-bold tracking-[-0.02em] leading-[1.1] text-foreground mb-3 inline-flex items-center gap-3"
          style={{ fontSize: "clamp(3rem, 6vw + 1rem, 7rem)" }}
        >
          <Calculator className="w-8 h-8 md:w-10 md:h-10" />
          Quick Value Check
        </h2>
        <p className="text-base text-muted-foreground font-sans">
          Set your budget to find the best builder for you.
        </p>
      </div>

      <div className="glass-card rounded-xl p-5 mb-4">
        <div className="flex justify-between text-sm font-sans items-center mb-2">
          <span>Monthly budget</span>
          <span className="font-bold text-foreground">${budget}/mo</span>
        </div>
        <Slider
          value={[budget]}
          min={0}
          max={100}
          step={5}
          onValueChange={([v]) => setBudget(v)}
        />
      </div>

      <div className="space-y-2 mb-4">
        {results.map(({ tool, pvi, price }, i) => {
          const { color } = getPVILabel(pvi);
          return (
            <div
              key={tool.id}
              className={`glass-card rounded-xl p-3 flex items-center gap-3 ${i === 0 ? "ring-1 ring-accent" : ""}`}
            >
              <span className="text-sm font-bold text-muted-foreground w-5 text-center font-sans">{i + 1}</span>
              <div className="w-7 h-7 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {tool.logoUrl ? (
                  <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 object-contain" loading="lazy" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">{tool.name[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold font-sans">{tool.name}</span>
                  {i === 0 && <Trophy className="w-3 h-3 text-accent" />}
                </div>
              </div>
              <span className={`text-base font-bold font-sans ${color}`}>{pvi || "—"}</span>
              <span className="text-xs text-muted-foreground font-sans">${price}/mo</span>
            </div>
          );
        })}
        {results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No builders match this budget yet.</p>
        )}
      </div>

      <div className="text-center">
        <Button variant="outline" size="sm" onClick={() => navigate("/calculator")}>
          Full Calculator with custom weights
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </section>
  );
}
