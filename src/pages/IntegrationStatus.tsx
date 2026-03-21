import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, ShieldCheck, Clock } from "lucide-react";

type CircuitState = "closed" | "open" | "half_open";

interface IntegrationConfig {
  tool_id: string;
  display_name: string | null;
  enabled: boolean;
  circuit_state: CircuitState;
  last_heartbeat: string | null;
  config_validation_errors: string[] | null;
}

function formatCircuitLabel(s: CircuitState): string {
  return s.replace(/_/g, "-");
}

export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("builder_integration_config")
          .select("tool_id, display_name, enabled, circuit_state, last_heartbeat, config_validation_errors");

        if (cancelled) return;
        if (error) throw error;

        const rows: IntegrationConfig[] = (data ?? []).map((row) => {
          const raw = row as Record<string, unknown>;
          const errRaw = raw.config_validation_errors;
          let validation: string[] | null = null;
          if (Array.isArray(errRaw)) {
            validation = errRaw.filter((e): e is string => typeof e === "string");
          } else if (errRaw != null && typeof errRaw === "object" && !Array.isArray(errRaw)) {
            const j = errRaw as Record<string, unknown>;
            if (Array.isArray(j.errors)) {
              validation = j.errors.filter((e): e is string => typeof e === "string");
            }
          }
          return {
            tool_id: String(raw.tool_id ?? ""),
            display_name: typeof raw.display_name === "string" ? raw.display_name : null,
            enabled: Boolean(raw.enabled),
            circuit_state: (raw.circuit_state as CircuitState) ?? "closed",
            last_heartbeat: typeof raw.last_heartbeat === "string" ? raw.last_heartbeat : null,
            config_validation_errors: validation,
          };
        });
        setIntegrations(rows);
        setFetchError(null);
      } catch (err) {
        console.warn("Integration config load failed:", err);
        if (!cancelled) {
          setFetchError(err instanceof Error ? err.message : "Failed to load integrations");
          setIntegrations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integration Status</h1>
        <p className="text-muted-foreground mt-2">
          Technical broker management and POP ecosystem health.
        </p>
      </div>

      {fetchError ? (
        <p className="text-sm text-destructive" role="alert">
          {fetchError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Integrations Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Builder (Tool ID)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Config Validation</TableHead>
                <TableHead>Circuit Breaker</TableHead>
                <TableHead className="text-right">Last Heartbeat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading ecosystem state...
                  </TableCell>
                </TableRow>
              ) : integrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No integrations configured.
                  </TableCell>
                </TableRow>
              ) : (
                integrations.map((integration) => (
                  <TableRow key={integration.tool_id}>
                    <TableCell className="font-medium">
                      {integration.display_name?.trim() || integration.tool_id}
                      <div className="text-xs text-muted-foreground font-mono">{integration.tool_id}</div>
                    </TableCell>
                    <TableCell>
                      {integration.enabled ? (
                        <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {integration.config_validation_errors && integration.config_validation_errors.length > 0 ? (
                        <div className="flex items-center gap-1.5 cursor-help" title={integration.config_validation_errors.join(", ")}>
                          <ShieldAlert className="w-4 h-4 text-destructive" />
                          <span className="text-sm font-medium text-destructive">{integration.config_validation_errors.length} Error(s)</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-success border-success/30 bg-success/5">Valid</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {integration.circuit_state === "closed" ? (
                          <ShieldCheck className="w-4 h-4 text-success" />
                        ) : integration.circuit_state === "open" ? (
                          <ShieldAlert className="w-4 h-4 text-destructive" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-warning" />
                        )}
                        <span className="capitalize">{formatCircuitLabel(integration.circuit_state)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {integration.last_heartbeat ? (
                        <div className="flex items-center justify-end gap-1.5 text-sm">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{new Date(integration.last_heartbeat).toLocaleTimeString()}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
