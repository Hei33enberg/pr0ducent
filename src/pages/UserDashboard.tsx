import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import AmbientBackground from "@/components/AmbientBackground";
import { supabase } from "@/integrations/supabase/client";
import { BUILDER_TOOLS } from "@/config/tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Zap, ExternalLink, Star, BarChart3, CreditCard, ClipboardList, CheckCircle2 } from "lucide-react";

interface UserExperiment {
  id: string;
  prompt: string;
  selected_tools: string[];
  created_at: string;
  account_model: string;
}

interface UserSubscription {
  plan: string;
  prompts_used: number;
  prompts_limit: number;
  current_period_end: string;
}

interface UserRating {
  id: string;
  tool_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [experiments, setExperiments] = useState<UserExperiment[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "ratings" | "subscription">("history");

  useEffect(() => {
    if (!user) return;

    supabase
      .from("experiments")
      .select("id, prompt, selected_tools, created_at, account_model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setExperiments(data); });

    supabase
      .from("subscriptions")
      .select("plan, prompts_used, prompts_limit, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setSubscription(data); });

    supabase
      .from("builder_ratings")
      .select("id, tool_id, rating, review, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setRatings(data); });
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <AmbientBackground />
        <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <h2 className="text-xl font-serif font-bold">Sign in required</h2>
            <p className="text-sm text-muted-foreground font-sans">Sign in to access your dashboard.</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </div>
        </PageFrame>
      </div>
    );
  }

  const getToolName = (id: string) => BUILDER_TOOLS.find((t) => t.id === id)?.name ?? id;
  const getTool = (id: string) => BUILDER_TOOLS.find((t) => t.id === id);

  const tabs = [
    { key: "history" as const, label: "Build History", icon: ClipboardList, count: experiments.length },
    { key: "ratings" as const, label: "My Ratings", icon: Star, count: ratings.length },
    { key: "subscription" as const, label: "Subscription", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">
          <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-sm text-muted-foreground font-sans mb-6">{user.email}</p>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-all border ${
                    activeTab === tab.key
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {"count" in tab && tab.count !== undefined && (
                    <span className="text-[9px] opacity-70">({tab.count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* History */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {experiments.length === 0 && (
                <p className="text-sm text-muted-foreground font-sans py-8 text-center">No experiments yet.</p>
              )}
              {experiments.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => navigate(`/experiment/${exp.id}`)}
                  className="glass-card rounded-xl p-4 w-full text-left hover:scale-[1.005] transition-all flex items-start gap-3"
                >
                  <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-sans text-foreground line-clamp-2 font-medium">{exp.prompt}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {exp.selected_tools.slice(0, 4).map((toolId) => (
                        <Badge key={toolId} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {getToolName(toolId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-sans shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(exp.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Ratings */}
          {activeTab === "ratings" && (
            <div className="space-y-2">
              {ratings.length === 0 && (
                <p className="text-sm text-muted-foreground font-sans py-8 text-center">No ratings yet.</p>
              )}
              {ratings.map((r) => {
                const tool = getTool(r.tool_id);
                return (
                  <div key={r.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                    {tool?.logoUrl ? (
                      <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 rounded object-contain" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold">
                        {getToolName(r.tool_id)[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold font-sans">{getToolName(r.tool_id)}</span>
                      {r.review && <p className="text-xs text-muted-foreground line-clamp-1">{r.review}</p>}
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < r.rating ? "text-warning fill-warning" : "text-muted-foreground/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subscription */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-serif font-bold">
                    {subscription ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Free"} Plan
                  </h3>
                </div>

                {subscription && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-sans">
                        <span className="text-muted-foreground">Prompts used</span>
                        <span className="font-medium">{subscription.prompts_used} / {subscription.prompts_limit}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${Math.min((subscription.prompts_used / subscription.prompts_limit) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground font-sans">
                        Resets on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}

                {/* Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {[
                    { name: "Free", price: "$0", prompts: "3/mo", features: ["1 builder per run", "Delayed results"] },
                    { name: "Pro", price: "$9/mo", prompts: "30/mo", features: ["All builders", "Instant results", "Full history"] },
                    { name: "Business", price: "$29/mo", prompts: "100/mo", features: ["Priority queue", "API access", "Team sharing"] },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={`glass-card rounded-xl p-4 text-center space-y-2 ${
                        subscription?.plan === plan.name.toLowerCase() ? "ring-2 ring-accent" : ""
                      }`}
                    >
                      <h4 className="text-sm font-bold font-sans">{plan.name}</h4>
                      <div className="text-xl font-bold font-serif">{plan.price}</div>
                      <div className="text-[10px] text-muted-foreground font-sans">{plan.prompts} prompts</div>
                      <ul className="text-[10px] text-muted-foreground font-sans space-y-0.5">
                        {plan.features.map((f) => (
                          <li key={f} className="inline-flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-success" /> {f}
                          </li>
                        ))}
                      </ul>
                      {subscription?.plan !== plan.name.toLowerCase() && plan.name !== "Free" && (
                        <Button size="sm" variant="outline" className="text-[10px] h-6 w-full mt-1">
                          Upgrade
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PageFrame>
    </div>
  );
}
