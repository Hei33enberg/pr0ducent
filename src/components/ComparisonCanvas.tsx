import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { getToolById } from "@/config/tools";
import type { Experiment, ExperimentRun, RunStatus } from "@/types/experiment";
import { saveExperiment, MOCK_BUILD_STEPS, MOCK_PREVIEW_GRADIENTS } from "@/lib/mock-experiment";
import { updateRunStatusInDb, logReferralHandoff } from "@/lib/experiment-service";
import { useAuth } from "@/hooks/useAuth";
import type { BuilderResult } from "@/hooks/useBuilderApi";
import { RunCenter } from "@/components/RunCenter";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CanvasFilters, type SortOption } from "@/components/CanvasFilters";
import { WinnerBanner } from "@/components/WinnerBanner";
import { BuilderResultBadge } from "@/components/BuilderResultBadge";
import { cn } from "@/lib/utils";
import { ExternalLink, Clock, CheckCircle2, Loader2, AlertCircle, Code2, BarChart3, MessageSquare, Info } from "lucide-react";
import { useRunTaskStream, type RunTaskRow, type RunEventRow, type BuilderResultRow } from "@/hooks/useRunTaskStream";
import { DemoPreviewFrame } from "@/components/DemoPreviewFrame";
import { BuilderProgressStream } from "@/components/BuilderProgressStream";
import { GuestOrchestrationBanner } from "@/components/GuestOrchestrationBanner";
import { DevExperimentInspector } from "@/components/DevExperimentInspector";
import { VoteWidget } from "@/components/VoteWidget";
import { CommentsSection } from "@/components/CommentsSection";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { calculatePVI, getPVILabel } from "@/lib/pvi-calculator";
import type { Tables } from "@/integrations/supabase/types";

function isDbExperimentId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function provenanceLabel(br: BuilderResult | undefined, run: ExperimentRun): string {
  const rProv = (run as ExperimentRun & { provenance?: string }).provenance;
  if (br?.provenance === "live_api" || rProv === "live_api") return "Live API";
  if (br?.provenance === "browser_bridge" || rProv === "browser_bridge") return "Browser bridge";
  if (br?.provenance === "mcp" || rProv === "mcp") return "MCP";
  if (br?.provenance === "benchmark" || rProv === "benchmark" || !br) return "Benchmark";
  return "Broker";
}

function ProvenanceBadge({ provenance, toolName }: { provenance: string; toolName: string }) {
  const isApi = provenance === "Live API";
  const isBridge = provenance === "Browser bridge";
  
  return (
    <div className="group relative flex items-center gap-1.5 border border-border/60 bg-muted/10 px-2 py-0.5 rounded-full text-[9px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-help z-10 hidden sm:flex">
      <div className={cn("w-1.5 h-1.5 rounded-full", isApi ? "bg-success" : isBridge ? "bg-blue-500" : "bg-muted-foreground/40")} />
      {provenance}
      
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 text-center">
        {isApi ? `${toolName} is fully integrated via VBP API.` : isBridge ? `Running via automated browser inside our infrastructure.` : `Benchmark mode based on historical data.`}
      </div>
    </div>
  );
}

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

function PVIScoreDisplay({ tool, run, builderResultId }: { tool: any; run: ExperimentRun; builderResultId?: string }) {
  const [realScore, setRealScore] = useState<Tables<"builder_benchmark_scores"> | null>(null);

  useEffect(() => {
    if (!builderResultId) return;
    
    supabase
      .from("builder_benchmark_scores")
      .select("*")
      .eq("builder_result_id", builderResultId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRealScore(data);
      });
  }, [builderResultId]);

  const pvi =
    realScore?.pvi_score != null
      ? Number(realScore.pvi_score)
      : calculatePVI({
          tool_id: tool.id,
          plan_name: "pro",
          monthly_price: parseInt(tool.pricing.replace(/\D/g, "")) || 20,
          credits_included: 1000,
          credit_unit: "messages",
          ai_models: [],
          features: tool.strengths,
          dev_environment: tool.stack,
        });
  
  const { label, color } = getPVILabel(pvi);

  const dimensions = realScore ? [
    { label: "Speed", val: realScore.score_speed || 85 },
    { label: "UI Quality", val: realScore.score_ui_quality || 90 },
    { label: "Code Quality", val: realScore.score_code_quality || 75 },
    { label: "Reliability", val: realScore.score_reliability || 88 },
    { label: "Cost Eff.", val: realScore.score_cost_efficiency || 80 },
    { label: "Mobile Resp.", val: realScore.score_mobile_responsiveness || 95 },
    { label: "Deploy Read.", val: realScore.score_deploy_readiness || 70 },
  ] : [
    { label: "Speed", val: run.scores.speed || 85 },
    { label: "UI Quality", val: run.scores.uiQuality || 90 },
    { label: "Code Quality", val: run.scores.backendLogic || 75 },
    { label: "Reliability", val: 88 },
    { label: "Cost Eff.", val: 80 },
    { label: "Mobile Resp.", val: 95 },
    { label: "Deploy Read.", val: 70 },
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
         <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
           PVI Score
           <TooltipProvider>
             <Tooltip>
               <TooltipTrigger>
                 <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
               </TooltipTrigger>
               <TooltipContent side="right" className="w-[320px] p-4 bg-card/95 backdrop-blur border-border/50 text-foreground">
                 <div className="space-y-3">
                   <div className="font-semibold text-sm">Producer Viability Index</div>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                     {dimensions.map(d => (
                       <div key={d.label} className="space-y-1">
                         <div className="flex justify-between text-[10px]">
                           <span className="text-muted-foreground">{d.label}</span>
                           <span className="font-mono text-foreground font-medium">{d.val}</span>
                         </div>
                         <div className="h-1 bg-muted rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full bg-primary", d.val > 80 ? "bg-success" : d.val > 60 ? "bg-primary" : "bg-warning")} style={{ width: `${d.val}%`}} />
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="border-t border-border/50 mt-2 pt-2">
                     <div className="text-[10px] text-muted-foreground font-semibold mb-1">AI Reasoning</div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">
                       {(() => {
                         const ar = realScore?.ai_reasoning;
                         if (ar && typeof ar === "object" && ar !== null && "summary" in ar) {
                           return String((ar as Record<string, unknown>).summary);
                         }
                         return "System estimated PVI based on structural analysis and developer ecosystem strength. Awaiting real telemetry from broker.";
                       })()}
                     </p>
                   </div>
                 </div>
               </TooltipContent>
             </Tooltip>
           </TooltipProvider>
         </span>
         <div className="flex items-center gap-2">
           {!realScore && <Badge variant="outline" className="text-[9px] bg-muted/20 border-muted font-normal text-muted-foreground h-4">Estimated</Badge>}
           <span className={cn("font-bold font-mono text-lg", color)}>{pvi.toFixed(1)}</span>
         </div>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pvi}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-full", color.replace("text-", "bg-"))} />
      </div>
    </div>
  )
}

function BuildStepAnimation({ toolId, elapsed, totalTime }: { toolId: string; elapsed: number; totalTime: number }) {
  const steps = MOCK_BUILD_STEPS[toolId] || ["Processing…", "Generating…", "Finalizing…"];
  const progress = Math.min(elapsed / totalTime, 0.95);
  const currentStepIndex = Math.min(Math.floor(progress * steps.length), steps.length - 1);

  return (
    <div className="flex flex-col items-center gap-2 px-4">
      <Loader2 className="w-5 h-5 text-primary animate-spin" />
      <div className="space-y-1.5 w-full max-w-[180px]">
        {steps.map((step, i) => (
          <div
            key={i}
            className={cn(
              "text-[9px] font-mono transition-all duration-300 flex items-center gap-1.5",
              i < currentStepIndex
                ? "text-success"
                : i === currentStepIndex
                ? "text-foreground font-medium"
                : "text-muted-foreground/40"
            )}
          >
            {i < currentStepIndex ? (
              <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
            ) : i === currentStepIndex ? (
              <Loader2 className="w-2.5 h-2.5 shrink-0 animate-spin" />
            ) : (
              <div className="w-2.5 h-2.5 shrink-0 rounded-full border border-muted-foreground/30" />
            )}
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockPreview({ toolId, description }: { toolId: string; description: string }) {
  const gradient = MOCK_PREVIEW_GRADIENTS[toolId] || "from-muted to-muted/50";
  const tool = getToolById(toolId);

  return (
    <div className={cn("w-full h-full bg-gradient-to-br", gradient, "flex flex-col items-center justify-center p-4 relative")}>
      {/* Mock browser chrome */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-background/50 backdrop-blur-sm flex items-center px-2 gap-1">
        <div className="w-2 h-2 rounded-full bg-destructive/50" />
        <div className="w-2 h-2 rounded-full bg-warning/50" />
        <div className="w-2 h-2 rounded-full bg-success/50" />
        <div className="flex-1 mx-2 h-3 rounded bg-muted/50" />
      </div>
      {/* Mock content */}
      <div className="mt-4 space-y-2 w-full max-w-[160px]">
        <div className="h-3 rounded bg-foreground/10 w-3/4" />
        <div className="h-2 rounded bg-foreground/5 w-full" />
        <div className="h-2 rounded bg-foreground/5 w-5/6" />
        <div className="flex gap-1 mt-3">
          <div className="h-5 rounded bg-primary/20 w-12" />
          <div className="h-5 rounded bg-muted/30 w-12" />
        </div>
        <div className="h-12 rounded bg-muted/20 w-full mt-2" />
      </div>
      <div className="absolute bottom-2 right-2">
        <Badge variant="secondary" className="text-[7px] px-1 py-0 opacity-60">
          <Code2 className="w-2 h-2 mr-0.5" />
          {tool?.name} mock
        </Badge>
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
  provenanceLabelText,
  task,
  events,
}: {
  run: ExperimentRun;
  elapsed: number;
  onClick: () => void;
  onReferralClick: (toolId: string) => void;
  builderResult?: BuilderResult | BuilderResultRow;
  provenanceLabelText: string;
  task?: RunTaskRow;
  events?: RunEventRow[];
}) {
  const tool = getToolById(run.toolId);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
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
          ? "col-span-1 md:col-span-2 border-primary/30"
          : "border-border"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {tool.logoUrl ? (
                <img src={tool.logoUrl} alt={tool.name} className="w-5 h-5 object-contain" loading="lazy" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">{tool.name[0]}</span>
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">{tool.name}</div>
              {isFeatured && (
                <span className="text-[10px] font-medium text-primary">Partner</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <ProvenanceBadge provenance={provenanceLabelText} toolName={tool.name} />
            <StatusBadge status={run.status} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="font-mono tabular-nums">{displayTime.toFixed(1)}s</span>
        </div>

        <div
          className={cn(
            "rounded-lg overflow-hidden relative border",
            isFeatured ? "h-64 border-primary/20" : "h-56 border-border/50"
          )}
        >
          {run.status === "completed" && builderResult?.previewUrl ? (
            <div className="w-full h-full bg-muted/20 relative z-0">
              <DemoPreviewFrame
                previewUrl={builderResult.previewUrl}
                toolName={tool.name}
                onFullscreen={() => setIsFullscreen(true)}
              />
            </div>
          ) : run.status === "completed" ? (
            <MockPreview toolId={run.toolId} description={run.description} />
          ) : run.status === "running" || builderResult?.status === "generating" ? (
            <BuilderProgressStream
              toolName={tool.name}
              task={task}
              events={events}
              elapsedSec={elapsed}
            />
          ) : (
            <div className="w-full h-full bg-muted/30 flex items-center justify-center">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Waiting...
              </div>
            </div>
          )}
        </div>

        {run.status === "completed" && (
          <div className="space-y-2">
            <PVIScoreDisplay tool={tool} run={run} builderResultId={builderResult?.id} />
            {builderResult && (
              <div className="pt-2">
                <BuilderResultBadge result={builderResult} />
                <div className="pt-3 border-t border-border/30 mt-3 -mx-2 px-2 pb-1">
                  <div className="flex items-center justify-between">
                    <VoteWidget builderResultId={builderResult.id} toolId={run.toolId} />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }} 
                      className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                      Discussion
                    </Button>
                  </div>
                  <AnimatePresence>
                    {showComments && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-muted/10 border border-border/40 rounded-xl p-3 backdrop-blur-sm">
                          <CommentsSection builderResultId={builderResult.id} toolId={run.toolId} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {/* P2: CTA hide-if-empty — show only when there's something actionable */}
        {run.status === "completed" && (() => {
          const claimToken = (builderResult as (BuilderResult & { metadata?: { claim_token?: string } }) | undefined)?.metadata?.claim_token;
          const extendedTool = tool as typeof tool & { url?: string };
          const hasReferral = !!tool.referralUrl;
          const hasPreview = !!builderResult?.previewUrl;
          const hasClaim = !!claimToken;
          
          // Hide CTA entirely if nothing actionable
          if (!hasClaim && !hasReferral && !hasPreview) return null;
          
          const ctaLabel = hasClaim ? `Claim project in ${tool.name}` : hasReferral ? `Continue in ${tool.name}` : "Open preview";
          
          return (
            <Button
              size="sm"
              variant={isFeatured ? "default" : "outline"}
              className={cn("w-full text-xs font-semibold", isFeatured && "bg-primary hover:bg-primary/90 text-primary-foreground")}
              onClick={(e) => {
                e.stopPropagation();
                onReferralClick(run.toolId);
                
                if (hasClaim && (extendedTool.url || hasReferral)) {
                  const baseHost = extendedTool.url ? new URL(extendedTool.url).host : new URL(tool.referralUrl!).host;
                  window.open(`https://${baseHost}/vbp/claim?token=${claimToken}&ref=pr0ducent_click`, "_blank");
                } else if (hasReferral) {
                  window.open(tool.referralUrl!, "_blank");
                } else if (hasPreview) {
                  window.open(builderResult!.previewUrl!, "_blank");
                }
              }}
            >
              {ctaLabel}
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-80" />
            </Button>
          );
        })()}

        {/* Pełnoekranowy Modal (Framer Motion) */}
        <AnimatePresence>
          {isFullscreen && builderResult?.previewUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 lg:p-12"
            >
              <div className="w-full h-full max-w-7xl relative bg-card rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-border/50 overflow-hidden flex flex-col">
                <DemoPreviewFrame
                  previewUrl={builderResult.previewUrl}
                  toolName={tool.name}
                  isFullscreen={true}
                  onFullscreen={() => setIsFullscreen(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
  const syncedRef = useRef<Set<string>>(new Set());

  const stream = useRunTaskStream(isDbExperimentId(experiment.id) ? experiment.id : undefined);

  const completedCount = experiment.runs.filter((r) => r.status === "completed").length;
  const totalCount = experiment.runs.length;

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let updated = false;
      const newRuns = experiment.runs.map((run) => {
        const br = builderResults[run.toolId];
        if (br && (br.status === "generating" || br.status === "completed" || br.status === "error")) {
          return run;
        }

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
  }, [experiment, onExperimentUpdate, builderResults]);

  useEffect(() => {
    let changed = false;
    const newRuns = experiment.runs.map((run) => {
      const br = builderResults[run.toolId];
      if (!br) return run;
      if (br.status === "completed" && run.status !== "completed") {
        changed = true;
        return { ...run, status: "completed" as const, completedAt: Date.now() };
      }
      if (br.status === "error" && run.status !== "error") {
        changed = true;
        return { ...run, status: "error" as const };
      }
      if (br.status === "generating" && run.status === "queued") {
        changed = true;
        return { ...run, status: "running" as const };
      }
      return run;
    });

    if (changed) {
      const updatedExp = { ...experiment, runs: newRuns };
      onExperimentUpdate(updatedExp);
      saveExperiment(updatedExp);
    }

    const runsForSync = changed ? newRuns : experiment.runs;
    if (user && isDbExperimentId(experiment.id)) {
      runsForSync.forEach((run) => {
        const br = builderResults[run.toolId];
        const key = `${experiment.id}:${run.toolId}`;
        if (br?.status === "completed" && !syncedRef.current.has(key)) {
          syncedRef.current.add(key);
          void updateRunStatusInDb(experiment.id, run.toolId, "completed", Date.now());
        }
        if (br?.status === "error" && !syncedRef.current.has(`${key}:err`)) {
          syncedRef.current.add(`${key}:err`);
          void updateRunStatusInDb(experiment.id, run.toolId, "error");
        }
      });
    }
  }, [builderResults, experiment, onExperimentUpdate, user]);

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
      logReferralHandoff(user.id, experiment.id, toolId, { source: "compare_cta" });
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
      <GuestOrchestrationBanner />

      {user && isDbExperimentId(experiment.id) ? (
        <RunCenter experimentId={experiment.id} />
      ) : null}

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
              builderResult={builderResults[run.toolId] || stream.results[run.toolId]}
              provenanceLabelText={provenanceLabel(builderResults[run.toolId], run)}
              task={stream.tasks[run.toolId]}
              events={stream.events[run.toolId]}
            />
          ))}
        </AnimatePresence>
      </div>

      <DevExperimentInspector experimentId={isDbExperimentId(experiment.id) ? experiment.id : undefined} stream={stream} />
    </section>
  );
}
