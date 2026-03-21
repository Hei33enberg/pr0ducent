-- Apply replit second builder config (from 20260421120000_replit_second_builder_generic_rest_path.sql)

UPDATE public.builder_integration_config
SET
  tier = 2,
  integration_type = 'rest_api',
  enabled = false,
  execution_modes = ARRAY['live', 'benchmark']::text[],
  display_name = 'Replit',
  capabilities = COALESCE(capabilities, '{}'::jsonb)
    || jsonb_build_object(
      'secondBuilderLane', true,
      'description', 'Placeholder REST path — enable after partner API is wired.'
    ),
  api_base_url = 'https://example.invalid/replit-dispatch-placeholder',
  api_secret_env = 'REPLIT_ORCHESTRATOR_API_KEY',
  auth_type = 'bearer',
  request_template = '{"prompt":"{{prompt}}"}'::jsonb,
  response_id_path = 'id',
  poll_url_template = 'https://example.invalid/replit-status/{{id}}',
  poll_status_path = 'status',
  poll_completed_values = ARRAY['completed', 'done', 'succeeded']::text[],
  poll_failed_values = ARRAY['failed', 'error', 'timeout', 'cancelled']::text[],
  poll_result_paths = '{"preview_url":"previewUrl","chat_url":"url"}'::jsonb,
  polling_function = 'poll-builder-status',
  updated_at = now()
WHERE tool_id = 'replit';

INSERT INTO public.builder_rate_limits (tool_id, max_concurrent, max_per_minute)
VALUES ('replit', 3, 20)
ON CONFLICT (tool_id) DO NOTHING;