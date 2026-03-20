import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PageFrame } from "@/components/PageFrame";
import AmbientBackground from "@/components/AmbientBackground";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { BUILDER_TOOLS } from "@/config/tools";
import { Badge } from "@/components/ui/badge";

interface LiveRun {
  id: string;
  prompt: string;
  selected_tools: string[];
  created_at: string;
  is_public: boolean;
}

export default function RunsNow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<LiveRun[]>([]);

  useEffect(() => {
    // Load initial public runs
    supabase
      .from("experiments")
      .select("id, prompt, selected_tools, created_at, is_public")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setRuns(data);
      });

    // Subscribe to realtime
    const channel = supabase
      .channel("runs-now")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "experiments", filter: "is_public=eq.true" },
        (payload) => {
          const newRun = payload.new as LiveRun;
          setRuns((prev) => [newRun, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getToolName = (id: string) => BUILDER_TOOLS.find((t) => t.id === id)?.name ?? id;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
                Runs Now
              </h1>
            </div>
            <p className="text-sm text-muted-foreground font-sans">
              Live stream of experiments running right now. Click to see results.
            </p>
          </div>

          <div className="space-y-2">
            {runs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-sans text-sm">
                No public runs yet. Be the first!
              </div>
            )}
            {runs.map((run) => (
              <button
                key={run.id}
                onClick={() => {
                  if (user) {
                    navigate(`/experiment/${run.id}`);
                  } else {
                    navigate("/auth");
                  }
                }}
                className="glass-card rounded-xl p-4 w-full text-left hover:scale-[1.005] transition-all flex items-start gap-3"
              >
                <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-sans text-foreground line-clamp-2 font-medium">
                    {run.prompt}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {run.selected_tools.slice(0, 4).map((toolId) => (
                      <Badge key={toolId} variant="secondary" className="text-[9px] px-1.5 py-0">
                        {getToolName(toolId)}
                      </Badge>
                    ))}
                    {run.selected_tools.length > 4 && (
                      <span className="text-[10px] text-muted-foreground">+{run.selected_tools.length - 4}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans shrink-0">
                  <Clock className="w-3 h-3" />
                  {timeAgo(run.created_at)}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </PageFrame>
    </div>
  );
}
