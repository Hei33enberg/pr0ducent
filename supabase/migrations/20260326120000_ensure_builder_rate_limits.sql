-- Safety net: builder_try_dispatch_slot (20260325100000) needs builder_rate_limits.
-- Normally created in 20260322120000_vbp_orchestration.sql — this block is idempotent if that migration already ran.

CREATE TABLE IF NOT EXISTS public.builder_rate_limits (
  tool_id TEXT PRIMARY KEY,
  max_concurrent INTEGER NOT NULL DEFAULT 5,
  max_per_minute INTEGER NOT NULL DEFAULT 60,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requests_in_window INTEGER NOT NULL DEFAULT 0,
  active_dispatches INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_rate_limits ENABLE ROW LEVEL SECURITY;

INSERT INTO public.builder_rate_limits (tool_id, max_concurrent, max_per_minute)
VALUES ('v0', 5, 30)
ON CONFLICT (tool_id) DO NOTHING;
