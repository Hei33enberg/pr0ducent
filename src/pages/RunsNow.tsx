import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { Zap, Clock, ArrowRight, MessageSquare, Star, Users, TrendingUp } from "lucide-react";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface LiveRun {
  id: string;
  prompt: string;
  selected_tools: string[];
  created_at: string;
  is_public: boolean;
}

interface RunStats {
  commentCount: Record<string, number>;
  avgRatings: Record<string, { avg: number; count: number }>;
}

export default function RunsNow() {
  const { tools } = useBuilderCatalog();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<LiveRun[]>([]);
  const [stats, setStats] = useState<RunStats>({ commentCount: {}, avgRatings: {} });
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    supabase
      .from("experiments")
      .select("id, prompt, selected_tools, created_at, is_public")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setRuns(data); });

    supabase
      .from("run_comments")
      .select("experiment_id")
      .then(({ data }) => {
        if (data) {
          const counts: Record<string, number> = {};
          data.forEach((c) => { counts[c.experiment_id] = (counts[c.experiment_id] || 0) + 1; });
          setStats((prev) => ({ ...prev, commentCount: counts }));
        }
      });

    supabase
      .from("builder_ratings")
      .select("tool_id, rating")
      .then(({ data }) => {
        if (data) {
          const byTool: Record<string, number[]> = {};
          data.forEach((r) => { if (!byTool[r.tool_id]) byTool[r.tool_id] = []; byTool[r.tool_id].push(r.rating); });
          const avgRatings: Record<string, { avg: number; count: number }> = {};
          Object.entries(byTool).forEach(([tool, ratings]) => {
            avgRatings[tool] = { avg: ratings.reduce((a, b) => a + b, 0) / ratings.length, count: ratings.length };
          });
          setStats((prev) => ({ ...prev, avgRatings }));
        }
      });

    const channel = supabase
      .channel("runs-now")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "experiments", filter: "is_public=eq.true" },
        (payload) => { const newRun = payload.new as LiveRun; setRuns((prev) => [newRun, ...prev].slice(0, 100)); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getToolName = (id: string) => tools.find((t) => t.id === id)?.name ?? id;
  const getToolLogo = (id: string) => tools.find((t) => t.id === id)?.logoUrl ?? "";

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const allToolIds = Array.from(new Set(runs.flatMap((r) => r.selected_tools)));
  const filteredRuns = filter === "all" ? runs : runs.filter((r) => r.selected_tools.includes(filter));

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <h1
                className="font-serif font-bold tracking-[-0.02em]"
                style={{ fontSize: "clamp(2.2rem, 4vw + 0.8rem, 4.5rem)" }}
              >
                Runs Now
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              Live stream of experiments. Click to see full comparison results.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono font-semibold text-foreground">{runs.length}</span>
              <span>experiments</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono font-semibold text-foreground">{allToolIds.length}</span>
              <span>builders tested</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono font-semibold text-foreground">
                {Object.values(stats.commentCount).reduce((a, b) => a + b, 0)}
              </span>
              <span>comments</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`text-[11px] px-3 py-1 rounded-full font-sans transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </button>
            {allToolIds.slice(0, 8).map((toolId) => (
              <button
                key={toolId}
                onClick={() => setFilter(toolId)}
                className={`text-[11px] px-3 py-1 rounded-full font-sans transition-colors flex items-center gap-1 ${
                  filter === toolId ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {getToolLogo(toolId) && <img src={getToolLogo(toolId)} alt="" className="w-3 h-3 rounded-sm" loading="lazy" />}
                {getToolName(toolId)}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredRuns.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-sans text-sm">
                No public runs yet. Be the first!
              </div>
            )}
            <AnimatePresence>
              {filteredRuns.map((run, i) => (
                <motion.button
                  key={run.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/experiment/${run.id}`)}
                  className="bg-card border border-border rounded-xl p-4 w-full text-left hover:border-primary/30 hover:shadow-md transition-all flex items-start gap-3 group"
                >
                  <div className="flex -space-x-1.5 shrink-0 mt-0.5">
                    {run.selected_tools.slice(0, 3).map((toolId) => (
                      <div key={toolId} className="w-6 h-6 rounded-md bg-muted border border-background flex items-center justify-center overflow-hidden">
                        {getToolLogo(toolId) ? (
                          <img src={getToolLogo(toolId)} alt={getToolName(toolId)} className="w-4 h-4 object-contain" loading="lazy" />
                        ) : (
                          <span className="text-[8px] font-bold text-muted-foreground">{getToolName(toolId)[0]}</span>
                        )}
                      </div>
                    ))}
                    {run.selected_tools.length > 3 && (
                      <div className="w-6 h-6 rounded-md bg-muted border border-background flex items-center justify-center">
                        <span className="text-[8px] font-bold text-muted-foreground">+{run.selected_tools.length - 3}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-sans text-foreground line-clamp-2 font-medium group-hover:text-primary transition-colors">
                      {run.prompt}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {run.selected_tools.slice(0, 4).map((toolId) => (
                          <Badge key={toolId} variant="secondary" className="text-[9px] px-1.5 py-0 font-sans">
                            {getToolName(toolId)}
                          </Badge>
                        ))}
                        {run.selected_tools.length > 4 && (
                          <span className="text-[10px] text-muted-foreground">+{run.selected_tools.length - 4}</span>
                        )}
                      </div>
                      {stats.commentCount[run.id] > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {stats.commentCount[run.id]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans shrink-0">
                    <Clock className="w-3 h-3" />
                    {timeAgo(run.created_at)}
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {Object.keys(stats.avgRatings).length > 0 && (
            <div className="mt-10 border-t border-border pt-8">
              <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-warning fill-warning" />
                Community Ratings
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {Object.entries(stats.avgRatings)
                  .sort(([, a], [, b]) => b.avg - a.avg)
                  .map(([toolId, { avg, count }]) => {
                    const tool = tools.find((t) => t.id === toolId);
                    if (!tool) return null;
                    return (
                      <div
                        key={toolId}
                        className="bg-card border border-border rounded-lg p-3 text-center hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => navigate(`/builders/${toolId}`)}
                      >
                        <div className="w-8 h-8 mx-auto rounded-lg bg-muted flex items-center justify-center mb-2 overflow-hidden">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground">{tool.name[0]}</span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-foreground">{tool.name}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span className="text-[11px] font-mono font-semibold">{avg.toFixed(1)}</span>
                          <span className="text-[9px] text-muted-foreground">({count})</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
