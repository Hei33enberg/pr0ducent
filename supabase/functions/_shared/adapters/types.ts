/** Row shape from builder_integration_config (fields used by dispatch). */
export type IntegrationConfigRow = {
  tool_id: string;
  tier: number;
  enabled: boolean;
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
};
