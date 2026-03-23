-- Template: second builder (do NOT run blindly on production).
-- Adjust tool_id, URLs, Edge secrets; then smoke per docs/PM-RUN-CHECKLIST.md.
--
-- 1) Integration row (example: generic_rest — needs a working builder API)
/*
INSERT INTO public.builder_integration_config (
  tool_id,
  enabled,
  tier,
  integration_type,
  api_base_url,
  api_secret_env,
  request_template,
  response_id_path,
  poll_url_template,
  poll_status_path,
  poll_completed_values,
  poll_result_paths
) VALUES (
  'example_tool',
  false,
  2,
  'rest_api',
  'https://api.example-builder.com/v1',
  'EXAMPLE_BUILDER_API_KEY',
  '{"method":"POST","url":"/generations","body":{"prompt":"{{prompt}}"}}'::jsonb,
  'data.id',
  'https://api.example-builder.com/v1/generations/{{id}}',
  'data.status',
  ARRAY['completed','failed'],
  '{"preview_url":"data.previewUrl","chat_url":"data.url"}'::jsonb
)
ON CONFLICT (tool_id) DO NOTHING;
*/

-- 2) Queue limits for this tool_id
/*
INSERT INTO public.builder_rate_limits (tool_id, max_concurrent, max_per_minute)
VALUES ('example_tool', 3, 20)
ON CONFLICT (tool_id) DO NOTHING;
*/

-- 3) In Supabase Edge Secrets add the variable named in api_secret_env (e.g. EXAMPLE_BUILDER_API_KEY).

-- For VBP instead of the above: integration_type = 'vbp', api_base_url = https://builder.../vbp/v1, VBP_* secrets — see docs/SECOND-BUILDER-PLAYBOOK.md
