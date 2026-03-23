import { useState, useEffect } from "react";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Footer } from "@/components/Footer";
import AmbientBackground from "@/components/AmbientBackground";
import { PairwiseArena } from "@/components/PairwiseArena";
import { usePublicExperiments } from "@/hooks/usePublicExperiments";
import { Loader2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function ArenaPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { experiments, loading } = usePublicExperiments(20);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  
  const generateMockMatch = () => {
    if (experiments.length === 0) return null;
    const exp = experiments[Math.floor(Math.random() * experiments.length)];
    const tools = ["lovable", "v0", "replit", "build0"];
    const tA = tools[Math.floor(Math.random() * tools.length)];
    const tbTools = tools.filter(t => t !== tA);
    const tB = tbTools[Math.floor(Math.random() * tbTools.length)];
    return {
      experimentId: exp.id,
      prompt: exp.prompt || "Build a dashboard application",
      resultA: { id: "mock1", tool_id: tA, preview_url: "https://demo.lovable.dev/app/dashboard" },
      resultB: { id: "mock2", tool_id: tB, preview_url: "https://v0.dev/chat/dashboard" }
    };
  };

  useEffect(() => {
    if (!loading && experiments.length > 0 && !currentMatch) {
      setCurrentMatch(generateMockMatch());
    }
  }, [loading, experiments, currentMatch]);

  return (
    <div className="min-h-screen">
      <AmbientBackground />
      <PageFrame experiment={null} onBack={() => navigate("/")} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <PageBreadcrumb crumbs={[{ label: "Arena" }]} />
          
          <header className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-muted-foreground font-sans mb-3">
              {t("arena.eyebrow")}
            </p>
            <h1
              className="font-serif font-bold tracking-[-0.02em] leading-[1.05] mb-4"
              style={{ fontSize: "clamp(2.75rem, 5vw + 0.75rem, 5rem)" }}
            >
              {t("arena.title")}
            </h1>
            <p className="text-muted-foreground font-sans text-sm md:text-base">
              {t("arena.subtitle")}
            </p>
          </header>

          {!currentMatch ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-card border border-border/50 rounded-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <div className="text-muted-foreground text-sm font-sans">Finding a match...</div>
            </div>
          ) : (
            <div className="section-gradient-rose rounded-2xl p-4 sm:p-6 bg-card border border-border/60 shadow-sm">
              <PairwiseArena 
                experimentId={currentMatch.experimentId}
                prompt={currentMatch.prompt}
                resultA={currentMatch.resultA}
                resultB={currentMatch.resultB}
                onNextPair={() => setCurrentMatch(generateMockMatch())}
              />
            </div>
          )}
          
          <div className="mt-12 text-center flex justify-center">
             <Button variant="ghost" onClick={() => window.location.href = "/leaderboard"} className="text-muted-foreground hover:text-foreground">
               <Trophy className="w-4 h-4 mr-2" /> View Leaderboard
             </Button>
          </div>
        </div>
        <Footer />
      </PageFrame>
    </div>
  );
}
