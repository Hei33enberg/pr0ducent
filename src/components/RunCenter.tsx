import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type RunEventRow = Pick<
  Database["public"]["Tables"]["run_events"]["Row"],
  "id" | "event_type" | "tool_id" | "payload" | "created_at"
>;

function formatEventLabel(eventType: string): string {
  return eventType.replace(/^orchestrator\./, "").replace(/^builder\./, "").replace(/^score\./, "score: ");
}

export function RunCenter({ experimentId }: { experimentId: string }) {
  const { t } = useTranslation();
  const [events, setEvents] = useState<RunEventRow[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("run_events")
      .select("id, event_type, tool_id, payload, created_at")
      .eq("experiment_id", experimentId)
      .order("created_at", { ascending: false })
      .limit(40);

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  }, [experimentId]);

  useEffect(() => {
    void load();

    const ch = supabase
      .channel(`run_events_ui:${experimentId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "run_events",
          filter: `experiment_id=eq.${experimentId}`,
        },
        (payload) => {
          const row = payload.new as RunEventRow;
          setEvents((prev) => [row, ...prev].slice(0, 40));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [experimentId, load]);

  if (loading && events.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground font-sans uppercase tracking-wider">
          <Activity className="w-3.5 h-3.5 text-accent" />
          {t("runCenter.title")}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>
      {expanded && (
        <ul className="max-h-48 overflow-y-auto text-xs font-mono divide-y divide-border/40">
          {events.length === 0 ? (
            <li className="px-4 py-3 text-muted-foreground font-sans">{t("runCenter.empty")}</li>
          ) : (
            events.map((ev) => (
              <li key={ev.id} className="px-4 py-2 flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-foreground font-sans font-medium")}>
                    {formatEventLabel(ev.event_type)}
                    {ev.tool_id ? (
                      <span className="text-muted-foreground font-normal"> · {ev.tool_id}</span>
                    ) : null}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                    {new Date(ev.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
