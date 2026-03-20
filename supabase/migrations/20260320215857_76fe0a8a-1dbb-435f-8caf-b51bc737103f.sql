INSERT INTO public.builder_rate_limits (tool_id, max_concurrent, max_per_minute)
VALUES ('v0', 5, 20)
ON CONFLICT (tool_id) DO NOTHING;