import { motion } from "framer-motion";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import type { ExperimentRun } from "@/types/experiment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Check, X as XIcon, Cpu, Globe, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolDetailPanelProps {
  run: ExperimentRun | null;
  open: boolean;
  onClose: () => void;
}

const BUILD_PHASES = [
  { label: "Prompt analysis", pct: 0 },
  { label: "Scaffolding project", pct: 15 },
  { label: "Generating UI components", pct: 35 },
  { label: "Building backend logic", pct: 60 },
  { label: "Running tests & checks", pct: 80 },
  { label: "Deploying prototype", pct: 95 },
];

function BuildTimeline({ run }: { run: ExperimentRun }) {
  const totalTime = run.timeToFirstPrototype ?? 15;
  const isCompleted = run.status === "completed";
  const elapsed = isCompleted
    ? totalTime
    : run.completedAt
      ? (run.completedAt - run.startedAt) / 1000
      : 0;
  const progress = Math.min(100, (elapsed / totalTime) * 100);

  return (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold text-foreground mb-3">Build Timeline</h4>
      <div className="relative pl-5">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
        <div
          className="absolute left-[7px] top-1 w-px bg-primary transition-all duration-500"
          style={{ height: `${Math.min(progress, 100)}%` }}
        />

        <div className="space-y-3">
          {BUILD_PHASES.map((phase, i) => {
            const done = progress >= phase.pct + 10;
            const active = !done && progress >= phase.pct;
            const timeAtPhase = (phase.pct / 100) * totalTime;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 relative"
              >
                <div className="absolute -left-5">
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : active ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    done ? "text-foreground" : active ? "text-foreground font-medium" : "text-muted-foreground/60"
                  )}
                >
                  {phase.label}
                </span>
                {done && (
                  <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                    {timeAtPhase.toFixed(1)}s
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-28">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          className={cn(
            "h-full rounded-full",
            value >= 80 ? "bg-success" : value >= 60 ? "bg-primary" : "bg-warning"
          )}
        />
      </div>
      <span className="font-mono text-sm font-medium text-foreground w-8 text-right">{value}</span>
    </div>
  );
}

export function ToolDetailPanel({ run, open, onClose }: ToolDetailPanelProps) {
  const { getToolById } = useBuilderCatalog();
  if (!run) return null;
  const tool = getToolById(run.toolId);
  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground">
              {tool.name[0]}
            </div>
            <div>
              <DialogTitle className="text-xl">{tool.name}</DialogTitle>
              {tool.featured && (
                <Badge className="mt-1 bg-featured text-featured-foreground border-0 text-[10px]">
                  Recommended Partner
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview */}
          <div className="rounded-xl bg-gradient-to-br from-muted to-muted/50 h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground text-center px-6">{run.description}</p>
          </div>

          {/* Build Timeline */}
          <BuildTimeline run={run} />

          {/* Time */}
          {run.timeToFirstPrototype && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Time to first prototype:</span>
              <span className="font-mono font-semibold text-foreground">{run.timeToFirstPrototype.toFixed(1)}s</span>
            </div>
          )}

          {/* Scores */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Editorial Scores</h4>
            <ScoreRow label="UI Quality" value={run.scores.uiQuality} />
            <ScoreRow label="Backend Logic" value={run.scores.backendLogic} />
            <ScoreRow label="Speed" value={run.scores.speed} />
            <ScoreRow label="Ease of Editing" value={run.scores.easeOfEditing} />
          </div>

          {run.scoresReasoning &&
            typeof run.scoresReasoning.summary === "string" &&
            run.scoresReasoning.summary.length > 0 && (
              <div className="rounded-lg border border-border p-3 space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Score narrative</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {run.scoresReasoning.summary as string}
                </p>
                {run.scoresReasoning.modelVersion != null && (
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Model: {String(run.scoresReasoning.modelVersion)}
                  </p>
                )}
              </div>
            )}

          {/* Pros / Cons */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-success">Strengths</h4>
              {run.pros.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-destructive">Limitations</h4>
              {run.cons.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <XIcon className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Tech details */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              {tool.stack}
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {tool.hosting}
            </div>
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className={cn(
              "w-full",
              tool.featured
                ? "bg-featured hover:bg-featured/90 text-featured-foreground"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            Continue Building in {tool.name}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
