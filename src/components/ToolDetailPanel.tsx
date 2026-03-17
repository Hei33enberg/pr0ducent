import { motion } from "framer-motion";
import { getToolById } from "@/config/tools";
import type { ExperimentRun } from "@/types/experiment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, Check, X as XIcon, Cpu, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolDetailPanelProps {
  run: ExperimentRun | null;
  open: boolean;
  onClose: () => void;
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
