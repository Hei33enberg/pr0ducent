import { copy } from "@/lib/copy";
import { motion } from "framer-motion";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import type { ExperimentRun } from "@/types/experiment";
import { Trophy } from "lucide-react";
import { calculatePVI } from "@/lib/pvi-calculator";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WinnerBannerProps {
  runs: ExperimentRun[];
}

function getOverallScore(run: ExperimentRun, tool: any) {
  if (!tool) return 0;
  
  return calculatePVI({
    tool_id: tool.id,
    plan_name: "pro",
    monthly_price: parseInt(tool.pricing.replace(/\D/g, '')) || 20,
    credits_included: 1000,
    credit_unit: "messages",
    ai_models: [],
    features: tool.strengths,
    dev_environment: tool.stack,
  });
}

export function WinnerBanner({ runs }: WinnerBannerProps) {
  const { getToolById } = useBuilderCatalog();
  const [realScores, setRealScores] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchScores() {
      const tIds = runs.map(r => r.toolId);
      if (tIds.length === 0) return;
      const { data } = await supabase.from("builder_leaderboard").select("tool_id, avg_pvi").in("tool_id", tIds);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach(r => { if (r.tool_id && r.avg_pvi) map[r.tool_id] = Number(r.avg_pvi); });
        setRealScores(map);
      }
    }
    fetchScores();
  }, [runs]);

  const getOverallScoreWithReal = (run: ExperimentRun) => {
    if (realScores[run.toolId]) return realScores[run.toolId];
    return getOverallScore(run, getToolById(run.toolId));
  };

  const allCompleted = runs.every((r) => r.status === "completed");
  if (!allCompleted || runs.length < 2) return null;

  const sorted = [...runs].sort((a, b) => getOverallScoreWithReal(b) - getOverallScoreWithReal(a));
  const winner = sorted[0];
  const tool = getToolById(winner.toolId);
  if (!tool) return null;

  const avgScore = getOverallScoreWithReal(winner).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-featured/30 bg-gradient-to-r from-featured/10 via-featured/5 to-transparent p-4 flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-full bg-featured/20 flex items-center justify-center">
        <Trophy className="w-5 h-5 text-featured" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-foreground font-sans">
          {copy["winner.bestResult"]} <span className="text-featured">{tool.name}</span>
        </div>
        <div className="text-xs text-muted-foreground font-sans">
          {copy["winner.avgScore"]} {avgScore}/100 · {copy["winner.time"]} {winner.timeToFirstPrototype?.toFixed(1)}s
        </div>
      </div>
    </motion.div>
  );
}
