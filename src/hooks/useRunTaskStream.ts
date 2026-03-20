import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  payload: Record<string, any>;
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
}

export interface StreamState {
  tasks: Record<string, RunTaskRow>;
  events: Record<string, RunEventRow[]>;
  results: Record<string, BuilderResultRow>;
  isLoading: boolean;
  error: Error | null;
}

export function useRunTaskStream(experimentId: string | undefined) {
  const [state, setState] = useState<StreamState>({
    tasks: {},
    events: {},
    results: {},
    isLoading: true,
    error: null,
  });

  const loadInitialData = useCallback(async (expId: string) => {
    try {
      // Używamy Promise.allSettled żeby bezpiecznie zignorować brak tabel w DB (np. gdy Cursor jeszcze pisze migracje)
      const promises = [
        supabase.from("builder_results").select("*").eq("experiment_id", expId),
        supabase.from("run_events").select("*").eq("experiment_id", expId).order("created_at", { ascending: true })
      ];

      // Próbujemy pobrać run_tasks, ale jak nie ma, to failuje miękko
      const tasksPromise = supabase.from("run_tasks").select("*").eq("experiment_id", expId);

      const [resultsRes, eventsRes, tasksRes] = await Promise.allSettled([...promises, tasksPromise]);

      setState((prev) => {
        const next = { ...prev, isLoading: false };
        
        if (tasksRes.status === "fulfilled" && tasksRes.value.data) {
          tasksRes.value.data.forEach((t: RunTaskRow) => {
            next.tasks[t.tool_id] = t;
          });
        }
        
        if (eventsRes.status === "fulfilled" && eventsRes.value.data) {
          eventsRes.value.data.forEach((e: RunEventRow) => {
            if (!next.events[e.tool_id]) next.events[e.tool_id] = [];
            // zabezpieczenie przed duplikatami w initial data
            if (!next.events[e.tool_id].find(ex => ex.id === e.id)) {
              next.events[e.tool_id].push(e);
            }
          });
        }
        
        if (resultsRes.status === "fulfilled" && resultsRes.value.data) {
          resultsRes.value.data.forEach((r: BuilderResultRow) => {
            next.results[r.tool_id] = r;
          });
        }

        return next;
      });
    } catch (err: any) {
      console.error("useRunTaskStream load error:", err);
      setState(prev => ({ ...prev, isLoading: false, error: err }));
    }
  }, []);

  useEffect(() => {
    if (!experimentId) {
      setState({ tasks: {}, events: {}, results: {}, isLoading: false, error: null });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    void loadInitialData(experimentId);

    const channel = supabase.channel(`stream:${experimentId}`);

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "run_tasks", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          const newTask = payload.new as RunTaskRow;
          if (newTask && newTask.tool_id) {
            setState(prev => ({
              ...prev,
              tasks: { ...prev.tasks, [newTask.tool_id]: newTask }
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "run_events", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          const newEvent = payload.new as RunEventRow;
          if (newEvent && newEvent.tool_id) {
            setState(prev => {
              const toolEvents = prev.events[newEvent.tool_id] || [];
              if (toolEvents.find(e => e.id === newEvent.id)) return prev;
              
              return {
                ...prev,
                events: { ...prev.events, [newEvent.tool_id]: [...toolEvents, newEvent] }
              };
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "builder_results", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          const newResult = payload.new as BuilderResultRow;
          if (newResult && newResult.tool_id) {
            setState(prev => ({
              ...prev,
              results: { ...prev.results, [newResult.tool_id]: newResult }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [experimentId, loadInitialData]);

  return state;
}
