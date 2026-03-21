import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface BuilderResult {
  id: string;
  toolId: string;
  status: "pending" | "generating" | "completed" | "error";
  chatUrl?: string;
  previewUrl?: string;
  generationTimeMs?: number;
  error?: string;
  provenance?: string;
  executionMode?: string;
  providerRunId?: string;
}

const POLL_INTERVAL = 3000;
const MAX_POLL_TIME = 120000;
/** Polls builder_results for non-v0 tools (generic_rest / VBP until SSE exists). */
const DB_RESULTS_POLL_KEY = "__db_results__";
const RUN_ON_V0_MAX_RETRIES = 3;
const RUN_ON_V0_RETRY_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isUuid(s: string | undefined): boolean {
  if (!s) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
}

function mapBuilderRow(row: Record<string, unknown>): BuilderResult {
  const st = String(row.status ?? "pending");
  const uiStatus: BuilderResult["status"] =
    st === "completed"
      ? "completed"
      : st === "error"
        ? "error"
        : st === "generating" || st === "dispatched"
          ? "generating"
          : "pending";

  return {
    id: (row.id as string) ?? "",
    toolId: String(row.tool_id),
    status: uiStatus,
    chatUrl: (row.chat_url as string) ?? undefined,
    previewUrl: (row.preview_url as string) ?? undefined,
    generationTimeMs: (row.generation_time_ms as number) ?? undefined,
    error: (row.error_message as string) ?? undefined,
    provenance: (row.provenance as string) ?? undefined,
    executionMode: (row.execution_mode as string) ?? undefined,
    providerRunId: (row.provider_run_id as string) ?? undefined,
  };
}

export function useBuilderApi() {
  const { t } = useTranslation();
  const [results, setResults] = useState<Record<string, BuilderResult>>({});
  const [loading, setLoading] = useState(false);
  const pollTimers = useRef<Record<string, number>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  const stopPolling = useCallback((toolId: string) => {
    if (pollTimers.current[toolId]) {
      clearInterval(pollTimers.current[toolId]);
      delete pollTimers.current[toolId];
    }
  }, []);

  const stopDbResultsPolling = useCallback(() => {
    if (pollTimers.current[DB_RESULTS_POLL_KEY]) {
      clearInterval(pollTimers.current[DB_RESULTS_POLL_KEY]);
      delete pollTimers.current[DB_RESULTS_POLL_KEY];
    }
  }, []);

  const unsubscribeRealtime = useCallback(() => {
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const runOnV0Guest = useCallback(
    async (prompt: string) => {
      setResults((prev) => ({
        ...prev,
        v0: { id: `v0-${Date.now()}`, toolId: "v0", status: "generating", provenance: "live_api", executionMode: "live" },
      }));

      const startTime = Date.now();

      try {
        let data: { success?: boolean; chatId?: string; chatUrl?: string; error?: string; retryable?: boolean } | null =
          null;

        for (let attempt = 1; attempt <= RUN_ON_V0_MAX_RETRIES; attempt++) {
          const { data: attemptData, error: attemptError } = await supabase.functions.invoke("run-on-v0", {
            body: { prompt },
          });

          if (!attemptError && attemptData?.success) {
            data = attemptData;
            break;
          }

          const combinedError = attemptError?.message || attemptData?.error || "v0 API error";
          const retryable =
            attemptData?.retryable === true || /timeout|504|failed to fetch/i.test(combinedError);

          if (!retryable || attempt === RUN_ON_V0_MAX_RETRIES) {
            throw new Error(combinedError);
          }

          await sleep(RUN_ON_V0_RETRY_DELAY_MS * attempt);
        }

        const chatId = data!.chatId!;
        const chatUrl = data!.chatUrl;

        setResults((prev) => ({
          ...prev,
          v0: {
            id: `v0-${Date.now()}`,
            toolId: "v0",
            status: "generating",
            chatUrl,
            providerRunId: chatId,
            provenance: "live_api",
            executionMode: "live",
          },
        }));

        const poll = async () => {
          try {
            const { data: pollData, error: pollError } = await supabase.functions.invoke("poll-v0-status", {
              body: { chatId, experimentId: undefined },
            });

            if (pollError) return;

            if (pollData?.status === "completed") {
              stopPolling("v0");
              setResults((prev) => ({
                ...prev,
                v0: {
                  id: `v0-${Date.now()}`,
                  toolId: "v0",
                  status: "completed",
                  chatUrl: pollData.chatUrl || chatUrl,
                  previewUrl: pollData.previewUrl,
                  generationTimeMs: Date.now() - startTime,
                  provenance: "live_api",
                  executionMode: "live",
                  providerRunId: chatId,
                },
              }));
            } else if (pollData?.status === "error") {
              stopPolling("v0");
              setResults((prev) => ({
                ...prev,
                v0: {
                  id: `v0-${Date.now()}`,
                  toolId: "v0",
                  status: "error",
                  error: pollData.error || t("api.v0Failed"),
                  chatUrl: pollData.chatUrl || chatUrl,
                  provenance: "live_api",
                  executionMode: "live",
                  providerRunId: chatId,
                },
              }));
            }
          } catch {
            /* ignore */
          }
        };

        pollTimers.current.v0 = window.setInterval(poll, POLL_INTERVAL);

        setTimeout(() => {
          if (pollTimers.current.v0) {
            stopPolling("v0");
            setResults((prev) => {
              if (prev.v0?.status === "generating") {
                return {
                  ...prev,
                  v0: {
                    ...prev.v0,
                    id: `v0-${Date.now()}`,
                    toolId: "v0",
                    status: "error",
                    error: t("api.timeoutGenerating"),
                    chatUrl,
                    providerRunId: chatId,
                  },
                };
              }
              return prev;
            });
          }
        }, MAX_POLL_TIME);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t("api.failedWithV0");
        setResults((prev) => ({
          ...prev,
          v0: { id: `v0-${Date.now()}`, toolId: "v0", status: "error", error: message, provenance: "live_api", executionMode: "live" },
        }));
      }
    },
    [stopPolling, t]
  );

  const startDbResultsPolling = useCallback(
    (experimentId: string, toolIds: string[]) => {
      const others = [...new Set(toolIds.filter((id) => id !== "v0"))];
      if (others.length === 0) return;

      stopDbResultsPolling();

      const tick = async () => {
        const { data: rowsBefore } = await supabase
          .from("builder_results")
          .select("*")
          .eq("experiment_id", experimentId)
          .in("tool_id", others);
        if (rowsBefore?.length) {
          for (const row of rowsBefore) {
            const toolId = String(row.tool_id);
            const st = String(row.status ?? "");
            if (
              toolId !== "v0" &&
              (st === "generating" || st === "dispatched" || st === "building")
            ) {
              const { error: pollErr } = await supabase.functions.invoke("poll-builder-status", {
                body: { experimentId, toolId },
              });
              if (pollErr) {
                console.warn("poll-builder-status", toolId, pollErr.message);
              }
            }
          }
        }

        const { data: rows } = await supabase
          .from("builder_results")
          .select("*")
          .eq("experiment_id", experimentId)
          .in("tool_id", others);
        if (!rows?.length) return;
        setResults((prev) => {
          const merged = { ...prev };
          let changed = false;
          for (const row of rows) {
            const br = mapBuilderRow(row as Record<string, unknown>);
            const old = merged[br.toolId];
            if (
              !old ||
              old.status !== br.status ||
              old.previewUrl !== br.previewUrl ||
              old.error !== br.error ||
              old.providerRunId !== br.providerRunId
            ) {
              merged[br.toolId] = br;
              changed = true;
            }
          }
          return changed ? merged : prev;
        });
      };

      pollTimers.current[DB_RESULTS_POLL_KEY] = window.setInterval(tick, POLL_INTERVAL);
      void tick();

      setTimeout(() => {
        stopDbResultsPolling();
      }, MAX_POLL_TIME);
    },
    [stopDbResultsPolling]
  );

  const startV0PollingForExperiment = useCallback(
    (experimentId: string, chatId: string, chatUrl: string | undefined) => {
      stopPolling("v0");
      const startTime = Date.now();

      const poll = async () => {
        try {
          const { data: pollData, error: pollError } = await supabase.functions.invoke("poll-v0-status", {
            body: { chatId, experimentId },
          });

          if (pollError) return;

          if (pollData?.status === "completed") {
            stopPolling("v0");
            setResults((prev) => ({
              ...prev,
              v0: {
                id: `v0-${Date.now()}`,
                toolId: "v0",
                status: "completed",
                chatUrl: pollData.chatUrl || chatUrl,
                previewUrl: pollData.previewUrl,
                generationTimeMs: Date.now() - startTime,
                provenance: "live_api",
                executionMode: "live",
                providerRunId: chatId,
              },
            }));
          } else if (pollData?.status === "error") {
            stopPolling("v0");
            setResults((prev) => ({
              ...prev,
              v0: {
                id: `v0-${Date.now()}`,
                toolId: "v0",
                status: "error",
                error: pollData.error || t("api.v0Failed"),
                chatUrl: pollData.chatUrl || chatUrl,
                provenance: "live_api",
                executionMode: "live",
                providerRunId: chatId,
              },
            }));
          }
        } catch {
          /* ignore */
        }
      };

      pollTimers.current.v0 = window.setInterval(poll, POLL_INTERVAL);

      setTimeout(() => {
        if (pollTimers.current.v0) {
          stopPolling("v0");
          setResults((prev) => {
            if (prev.v0?.status === "generating") {
              return {
                ...prev,
                v0: {
                  ...prev.v0,
                  toolId: "v0",
                  status: "error",
                  error: t("api.timeoutGenerating"),
                  chatUrl,
                  providerRunId: chatId,
                },
              };
            }
            return prev;
          });
        }
      }, MAX_POLL_TIME);
    },
    [stopPolling, t]
  );

  const runBuilders = useCallback(
    async (prompt: string, experimentId: string | undefined, selectedTools: string[]) => {
      unsubscribeRealtime();
      stopDbResultsPolling();
      Object.keys(pollTimers.current).forEach(stopPolling);
      setResults({});

      if (!isUuid(experimentId)) {
        setLoading(true);
        if (selectedTools.includes("v0")) {
          await runOnV0Guest(prompt);
        }
        setLoading(false);
        return;
      }

      setLoading(true);

      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${experimentId}-${Date.now()}`;

      const { data, error } = await supabase.functions.invoke("dispatch-builders", {
        body: { prompt, experimentId, selectedTools, idempotencyKey },
      });

      if (error) {
        toast.error(error.message || "Dispatch failed");
        setLoading(false);
        return;
      }

      if (data?.code === "limit_exceeded") {
        toast.error(data.error || t("guest.limitReached"));
        setLoading(false);
        return;
      }

      if (!data?.ok) {
        toast.error(data?.error || "Dispatch failed");
        setLoading(false);
        return;
      }

      const { data: rows } = await supabase
        .from("builder_results")
        .select("*")
        .eq("experiment_id", experimentId);

      const next: Record<string, BuilderResult> = {};
      (rows || []).forEach((row) => {
        const br = mapBuilderRow(row as Record<string, unknown>);
        next[br.toolId] = br;
      });
      setResults(next);

      const v0Row = next["v0"];
      if (v0Row?.providerRunId && v0Row.status === "generating") {
        startV0PollingForExperiment(experimentId, v0Row.providerRunId, v0Row.chatUrl);
      }

      startDbResultsPolling(experimentId, selectedTools);

      const resultsChannel = supabase
        .channel(`builder_results:${experimentId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "builder_results",
            filter: `experiment_id=eq.${experimentId}`,
          },
          (payload) => {
            const row = (payload.new ?? payload.old) as Record<string, unknown>;
            if (!row?.tool_id) return;
            const br = mapBuilderRow(row);
            setResults((prev) => {
              const merged = { ...prev, [br.toolId]: br };
              if (
                br.toolId === "v0" &&
                br.status === "generating" &&
                br.providerRunId &&
                !pollTimers.current.v0
              ) {
                startV0PollingForExperiment(experimentId, br.providerRunId, br.chatUrl);
              }
              return merged;
            });
          }
        )
        .subscribe();

      channelRef.current = resultsChannel;

      setLoading(false);
    },
    [
      runOnV0Guest,
      startDbResultsPolling,
      startV0PollingForExperiment,
      stopDbResultsPolling,
      stopPolling,
      t,
      unsubscribeRealtime,
    ]
  );

  useEffect(() => {
    return () => {
      unsubscribeRealtime();
      stopDbResultsPolling();
      Object.keys(pollTimers.current).forEach((k) => {
        clearInterval(pollTimers.current[k]);
      });
    };
  }, [stopDbResultsPolling, unsubscribeRealtime]);

  return { results, loading, runBuilders };
}
