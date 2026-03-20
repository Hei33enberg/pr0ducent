import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type RunTaskRow = {
  id: string;
  tool_id: string;
  status: string;
  adapter_tier: number | null;
  error_message: string | null;
  updated_at?: string | null;
};

export type RunEventRow = {
  id: string;
  event_type: string;
  tool_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

/**
 * Subscribes to run_tasks + run_events for one experiment (orchestration stream).
 */
export function useOrchestrationRealtime(experimentId: string | undefined) {
  const [tasks, setTasks] = useState<RunTaskRow[]>([]);
  const [events, setEvents] = useState<RunEventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!experimentId) {
      setTasks([]);
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [tRes, eRes] = await Promise.all([
      supabase
        .from("run_tasks")
        .select("id, tool_id, status, adapter_tier, error_message, updated_at")
        .eq("experiment_id", experimentId)
        .order("created_at", { ascending: true }),
      supabase
        .from("run_events")
        .select("id, event_type, tool_id, payload, created_at")
        .eq("experiment_id", experimentId)
        .order("created_at", { ascending: false })
        .limit(80),
    ]);
    if (!tRes.error && tRes.data) setTasks(tRes.data as RunTaskRow[]);
    if (!eRes.error && eRes.data) setEvents(eRes.data as RunEventRow[]);
    setLoading(false);
  }, [experimentId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!experimentId) return;

    const ch: RealtimeChannel = supabase
      .channel(`orch:${experimentId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "run_tasks", filter: `experiment_id=eq.${experimentId}` },
        () => {
          void load();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "run_events", filter: `experiment_id=eq.${experimentId}` },
        (payload) => {
          const row = payload.new as RunEventRow;
          setEvents((prev) => [row, ...prev].slice(0, 80));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(ch);
    };
  }, [experimentId, load]);

  return { tasks, events, loading, reload: load };
}
