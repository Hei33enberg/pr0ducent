import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext.tsx";
import type { Tables } from "@/integrations/supabase/types";

export interface LeaderboardEntry {
  tool_id: string;
  pvi_score: number;
  total_runs: number;
  avg_speed: number;
  avg_ui_quality: number;
  avg_code_quality: number;
  user_rating: number;
  trend: "up" | "down" | "flat";
}

export type Timeframe = "7d" | "30d" | "all";
export type SortDim = "pvi_score" | "avg_speed" | "avg_ui_quality" | "avg_code_quality" | "total_runs";

type LeaderboardRow = Tables<"builder_leaderboard">;

function mapMvRow(row: LeaderboardRow): LeaderboardEntry | null {
  const tid = row.tool_id;
  if (!tid) return null;
  return {
    tool_id: tid,
    pvi_score: Number(row.avg_pvi ?? row.best_pvi ?? 0),
    total_runs: Number(row.total_runs ?? 0),
    avg_speed: 0,
    avg_ui_quality: 0,
    avg_code_quality: 0,
    user_rating: 0,
    trend: "flat",
  };
}

const SORT_COLUMN: Record<SortDim, keyof LeaderboardRow> = {
  pvi_score: "avg_pvi",
  avg_speed: "avg_pvi",
  avg_ui_quality: "avg_pvi",
  avg_code_quality: "avg_pvi",
  total_runs: "total_runs",
};

export function useLeaderboard(timeframe: Timeframe, sortDim: SortDim) {
  const { tools } = useBuilderCatalog();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const col = SORT_COLUMN[sortDim];
      const { data, error: sbError } = await supabase
        .from("builder_leaderboard")
        .select("*")
        .order(col, { ascending: false, nullsFirst: false });

      if (sbError) throw sbError;

      if (data && data.length > 0) {
        const mapped = data
          .map(mapMvRow)
          .filter((e): e is LeaderboardEntry => e !== null);
        setEntries(mapped);
        setLoading(false);
        return;
      }
    } catch (err: unknown) {
      console.warn("Failed to fetch builder_leaderboard. Using fallback mocks.", err);
      setError(err instanceof Error ? err.message : "fetch_failed");
    }

    const mockDb: LeaderboardEntry[] = builderTools.map((t, idx) => ({
      tool_id: t.id,
      pvi_score: 85 - idx * 2 + Math.random() * 5,
      total_runs: 1200 - idx * 100 + Math.floor(Math.random() * 50),
      avg_speed: Math.floor(Math.random() * 20) + 70,
      avg_ui_quality: 90 - idx,
      avg_code_quality: 88 - idx,
      user_rating: parseFloat((4.0 + Math.random()).toFixed(1)),
      trend: idx === 0 ? "up" : idx === 1 ? "down" : "flat",
    }));

    const sorted = [...mockDb].sort((a, b) => {
      const key = sortDim === "pvi_score" ? "pvi_score" : sortDim;
      const valA = a[key] as number;
      const valB = b[key] as number;
      return valB - valA;
    });

    setEntries(sorted);
    setLoading(false);
  }, [timeframe, sortDim, builderTools]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, error, refetch: fetchLeaderboard };
}
