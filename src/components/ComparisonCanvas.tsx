import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getToolById } from "@/config/tools";
import type { Experiment, ExperimentRun, RunStatus } from "@/types/experiment";
import { saveExperiment } from "@/lib/mock-experiment";
import { updateRunStatusInDb, logReferralClick } from "@/lib/experiment-service";
import { useAuth } from "@/hooks/useAuth";
import type { BuilderResult } from "@/hooks/useBuilderApi";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CanvasFilters, type SortOption } from "@/components/CanvasFilters";
import { WinnerBanner } from "@/components/WinnerBanner";
import { BuilderResultBadge } from "@/components/BuilderResultBadge";
import { cn } from "@/lib/utils";
import { ExternalLink, Clock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ComparisonCanvasProps {
  experiment: Experiment;
  onExperimentUpdate: (exp: Experiment) => void;
  onToolClick: (toolId: string) => void;
  builderResults?: Record<string, BuilderResult>;
}

function StatusBadge({ status }: { status: RunStatus }) {
  const config = {
    queued: { label: "Queued", className: "bg-muted text-muted-foreground", icon: Clock },
    running: { label: "Building…", className: "bg-warning/15 text-warning animate-status-pulse", icon: Loader2 },
    completed: { label: "Ready", className: "bg-success/15 text-success", icon: CheckCircle2 },
    error: { label: "Error", className: "bg-destructive/15 text-destructive", icon: AlertCircle },
  }[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px] font-medium border-0", config.className)}>
      <Icon className={cn("w-3 h-3", status === "running" && "animate-spin")} />
      {config.label}
    </Badge>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={cn(
            "h-full rounded-full",
            value >= 80 ? "bg-success" : value >= 60 ? "bg-primary" : "bg-warning"
          )}
        />
      </div>
    </div>
  );
}

function ToolTile({
  run,
  elapsed,
  onClick,
  onReferralClick,
  builderResult,
}: {
  run: ExperimentRun;
  elapsed: number;
  onClick: () => void;
  onReferralClick: (toolId: string) => void;
  builderResult?: BuilderResult;
}) {
  const tool = getToolById(run.toolId);
  if (!tool) return null;

  const isFeatured = tool.featured;
  const displayTime =
    run.status === "completed" && run.timeToFirstPrototype
      ? run.timeToFirstPrototype
      : elapsed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden",
        isFeatured
          ? "col-span-1 md:col-span-2 border-featured/30 animate-pulse-glow"
          : "border-border"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-foreground">
              {tool.name[0]}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{tool.name}</div>
              {isFeatured && (
                <span className="text-[10px] font-medium text-featured">Recommended Partner</span>
              )}
            </div>
          </div>
          <StatusBadge status={run.status} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono tabular-nums">{displayTime.toFixed(1)}s</span>
        </div>

        <div
          className={cn(
            "rounded-lg overflow-hidden",
            isFeatured ? "h-32" : "h-24",
            "bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
          )}
        >
          {run.status === "completed" ? (
            <div className="text-xs text-muted-foreground text-center px-4">{run.description.slice(0, 80)}…</div>
          ) : run.status === "running" ? (
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          ) : (
            <div className="text-xs text-muted-foreground">Waiting…</div>
          )}
        </div>

        {run.status === "completed" && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <ScoreBar label="UI Quality" value={run.scores.uiQuality} />
              <ScoreBar label="Backend" value={run.scores.backendLogic} />
              <ScoreBar label="Speed" value={run.scores.speed} />
              <ScoreBar label="Editing" value={run.scores.easeOfEditing} />
            </div>
            {builderResult && <BuilderResultBadge result={builderResult} />}
          </div>
        )}

        {run.status === "completed" && (
          <Button
            size="sm"
            variant={isFeatured ? "default" : "outline"}
            className={cn("w-full text-xs", isFeatured && "bg-featured hover:bg-featured/90 text-featured-foreground")}
            onClick={(e) => {
              e.stopPropagation();
              onReferralClick(run.toolId);
              if (tool.referralUrl) {
                window.open(tool.referralUrl, "_blank");
              }
            }}
          >
            Continue in {tool.name}
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function getOverallScore(run: ExperimentRun) {
  const s = run.scores;
  return (s.uiQuality + s.backendLogic + s.speed + s.easeOfEditing) / 4;
}

export function ComparisonCanvas({ experiment, onExperimentUpdate, onToolClick, builderResults = {} }: ComparisonCanvasProps) {
  const { user } = useAuth();
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const [hiddenTools, setHiddenTools] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const completedCount = experiment.runs.filter((r) => r.status === "completed").length;
  const totalCount = experiment.runs.length;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let updated = false;
      const newRuns = experiment.runs.map((run) => {
        const elapsedSec = (now - run.startedAt) / 1000;

        if (run.status === "queued" && elapsedSec > 1) {
          updated = true;
          return { ...run, status: "running" as RunStatus };
        }
        if (run.status === "running" && run.timeToFirstPrototype && elapsedSec > run.timeToFirstPrototype) {
          updated = true;
          return { ...run, status: "completed" as RunStatus, completedAt: now };
        }
        return run;
      });

      const newElapsed: Record<string, number> = {};
      newRuns.forEach((run) => {
        newElapsed[run.toolId] = (now - run.startedAt) / 1000;
      });
      setElapsed(newElapsed);

      if (updated) {
        const updatedExp = { ...experiment, runs: newRuns };
        onExperimentUpdate(updatedExp);
        saveExperiment(updatedExp);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [experiment, onExperimentUpdate]);

  const toggleTool = (toolId: string) => {
    setHiddenTools((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  };

  const handleReferralClick = (toolId: string) => {
    if (user) {
      logReferralClick(user.id, experiment.id, toolId);
    }
  };

  const sortedRuns = [...experiment.runs]
    .filter((r) => !hiddenTools.has(r.toolId))
    .sort((a, b) => {
      if (sortBy === "score") return getOverallScore(b) - getOverallScore(a);
      if (sortBy === "speed") return (a.timeToFirstPrototype ?? 999) - (b.timeToFirstPrototype ?? 999);
      if (sortBy === "name") {
        const na = getToolById(a.toolId)?.name ?? "";
        const nb = getToolById(b.toolId)?.name ?? "";
        return na.localeCompare(nb);
      }
      // default: featured first, completed first
      const toolA = getToolById(a.toolId);
      const toolB = getToolById(b.toolId);
      if (toolA?.featured && !toolB?.featured) return -1;
      if (!toolA?.featured && toolB?.featured) return 1;
      if (a.status === "completed" && b.status !== "completed") return -1;
      if (a.status !== "completed" && b.status === "completed") return 1;
      return 0;
    });

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Experiment Progress</span>
          <span className="font-mono text-muted-foreground">{completedCount}/{totalCount} completed</span>
        </div>
        <Progress value={(completedCount / totalCount) * 100} className="h-2" />
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-xs text-muted-foreground mb-1">Your prompt</div>
        <div className="text-sm text-foreground font-medium">{experiment.prompt}</div>
      </div>

      <WinnerBanner runs={experiment.runs} />

      <CanvasFilters
        hiddenTools={hiddenTools}
        onToggleTool={toggleTool}
        sortBy={sortBy}
        onSortChange={setSortBy}
        availableToolIds={experiment.selectedTools}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {sortedRuns.map((run) => (
            <ToolTile
              key={run.toolId}
              run={run}
              elapsed={elapsed[run.toolId] || 0}
              onClick={() => onToolClick(run.toolId)}
              onReferralClick={handleReferralClick}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
