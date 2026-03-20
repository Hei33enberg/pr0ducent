import { motion } from "framer-motion";
import { getToolById } from "@/config/tools";
import type { ExperimentRun } from "@/types/experiment";
import { Trophy } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { calculatePVI } from "@/lib/pvi-calculator";

interface WinnerBannerProps {
  runs: ExperimentRun[];
}

function getOverallScore(run: ExperimentRun) {
  const tool = getToolById(run.toolId);
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
  const { t } = useTranslation();
  const allCompleted = runs.every((r) => r.status === "completed");
  if (!allCompleted || runs.length < 2) return null;

  const sorted = [...runs].sort((a, b) => getOverallScore(b) - getOverallScore(a));
  const winner = sorted[0];
  const tool = getToolById(winner.toolId);
  if (!tool) return null;

  const avgScore = getOverallScore(winner).toFixed(1);

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
          {t("winner.bestResult")} <span className="text-featured">{tool.name}</span>
        </div>
        <div className="text-xs text-muted-foreground font-sans">
          {t("winner.avgScore")} {avgScore}/100 · {t("winner.time")} {winner.timeToFirstPrototype?.toFixed(1)}s
        </div>
      </div>
    </motion.div>
  );
}
