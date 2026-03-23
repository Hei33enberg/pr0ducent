import { copy } from "@/lib/copy";
import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { ToolDetailPanel } from "@/components/ToolDetailPanel";
import { GuestLimitModal, isGuestLimitReached, incrementGuestCount } from "@/components/GuestLimitModal";

import { createMockExperiment, saveExperiment, loadExperiments, deleteLocalExperiment } from "@/lib/mock-experiment";
import { createExperimentInDb, loadExperimentsFromDb, deleteExperimentFromDb } from "@/lib/experiment-service";
import { useAuth } from "@/hooks/useAuth";
import { useBuilderApi } from "@/hooks/useBuilderApi";
import { PageFrame } from "@/components/PageFrame";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AmbientBackground from "@/components/AmbientBackground";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext";
import type { Experiment, AccountModel } from "@/types/experiment";
import { toast } from "sonner";

const BuilderComparisonTable = lazy(() =>
  import("@/components/BuilderComparisonTable").then((m) => ({ default: m.BuilderComparisonTable }))
);
const FeatureMatrix = lazy(() =>
  import("@/components/FeatureMatrix").then((m) => ({ default: m.FeatureMatrix }))
);
const PlanComparisonTable = lazy(() =>
  import("@/components/PlanComparisonTable").then((m) => ({ default: m.PlanComparisonTable }))
);
const HomepageBlogSection = lazy(() =>
  import("@/components/HomepageBlogSection").then((m) => ({ default: m.HomepageBlogSection }))
);
const InlineCalculator = lazy(() =>
  import("@/components/InlineCalculator").then((m) => ({ default: m.InlineCalculator }))
);
const FAQ = lazy(() => import("@/components/FAQ").then((m) => ({ default: m.FAQ })));
const ExperimentHistory = lazy(() =>
  import("@/components/ExperimentHistory").then((m) => ({ default: m.ExperimentHistory }))
);
const Footer = lazy(() => import("@/components/Footer").then((m) => ({ default: m.Footer })));

function SectionFallback() {
  return (
    <div className="min-h-[120px] w-full flex items-center justify-center px-4" aria-busy="true">
      <div
        className="h-8 w-8 rounded-full border-2 border-muted-foreground/25 border-t-muted-foreground/60 animate-spin"
        aria-hidden
      />
    </div>
  );
}

const Index = () => {
  const { user } = useAuth();
  const { results: builderResults, runBuilders } = useBuilderApi();
  const { tools } = useBuilderCatalog();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [pastExperiments, setPastExperiments] = useState<Experiment[]>([]);
  const [showGuestLimit, setShowGuestLimit] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>(
    tools.filter((t) => t.featured).map((t) => t.id)
  );
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    } else {
      setPastExperiments(loadExperiments());
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (prompt: string, selectedTools: string[], accountModel: AccountModel, useCaseTags?: string[]) => {
      if (!user && isGuestLimitReached()) {
        setShowGuestLimit(true);
        return;
      }
      const exp = createMockExperiment(prompt, selectedTools, accountModel);
      exp.useCaseTags = useCaseTags;
      saveExperiment(exp);
      setExperiment(exp);
      if (!user) incrementGuestCount();

      let dbId: string | undefined;
      if (user) {
        dbId = await createExperimentInDb(user.id, prompt, selectedTools, accountModel, exp.runs, useCaseTags) || undefined;
        if (!dbId) {
          toast.error(copy["experiment.createFailed"]);
          return;
        }
        const synced = { ...exp, id: dbId };
        setExperiment(synced);
        saveExperiment(synced);
        loadExperimentsFromDb(user.id).then(setPastExperiments);
      } else {
        setPastExperiments(loadExperiments());
      }
      runBuilders(prompt, dbId, selectedTools);
    },
    [user, runBuilders]
  );

  const handleExperimentUpdate = useCallback((updated: Experiment) => {
    setExperiment(updated);
    saveExperiment(updated);
  }, []);

  const handleBack = () => {
    setExperiment(null);
    if (user) {
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    } else {
      setPastExperiments(loadExperiments());
    }
  };

  const handleDelete = useCallback(async (expId: string) => {
    if (user) {
      await deleteExperimentFromDb(expId);
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    } else {
      deleteLocalExperiment(expId);
      setPastExperiments(loadExperiments());
    }
  }, [user]);

  const handleVisibilityChange = (isPublic: boolean) => {
    if (experiment) setExperiment({ ...experiment, isPublic });
  };

  const selectedRun = experiment?.runs.find((r) => r.toolId === selectedToolId) ?? null;

  return (
    <div className="min-h-screen">
      <AmbientBackground />

      <PageFrame
        experiment={experiment}
        onBack={handleBack}
        onVisibilityChange={handleVisibilityChange}
      >
        {experiment ? (
          <div>
            <ComparisonCanvas
              experiment={experiment}
              onExperimentUpdate={handleExperimentUpdate}
              onToolClick={(toolId) => setSelectedToolId(toolId)}
              builderResults={builderResults}
            />
          </div>
        ) : (
          <div>
            <HeroSection
              onSubmit={handleSubmit}
              selectedTools={selectedTools}
              onSelectedToolsChange={setSelectedTools}
              heroRef={heroRef}
            />

            <div className="parity-section-sep" aria-hidden="true" />

            {user ? (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-2">
                <Alert className="border-border/60 bg-muted/30">
                  <AlertDescription className="text-sm text-muted-foreground">
                    {copy["help.orchestrationSignedIn"]}
                  </AlertDescription>
                </Alert>
              </div>
            ) : null}

            <div className="section-gradient-peach min-w-0">
              <Suspense fallback={<SectionFallback />}>
                <BuilderComparisonTable
                  onSelectTool={(toolId) => {
                    setSelectedTools([toolId]);
                    heroRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              </Suspense>
            </div>

            <div className="section-wash-blush min-w-0">
              <Suspense fallback={<SectionFallback />}>
                <FeatureMatrix />
              </Suspense>
            </div>

            <div className="section-wash-indigo min-w-0">
              <Suspense fallback={<SectionFallback />}>
                <PlanComparisonTable />
              </Suspense>
            </div>

            <div className="section-wash-gold min-w-0">
              <Suspense fallback={<SectionFallback />}>
                <InlineCalculator />
              </Suspense>
            </div>

            <Suspense fallback={<SectionFallback />}>
              <FAQ />
            </Suspense>

            <div className="section-wash-teal min-w-0">
              <Suspense fallback={<SectionFallback />}>
                <HomepageBlogSection />
              </Suspense>
            </div>

            {pastExperiments.length > 0 ? (
              <div className="section-gradient-lavender min-w-0">
                <Suspense fallback={<SectionFallback />}>
                  <ExperimentHistory
                    experiments={pastExperiments}
                    onSelect={(exp) => setExperiment(exp)}
                    onDelete={handleDelete}
                  />
                </Suspense>
              </div>
            ) : null}

            <Suspense fallback={<SectionFallback />}>
              <Footer />
            </Suspense>
          </div>
        )}
      </PageFrame>

      <ToolDetailPanel
        run={selectedRun}
        open={!!selectedToolId}
        onClose={() => setSelectedToolId(null)}
      />

      <GuestLimitModal open={showGuestLimit} onClose={() => setShowGuestLimit(false)} />
      
    </div>
  );
};

export default Index;
