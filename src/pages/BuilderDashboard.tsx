import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { PageFrame } from "@/components/PageFrame";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import type { Json } from "@/integrations/supabase/types";

interface BuilderSyncData {
  id: string;
  tool_id: string;
  pricing_tiers: any[];
  features: any[];
  changelog: any[];
  official_url: string | null;
  docs_url: string | null;
  status: string | null;
  last_synced_at: string;
}

export default function BuilderDashboard() {
  const { t } = useTranslation();
  const { getToolById } = useBuilderCatalog();
  const navigate = useNavigate();
  const [builders, setBuilders] = useState<BuilderSyncData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBuilder, setExpandedBuilder] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("builder_sync_data")
        .select("*")
        .order("tool_id");
      setBuilders((data || []) as unknown as BuilderSyncData[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "< 1h ago";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="font-serif font-bold tracking-[-0.02em] text-foreground mb-2"
                style={{ fontSize: "clamp(2.2rem, 4vw + 0.8rem, 4.5rem)" }}
              >
                {t("dashboard.title")}
              </h1>
              <p className="text-muted-foreground font-sans text-lg">
                {t("dashboard.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
              <RefreshCw className="w-3.5 h-3.5" />
              {t("dashboard.autoSync")}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : builders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground font-sans">
              <p className="text-lg mb-2">{t("dashboard.empty")}</p>
              <p className="text-sm">{t("dashboard.emptyHint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {builders.map((builder) => {
                const tool = getToolById(builder.tool_id);
                const isExpanded = expandedBuilder === builder.tool_id;

                return (
                  <div
                    key={builder.id}
                    className="border border-border/50 rounded-xl bg-card p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {tool?.logoUrl && (
                          <img src={tool.logoUrl} alt={tool.name} className="w-8 h-8 rounded-lg" loading="lazy" />
                        )}
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-foreground">
                            {tool?.name || builder.tool_id}
                          </h3>
                          <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(builder.last_synced_at)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={builder.status === "active" ? "default" : "secondary"} className="text-xs">
                        {builder.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(builder.features as string[])?.slice(0, 4).map((feat, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-sans">
                          {feat}
                        </span>
                      ))}
                      {(builder.features as string[])?.length > 4 && (
                        <span className="text-xs text-muted-foreground font-sans">
                          +{(builder.features as string[]).length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      {builder.official_url && (
                        <a href={builder.official_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-sans flex items-center gap-1">
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {builder.docs_url && (
                        <a href={builder.docs_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-sans flex items-center gap-1">
                          Docs <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedBuilder(isExpanded ? null : builder.tool_id)}
                      className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-border/30 font-sans"
                    >
                      {isExpanded ? (
                        <>Less <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Pricing & Changelog <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 space-y-6">
                        {(builder.pricing_tiers as Json[])?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 font-sans">Pricing</h4>
                            <div className="space-y-2">
                              {(builder.pricing_tiers as Json[]).map((tier: any, i: number) => (
                                <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                                  <span className="text-sm font-sans font-medium text-foreground">{tier.name}</span>
                                  <span className="text-sm font-sans text-muted-foreground">{tier.price}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(builder.changelog as Json[])?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3 font-sans">Recent Updates</h4>
                            <div className="space-y-3">
                              {(builder.changelog as Json[]).map((entry: any, i: number) => (
                                <div key={i} className="border-l-2 border-primary/30 pl-3">
                                  <div className="text-xs text-muted-foreground font-sans">{entry.date}</div>
                                  <div className="text-sm font-sans font-medium text-foreground">{entry.title}</div>
                                  <div className="text-xs text-muted-foreground font-sans">{entry.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
