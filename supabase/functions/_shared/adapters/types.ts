/** Row shape from builder_integration_config (fields used by dispatch + VBP). */
export type IntegrationConfigRow = {
  tool_id: string;
  tier: number;
  enabled: boolean;
  integration_type?: string | null;
  api_base_url?: string | null;
  auth_type?: string | null;
  request_template?: Record<string, unknown> | null;
  response_id_path?: string | null;
  poll_url_template?: string | null;
  poll_status_path?: string | null;
  poll_completed_values?: string[] | null;
  poll_failed_values?: string[] | null;
  poll_result_paths?: Record<string, unknown> | null;
  phantom_ttl_hours?: number | null;
  circuit_state?: string | null;
  circuit_opened_at?: string | null;
  consecutive_failures?: number | null;
  api_secret_env?: string | null;
  execution_modes?: string[] | null;
  capabilities?: Record<string, unknown> | null;
  polling_function?: string | null;
};

/** One entry in the HTTP response `dispatched` array (front + useBuilderApi). */
export type DispatchedEntry = {
  toolId: string;
  tier: number;
  status: string;
  error?: string;
};

import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/** Service-role client (DB schema not wired in Edge shared types). */
export type ServiceSupabase = SupabaseClient;

/** Context passed to each adapter dispatch (service-role client). */
export type AdapterDispatchContext = {
  admin: ServiceSupabase;
  experimentId: string;
  runJobId: string;
  traceId: string;
  prompt: string;
  toolId: string;
  runTaskId: string;
  config: IntegrationConfigRow | undefined;
  /** User BYOA key from Vault; when set, adapters prefer this over platform env (broker mode). */
  byoaApiKeyOverride?: string;
};
