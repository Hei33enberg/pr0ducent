import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { ToolDetailPanel } from "@/components/ToolDetailPanel";
import { RunComments } from "@/components/RunComments";
import { BuilderRatingStars } from "@/components/BuilderRatingStars";
import { ShareButton } from "@/components/ShareButton";
import { useTranslation } from "@/lib/i18n";
import type { Experiment, ExperimentRun, EditorialScores, AccountModel } from "@/types/experiment";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUILDER_TOOLS } from "@/config/tools";

export default function PublicExperiment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const { data: exp, error: expErr } = await supabase
        .from("experiments")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .maybeSingle();

      if (expErr || !exp) {
        setError(t("public.notFound"));
        setLoading(false);
        return;
      }

      const { data: runs } = await supabase
        .from("experiment_runs")
        .select("*")
        .eq("experiment_id", exp.id);

      const mappedRuns: ExperimentRun[] = (runs || []).map((r) => ({
        toolId: r.tool_id,
        status: r.status as ExperimentRun["status"],
        startedAt: new Date(r.started_at).getTime(),
        completedAt: r.completed_at ? new Date(r.completed_at).getTime() : undefined,
        timeToFirstPrototype: r.time_to_prototype ?? undefined,
        description: r.description,
        scores: r.scores as unknown as EditorialScores,
        pros: r.pros as unknown as string[],
        cons: r.cons as unknown as string[],
      }));

      setExperiment({
        id: exp.id,
        prompt: exp.prompt,
        selectedTools: exp.selected_tools,
        accountModel: exp.account_model as AccountModel,
        createdAt: new Date(exp.created_at).getTime(),
        runs: mappedRuns,
        useCaseTags: (exp as any).use_case_tags || [],
        isPublic: (exp as any).is_public ?? false,
      });
      setLoading(false);
    }

    load();
  }, [id]);

  const selectedRun = experiment?.runs.find((r) => r.toolId === selectedToolId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="mr-1">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} className="no-underline">
              <span className="font-serif font-bold tracking-tight leading-none text-foreground" style={{ fontSize: "1.3rem" }}>
                pr<span style={{ fontSize: "1.6em", fontWeight: 800, lineHeight: 0.8, letterSpacing: "-0.02em" }}>0</span>ducent<span style={{ fontSize: "0.4em", fontWeight: 600, verticalAlign: "super", marginLeft: "0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>™</span>
              </span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-sans">{t("public.sharedExperiment")}</span>
            {experiment && <ShareButton experimentId={experiment.id} />}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-muted-foreground font-sans">{error}</p>
          <Button variant="outline" onClick={() => navigate("/")}>{t("public.backHome")}</Button>
        </div>
      ) : experiment ? (
        <>
          <ComparisonCanvas
            experiment={experiment}
            onExperimentUpdate={() => {}}
            onToolClick={(toolId) => setSelectedToolId(toolId)}
          />

          {/* Social layer: Ratings + Comments */}
          <section className="max-w-6xl mx-auto px-4 pb-12 space-y-8">
            {/* Rate builders */}
            <div className="border-t border-border pt-8">
              <h2 className="text-lg font-serif font-bold mb-4">Rate the builders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {experiment.selectedTools.map((toolId) => {
                  const tool = BUILDER_TOOLS.find((t) => t.id === toolId);
                  if (!tool) return null;
                  return (
                    <div key={toolId} className="bg-card border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {tool.logoUrl ? (
                            <img src={tool.logoUrl} alt={tool.name} className="w-4 h-4 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground">{tool.name[0]}</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{tool.name}</span>
                      </div>
                      <BuilderRatingStars toolId={toolId} experimentId={experiment.id} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="border-t border-border pt-8">
              <RunComments experimentId={experiment.id} />
            </div>
          </section>

          <ToolDetailPanel
            run={selectedRun}
            open={!!selectedToolId}
            onClose={() => setSelectedToolId(null)}
          />
        </>
      ) : null}
    </div>
  );
}
