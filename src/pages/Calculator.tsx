import { useState, useEffect } from "react";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import AmbientBackground from "@/components/AmbientBackground";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { supabase } from "@/integrations/supabase/client";
import { calculatePVI, getPVILabel, type PVIPlan, type PVIWeights } from "@/lib/pvi-calculator";
import { useNavigate } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calculator, DollarSign, CheckSquare, Cpu, Wrench, BarChart3, Trophy } from "lucide-react";

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

export default function CalculatorPage() {
  const { tools } = useBuilderCatalog();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [promptsPerMonth, setPromptsPerMonth] = useState(30);
  const [weights, setWeights] = useState<PVIWeights>({
    costEfficiency: 35,
    features: 25,
    modelQuality: 25,
    ecosystem: 15,
  });

  useEffect(() => {
    supabase
      .from("builder_pricing_plans")
      .select("*")
      .then(({ data }) => { if (data) setPlans(data as PricingPlan[]); });
  }, []);

  const normalizedWeights: PVIWeights = {
    costEfficiency: weights.costEfficiency / 100,
    features: weights.features / 100,
    modelQuality: weights.modelQuality / 100,
    ecosystem: weights.ecosystem / 100,
  };

  const results = tools.map((tool) => {
    const toolPlans = plans.filter((p) => p.tool_id === tool.id);
    const bestPlan = toolPlans.find((p) => p.plan_name === "pro") || toolPlans[0];

    const pvi = bestPlan
      ? calculatePVI(
          {
            tool_id: tool.id,
            plan_name: bestPlan.plan_name,
            monthly_price: bestPlan.monthly_price || 0,
            credits_included: bestPlan.credits_included || 0,
            credit_unit: bestPlan.credit_unit || "messages",
            ai_models: bestPlan.ai_models || [],
            features: Array.isArray(bestPlan.features) ? bestPlan.features.map((f: any) => typeof f === "string" ? f : "") : [],
            dev_environment: bestPlan.dev_environment || "",
          },
          normalizedWeights
        )
      : 0;

    const monthlyCost = bestPlan?.monthly_price || 0;

    return { tool, pvi, monthlyCost, plan: bestPlan };
  }).sort((a, b) => b.pvi - a.pvi);

  const sliders = [
    { key: "costEfficiency" as const, label: "Cost Efficiency", icon: DollarSign, value: weights.costEfficiency },
    { key: "features" as const, label: "Features", icon: CheckSquare, value: weights.features },
    { key: "modelQuality" as const, label: "AI Model Quality", icon: Cpu, value: weights.modelQuality },
    { key: "ecosystem" as const, label: "Ecosystem", icon: Wrench, value: weights.ecosystem },
  ];

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner-narrow">
          <PageBreadcrumb crumbs={[{ label: "Calculator" }]} />
          <div className="section-wash-blush rounded-xl p-6 mb-6">
          <div className="text-center mb-8">
            <h1
              className="font-serif font-bold tracking-[-0.02em] mb-2 inline-flex items-center gap-2"
              style={{ fontSize: "clamp(2.2rem, 4vw + 0.8rem, 4.5rem)" }}
            >
              <Calculator className="w-8 h-8" />
              Value Calculator
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Find the best AI builder for YOUR needs with our pr0ducent Value Index (PVI).
            </p>
          </div>

          {/* Weight sliders */}
          <div className="bg-card border border-border/50 rounded-xl p-5 mb-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-semibold font-sans text-foreground">Adjust Your Priorities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sliders.map(({ key, label, icon: Icon, value }) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-sans items-center">
                    <span className="inline-flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {label}
                    </span>
                    <span className="text-muted-foreground">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={([v]) => setWeights((w) => ({ ...w, [key]: v }))}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans items-center">
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                  Expected Prompts/Month
                </span>
                <span className="text-muted-foreground">{promptsPerMonth}</span>
              </div>
              <Slider
                value={[promptsPerMonth]}
                min={1}
                max={500}
                step={5}
                onValueChange={([v]) => setPromptsPerMonth(v)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-2">
            {results.map(({ tool, pvi, monthlyCost }, i) => {
              const { label, color } = getPVILabel(pvi);
              return (
                <div
                  key={tool.id}
                  className={`bg-card border border-border/50 rounded-xl p-4 flex items-center gap-4 shadow-sm ${i === 0 ? "ring-2 ring-accent" : ""}`}
                >
                  <div className="text-lg font-bold text-muted-foreground font-sans w-6 text-center">
                    {i + 1}
                  </div>
                  {tool.logoUrl ? (
                    <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 rounded object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm font-bold">{tool.name[0]}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm font-sans">{tool.name}</span>
                      {tool.featured && <Badge className="text-[7px] px-1 py-0 bg-featured text-featured-foreground border-0">Partner</Badge>}
                      {i === 0 && (
                        <Badge className="text-[7px] px-1 py-0 bg-accent text-accent-foreground border-0 inline-flex items-center gap-0.5">
                          <Trophy className="w-2 h-2" /> Best Match
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-sans">{tool.category}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold font-sans ${color}`}>{pvi || "—"}</div>
                    <div className="text-[9px] text-muted-foreground">{pvi ? label : "No data"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium font-sans">${monthlyCost}/mo</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
