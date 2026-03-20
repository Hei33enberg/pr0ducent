import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePairwiseVote() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const castVote = async (
    experimentId: string,
    winnerToolId: string | null, // null means tie
    toolA: string,
    toolB: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error: sbError } = await supabase.from("builder_arena_votes" as any).insert({
        experiment_id: experimentId,
        user_id: session?.user?.id || null, // Allow anonymous votes if db allows it
        winner_tool_id: winnerToolId,
        tool_a_id: toolA,
        tool_b_id: toolB
      });
      
      if (sbError) throw sbError;
      return true;
    } catch (err: any) {
      console.error("Pairwise vote error:", err);
      setError(err.message || "Failed to cast vote");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { castVote, loading, error };
}
