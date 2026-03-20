import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, AlertCircle, Terminal, Clock } from "lucide-react";
import type { RunTaskRow, RunEventRow } from "@/hooks/useRunTaskStream";
import { motion } from "framer-motion";

interface BuilderProgressStreamProps {
  toolName: string;
  task?: RunTaskRow;
  events?: RunEventRow[];
  elapsedSec: number;
}

export function BuilderProgressStream({ toolName, task, events = [], elapsedSec }: BuilderProgressStreamProps) {
  const status = task?.status || "queued";
  
  // Ostatni event to nasz aktualny krok
  const sortedEvents = [...events].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const latestEvent = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1] : null;
  
  let statusText = "Preparing environment...";
  if (status === "queued") statusText = "Waiting in orchestrator queue...";
  else if (status === "error" || task?.status === "dead_letter") statusText = "Execution failed";
  else if (latestEvent) {
    statusText = latestEvent.event_type.replace(/^orchestrator\.|^builder\.|^score\./, "");
    statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1).replace(/_/g, " ");
  }

  // Estymowany czas (VBP config docelowo, teraz hardcode na 25s)
  const estimatedTotal = 25; 
  const progressPercent = status === "completed" ? 100 : Math.min(95, (elapsedSec / estimatedTotal) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full h-full bg-gradient-to-br from-background to-muted/20 relative overflow-hidden">
      {/* Subtelne tło z nazwą buildera */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none overflow-hidden text-clip flex-wrap">
        <span className="text-8xl font-black tracking-tighter text-foreground whitespace-nowrap overflow-hidden">
          {toolName.toUpperCase()}
        </span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-[240px] glass-card p-5 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative">
          {status === "error" || status === "dead_letter" ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-destructive/10 p-3 rounded-full">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </motion.div>
          ) : status === "completed" ? (
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-success/10 p-3 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </motion.div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
              <div className="bg-primary/10 p-3 rounded-full">
                <Loader2 className="w-8 h-8 text-primary opacity-50" />
              </div>
            </div>
          )}
          {events.length > 0 && status !== "error" && status !== "completed" && (
            <div className="absolute -bottom-1 -right-1 bg-background border border-border rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-bold shadow-sm">
              {events.length}
            </div>
          )}
        </div>
        
        <div className="text-center w-full space-y-3">
          <div className="text-xs font-mono text-foreground font-medium truncate flex items-center justify-center gap-1.5 h-4">
            {status === "running" && <Terminal className="w-3.5 h-3.5 text-primary" />}
            {statusText}
          </div>
          
          <div className="space-y-1.5">
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  status === "error" ? "bg-destructive w-full" :
                  status === "completed" ? "bg-success w-full" :
                  "bg-gradient-to-r from-primary/60 to-primary"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ ease: "linear", duration: 0.5 }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono px-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {elapsedSec.toFixed(1)}s
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
