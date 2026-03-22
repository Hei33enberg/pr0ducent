import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { shouldReplaceBuilderResultRow, shouldReplaceTaskRow } from "@/lib/realtime-merge";

export type TaskStatus = "queued" | "running" | "completed" | "error" | "throttled" | "dead_letter";

export interface RunTaskRow {
  id: string;
  experiment_id: string;
  tool_id: string;
  status: TaskStatus;
  adapter_tier: number | null;
  attempt_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunEventRow {
  id: string;
  experiment_id: string;
  tool_id: string | null;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface BuilderResultRow {
  id: string;
  experiment_id: string;
  tool_id: string;
  status: string;
  preview_url: string | null;
  chat_url: string | null;
  provenance: string;
  execution_mode: string;
  updated_at: string;
}

export interface StreamState {
  tasks: Record<string, RunTaskRow>;
  events: Record<string, RunEventRow[]>;
  results: Record<string, BuilderResultRow>;
  isLoading: boolean;
  error: Error | null;
  /** Realtime channel lifecycle (Slice C). */
  realtimeChannelStatus: "idle" | "subscribed" | "error";
}

export function useRunTaskStream(experimentId: string | undefined) {
  const [state, setState] = useState<StreamState>({
    tasks: {},
    events: {},
    results: {},
    isLoading: true,
    error: null,
    realtimeChannelStatus: "idle",
  });

  const loadInitialData = useCallback(async (expId: string) => {
    try {
      const [tasksRes, eventsRes, resultsRes] = await Promise.all([
        supabase.from("run_tasks").select("*").eq("experiment_id", expId),
        supabase.from("run_events").select("*").eq("experiment_id", expId).order("created_at", { ascending: true }),
        supabase.from("builder_results").select("*").eq("experiment_id", expId),
      ]);

      setState((prev) => {
        const next: StreamState = { ...prev, isLoading: false };

        if (tasksRes.data) {
          for (const t of tasksRes.data) {
            const row = t as unknown as RunTaskRow;
            const cur = next.tasks[row.tool_id];
            if (shouldReplaceTaskRow(cur, row)) {
              next.tasks[row.tool_id] = row;
            }
          }
        }

        if (eventsRes.data) {
          for (const e of eventsRes.data) {
            const toolId = e.tool_id ?? "__global";
            if (!next.events[toolId]) next.events[toolId] = [];
            if (!next.events[toolId].find((ex) => ex.id === e.id)) {
              next.events[toolId].push(e as unknown as RunEventRow);
            }
          }
        }

        if (resultsRes.data) {
          for (const r of resultsRes.data) {
            const row = r as unknown as BuilderResultRow;
            const cur = next.results[row.tool_id];
            if (shouldReplaceBuilderResultRow(cur, row)) {
              next.results[row.tool_id] = row;
            }
          }
        }

        return next;
      });
    } catch (err: unknown) {
      console.error("useRunTaskStream load error:", err);
      setState((prev) => ({ ...prev, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) }));
    }
  }, []);

  useEffect(() => {
    if (!experimentId) {
      setState({
        tasks: {},
        events: {},
        results: {},
        isLoading: false,
        error: null,
        realtimeChannelStatus: "idle",
      });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null, realtimeChannelStatus: "idle" }));
    void loadInitialData(experimentId);

    let reconnectAttempts = 0;
    const maxReconnect = 3;

    const channel = supabase.channel(`stream:${experimentId}`);

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "run_tasks", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { tool_id?: string } | null;
            const toolId = oldRow?.tool_id;
            if (!toolId) return;
            setState((prev) => {
              const tasks = { ...prev.tasks };
              delete tasks[toolId];
              return { ...prev, tasks };
            });
            return;
          }

          const newTask = payload.new as RunTaskRow | null;
          if (!newTask?.tool_id) return;
          setState((prev) => {
            const cur = prev.tasks[newTask.tool_id];
            if (!shouldReplaceTaskRow(cur, newTask)) return prev;
            return {
              ...prev,
              tasks: { ...prev.tasks, [newTask.tool_id]: newTask },
            };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "run_events", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          const newEvent = payload.new as RunEventRow;
          if (!newEvent) return;
          const toolId = newEvent.tool_id ?? "__global";
          setState((prev) => {
            const toolEvents = prev.events[toolId] || [];
            if (toolEvents.find((e) => e.id === newEvent.id)) return prev;
            return {
              ...prev,
              events: { ...prev.events, [toolId]: [...toolEvents, newEvent] },
            };
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "builder_results", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { tool_id?: string } | null;
            const toolId = oldRow?.tool_id;
            if (!toolId) return;
            setState((prev) => {
              const results = { ...prev.results };
              delete results[toolId];
              return { ...prev, results };
            });
            return;
          }

          const newResult = payload.new as BuilderResultRow | null;
          if (!newResult?.tool_id) return;
          setState((prev) => {
            const cur = prev.results[newResult.tool_id];
            if (!shouldReplaceBuilderResultRow(cur, newResult)) return prev;
            return {
              ...prev,
              results: { ...prev.results, [newResult.tool_id]: newResult },
            };
          });
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          reconnectAttempts = 0;
          setState((prev) => ({ ...prev, realtimeChannelStatus: "subscribed" }));
        } else if (status === "CHANNEL_ERROR") {
          console.warn("useRunTaskStream channel error:", err);
          setState((prev) => ({ ...prev, realtimeChannelStatus: "error" }));
          if (reconnectAttempts < maxReconnect) {
            reconnectAttempts += 1;
            toast.error("Realtime connection issue — retrying…", { duration: 4000 });
            window.setTimeout(() => {
              void channel.subscribe();
            }, 1500 * reconnectAttempts);
          } else {
            toast.error("Realtime unavailable — refresh the page if progress stalls.", { duration: 6000 });
          }
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [experimentId, loadInitialData]);

  return state;
}
