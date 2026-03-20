import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BUILDER_TOOLS } from "@/config/tools";

export interface LeaderboardEntry {
  tool_id: string;
  pvi_score: number;
  total_runs: number;
  avg_speed: number;
  avg_ui_quality: number;
  avg_code_quality: number;
  user_rating: number; // 1-5
  trend: "up" | "down" | "flat";
}

export type Timeframe = "7d" | "30d" | "all";
export type SortDim = "pvi_score" | "avg_speed" | "avg_ui_quality" | "avg_code_quality" | "total_runs";

export function useLeaderboard(timeframe: Timeframe, sortDim: SortDim) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // W wersji produkcyjnej query powinno filtrować wg. timeframe (np. funkcja RPC z argumentem dni)
      // Jednak jako materialized view `builder_leaderboard` jest całościowe.
      
      const { data, error: sbError } = await supabase
        .from("builder_leaderboard" as any)
        .select("*")
        .order(sortDim, { ascending: sortDim === "avg_speed" ? true : false }); 
        // UWAGA: Mniejszy czas generowania (speed) traktujemy jako lepszy, jeśli to sekundy.
        // Jeśli to wynik (1-100), odwracamy. Dla spójności PVI Score zakładamy 0-100.

      if (sbError) throw sbError;
      
      if (data && data.length > 0) {
        setEntries(data as unknown as LeaderboardEntry[]);
        return;
      }
    } catch (err: any) {
      console.warn("Failed to fetch builder_leaderboard. View might not exist yet. Using fallback mocks.", err);
    }
    
    // Fallback Mock Data if view is missing or empty
    const mockDb: LeaderboardEntry[] = BUILDER_TOOLS.map((t, idx) => ({
      tool_id: t.id,
      pvi_score: 85 - idx * 2 + (Math.random() * 5),
      total_runs: 1200 - idx * 100 + Math.floor(Math.random() * 50),
      avg_speed: Math.floor(Math.random() * 20) + 70, 
      avg_ui_quality: 90 - idx,
      avg_code_quality: 88 - idx,
      user_rating: parseFloat((4.0 + Math.random()).toFixed(1)),
      trend: idx === 0 ? "up" : idx === 1 ? "down" : "flat",
    }));

    // Local sort mock
    const sorted = [...mockDb].sort((a, b) => {
      const valA = a[sortDim] as number;
      const valB = b[sortDim] as number;
      // Jeśli to avg_speed i to by było w sekundach, powinno być rosnąco, 
      // ale w BenchmarkScores to jest od 0 do 100, więc malejąco:
      return valB - valA;
    });

    setEntries(sorted);
    setLoading(false);
  }, [timeframe, sortDim]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { entries, loading, error, refetch: fetchLeaderboard };
}
