import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Code2, Shield, ExternalLink, HelpCircle, Copy, Check, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { useNavigate } from "react-router-dom";

/** Public OSS bundle (standalone repo when published). Fallback: monorepo path. */
const PROTOCOL_REPO_URL =
  (import.meta.env.VITE_VBP_PROTOCOL_URL as string | undefined)?.trim() ||
  "https://github.com/Hei33enberg/pr0ducent/tree/main/protocol/vibecoding-broker-protocol";

const POP_INDEX_DOC_URL =
  "https://github.com/Hei33enberg/pr0ducent/blob/main/docs/POP-INDEX.md";

const POP_MESSAGING_DOC_URL =
  "https://github.com/Hei33enberg/pr0ducent/blob/main/docs/POP-PUBLIC-MESSAGING.md";

const POP_OSS_SCOPE_DOC_URL =
  "https://github.com/Hei33enberg/pr0ducent/blob/main/docs/POP-OSS-SCOPE.md";

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
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner max-w-5xl space-y-8">
          <PageBreadcrumb crumbs={[{ label: "Docs" }]} />
          <div>
            <h1
              className="font-serif font-bold tracking-[-0.02em] leading-[1.1] text-foreground mb-3"
              style={{ fontSize: "clamp(2.2rem, 4vw + 0.8rem, 4.5rem)" }}
            >
              Builder &amp; partner docs
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-sans max-w-2xl">
              Integrations use the <strong className="text-foreground">Vibecoding Broker Protocol (VBP)</strong>: a small HTTP surface
              (dispatch, status or webhooks, optional SSE) so your users can compare runs and hand off to your product. The hosted pr0ducent
              app is the broker that orchestrates runs against your VBP base URL.
            </p>
            <p className="text-sm text-muted-foreground font-sans max-w-2xl mt-3">
              Full documentation index (Markdown):{" "}
              <a
                href={POP_INDEX_DOC_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
              >
                docs/POP-INDEX.md (VBP index) on GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="section-wash-teal rounded-xl p-4">
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8 h-auto sm:h-10">
                <TabsTrigger value="builder" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                  <Terminal className="w-4 h-4 shrink-0" /> Builder quickstart
                </TabsTrigger>
                <TabsTrigger value="pilot" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                  <Shield className="w-4 h-4 shrink-0" /> Pilot &amp; security
                </TabsTrigger>
                <TabsTrigger value="handoff" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                  <HelpCircle className="w-4 h-4 shrink-0" /> Claim &amp; compatibility
                </TabsTrigger>
                <TabsTrigger value="open" className="flex items-center gap-2 text-xs sm:text-sm py-2">
                  <BookOpen className="w-4 h-4 shrink-0" /> Open protocol
                </TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Minimum integration (VBP)</CardTitle>
                    <CardDescription>What to implement so pr0ducent can orchestrate a run and show results.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      You expose a base URL (for example <code className="text-xs">/vbp/v1</code>). The broker calls{" "}
                      <strong>POST /dispatch</strong> with the prompt and a <code className="text-xs">webhook_url</code> pointing at our
                      receiver (unless you only use polling or SSE per spec). You return <code className="text-xs">202</code> and{" "}
                      <code className="text-xs">provider_run_id</code>. Completion is signaled via{" "}
                      <strong>GET /status/&#123;id&#125;</strong> and/or signed POSTs to the webhook.
                    </p>
                    <h3 className="font-semibold text-sm">Endpoints (normative detail: VBP-SPEC in the repo)</h3>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong>POST …/dispatch</strong> — start run; broker sends <code className="text-xs">run_id</code> (our task id).
                      </li>
                      <li>
                        <strong>GET …/status/&#123;provider_run_id&#125;</strong> — poll fallback when webhooks or SSE are not enough.
                      </li>
                      <li>
                        <strong>Webhook to broker</strong> — POST JSON to our <code className="text-xs">pbp-webhook</code> Edge function; sign
                        with HMAC when agreed (see Pilot &amp; security).
                      </li>
                    </ul>
                    <CodeBlock
                      title="Dispatch body (illustrative)"
                      code={`{\n  "broker_id": "pr0ducent",\n  "run_id": "<uuid run_task_id>",\n  "prompt": "…",\n  "webhook_url": "https://<project>.supabase.co/functions/v1/pbp-webhook",\n  "user_context": { "experiment_id": "<uuid>" }\n}`}
                    />
                    <p className="text-xs text-muted-foreground border-l-2 border-primary/50 pl-3">
                      Generic REST-only mappings (no full VBP) are configured per tool in our database; they are slower to evolve than
                      implementing VBP. Prefer VBP for a stable partner surface.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pilot" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pilot &amp; security</CardTitle>
                    <CardDescription>Two-week pilot, signed webhooks, and limits.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong>Webhook signing:</strong> HMAC-SHA256 over the raw JSON body; header{" "}
                        <code className="text-xs">X-VBP-Signature</code> (aliases accepted). We verify when{" "}
                        <code className="text-xs">VBP_WEBHOOK_SECRET</code> is set; production should require it.
                      </li>
                      <li>
                        <strong>Idempotency:</strong> duplicate identical webhook bodies are deduplicated after successful parse.
                      </li>
                      <li>
                        <strong>Rate limits:</strong> agreed per partner; broker enforces windows and circuit breaker in config.
                      </li>
                      <li>
                        <strong>Pilot:</strong> staging partner key, one smoke run dispatch → terminal status, conformance check.
                      </li>
                    </ul>
                    <CodeBlock
                      title="Example completion webhook payload"
                      code={`{\n  "event_type": "completed",\n  "experiment_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",\n  "tool_id": "your_tool_id",\n  "preview_url": "https://your-builder.example/preview/123",\n  "trace_id": "optional-correlation-id"\n}`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lifecycle keywords are normalized from <code className="text-xs">event</code>, <code className="text-xs">type</code>,{" "}
                      <code className="text-xs">event_type</code>, or <code className="text-xs">status</code>. See{" "}
                      <code className="text-xs">docs/WEBHOOK-PAYLOAD-CONTRACT.md</code> in the repo.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="handoff" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User accounts &amp; claim</CardTitle>
                    <CardDescription>Multi-builder demos and handoff to your product.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      Each builder platform normally has its <strong>own</strong> user account. A user comparing several builders may need
                      several handoffs. VBP supports a <code className="text-xs">claim_token</code> (and optional claim URL) so a demo run can
                      upgrade to a real account on your side; attribute referrals with <code className="text-xs">ref</code> / UTM as you
                      agree commercially.
                    </p>
                    <p>
                      In the app we log handoff-related events for attribution (e.g. referral clicks and conversions). Exact commercial
                      settlement is agreed in the partner program — see <code className="text-xs">docs/POP-COMMERCIAL-MODELS.md</code>.
                    </p>
                    <div className="h-px w-full bg-border" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">VBP vs generic REST</h4>
                      <p>
                        <strong>VBP</strong> gives one documented contract (dispatch, status, webhooks, optional SSE).{" "}
                        <strong>Generic REST</strong> uses per-tool JSON path mapping and polling only — fine for experiments, but higher
                        maintenance for both sides.
                      </p>
                    </div>
                    <div className="h-px w-full bg-border" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Self-hosting the broker</h4>
                      <p>
                        The reference app is open on GitHub; enterprises can run their own stack. Most partners integrate against the hosted
                        pr0ducent broker and the public VBP bundle — no need to deploy the full product to try a pilot.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="open" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Open protocol (OSS)</CardTitle>
                    <CardDescription>Spec, schemas, validator, and quickstart for builders and contributors.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      We publish the <strong>VBP</strong> bundle (OpenAPI, JSON Schema, validator, minimal Node example) so integrations stay
                      inspectable and community-driven. Application orchestration, billing, and high-risk bridge automation stay in the main
                      product — see the scope doc on GitHub.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 text-xs">
                      <a
                        href={POP_OSS_SCOPE_DOC_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        OSS scope (POP-OSS-SCOPE.md) <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-muted-foreground hidden sm:inline">·</span>
                      <a
                        href={POP_MESSAGING_DOC_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 inline-flex items-center gap-1"
                      >
                        Bridge &amp; ToS messaging <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="default" asChild>
                        <a href={PROTOCOL_REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                          Protocol repo <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href={POP_INDEX_DOC_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                          VBP documentation index <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs">
                      Set <code className="text-xs">VITE_VBP_PROTOCOL_URL</code> in hosting to point the primary button at your published
                      standalone protocol repo when it exists.
                    </p>
                    <CodeBlock
                      title="Validate a builder base URL (local)"
                      code={`cd protocol/vibecoding-broker-protocol/validator\nnpm install\nnode cli.mjs https://your-builder.example.com/vbp/v1`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Footer />
      </PageFrame>
    </div>
  );
}
