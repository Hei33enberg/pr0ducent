import { useState, useCallback, useEffect, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { BuilderComparisonTable } from "@/components/BuilderComparisonTable";
import { ToolDetailPanel } from "@/components/ToolDetailPanel";
import { ExperimentHistory } from "@/components/ExperimentHistory";
import { GuestLimitModal, isGuestLimitReached, incrementGuestCount } from "@/components/GuestLimitModal";
import { HowItWorks } from "@/components/HowItWorks";
import { FeatureMatrix } from "@/components/FeatureMatrix";
import { PlanComparisonTable } from "@/components/PlanComparisonTable";

import { HomepageBlogSection } from "@/components/HomepageBlogSection";
import { InlineCalculator } from "@/components/InlineCalculator";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import BigHeadline from "@/components/BigHeadline";

import { createMockExperiment, saveExperiment, loadExperiments, deleteLocalExperiment } from "@/lib/mock-experiment";
import { createExperimentInDb, loadExperimentsFromDb, deleteExperimentFromDb } from "@/lib/experiment-service";
import { useAuth } from "@/hooks/useAuth";
import { useBuilderApi } from "@/hooks/useBuilderApi";
import { PageFrame } from "@/components/PageFrame";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/lib/i18n";
import AmbientBackground from "@/components/AmbientBackground";
import { useBuilderCatalog } from "@/contexts/BuilderCatalogContext";
import type { Experiment, AccountModel } from "@/types/experiment";
import { AnimatePresence, motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
        if (dbId) {
          const synced = { ...exp, id: dbId };
          setExperiment(synced);
          saveExperiment(synced);
        }
        loadExperimentsFromDb(user.id).then(setPastExperiments);
      } else {
        setPastExperiments(loadExperiments());
      }
      runBuilders(prompt, dbId, selectedTools);
    },
    [user]
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

            {user ? (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 pb-2">
                <Alert className="border-border/60 bg-muted/30">
                  <AlertDescription className="text-sm text-muted-foreground">
                    {t("help.orchestrationSignedIn")}
                  </AlertDescription>
                </Alert>
              </div>
            ) : null}
            
            

            

            <div className="section-gradient-peach">
              <BuilderComparisonTable
                onSelectTool={(toolId) => {
                  setSelectedTools([toolId]);
                  heroRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            <div className="section-wash-blush">
              <FeatureMatrix />
            </div>

            <div className="section-wash-indigo">
              <PlanComparisonTable />
            </div>

            

            <div className="section-wash-gold">
              <InlineCalculator />
            </div>

            <FAQ />

            <div className="section-wash-teal">
              <HomepageBlogSection />
            </div>

            <div className="section-gradient-lavender">
              <ExperimentHistory
                experiments={pastExperiments}
                onSelect={(exp) => setExperiment(exp)}
                onDelete={handleDelete}
              />
            </div>

            <Footer />
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
