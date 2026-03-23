import { copy } from "@/lib/copy";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { supabase } from "@/integrations/supabase/client";
import { calculatePVI, getPVILabel, type PVIPlan } from "@/lib/pvi-calculator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="calculator" className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
      <header className="text-center mb-10 max-w-3xl mx-auto">
        <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
          {copy["inlineCalc.eyebrow"]}
        </p>
        <h2
          className="font-serif font-bold tracking-[-0.02em] leading-[1.05] text-foreground"
          style={{ fontSize: "clamp(2.75rem, 5vw + 0.75rem, 5rem)" }}
        >
          {copy["inlineCalc.title"]}
        </h2>
        <p className="text-base text-muted-foreground font-sans mt-4">
          {copy["inlineCalc.subtitle"]}
        </p>
      </header>

      <div className="bg-card border border-border/50 rounded-xl p-5 mb-4 shadow-sm">
        <div className="flex justify-between text-sm font-sans items-center mb-2">
          <span>{copy["inlineCalc.monthlyBudget"]}</span>
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
              className={`bg-card border border-border/50 rounded-xl p-3 flex items-center gap-3 shadow-sm ${i === 0 ? "ring-1 ring-accent" : ""}`}
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
          <p className="text-center text-sm text-muted-foreground py-4">{copy["inlineCalc.noMatch"]}</p>
        )}
      </div>

      <div className="text-center">
        <Button variant="outline" size="sm" onClick={() => navigate("/calculator")}>
          {copy["inlineCalc.fullCalculatorCta"]}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
      </motion.div>
    </section>
  );
}
