import { useEffect, useState } from "react";
import { FF } from "@/lib/featureFlags";
import type { StreamState } from "@/hooks/useRunTaskStream";
import { cn } from "@/lib/utils";
import { X, Database, Activity, FileText } from "lucide-react";

interface DevExperimentInspectorProps {
  experimentId: string | undefined;
  stream: StreamState;
}

/**
 * Dev-only drawer (Ctrl+Shift+D) showing raw run_tasks / run_events.
 * Never renders in production builds.
 */
export function DevExperimentInspector({ experimentId, stream }: DevExperimentInspectorProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!FF.DEV_INSPECTOR) return;

    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!FF.DEV_INSPECTOR || !open) return null;

  const tasks = Object.values(stream.tasks);
  const allEvents = Object.entries(stream.events)
    .flatMap(([toolId, events]) => events.map(e => ({ ...e, _toolId: toolId })))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="fixed inset-y-0 right-0 z-[200] w-[420px] max-w-[90vw] bg-background border-l border-border shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-bold">Dev Inspector</span>
          <span className="text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded font-mono">DEV ONLY</span>
        </div>
        <button onClick={() => setOpen(false)} title="Close inspector" className="p-1 hover:bg-muted rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Experiment ID */}
      <div className="px-4 py-2 border-b border-border/50 bg-muted/10">
        <div className="text-[10px] text-muted-foreground font-mono">experiment_id</div>
        <div className="text-xs font-mono select-all text-foreground">{experimentId || "—"}</div>
        <div className="text-[10px] text-muted-foreground font-mono mt-2">realtime</div>
        <div className="text-xs font-mono text-foreground">{stream.realtimeChannelStatus}</div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* run_tasks */}
        <div className="p-4 border-b border-border/50">
          <h3 className="text-xs font-bold font-mono flex items-center gap-1.5 mb-3">
            <Activity className="w-3.5 h-3.5 text-primary" />
            run_tasks ({tasks.length})
          </h3>
          {tasks.length === 0 ? (
            <p className="text-[10px] text-muted-foreground font-mono">No tasks found</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-muted/20 rounded px-2.5 py-1.5 text-[10px] font-mono border border-border/30">
                  <span className="font-semibold">{t.tool_id}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-bold",
                    t.status === "completed" ? "bg-success/20 text-success" :
                    t.status === "error" ? "bg-destructive/20 text-destructive" :
                    t.status === "running" ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {t.status}
                  </span>
                  {t.error_message && (
                    <span className="text-destructive truncate max-w-[120px]" title={t.error_message}>
                      {t.error_message}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* run_events */}
        <div className="p-4">
          <h3 className="text-xs font-bold font-mono flex items-center gap-1.5 mb-3">
            <FileText className="w-3.5 h-3.5 text-primary" />
            run_events ({allEvents.length})
          </h3>
          {allEvents.length === 0 ? (
            <p className="text-[10px] text-muted-foreground font-mono">No events yet</p>
          ) : (
            <div className="space-y-1">
              {allEvents.slice(-50).map(e => (
                <div key={e.id} className="text-[9px] font-mono border-l-2 border-primary/30 pl-2 py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
                    <span className="font-semibold text-foreground">{e.event_type}</span>
                    <span className="text-muted-foreground">({e._toolId})</span>
                  </div>
                  {e.payload && Object.keys(e.payload).length > 0 && (
                    <pre className="text-[8px] text-muted-foreground mt-0.5 overflow-hidden text-ellipsis max-h-[40px]">
                      {JSON.stringify(e.payload, null, 1)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/50 bg-muted/10 text-[9px] text-muted-foreground font-mono">
        Ctrl+Shift+D to toggle · {stream.isLoading ? "Loading..." : "Live"}
      </div>
    </div>
  );
}
