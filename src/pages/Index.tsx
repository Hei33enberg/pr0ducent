import { useState, useCallback, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { ToolDetailPanel } from "@/components/ToolDetailPanel";
import { ExperimentHistory } from "@/components/ExperimentHistory";
import { createMockExperiment } from "@/lib/mock-experiment";
import { createExperimentInDb, loadExperimentsFromDb } from "@/lib/experiment-service";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Experiment, AccountModel } from "@/types/experiment";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, signOut } = useAuth();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [pastExperiments, setPastExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    if (user) {
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (prompt: string, selectedTools: string[], accountModel: AccountModel) => {
      if (!user) return;
      const exp = createMockExperiment(prompt, selectedTools, accountModel);
      await createExperimentInDb(user.id, prompt, selectedTools, accountModel, exp.runs);
      setExperiment(exp);
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    },
    [user]
  );

  const handleExperimentUpdate = useCallback((updated: Experiment) => {
    setExperiment(updated);
  }, []);

  const handleBack = () => {
    setExperiment(null);
    if (user) {
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    }
  };

  const selectedRun = experiment?.runs.find((r) => r.toolId === selectedToolId) ?? null;

  return (
    <div className="min-h-screen bg-background">
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} title="Wyloguj" className="h-8 w-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
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
