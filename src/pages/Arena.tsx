import { useState, useEffect } from "react";
import { PageFrame } from "@/components/PageFrame";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import AmbientBackground from "@/components/AmbientBackground";
import { PairwiseArena } from "@/components/PairwiseArena";
import { usePublicExperiments } from "@/hooks/usePublicExperiments";
import { Loader2, Swords, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ArenaPage() {
  const { experiments, loading } = usePublicExperiments(20);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  
  // Mock data generator for the arena since real DB might not have enough paired results yet
  const generateMockMatch = () => {
    if (experiments.length === 0) return null;
    const exp = experiments[Math.floor(Math.random() * experiments.length)];
    
    // Create two mock results
    const tools = ["lovable", "v0", "replit", "build0"];
    const tA = tools[Math.floor(Math.random() * tools.length)];
    const tbTools = tools.filter(t => t !== tA);
    const tB = tbTools[Math.floor(Math.random() * tbTools.length)];
    
    return {
      experimentId: exp.id,
      prompt: exp.prompt || "Build a dashboard application",
      resultA: {
        id: "mock1",
        tool_id: tA,
        preview_url: "https://demo.lovable.dev/app/dashboard"
      },
      resultB: {
        id: "mock2",
        tool_id: tB,
        preview_url: "https://v0.dev/chat/dashboard"
      }
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
      <PageFrame experiment={null} onBack={() => {}} onVisibilityChange={() => {}}>
        <div className="page-inner">
          <PageBreadcrumb crumbs={[{ label: "Arena" }]} />
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4 flex justify-center items-center gap-3">
              <Swords className="w-8 h-8 md:w-12 md:h-12 text-primary" />
              Builder Arena
            </h1>
            <p className="text-muted-foreground font-sans text-sm md:text-base">
              Blind tests between two AI Builders. Vote for the best output to help establish the open benchmark ranking, ELO style.
            </p>
          </div>

          {!currentMatch ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-card/30 border border-border/50 rounded-3xl backdrop-blur-sm">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <div className="text-muted-foreground text-sm font-sans">Finding a match...</div>
            </div>
          ) : (
            <div className="bg-card/40 border border-border/60 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
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
      </PageFrame>
    </div>
  );
}
