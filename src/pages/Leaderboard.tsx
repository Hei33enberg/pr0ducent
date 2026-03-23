import { useState } from "react";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { useLeaderboard, Timeframe, SortDim, LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { TrendingUp, TrendingDown, Minus, Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Leaderboard() {
  const { t } = useTranslation();
  const { getToolById } = useBuilderCatalog();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [sortDim, setSortDim] = useState<SortDim>("pvi_score");
  const { entries, loading } = useLeaderboard(timeframe, sortDim);

  const getTrendIcon = (trend: "up" | "down" | "flat") => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <PageBreadcrumb crumbs={[{ label: "Leaderboard" }]} />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
                {t("leaderboard.eyebrow")}
              </p>
              <h1
                className="font-serif font-bold tracking-[-0.02em] leading-[1.05] mb-3"
                style={{ fontSize: "clamp(2.75rem, 5vw + 0.75rem, 5rem)" }}
              >
                {t("leaderboard.title")}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base font-sans">
                {t("leaderboard.subtitle")}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Select value={sortDim} onValueChange={(v) => setSortDim(v as SortDim)}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pvi_score" className="text-xs">Sort by PVI Score</SelectItem>
                  <SelectItem value="avg_speed" className="text-xs">Sort by Speed</SelectItem>
                  <SelectItem value="avg_ui_quality" className="text-xs">Sort by UI Quality</SelectItem>
                  <SelectItem value="avg_code_quality" className="text-xs">Sort by Code Quality</SelectItem>
                  <SelectItem value="total_runs" className="text-xs">Sort by Popularity</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex bg-muted/30 p-1 rounded-md border border-border/50">
                {(["7d", "30d", "all"] as Timeframe[]).map((tf) => (
                  <Button
                    key={tf}
                    variant="ghost"
                    size="sm"
                    onClick={() => setTimeframe(tf)}
                    className={cn("h-7 px-3 text-xs", tf === "30d" ? "w-14" : "w-12", timeframe === tf && "bg-background shadow-sm")}
                  >
                    {tf === "all" ? "All" : tf}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="section-gradient-lavender rounded-2xl p-1 bg-card border border-border/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground w-12">#</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground">Builder</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground w-32">PVI Score</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground w-28 text-center">Trend</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground w-32 hidden md:table-cell">UI Quality</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground w-32 hidden md:table-cell">Code Quality</th>
                    <th className="py-4 px-6 text-xs font-semibold text-muted-foreground w-28 text-right">Runs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        <div className="flex justify-center mb-2"><Sparkles className="w-6 h-6 animate-pulse opacity-50" /></div>
                        Wait, calculating scores...
                      </td>
                    </tr>
                  ) : entries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        No ranking data available.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry, idx) => {
                      const tool = getToolById(entry.tool_id);
                      if (!tool) return null;
                      return (
                        <tr key={entry.tool_id} className="hover:bg-muted/10 transition-colors group">
                          <td className="py-4 px-6">
                            <span className={cn(
                              "font-bold text-sm",
                              idx === 0 ? "text-[1.1rem] text-primary drop-shadow-sm" :
                              idx === 1 ? "text-[1.05rem] text-muted-foreground" :
                              idx === 2 ? "text-[1.05rem] text-muted-foreground" :
                              "text-muted-foreground"
                            )}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center shrink-0">
                                {tool.logoUrl ? (
                                  <img src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" />
                                ) : (
                                  <span className="font-bold text-muted-foreground">{tool.name[0]}</span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/?tools=${tool.id}`)}>
                                  {tool.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground py-0.5">
                                  {entry.user_rating > 0 ? `Rating ${entry.user_rating}★` : "—"}
                                </span>
                              </div>
                              {tool.featured && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 ml-2 shadow-none">Partner</Badge>}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono font-bold text-base tracking-tight">{entry.pvi_score.toFixed(1)}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-muted/20">
                              {getTrendIcon(entry.trend)}
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-primary/70" />
                              <span className="text-sm tabular-nums">{entry.avg_ui_quality.toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Code2 className="w-3.5 h-3.5 text-success/70" />
                              <span className="text-sm tabular-nums">{entry.avg_code_quality.toFixed(0)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                              {entry.total_runs >= 1000
                                ? `${(entry.total_runs / 1000).toFixed(1)}k`
                                : String(entry.total_runs)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
