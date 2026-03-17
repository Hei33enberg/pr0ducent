import { useState, useCallback, useEffect } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ComparisonCanvas } from "@/components/ComparisonCanvas";
import { ToolDetailPanel } from "@/components/ToolDetailPanel";
import { ExperimentHistory } from "@/components/ExperimentHistory";
import { createMockExperiment, saveExperiment, loadExperiments, deleteLocalExperiment } from "@/lib/mock-experiment";
import { createExperimentInDb, loadExperimentsFromDb, deleteExperimentFromDb } from "@/lib/experiment-service";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Experiment, AccountModel } from "@/types/experiment";
import { motion, AnimatePresence } from "framer-motion";
import { Beaker, ArrowLeft, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [pastExperiments, setPastExperiments] = useState<Experiment[]>([]);

  useEffect(() => {
    if (user) {
      loadExperimentsFromDb(user.id).then(setPastExperiments);
    } else {
      setPastExperiments(loadExperiments());
    }
  }, [user]);

  const handleSubmit = useCallback(
    async (prompt: string, selectedTools: string[], accountModel: AccountModel) => {
      const exp = createMockExperiment(prompt, selectedTools, accountModel);
      // Always save locally so experiment works immediately
      saveExperiment(exp);
      setExperiment(exp);

      // If logged in, also persist to DB
      if (user) {
        await createExperimentInDb(user.id, prompt, selectedTools, accountModel, exp.runs);
        loadExperimentsFromDb(user.id).then(setPastExperiments);
      } else {
        setPastExperiments(loadExperiments());
      }
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
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                <Button variant="ghost" size="icon" onClick={signOut} title="Wyloguj" className="h-8 w-8">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="text-xs h-8">
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Zaloguj się
              </Button>
            )}
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
              onDelete={handleDelete}
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
