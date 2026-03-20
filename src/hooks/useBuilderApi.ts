import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BuilderResult {
  toolId: string;
  status: "pending" | "generating" | "completed" | "error";
  chatUrl?: string;
  previewUrl?: string;
  generationTimeMs?: number;
  error?: string;
}

/**
 * Hook to call real builder APIs via edge functions.
 * Currently supports: v0
 * Returns results per tool and a trigger function.
 */
export function useBuilderApi() {
  const [results, setResults] = useState<Record<string, BuilderResult>>({});
  const [loading, setLoading] = useState(false);

  const runOnV0 = useCallback(
    async (prompt: string, experimentId: string) => {
      setResults((prev) => ({
        ...prev,
        v0: { toolId: "v0", status: "generating" },
      }));

      try {
        const { data, error } = await supabase.functions.invoke("run-on-v0", {
          body: { prompt, experimentId },
        });

        if (error) throw error;

        if (data?.success) {
          setResults((prev) => ({
            ...prev,
            v0: {
              toolId: "v0",
              status: "completed",
              chatUrl: data.chatUrl,
              previewUrl: data.previewUrl,
              generationTimeMs: data.generationTimeMs,
            },
          }));
        } else {
          throw new Error(data?.error || "Unknown error from v0 API");
        }
      } catch (err: any) {
        console.error("v0 API error:", err);
        setResults((prev) => ({
          ...prev,
          v0: {
            toolId: "v0",
            status: "error",
            error: err.message || "Failed to generate with v0",
          },
        }));
      }
    },
    []
  );

  const runBuilders = useCallback(
    async (prompt: string, experimentId: string, selectedTools: string[]) => {
      setLoading(true);

      const promises: Promise<void>[] = [];

      if (selectedTools.includes("v0")) {
        promises.push(runOnV0(prompt, experimentId));
      }

      // Future: add runOnReplit, runOnBolt, etc.

      await Promise.allSettled(promises);
      setLoading(false);
    },
    [runOnV0]
  );

  return { results, loading, runBuilders };
}
