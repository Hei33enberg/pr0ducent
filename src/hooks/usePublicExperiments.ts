import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PublicExperimentRecord {
  id: string;
  prompt: string;
  created_at: string;
  use_case_tags: string[];
  selected_tools: string[];
  user_id: string;
  builder_results?: any[]; 
}

export function usePublicExperiments(pageSize = 12) {
  const [experiments, setExperiments] = useState<PublicExperimentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPublic = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      
      const { data, error } = await supabase
        .from("experiments")
        .select(`
          id, prompt, created_at, use_case_tags, selected_tools, user_id,
          builder_results (*)
        `)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1);

      if (error) throw error;
      
      const records = (data as unknown) as PublicExperimentRecord[];
      
      if (records.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setExperiments(prev => isInitial ? records : [...prev, ...records]);
    } catch (err) {
      console.error("Failed to load public experiments:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPublic(0, true).catch(() => setLoading(false));
  }, [fetchPublic]);

  const loadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPublic(nextPage, false);
  }, [hasMore, loading, page, fetchPublic]);

  return { experiments, loading, hasMore, loadMore };
}
