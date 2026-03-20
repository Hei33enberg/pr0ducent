/**
 * Universal builder orchestration — adapter contract, events, and task states.
 * Aligned with docs/plan: Tier 1 API, Tier 2 browser, Tier 3 MCP, Tier 4 manual/benchmark.
 */

export type IntegrationTier = 1 | 2 | 3 | 4;

export type ExecutionMode = "live" | "benchmark" | "hybrid";

export type RunTaskProvenance = "live_api" | "browser_bridge" | "mcp" | "benchmark" | "queued_manual";

export type RunTaskStatus =
  | "pending"
  | "queued"
  | "dispatched"
  | "generating"
  | "completed"
  | "error"
  | "benchmark"
  | "cancelled";

/** Append-only orchestrator events (mirrors public.run_events.event_type). */
export type RunEventType =
  | "orchestrator.job_received"
  | "orchestrator.job_rejected"
  | "orchestrator.credit_charged"
  | "orchestrator.dispatched"
  | "orchestrator.v0_started"
  | "orchestrator.v0_error"
  | "orchestrator.benchmark_skipped"
  | "builder.poll_completed"
  | "builder.poll_error"
  | "score.baseline_attached";

export interface AdapterCapabilities {
  livePreview?: boolean;
  files?: boolean;
  deployLink?: boolean;
  logs?: boolean;
  estimatedCost?: boolean;
}

/** Contract each builder adapter implements (workers / edge handlers). */
export interface BuilderAdapterContext {
  experimentId: string;
  toolId: string;
  userId: string;
  prompt: string;
  traceId: string;
  tier: IntegrationTier;
  executionMode: ExecutionMode;
}

export interface BuilderAdapter {
  readonly toolId: string;
  readonly tier: IntegrationTier;
  capabilities(): AdapterCapabilities;
  prepare(ctx: BuilderAdapterContext): Promise<void>;
  start(ctx: BuilderAdapterContext): Promise<{ providerRunId?: string; chatUrl?: string }>;
  collectArtifacts(ctx: BuilderAdapterContext): Promise<{
    previewUrl?: string;
    files?: unknown[];
  }>;
  handoff(ctx: BuilderAdapterContext): Promise<{ referralUrl?: string; label?: string }>;
}

export interface DispatchBuildersRequest {
  prompt: string;
  experimentId: string;
  selectedTools: string[];
  idempotencyKey?: string;
}

export interface DispatchBuildersResponse {
  ok: boolean;
  experimentId: string;
  dispatched: { toolId: string; tier: number; status: string; error?: string }[];
  traceId: string;
  runJobId?: string;
  idempotentReplay?: boolean;
  error?: string;
  code?: string;
}
