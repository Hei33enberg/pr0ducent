import { useState, useCallback } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { ToolDetailPanel } from "@/components/ToolDetailPanel";
import { ExperimentHistory } from "@/components/ExperimentHistory";
import { createMockExperiment, loadExperiments, saveExperiment } from "@/lib/mock-experiment";
import type { Experiment, AccountModel } from "@/types/experiment";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [pastExperiments, setPastExperiments] = useState<Experiment[]>(loadExperiments);

  const handleSubmit = useCallback(
    (prompt: string, selectedTools: string[], accountModel: AccountModel) => {
      const exp = createMockExperiment(prompt, selectedTools, accountModel);
      saveExperiment(exp);
      setExperiment(exp);
      setPastExperiments(loadExperiments());
    },
    []
  );

  const handleExperimentUpdate = useCallback((updated: Experiment) => {
    setExperiment(updated);
  }, []);

  const handleBack = () => {
    setExperiment(null);
    setPastExperiments(loadExperiments());
  };

  const selectedRun = experiment?.runs.find((r) => r.toolId === selectedToolId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {experiment && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="mr-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Beaker className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground tracking-tight">PromptLab</span>
          </div>
          <div className="text-xs text-muted-foreground">AI Builder Comparison Engine</div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {experiment ? (
          <motion.div
            key="canvas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ComparisonCanvas
              experiment={experiment}
              onExperimentUpdate={handleExperimentUpdate}
              onToolClick={(toolId) => setSelectedToolId(toolId)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <HeroSection onSubmit={handleSubmit} />
            <ExperimentHistory
              experiments={pastExperiments}
              onSelect={(exp) => setExperiment(exp)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ToolDetailPanel
        run={selectedRun}
        open={!!selectedToolId}
        onClose={() => setSelectedToolId(null)}
      />
    </div>
  );
};

export default Index;
