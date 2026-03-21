import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Code2, Server, HelpCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-md bg-muted/50 border border-border">
      {title && (
        <div className="px-4 py-2 border-b border-border/50 text-xs font-mono text-muted-foreground flex justify-between items-center bg-muted/20">
          <span>{title}</span>
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </Button>
      <pre className="p-4 text-sm font-mono overflow-x-auto text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DeveloperPortal() {
  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Platform Developer Portal</h1>
        <p className="text-xl text-muted-foreground">
          Vibe-coding Broker Protocol (VBP) and POP Ecosystem Integrations.
        </p>
      </div>

      <Tabs defaultValue="broker" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="broker" className="flex items-center gap-2">
            <Server className="w-4 h-4" /> Broker Quickstart
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Builder Quickstart
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Webhooks & API
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" /> Compatibility FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broker" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deploying the VBP Broker</CardTitle>
              <CardDescription>How to independently orchestrate AI builders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The POP broker orchestrates cross-builder comparisons, handles dynamic API integrations, and secures polling mechanics seamlessly.
              </p>
              <CodeBlock 
                title="1. Clone & Setup"
                code={`git clone https://github.com/Hei33enberg/pr0ducent.git
cd pr0ducent
npm install`} 
              />
              <CodeBlock 
                title="2. Initialize Edge Functions"
                code={`supabase init
supabase start
supabase functions deploy process-task-queue`} 
              />
              <p className="text-sm border-l-2 border-primary pl-3 text-muted-foreground italic mt-4">
                Note: Ensure you have your Supabase config properly linked to allow edge functions to access auth headers.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding as a Builder</CardTitle>
              <CardDescription>Integrate your AI application with the POP Orchestrator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Whether you are a Native POP engine or prefer generic REST integration, you can connect your platform within minutes.
              </p>
              <h3 className="font-semibold mt-4">Required API Contracts</h3>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                <li><strong>/dispatch</strong> (POST) - Receives the task prompt. Returns a Job ID.</li>
                <li><strong>/status/:id</strong> (GET) - Real-time job polling endpoints.</li>
                <li><strong>/webhook</strong> (Optional) - PBP webhook verification completion events.</li>
              </ul>
              <CodeBlock 
                title="Generic REST Dispatch Mapping"
                code={`{
  "task": "Build me a fully functional Todo app",
  "config": {
    "engine": "v0",
    "theme": "dark"
  },
  "callback_url": "https://[broker-url]/functions/v1/pbp-webhook"
}`} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Signatures & Payloads</CardTitle>
              <CardDescription>Detailed verifiable signatures from documentation VBP-SPEC.md</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-sm">Completion Payload Example</h3>
              <CodeBlock 
                title="POST /functions/v1/pbp-webhook"
                code={`{
  "event_type": "build.completed",
  "run_id": "b0a2c3f8-5d12-4ee8-9c4c-21de3a2d",
  "status": "completed",
  "artifacts": {
    "preview_url": "https://builder.dev/preview/123",
    "repo_url": "https://github.com/builder/123",
    "deployment_log": "..."
  },
  "metrics": {
    "duration_ms": 14200,
    "tokens_used": 4500
  }
}`} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compatibility Matrix</CardTitle>
              <CardDescription>Common questions regarding Tier 1 & Tier 2 support.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Q: What is the difference between Native POP and Generic REST?</h4>
                <p className="text-muted-foreground">Native POP includes full 2-way Webhooks with E2EE telemetry syncing natively to our orchestrator. Generic REST relies purely on synchronous polling using the \`poll-builder-status\` fallback adapter.</p>
              </div>
              <div className="h-px w-full bg-border" />
              <div>
                <h4 className="font-semibold mb-1">Q: Do we need to deploy our own Broker?</h4>
                <p className="text-muted-foreground">No. We maintain the global POP Broker, but the SDK and contracts are completely open source if your enterprise requires an isolated self-hosted stack.</p>
              </div>
              <div className="h-px w-full bg-border" />
              <div>
                <h4 className="font-semibold mb-1">Q: How fast is adding a generic REST builder?</h4>
                <p className="text-muted-foreground">Zero deployments needed. A builder can be onboarded in 2 days by updating the \`builder_integration_config\` payload map.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
