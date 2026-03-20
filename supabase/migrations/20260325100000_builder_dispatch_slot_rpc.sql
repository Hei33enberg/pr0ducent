-- Atomic per-tool rate window + inflight cap before dispatch (see process-task-queue).

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
