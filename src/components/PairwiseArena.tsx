import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getToolById } from "@/config/tools";
import { DemoPreviewFrame } from "@/components/DemoPreviewFrame";
import { usePairwiseVote } from "@/hooks/usePairwiseVote";
import { toast } from "sonner";
import { Swords, ThumbsUp, GitCommit } from "lucide-react";

interface ArenaBuilderResult {
  id: string;
  tool_id: string;
  preview_url: string | null;
}

interface PairwiseArenaProps {
  experimentId: string;
  prompt: string;
  resultA: ArenaBuilderResult;
  resultB: ArenaBuilderResult;
  onNextPair: () => void;
}

export function PairwiseArena({ experimentId, prompt, resultA, resultB, onNextPair }: PairwiseArenaProps) {
  const [votedId, setVotedId] = useState<string | "tie" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { castVote, loading } = usePairwiseVote();

  const handleVote = async (winnerId: string | "tie") => {
    if (votedId) return; // Already voted
    
    setVotedId(winnerId);
    setRevealed(true);
    
    const dbWinner = winnerId === "tie" ? null : winnerId;
    const success = await castVote(experimentId, dbWinner, resultA.tool_id, resultB.tool_id);
    
    if (success) {
      toast.success(winnerId === "tie" ? "Tie recorded!" : "Vote recorded!", {
        description: "Your vote helps rank the builders."
      });
    } else {
      toast.error("Couldn't save vote. Continuing anyway.");
    }
  };

  const toolA = getToolById(resultA.tool_id);
  const toolB = getToolById(resultB.tool_id);

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-6 p-4 bg-muted/20 border border-border/50 rounded-xl">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">The Prompt</div>
        <p className="text-sm font-sans text-foreground leading-relaxed">{prompt}</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 or gap-6 min-h-[500px]">
        {/* Model A */}
        <div className="flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card/50 relative">
          <div className="p-3 border-b border-border/50 flex justify-between items-center bg-muted/10">
            <span className="font-semibold text-sm">Model A</span>
            <AnimatePresence>
              {revealed && toolA && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">{toolA.name}</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 relative bg-background/50">
            {resultA.preview_url ? (
              <DemoPreviewFrame previewUrl={resultA.preview_url} toolName="Model A" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No preview available</div>
            )}
            
            {/* Overlay if won */}
            {revealed && votedId === resultA.tool_id && (
              <div className="absolute inset-0 pointer-events-none ring-4 ring-primary ring-inset z-10" />
            )}
          </div>
          <div className="p-4 bg-card border-t border-border/50 flex justify-center">
             <Button 
               variant={revealed ? (votedId === resultA.tool_id ? "default" : "outline") : "default"}
               size="lg"
               className="w-full sm:w-auto font-semibold"
               disabled={revealed || loading}
               onClick={() => handleVote(resultA.tool_id)}
             >
               <ThumbsUp className="w-4 h-4 mr-2" /> Model A is better
             </Button>
          </div>
        </div>

        {/* Model B */}
        <div className="flex flex-col border border-border/50 rounded-2xl overflow-hidden bg-card/50 relative">
          <div className="p-3 border-b border-border/50 flex justify-between items-center bg-muted/10">
            <span className="font-semibold text-sm">Model B</span>
            <AnimatePresence>
              {revealed && toolB && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-accent/10 text-accent">{toolB.name}</Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1 relative bg-background/50">
            {resultB.preview_url ? (
              <DemoPreviewFrame previewUrl={resultB.preview_url} toolName="Model B" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">No preview available</div>
            )}
            
            {/* Overlay if won */}
            {revealed && votedId === resultB.tool_id && (
              <div className="absolute inset-0 pointer-events-none ring-4 ring-accent ring-inset z-10" />
            )}
          </div>
          <div className="p-4 bg-card border-t border-border/50 flex justify-center">
             <Button 
               variant={revealed ? (votedId === resultB.tool_id ? "default" : "outline") : "default"}
               size="lg"
               className="w-full sm:w-auto font-semibold"
               disabled={revealed || loading}
               onClick={() => handleVote(resultB.tool_id)}
             >
               <ThumbsUp className="w-4 h-4 mr-2" /> Model B is better
             </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
        {!revealed ? (
          <Button variant="outline" size="lg" disabled={loading} onClick={() => handleVote("tie")} className="rounded-full px-8">
            <GitCommit className="w-4 h-4 mr-2" /> Tie
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button size="lg" onClick={onNextPair} className="rounded-full px-8 shadow-lg shadow-primary/20">
              Next Match <Swords className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
