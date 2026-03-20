import { useRef, useState, useEffect } from "react";
import { BUILDER_TOOLS } from "@/config/tools";
import { COMPARISON_FEATURES } from "@/config/comparison-features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight, Zap, Star, TrendingUp, Sparkles, BarChart3, DollarSign, Cpu, CheckSquare, Monitor, Clock, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { calculatePVI, getPVILabel, type PVIPlan } from "@/lib/pvi-calculator";

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
  promo_expires_at: string | null;
}

interface BuilderRating {
  tool_id: string;
  avg_rating: number;
  count: number;
}

const PLAN_ORDER = ["free", "pro", "team", "enterprise"];

export function BuilderComparisonTable({ onSelectTool }: BuilderComparisonTableProps) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "pricing" | "models" | "features">("overview");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [ratings, setRatings] = useState<BuilderRating[]>([]);

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
    pricingPlans
      .filter((p) => p.tool_id === toolId)
      .sort((a, b) => PLAN_ORDER.indexOf(a.plan_name) - PLAN_ORDER.indexOf(b.plan_name));

  const getRating = (toolId: string) => ratings.find((r) => r.tool_id === toolId);

  const getPromo = (toolId: string) =>
    pricingPlans.find((p) => p.tool_id === toolId && p.promo_active);

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

  const sections = [
    { key: "overview" as const, label: "Overview", icon: BarChart3 },
    { key: "pricing" as const, label: "Pricing & Credits", icon: DollarSign },
    { key: "models" as const, label: "AI Models & Stack", icon: Cpu },
    { key: "features" as const, label: "Feature Matrix", icon: CheckSquare },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground mb-2 inline-flex items-center gap-2">
            <Swords className="w-6 h-6" />
            All Builders at a Glance
          </h2>
          <p className="text-sm text-muted-foreground font-sans">
            Complete comparison of {BUILDER_TOOLS.length} AI builders — pricing, AI models, features, and our Value Index.
          </p>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all border ${
                  activeSection === s.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none rounded-r-xl" />

          <div
            ref={scrollRef}
            className="overflow-x-auto rounded-xl border border-border bg-card shadow-lg scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          >
            <table className="w-max min-w-full text-sm border-collapse">
              {/* Header */}
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-30 bg-card p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[150px] border-r border-border/50 font-sans">
                    {activeSection === "pricing" ? "Plan / Builder" : "Feature"}
                  </th>
                  {BUILDER_TOOLS.map((tool) => (
                    <th
                      key={tool.id}
                      className={`p-3 text-center min-w-[130px] transition-colors duration-150 ${
                        hoveredCol === tool.id ? "bg-primary/5" : ""
                      }`}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 rounded object-contain" loading="lazy" />
                        ) : (
                          <div className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">{tool.name[0]}</div>
                        )}
                        <span className="font-semibold text-foreground text-xs font-sans">{tool.name}</span>
                        {tool.featured && (
                          <Badge className="text-[7px] px-1 py-0 bg-featured text-featured-foreground border-0">
                            <Star className="w-2 h-2 mr-0.5 inline" /> Partner
                          </Badge>
                        )}
                        {getPromo(tool.id) && (
                          <Badge className="text-[7px] px-1 py-0 bg-warning text-warning-foreground border-0 animate-pulse">
                            <Tag className="w-2 h-2 mr-0.5 inline" /> Promo
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {activeSection === "overview" && (
                  <>
                    {/* PVI Score */}
                    <Row label="Value Index (PVI)" icon={<TrendingUp className="w-3.5 h-3.5 inline mr-1 text-accent" />} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                      {BUILDER_TOOLS.map((tool) => {
                        const pvi = getPVI(tool.id);
                        const { label, color } = getPVILabel(pvi);
                        return (
                          <td key={tool.id} className={cellClass(hoveredCol, tool.id)}>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`text-lg font-bold font-sans ${color}`}>{pvi || "—"}</span>
                              <span className="text-[9px] text-muted-foreground">{pvi ? label : "No data"}</span>
                            </div>
                          </td>
                        );
                      })}
                    </Row>

                    {/* Community Rating */}
                    <Row label="Community Rating" icon={<Star className="w-3.5 h-3.5 inline mr-1 text-warning" />} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                      {BUILDER_TOOLS.map((tool) => {
                        const r = getRating(tool.id);
                        return (
                          <td key={tool.id} className={cellClass(hoveredCol, tool.id, true)}>
                            {r ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-3 h-3 text-warning fill-warning" />
                                <span className="text-xs font-medium font-sans">{r.avg_rating.toFixed(1)}</span>
                                <span className="text-[9px] text-muted-foreground">({r.count})</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </Row>

                    {/* Pricing summary */}
                    <Row label="Starting Price" icon={<DollarSign className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                      {BUILDER_TOOLS.map((tool) => (
                        <td key={tool.id} className={cellClass(hoveredCol, tool.id)}>
                          <span className="text-xs font-medium text-foreground font-sans">{tool.pricing}</span>
                        </td>
                      ))}
                    </Row>

                    <Row label="Tech Stack" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                      {BUILDER_TOOLS.map((tool) => (
                        <td key={tool.id} className={cellClass(hoveredCol, tool.id, true)}>
                          <span className="text-[10px] font-mono text-foreground">{tool.stack}</span>
                        </td>
                      ))}
                    </Row>

                    <Row label="Category" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                      {BUILDER_TOOLS.map((tool) => (
                        <td key={tool.id} className={cellClass(hoveredCol, tool.id)}>
                          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{tool.category}</Badge>
                        </td>
                      ))}
                    </Row>

                    <Row label="Key Strengths" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                      {BUILDER_TOOLS.map((tool) => (
                        <td key={tool.id} className={cellClass(hoveredCol, tool.id, true)}>
                          <div className="flex flex-wrap justify-center gap-0.5">
                            {tool.strengths.slice(0, 3).map((s) => (
                              <Badge key={s} variant="secondary" className="text-[8px] px-1 py-0">{s}</Badge>
                            ))}
                          </div>
                        </td>
                      ))}
                    </Row>
                  </>
                )}

                {activeSection === "pricing" && (
                  <>
                    {PLAN_ORDER.map((planName, idx) => (
                      <Row key={planName} label={`${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan`} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt={idx % 2 === 1}>
                        {BUILDER_TOOLS.map((tool) => {
                          const plan = getPlansForTool(tool.id).find((p) => p.plan_name === planName);
                          return (
                            <td key={tool.id} className={cellClass(hoveredCol, tool.id, idx % 2 === 1)}>
                              {plan ? (
                                <div className="text-center space-y-0.5">
                                  <div className="text-xs font-bold font-sans">
                                    {plan.monthly_price === 0 ? "Free" : `$${plan.monthly_price}/mo`}
                                  </div>
                                  {plan.annual_price != null && plan.annual_price > 0 && (
                                    <div className="text-[9px] text-muted-foreground">
                                      ${plan.annual_price}/yr
                                    </div>
                                  )}
                                  {plan.credits_included != null && (
                                    <div className="text-[9px] text-muted-foreground">
                                      {plan.credits_included} {plan.credit_unit || "credits"}
                                    </div>
                                  )}
                                  {plan.promo_active && (
                                    <Badge className="text-[7px] px-1 py-0 bg-warning text-warning-foreground border-0">
                                      {plan.promo_description || "Promo!"}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">—</span>
                              )}
                            </td>
                          );
                        })}
                      </Row>
                    ))}

                    <Row label="Overage Cost" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                      {BUILDER_TOOLS.map((tool) => {
                        const plan = getPlansForTool(tool.id).find((p) => p.plan_name === "pro");
                        return (
                          <td key={tool.id} className={cellClass(hoveredCol, tool.id)}>
                            <span className="text-[10px] text-foreground font-sans">
                              {plan?.overage_cost ? `$${plan.overage_cost}/msg` : "—"}
                            </span>
                          </td>
                        );
                      })}
                    </Row>
                  </>
                )}

                {activeSection === "models" && (
                  <>
                    <Row label="AI Models" icon={<Cpu className="w-3.5 h-3.5 inline mr-1 text-accent" />} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                      {BUILDER_TOOLS.map((tool) => {
                        const plans = getPlansForTool(tool.id);
                        const models = [...new Set(plans.flatMap((p) => p.ai_models || []))];
                        return (
                          <td key={tool.id} className={cellClass(hoveredCol, tool.id)}>
                            {models.length > 0 ? (
                              <div className="flex flex-wrap justify-center gap-0.5">
                                {models.map((m) => (
                                  <Badge key={m} variant="secondary" className="text-[8px] px-1 py-0">{m}</Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </Row>

                    <Row label="Dev Environment" icon={<Monitor className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                      {BUILDER_TOOLS.map((tool) => {
                        const plans = getPlansForTool(tool.id);
                        const env = plans[0]?.dev_environment;
                        return (
                          <td key={tool.id} className={cellClass(hoveredCol, tool.id, true)}>
                            <span className="text-[10px] text-foreground font-sans">{env || tool.stack}</span>
                          </td>
                        );
                      })}
                    </Row>

                    <Row label="Hosting" hoveredCol={hoveredCol} setHoveredCol={setHoveredCol}>
                      {BUILDER_TOOLS.map((tool) => (
                        <td key={tool.id} className={cellClass(hoveredCol, tool.id)}>
                          <span className="text-[10px] text-foreground font-sans">{tool.hosting}</span>
                        </td>
                      ))}
                    </Row>

                    <Row label="Avg Build Time" icon={<Clock className="w-3.5 h-3.5 inline mr-1 text-muted-foreground" />} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt>
                      {BUILDER_TOOLS.map((tool) => (
                        <td key={tool.id} className={cellClass(hoveredCol, tool.id, true)}>
                          <span className="text-xs text-foreground font-medium font-sans">
                            {tool.mockDelayRange[0]}–{tool.mockDelayRange[1]}s
                          </span>
                        </td>
                      ))}
                    </Row>
                  </>
                )}

                {activeSection === "features" && (
                  <>
                    {COMPARISON_FEATURES.map((feature, idx) => (
                      <Row key={feature.id} label={feature.label} hoveredCol={hoveredCol} setHoveredCol={setHoveredCol} alt={idx % 2 === 0}>
                        {BUILDER_TOOLS.map((tool) => (
                          <td key={tool.id} className={cellClass(hoveredCol, tool.id, idx % 2 === 0)}>
                            {feature.tools.includes(tool.id) ? (
                              <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground/20 mx-auto" />
                            )}
                          </td>
                        ))}
                      </Row>
                    ))}
                  </>
                )}

                {/* CTA row */}
                <tr className="border-t border-border">
                  <td className="sticky left-0 z-10 bg-card p-3 border-r border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Action</span>
                  </td>
                  {BUILDER_TOOLS.map((tool) => (
                    <td
                      key={tool.id}
                      className={`p-2 text-center transition-colors duration-150 ${hoveredCol === tool.id ? "bg-primary/5" : ""}`}
                      onMouseEnter={() => setHoveredCol(tool.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                    >
                      <Button
                        size="sm"
                        variant={tool.featured ? "default" : "outline"}
                        className="text-[10px] h-7 px-2.5 rounded-lg font-sans"
                        onClick={() => onSelectTool(tool.id)}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Test
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function cellClass(hoveredCol: string | null, toolId: string, alt = false) {
  return `p-2 text-center transition-colors duration-150 ${
    hoveredCol === toolId ? "bg-primary/5" : alt ? "bg-muted/20" : ""
  }`;
}

function Row({
  label,
  icon,
  children,
  hoveredCol,
  setHoveredCol,
  alt = false,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  hoveredCol: string | null;
  setHoveredCol: (id: string | null) => void;
  alt?: boolean;
}) {
  return (
    <tr className="border-b border-border/50">
      <td
        className={`sticky left-0 z-10 p-2 text-xs font-medium text-foreground border-r border-border/50 font-sans ${
          alt ? "bg-muted/20" : "bg-card"
        }`}
      >
        {icon}{label}
      </td>
      {children}
    </tr>
  );
}
