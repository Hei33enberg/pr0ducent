import { copy } from "@/lib/copy";
import { useState, useEffect } from "react";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, Zap, ChevronRight, ExternalLink, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { calculatePVI, getPVILabel, type PVIPlan } from "@/lib/pvi-calculator";
import { useNavigate } from "react-router-dom";

interface BuilderComparisonTableProps {
  onSelectTool: (toolId: string) => void;
}

interface PricingPlan {
  tool_id: string;
  plan_name: string;
  monthly_price: number | null;
  annual_price: number | null;
  credits_included: number | null;
  credit_unit: string | null;
  overage_cost: number | null;
  ai_models: string[] | null;
  dev_environment: string | null;
  features: any;
  promo_active: boolean | null;
  promo_description: string | null;
}

interface BuilderRating {
  tool_id: string;
  avg_rating: number;
  count: number;
}

export function BuilderComparisonTable({ onSelectTool }: BuilderComparisonTableProps) {
  const { tools } = useBuilderCatalog();
  const CATEGORIES = ["All", ...new Set(tools.map((t) => t.category))];
  const navigate = useNavigate();
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [ratings, setRatings] = useState<BuilderRating[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [compareList, setCompareList] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("builder_pricing_plans")
      .select("*")
      .then(({ data }) => { if (data) setPricingPlans(data as PricingPlan[]); });

    supabase
      .from("builder_ratings")
      .select("tool_id, rating")
      .then(({ data }) => {
        if (!data) return;
        const grouped: Record<string, { sum: number; count: number }> = {};
        data.forEach((r: any) => {
          if (!grouped[r.tool_id]) grouped[r.tool_id] = { sum: 0, count: 0 };
          grouped[r.tool_id].sum += r.rating;
          grouped[r.tool_id].count += 1;
        });
        setRatings(
          Object.entries(grouped).map(([tool_id, v]) => ({
            tool_id,
            avg_rating: v.sum / v.count,
            count: v.count,
          }))
        );
      });
  }, []);

  const getPlansForTool = (toolId: string) =>
    pricingPlans.filter((p) => p.tool_id === toolId);

  const getRating = (toolId: string) => ratings.find((r) => r.tool_id === toolId);

  const getPVI = (toolId: string): number => {
    const plans = getPlansForTool(toolId);
    const proPlan = plans.find((p) => p.plan_name === "pro") || plans[0];
    if (!proPlan) return 0;
    const pviPlan: PVIPlan = {
      tool_id: toolId,
      plan_name: proPlan.plan_name,
      monthly_price: proPlan.monthly_price || 0,
      credits_included: proPlan.credits_included || 0,
      credit_unit: proPlan.credit_unit || "messages",
      ai_models: proPlan.ai_models || [],
      features: Array.isArray(proPlan.features) ? proPlan.features.map((f: any) => typeof f === "string" ? f : f.name || "") : [],
      dev_environment: proPlan.dev_environment || "",
    };
    return calculatePVI(pviPlan);
  };

  const filteredTools = tools.filter(
    (t) => activeCategory === "All" || t.category === activeCategory
  ).sort((a, b) => {
    // featured first, then by PVI
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return getPVI(b.id) - getPVI(a.id);
  });

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <section id="comparison" className="max-w-6xl mx-auto px-4 py-12 min-w-0 overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <header className="text-center mb-10 max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
            {copy["builderComparison.eyebrow"]}
          </p>
          <h2
            className="font-serif font-bold tracking-[-0.02em] text-foreground leading-tight"
            style={{ fontSize: "clamp(2.5rem, 4.5vw + 0.5rem, 4.5rem)" }}
          >
            {copy["builderComparison.title"]}
          </h2>
          <p className="text-base text-muted-foreground font-sans mt-4 max-w-lg mx-auto">
            {copy["builderComparison.subtitle"].replace("{count}", String(tools.length))}
          </p>
        </header>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-6">
          <Filter className="w-4 h-4 text-muted-foreground self-center mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all border ${
                activeCategory === cat
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {cat === "All" ? copy["builderComparison.categoryAll"] : cat}
            </button>
          ))}
        </div>

        {/* Compare bar */}
        {compareList.length > 0 && (
          <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-sans">{copy["builderComparison.comparing"]}</span>
            {compareList.map((id) => {
              const tool = tools.find((t) => t.id === id);
              return (
                <Badge key={id} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => toggleCompare(id)}>
                  {tool?.name} ×
                </Badge>
              );
            })}
            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setCompareList([])}>
              {copy["builderComparison.clear"]}
            </Button>
          </div>
        )}

        {/* Builder cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool, i) => {
            const pvi = getPVI(tool.id);
            const { label: pviLabel, color: pviColor } = getPVILabel(pvi);
            const rating = getRating(tool.id);
            const plans = getPlansForTool(tool.id);
            const proPlan = plans.find((p) => p.plan_name === "pro") || plans[0];
            const promo = plans.find((p) => p.promo_active);
            const isComparing = compareList.includes(tool.id);

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    tool.featured
                      ? "border-primary/40 shadow-md ring-1 ring-primary/20"
                      : isComparing
                      ? "border-accent ring-1 ring-accent/30"
                      : "border-border"
                  }`}
                >
                  {tool.featured && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-accent" />
                  )}
                  {promo && (
                    <div className="absolute top-2 right-2">
                      <Badge className="text-[9px] px-1.5 py-0.5 bg-warning text-warning-foreground border-0 animate-pulse">
                        🔥 Promo
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="w-7 h-7 object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-muted-foreground">${tool.name[0]}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{tool.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold font-sans text-foreground">{tool.name}</h3>
                          {tool.featured && (
                            <Badge className="text-[8px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                              ⭐ Partner
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans">{tool.category}</p>
                      </div>
                    </div>

                    {/* PVI Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[10px] text-muted-foreground font-sans">{copy["builderComparison.valueIndex"]}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-lg font-bold font-sans ${pviColor}`}>{pvi || "—"}</span>
                        {pvi > 0 && <span className="text-[9px] text-muted-foreground">{pviLabel}</span>}
                      </div>
                    </div>

                    {/* PVI bar */}
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pvi}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${
                          pvi >= 70 ? "bg-success" : pvi >= 40 ? "bg-primary" : "bg-warning"
                        }`}
                      />
                    </div>

                    {/* Rating + Price row */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {rating ? (
                          <>
                            <Star className="w-3 h-3 text-warning fill-warning" />
                            <span className="font-medium font-sans">{rating.avg_rating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({rating.count})</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">{copy["builderComparison.noRatings"]}</span>
                        )}
                      </div>
                      <span className="font-semibold font-sans text-foreground">
                        {proPlan ? (proPlan.monthly_price === 0 ? copy["builderComparison.free"] : `$${proPlan.monthly_price}/mo`) : tool.pricing}
                      </span>
                    </div>

                    {/* Strengths */}
                    <div className="flex flex-wrap gap-1">
                      {tool.strengths.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[8px] px-1.5 py-0.5 font-sans">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    {/* Stack */}
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{tool.stack}</p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={tool.featured ? "default" : "outline"}
                        className="flex-1 text-xs h-8"
                        onClick={() => onSelectTool(tool.id)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {copy["builderComparison.testIt"]}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 px-2"
                        onClick={() => navigate(`/builders/${tool.id}`)}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant={isComparing ? "secondary" : "ghost"}
                        className="text-xs h-8 px-2"
                        onClick={() => toggleCompare(tool.id)}
                        title={copy["builderComparison.addToCompare"]}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
