import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import AmbientBackground from "@/components/AmbientBackground";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Zap, ExternalLink, Star, BarChart3, CreditCard, ClipboardList, CheckCircle2, Loader2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FF } from "@/lib/featureFlags";
import { useTranslation } from "@/lib/i18n";
import type { Tables } from "@/integrations/supabase/types";
import { throwIfByoaRpcFailed } from "@/lib/byoa-rpc";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type ByoaCredentialRow = Pick<
  Tables<"user_builder_credentials">,
  "id" | "tool_id" | "credential_type" | "created_at"
>;

/** Optional analytics hook — detail contains only action + toolId (no secrets). */
function emitByoaUiTelemetry(
  action: "connect_ok" | "rotate_ok" | "disconnect_ok",
  toolId: string,
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pr0ducent:byoa", { detail: { action, toolId } }));
}

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tools } = useBuilderCatalog();
  const { t } = useTranslation();
  const [experiments, setExperiments] = useState<UserExperiment[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [activeTab, setActiveTab] = useState<"history" | "ratings" | "subscription" | "builders">("history");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [byoaCredentials, setByoaCredentials] = useState<ByoaCredentialRow[]>([]);
  const [keyDialog, setKeyDialog] = useState<{ toolId: string; mode: "connect" | "rotate" } | null>(null);
  const [disconnectToolId, setDisconnectToolId] = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const PRICE_IDS: Record<string, string> = {
    Pro: "price_1TCy4hKTwW79ip00MhitTcY8",
    Business: "price_1TCy4iKTwW79ip00yNVhNgly",
  };

  const handleUpgrade = async (planName: string) => {
    const priceId = PRICE_IDS[planName];
    if (!priceId) return;
    setLoadingPlan(planName);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const loadByoaCredentials = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_builder_credentials")
      .select("id, tool_id, credential_type, created_at")
      .eq("user_id", user.id);
    if (!error && data) setByoaCredentials(data);
  }, [user]);

  const handleSaveApiKey = async () => {
    if (!keyDialog || !apiKeyInput.trim()) return;
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.rpc("save_user_builder_api_key", {
        p_tool_id: keyDialog.toolId,
        p_credential_type: "api_key",
        p_plaintext_secret: apiKeyInput.trim(),
      });
      if (error) throw error;
      throwIfByoaRpcFailed(data);

      toast.success(t("byoa.connected"));
      emitByoaUiTelemetry(keyDialog.mode === "rotate" ? "rotate_ok" : "connect_ok", keyDialog.toolId);
      await loadByoaCredentials();
      setKeyDialog(null);
      setApiKeyInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || t("byoa.errorSave"));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectToolId) return;
    setDisconnectLoading(true);
    try {
      const { data, error } = await supabase.rpc("disconnect_user_builder_api_key", {
        p_tool_id: disconnectToolId,
        p_credential_type: "api_key",
      });
      if (error) throw error;
      throwIfByoaRpcFailed(data);
      toast.success(t("byoa.disconnected"));
      emitByoaUiTelemetry("disconnect_ok", disconnectToolId);
      await loadByoaCredentials();
      setDisconnectToolId(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || t("byoa.errorDisconnect"));
    } finally {
      setDisconnectLoading(false);
    }
  };

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
      
    void loadByoaCredentials();
  }, [user, loadByoaCredentials]);

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
        <Footer />
      </div>
    );
  }

  const getToolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;
  const getTool = (id: string) => tools.find((t) => t.id === id);

  const tabs = [
    { key: "history" as const, label: "Build History", icon: ClipboardList, count: experiments.length },
    { key: "ratings" as const, label: "My Ratings", icon: Star, count: ratings.length },
    { key: "subscription" as const, label: "Subscription", icon: CreditCard },
    { key: "builders" as const, label: "My Builders", icon: Key },
  ];

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner-narrow">
          <PageBreadcrumb crumbs={[{ label: "Dashboard" }]} />
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
                  className="bg-card border border-border/50 shadow-sm rounded-xl p-4 w-full text-left hover:scale-[1.005] transition-all flex items-start gap-3"
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
                  <div key={r.id} className="bg-card border border-border/50 shadow-sm rounded-xl p-4 flex items-center gap-3">
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
              <div className="bg-card border border-border/50 shadow-sm rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-serif font-bold">
                    {subscription ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : "Free"} Plan
                  </h3>
                </div>

                {subscription && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-sans mb-1 items-end">
                        <span className="text-muted-foreground font-medium">Credits (Prompts)</span>
                        <span className="font-bold text-lg leading-none">{subscription.prompts_used} <span className="text-muted-foreground font-normal text-sm">/ {subscription.prompts_limit}</span></span>
                      </div>
                      <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden shadow-inner border border-border/40">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            (subscription.prompts_used / subscription.prompts_limit) > 0.9 ? "bg-destructive" :
                            (subscription.prompts_used / subscription.prompts_limit) > 0.75 ? "bg-warning" : "bg-primary"
                          )}
                          style={{ width: `${Math.min((subscription.prompts_used / subscription.prompts_limit) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-sans flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Resets on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}

                {/* Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {[
                    { name: "Free", price: "$0", prompts: "3/mo", features: ["1 builder per run", "Delayed results", "Community support"] },
                    { name: "Starter", price: "$19/mo", prompts: "100/mo", features: ["Up to 3 builders per run", "Standard queue", "Email support"] },
                    { name: "Pro", price: "$49/mo", prompts: "300/mo", features: ["All available builders", "Priority compute", "VBP API access"] },
                    { name: "Enterprise", price: "Custom", prompts: "Unlimited", features: ["Dedicated instances", "SLA guarantees", "Custom integrations"] },
                  ].map((plan) => (
                    <div
                      key={plan.name}
                      className={`bg-card border border-border/50 shadow-sm rounded-xl p-4 text-center space-y-2 ${
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-6 w-full mt-1"
                          disabled={loadingPlan === plan.name}
                          onClick={() => handleUpgrade(plan.name)}
                        >
                          {loadingPlan === plan.name ? <Loader2 className="w-3 h-3 animate-spin" /> : "Upgrade"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BYOA Builders — catalog-driven rows */}
          {activeTab === "builders" && (
            <div className="bg-card border border-border/50 shadow-sm rounded-2xl p-8 space-y-6 border border-border/50">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <Key className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-serif font-bold">{t("byoa.title")}</h3>
                <p className="text-muted-foreground font-sans max-w-md mx-auto text-base leading-relaxed">
                  {t("byoa.subtitle")}
                </p>
              </div>
              {!FF.BYOA_TAB ? (
                <p className="text-center text-sm text-muted-foreground font-sans">{t("byoa.disabledFlag")}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {tools.map((tool) => {
                    const isConnected = byoaCredentials.some((c) => c.tool_id === tool.id);
                    return (
                      <div key={tool.id} className="bg-card border border-border/50 shadow-sm rounded-xl p-4 flex items-center justify-between border border-border/50">
                        <div className="flex items-center gap-3">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 rounded object-contain" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center font-bold">
                              {tool.name[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold font-sans flex items-center gap-2">
                              {tool.name}
                              {tool.featured && (
                                <Badge className="text-[9px] bg-featured text-featured-foreground border-0 h-4 px-1.5">{t("compare.partner")}</Badge>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{tool.stack}</div>
                          </div>
                        </div>
                        
                        <div>
                          {isConnected ? (
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              <Badge variant="outline" className="border-success/50 text-success shrink-0">
                                {t("byoa.connected")}
                              </Badge>
                              {tool.integrationEnabled && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs rounded-full"
                                    onClick={() => setKeyDialog({ toolId: tool.id, mode: "rotate" })}
                                  >
                                    {t("byoa.rotateKey")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs text-destructive hover:text-destructive"
                                    disabled={disconnectToolId === tool.id}
                                    onClick={() => setDisconnectToolId(tool.id)}
                                  >
                                    {t("byoa.disconnectKey")}
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : tool.integrationEnabled ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs rounded-full"
                              onClick={() => setKeyDialog({ toolId: tool.id, mode: "connect" })}
                            >
                              {t("byoa.connectKey")}
                            </Button>
                          ) : (
                            <Badge variant="secondary" className="opacity-60">
                              {t("byoa.comingSoon")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </PageFrame>

      <Footer />

      <Dialog
        open={!!keyDialog}
        onOpenChange={(open) => {
          if (!open) {
            setKeyDialog(null);
            setApiKeyInput("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {keyDialog?.mode === "rotate"
                ? t("byoa.rotateTitle").replace("{name}", getToolName(keyDialog.toolId))
                : t("byoa.connectTitle").replace("{name}", getToolName(keyDialog?.toolId ?? ""))}
            </DialogTitle>
            <DialogDescription>{t("byoa.vaultNotice")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setKeyDialog(null);
                setApiKeyInput("");
              }}
            >
              {t("byoa.cancel")}
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKeyInput.trim() || isConnecting}>
              {isConnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {keyDialog?.mode === "rotate" ? t("byoa.saveRotatedKey") : t("byoa.saveKey")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!disconnectToolId} onOpenChange={(open) => !open && setDisconnectToolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("byoa.disconnectConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("byoa.disconnectConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectLoading}>{t("byoa.cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={disconnectLoading}
              onClick={() => void handleConfirmDisconnect()}
            >
              {disconnectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("byoa.disconnectConfirm")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}