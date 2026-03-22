import { useState, useEffect } from "react";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, Cpu, Layers } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface PricingPlan {
  tool_id: string;
  plan_name: string;
  monthly_price: number | null;
  annual_price: number | null;
  credits_included: number | null;
  credit_unit: string | null;
  ai_models: string[] | null;
  dev_environment: string | null;
  features: any;
  promo_active: boolean | null;
  promo_description: string | null;
}

const PLAN_TIERS = ["free", "pro", "team", "enterprise"];

export function PlanComparisonTable() {
  const { t } = useTranslation();
  const { tools } = useBuilderCatalog();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [activeTier, setActiveTier] = useState("pro");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("builder_pricing_plans")
      .select("*")
      .then(({ data }) => {
        if (data) setPlans(data as PricingPlan[]);
        setLoading(false);
      });
  }, []);

  const availableTiers = [...new Set(plans.map((p) => p.plan_name))].sort(
    (a, b) => PLAN_TIERS.indexOf(a) - PLAN_TIERS.indexOf(b)
  );

  const toolsWithPlans = tools.filter((t) =>
    plans.some((p) => p.tool_id === t.id && p.plan_name === activeTier)
  );

  const getToolPlan = (toolId: string) =>
    plans.find((p) => p.tool_id === toolId && p.plan_name === activeTier);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  if (plans.length === 0) return null;

  return (
    <section id="plans" className="max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center mb-10 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
            {t("planComparison.eyebrow")}
          </p>
          <h2 className="font-serif font-bold tracking-[-0.02em] text-foreground text-3xl sm:text-4xl md:text-5xl leading-tight">
            {t("planComparison.title")}
          </h2>
          <p className="text-base text-muted-foreground font-sans mt-4">
            {t("planComparison.subtitle")}
          </p>
        </header>

        {/* Tier selector */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-6 px-2">
          {availableTiers.map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-sans font-medium transition-all border capitalize ${
                activeTier === tier
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {toolsWithPlans.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {t("planComparison.noTierData").replace("{tier}", activeTier)}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-semibold text-foreground sticky left-0 bg-muted/50 min-w-[120px]">
                    {t("planComparison.builderCol")}
                  </th>
                  <th className="p-3 text-center font-semibold text-foreground min-w-[90px]">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" /> {t("planComparison.monthly")}
                    </div>
                  </th>
                  <th className="p-3 text-center font-semibold text-foreground min-w-[90px]">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="w-3 h-3" /> {t("planComparison.annual")}
                    </div>
                  </th>
                  <th className="p-3 text-center font-semibold text-foreground min-w-[100px]">
                    <div className="flex items-center justify-center gap-1">
                      <CreditCard className="w-3 h-3" /> {t("planComparison.credits")}
                    </div>
                  </th>
                  <th className="p-3 text-center font-semibold text-foreground min-w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      <Cpu className="w-3 h-3" /> {t("planComparison.aiModels")}
                    </div>
                  </th>
                  <th className="p-3 text-center font-semibold text-foreground min-w-[100px]">
                    <div className="flex items-center justify-center gap-1">
                      <Layers className="w-3 h-3" /> {t("planComparison.environment")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {toolsWithPlans.map((tool, i) => {
                  const plan = getToolPlan(tool.id);
                  if (!plan) return null;
                  return (
                    <tr
                      key={tool.id}
                      className={`${i % 2 === 0 ? "bg-background" : "bg-muted/20"} ${
                        tool.featured ? "ring-1 ring-inset ring-primary/20" : ""
                      }`}
                    >
                      <td className={`p-3 sticky left-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                            {tool.logoUrl ? (
                              <img src={tool.logoUrl} alt={tool.name} className="w-4 h-4 object-contain" loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[8px] font-bold text-muted-foreground">${tool.name[0]}</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-[8px] font-bold text-muted-foreground">{tool.name[0]}</span>
                            )}
                          </div>
                          <span className="font-semibold text-foreground">{tool.name}</span>
                          {tool.featured && (
                            <Badge className="text-[7px] px-1 py-0 bg-primary/10 text-primary border-primary/20">⭐</Badge>
                          )}
                          {plan.promo_active && (
                            <Badge className="text-[7px] px-1 py-0 bg-warning text-warning-foreground border-0">🔥</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center font-semibold text-foreground">
                        {plan.monthly_price != null
                          ? plan.monthly_price === 0
                            ? t("planComparison.free")
                            : `$${plan.monthly_price}`
                          : "—"}
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {plan.annual_price != null
                          ? plan.annual_price === 0
                            ? t("planComparison.free")
                            : `$${plan.annual_price}/yr`
                          : "—"}
                      </td>
                      <td className="p-3 text-center">
                        {plan.credits_included != null ? (
                          <span className="text-foreground">
                            {plan.credits_included.toLocaleString()}{" "}
                            <span className="text-muted-foreground">{plan.credit_unit || ""}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {plan.ai_models && plan.ai_models.length > 0 ? (
                            plan.ai_models.slice(0, 3).map((m) => (
                              <Badge key={m} variant="secondary" className="text-[7px] px-1 py-0">
                                {m}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                          {plan.ai_models && plan.ai_models.length > 3 && (
                            <Badge variant="secondary" className="text-[7px] px-1 py-0">
                              +{plan.ai_models.length - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {plan.dev_environment || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}
