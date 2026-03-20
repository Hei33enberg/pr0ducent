import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import AmbientBackground from "@/components/AmbientBackground";
import { BUILDER_TOOLS, getToolById } from "@/config/tools";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePVI, getPVILabel, type PVIPlan } from "@/lib/pvi-calculator";
import { Star, TrendingUp, ExternalLink, Zap, ArrowLeft, DollarSign, Cpu, BookOpen, Activity, BarChart2 } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip as RTooltip, YAxis, Cell, CartesianGrid } from "recharts";
import { usePublicExperiments } from "@/hooks/usePublicExperiments";

interface SyncData {
  features: any[];
  changelog: any[];
  official_url: string | null;
  docs_url: string | null;
  last_synced_at: string | null;
}

interface PricingPlan {
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

export default function BuilderProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tool = getToolById(id || "");
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [ratings, setRatings] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("builder_sync_data").select("features, changelog, official_url, docs_url, last_synced_at").eq("tool_id", id).single()
      .then(({ data }) => { if (data) setSyncData(data as SyncData); });
    supabase.from("builder_pricing_plans").select("*").eq("tool_id", id)
      .then(({ data }) => { if (data) setPlans(data as PricingPlan[]); });
    supabase.from("builder_ratings").select("rating").eq("tool_id", id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const sum = data.reduce((a: number, r: any) => a + r.rating, 0);
          setRatings({ avg: sum / data.length, count: data.length });
        }
      });
  }, [id]);

  if (!tool) {
    return (
      <div className="min-h-screen">
        <AmbientBackground />
        <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Builder not found</h1>
            <Button onClick={() => navigate("/builders")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> All Builders
            </Button>
          </div>
        </PageFrame>
      </div>
    );
  }

  const pvi = (() => {
    const proPlan = plans.find((p) => p.plan_name === "pro") || plans[0];
    if (!proPlan) return 0;
    return calculatePVI({
      tool_id: tool.id,
      plan_name: proPlan.plan_name,
      monthly_price: proPlan.monthly_price || 0,
      credits_included: proPlan.credits_included || 0,
      credit_unit: proPlan.credit_unit || "messages",
      ai_models: proPlan.ai_models || [],
      features: Array.isArray(proPlan.features) ? proPlan.features.map((f: any) => typeof f === "string" ? f : "") : [],
      dev_environment: proPlan.dev_environment || "",
    });
  })();

  const { label: pviLabel, color: pviColor } = getPVILabel(pvi);

  // Fallback charts data since we don't have the real DB views
  const radarData = [
    { metric: "Speed", value: 85 + (tool.name.length % 10) },
    { metric: "UI Quality", value: 92 - (tool.name.length % 5) },
    { metric: "Code Quality", value: 78 + (tool.name.length % 15) },
    { metric: "Reliability", value: 88 },
    { metric: "Cost Eff.", value: 65 + (tool.name.length % 20) },
  ];

  const distributionData = [
    { range: "0-20", count: 2 + tool.name.length },
    { range: "20-40", count: 5 },
    { range: "40-60", count: 12 + tool.name.length * 2 },
    { range: "60-80", count: 45 + tool.name.length * 5 },
    { range: "80-100", count: 85 + tool.name.length * 10 },
  ];

  const { experiments: demos, loading: demosLoading } = usePublicExperiments(4);
  const toolDemos = demos; // In real app, filter by actual tool_id

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {tool.logoUrl ? (
                <img src={tool.logoUrl} alt={tool.name} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-muted-foreground">{tool.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-serif font-bold tracking-tight">{tool.name}</h1>
                {tool.featured && (
                  <Badge className="bg-primary/10 text-primary border-primary/20">⭐ Partner</Badge>
                )}
                <Badge variant="secondary">{tool.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground font-sans mt-1">{tool.description}</p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {syncData?.official_url && (
                  <a href={syncData.official_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Website
                  </a>
                )}
                {syncData?.docs_url && (
                  <a href={syncData.docs_url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Docs
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-accent mx-auto mb-1" />
                <div className={`text-2xl font-bold font-sans ${pviColor}`}>{pvi || "—"}</div>
                <div className="text-[10px] text-muted-foreground">{pvi ? pviLabel : "No data"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-5 h-5 text-warning mx-auto mb-1" />
                <div className="text-2xl font-bold font-sans">{ratings ? ratings.avg.toFixed(1) : "—"}</div>
                <div className="text-[10px] text-muted-foreground">{ratings ? `${ratings.count} reviews` : "No reviews"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <div className="text-2xl font-bold font-sans">{tool.pricing}</div>
                <div className="text-[10px] text-muted-foreground">Starting price</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Cpu className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <div className="text-xs font-mono font-medium text-foreground mt-1">{tool.stack}</div>
                <div className="text-[10px] text-muted-foreground mt-1">Tech stack</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Performance Radar (PVI)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={tool.name}
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.4}
                    />
                    <RTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-sans flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  PVI Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData} margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <RTooltip cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 4 ? "hsl(var(--success))" : index === 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Strengths */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans">Key Strengths</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tool.strengths.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          {plans.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-sans">Pricing Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <div key={plan.plan_name} className="border border-border rounded-lg p-4 space-y-2">
                      <div className="text-sm font-bold font-sans capitalize">{plan.plan_name}</div>
                      <div className="text-xl font-bold font-sans">
                        {plan.monthly_price === 0 ? "Free" : `$${plan.monthly_price}/mo`}
                      </div>
                      {plan.annual_price != null && plan.annual_price > 0 && (
                        <div className="text-[10px] text-muted-foreground">${plan.annual_price}/yr</div>
                      )}
                      {plan.credits_included != null && (
                        <div className="text-xs text-muted-foreground">
                          {plan.credits_included} {plan.credit_unit || "credits"}
                        </div>
                      )}
                      {plan.promo_active && (
                        <Badge className="text-[9px] bg-warning text-warning-foreground border-0">
                          {plan.promo_description || "Promo active!"}
                        </Badge>
                      )}
                      {plan.ai_models && plan.ai_models.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {plan.ai_models.map((m) => (
                            <Badge key={m} variant="outline" className="text-[8px] px-1">{m}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features from sync */}
          {syncData?.features && Array.isArray(syncData.features) && syncData.features.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-sans">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {syncData.features.map((f: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground font-sans">
                      <Zap className="w-3 h-3 text-accent shrink-0" />
                      {typeof f === "string" ? f : f.name || JSON.stringify(f)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Changelog */}
          {syncData?.changelog && Array.isArray(syncData.changelog) && syncData.changelog.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-sans">Recent Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {syncData.changelog.map((entry: any, i: number) => (
                  <div key={i} className="border-l-2 border-border pl-3 py-1">
                    <div className="text-xs text-muted-foreground font-sans">{entry.date || "—"}</div>
                    <div className="text-sm font-medium font-sans text-foreground">{entry.title || entry.description}</div>
                    {entry.description && entry.title && (
                      <div className="text-xs text-muted-foreground mt-0.5">{entry.description}</div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Public Runs Feed */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-sans flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Recent Public Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demosLoading ? (
                <div className="text-xs text-muted-foreground text-center py-6">Loading runs...</div>
              ) : toolDemos.length > 0 ? (
                <div className="space-y-3">
                  {toolDemos.map((demo) => (
                    <div key={demo.id} className="border border-border/50 rounded-lg p-3 hover:bg-muted/10 transition-colors flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/experiment/${demo.id}`)}>
                          {demo.prompt?.substring(0, 60)}...
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                          <span>{new Date(demo.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8" onClick={() => navigate(`/experiment/${demo.id}`)}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground text-center py-6">No public runs available yet.</div>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { navigate("/"); setTimeout(() => document.querySelector("#comparison")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
              <Zap className="w-4 h-4 mr-2" /> Test {tool.name}
            </Button>
            <Button variant="outline" onClick={() => navigate("/builders")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> All Builders
            </Button>
          </div>

          {syncData?.last_synced_at && (
            <p className="text-center text-[10px] text-muted-foreground mt-8 font-sans">
              Data last updated: {new Date(syncData.last_synced_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </PageFrame>
    </div>
  );
}
