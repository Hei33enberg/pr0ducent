import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, ShieldAlert, ShieldCheck, Clock } from "lucide-react";

interface IntegrationConfig {
  tool_id: string;
  name?: string;
  enabled: boolean;
  circuit_state: "open" | "closed" | "half-open";
  last_heartbeat: string | null;
}

export default function IntegrationStatus() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        // Querying the provisional DB view requested by Cursor.
        // We use targeted generic typing mapped internally until migrations run.
        const { data, error } = await supabase
          .from("builder_integration_config" as any)
          .select("tool_id, name, enabled, circuit_state, last_heartbeat");

        if (error) throw error;
        
        if (data && data.length > 0) {
          setIntegrations(data as unknown as IntegrationConfig[]);
        }
      } catch (err) {
        console.warn("Integration config view not ready. Displaying mock data.", err);
        // Fallback to placeholder mock while waiting for MVP DB structure
        setIntegrations([
          { tool_id: "lovable", name: "Lovable", enabled: true, circuit_state: "closed", last_heartbeat: new Date().toISOString() },
          { tool_id: "cursor", name: "Cursor", enabled: true, circuit_state: "closed", last_heartbeat: new Date().toISOString() },
          { tool_id: "v0", name: "Vercel v0", enabled: false, circuit_state: "open", last_heartbeat: null },
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchStatus();
  }, []);

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integration Status</h1>
        <p className="text-muted-foreground mt-2">
          Technical broker management and POP ecosystem health.
        </p>
      </div>

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
                <TableHead>Circuit Breaker</TableHead>
                <TableHead className="text-right">Last Heartbeat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading ecosystem state...
                  </TableCell>
                </TableRow>
              ) : integrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No integrations configured.
                  </TableCell>
                </TableRow>
              ) : (
                integrations.map((integration) => (
                  <TableRow key={integration.tool_id}>
                    <TableCell className="font-medium">
                      {integration.name || integration.tool_id}
                      <div className="text-xs text-muted-foreground font-mono">{integration.tool_id}</div>
                    </TableCell>
                    <TableCell>
                      {integration.enabled ? (
                        <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
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
                        <span className="capitalize">{integration.circuit_state}</span>
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
