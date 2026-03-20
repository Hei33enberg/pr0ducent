
-- builder_rate_limits table (required by builder_try_dispatch_slot RPC)
CREATE TABLE IF NOT EXISTS public.builder_rate_limits (
  tool_id text PRIMARY KEY,
  max_concurrent integer NOT NULL DEFAULT 5,
  max_per_minute integer NOT NULL DEFAULT 10,
  requests_in_window integer NOT NULL DEFAULT 0,
  window_started_at timestamp with time zone NOT NULL DEFAULT now(),
  circuit_state text NOT NULL DEFAULT 'closed',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.builder_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits"
  ON public.builder_rate_limits FOR ALL TO service_role USING (true) WITH CHECK (true);

-- builder_try_dispatch_slot RPC
CREATE OR REPLACE FUNCTION public.builder_try_dispatch_slot(p_tool_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lim public.builder_rate_limits%ROWTYPE;
  inflight int;
BEGIN
  SELECT * INTO lim FROM public.builder_rate_limits WHERE tool_id = p_tool_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;

  SELECT count(*)::int INTO inflight
  FROM public.run_tasks
  WHERE tool_id = p_tool_id
    AND status IN ('dispatched', 'building', 'artifact_ready');

  IF inflight >= lim.max_concurrent THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'max_concurrent');
  END IF;

  IF lim.window_started_at < now() - interval '1 minute' THEN
    UPDATE public.builder_rate_limits
    SET window_started_at = now(),
        requests_in_window = 0,
        updated_at = now()
    WHERE tool_id = p_tool_id;
    lim.requests_in_window := 0;
    lim.window_started_at := now();
  END IF;

  IF lim.requests_in_window >= lim.max_per_minute THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'max_per_minute');
  END IF;

  UPDATE public.builder_rate_limits
  SET requests_in_window = public.builder_rate_limits.requests_in_window + 1,
      updated_at = now()
  WHERE tool_id = p_tool_id;

  RETURN jsonb_build_object('allowed', true);
END;
$$;

REVOKE ALL ON FUNCTION public.builder_try_dispatch_slot(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.builder_try_dispatch_slot(text) TO service_role;
