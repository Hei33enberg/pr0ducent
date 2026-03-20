import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BuilderResult {
  toolId: string;
  status: "pending" | "generating" | "completed" | "error";
  chatUrl?: string;
  previewUrl?: string;
  generationTimeMs?: number;
  error?: string;
}

const POLL_INTERVAL = 3000;
const MAX_POLL_TIME = 120000;
const RUN_ON_V0_MAX_RETRIES = 3;
const RUN_ON_V0_RETRY_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useBuilderApi() {
  const [results, setResults] = useState<Record<string, BuilderResult>>({});
  const [loading, setLoading] = useState(false);
  const pollTimers = useRef<Record<string, number>>({});

  const stopPolling = useCallback((toolId: string) => {
    if (pollTimers.current[toolId]) {
      clearInterval(pollTimers.current[toolId]);
      delete pollTimers.current[toolId];
    }
  }, []);

  const runOnV0 = useCallback(
    async (prompt: string, experimentId?: string) => {
      setResults((prev) => ({
        ...prev,
        v0: { toolId: "v0", status: "generating" },
      }));

      const startTime = Date.now();

      try {
        // Step 1: Initiate async generation (with retries only for retryable failures)
        let data: any = null;

        for (let attempt = 1; attempt <= RUN_ON_V0_MAX_RETRIES; attempt++) {
          const { data: attemptData, error: attemptError } = await supabase.functions.invoke("run-on-v0", {
            body: { prompt, experimentId },
          });

          if (!attemptError && attemptData?.success) {
            data = attemptData;
            break;
          }

          const combinedError = attemptError?.message || attemptData?.error || "v0 API error";
          const retryable = attemptData?.retryable === true || /timeout|504|failed to fetch/i.test(combinedError);

          if (!retryable || attempt === RUN_ON_V0_MAX_RETRIES) {
            throw new Error(combinedError);
          }

          await sleep(RUN_ON_V0_RETRY_DELAY_MS * attempt);
        }

        const chatId = data.chatId;
        const chatUrl = data.chatUrl;

        setResults((prev) => ({
          ...prev,
          v0: { toolId: "v0", status: "generating", chatUrl },
        }));

        // Step 2: Poll for completion
        const poll = async () => {
          try {
            const { data: pollData, error: pollError } =
              await supabase.functions.invoke("poll-v0-status", {
                body: { chatId, experimentId },
              });

            if (pollError) {
              console.warn("Poll error:", pollError);
              return;
            }

            if (pollData?.status === "completed") {
              stopPolling("v0");
              setResults((prev) => ({
                ...prev,
                v0: {
                  toolId: "v0",
                  status: "completed",
                  chatUrl: pollData.chatUrl || chatUrl,
                  previewUrl: pollData.previewUrl,
                  generationTimeMs: Date.now() - startTime,
                },
              }));
            } else if (pollData?.status === "error") {
              stopPolling("v0");
              setResults((prev) => ({
                ...prev,
                v0: {
                  toolId: "v0",
                  status: "error",
                  error: pollData.error || "v0 generation failed",
                  chatUrl: pollData.chatUrl || chatUrl,
                },
              }));
            }
          } catch (e) {
            console.warn("Poll exception:", e);
          }
        };

        // Start polling
        pollTimers.current.v0 = window.setInterval(poll, POLL_INTERVAL);

        // Auto-stop after max time
        setTimeout(() => {
          if (pollTimers.current.v0) {
            stopPolling("v0");
            setResults((prev) => {
              if (prev.v0?.status === "generating") {
                return {
                  ...prev,
                  v0: {
                    toolId: "v0",
                    status: "error",
                    error: "Timeout — generowanie trwa zbyt długo. Sprawdź link do chatu.",
                    chatUrl,
                  },
                };
              }
              return prev;
            });
          }
        }, MAX_POLL_TIME);
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
    [stopPolling]
  );

  const runBuilders = useCallback(
    async (prompt: string, experimentId: string | undefined, selectedTools: string[]) => {
      setLoading(true);

      const promises: Promise<void>[] = [];

      if (selectedTools.includes("v0")) {
        promises.push(runOnV0(prompt, experimentId));
      }

      await Promise.allSettled(promises);
      setLoading(false);
    },
    [runOnV0]
  );

  return { results, loading, runBuilders };
}
