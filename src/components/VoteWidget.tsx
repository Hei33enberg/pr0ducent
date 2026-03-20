import { useState, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoteWidgetProps {
  builderResultId: string;
  toolId: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  userExistingVote?: 1 | -1 | null;
  userExistingRating?: number | null;
  className?: string;
}

export function VoteWidget({
  builderResultId,
  toolId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  userExistingVote = null,
  userExistingRating = null,
  className
}: VoteWidgetProps) {
  const { user } = useAuth();
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [myVote, setMyVote] = useState<1 | -1 | null>(userExistingVote);
  const [myRating, setMyRating] = useState<number | null>(userExistingRating);
  const [isCasting, setIsCasting] = useState(false);

  const handleVote = useCallback(async (voteValue: 1 | -1) => {
    if (!user) {
      toast.error("You must be logged in to vote on this run.");
      return;
    }
    if (isCasting) return;
    setIsCasting(true);

    const prevVote = myVote;
    const sameVote = prevVote === voteValue;
    const newVote = sameVote ? null : voteValue;

    // Optimistic update
    if (prevVote === 1) setUpvotes(u => u - 1);
    if (prevVote === -1) setDownvotes(d => d - 1);
    
    if (newVote === 1) setUpvotes(u => u + 1);
    if (newVote === -1) setDownvotes(d => d + 1);
    
    setMyVote(newVote);

    try {
      if (newVote === null) {
        // Delete vote
        const { error } = await supabase
          .from("user_votes" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("builder_result_id", builderResultId);
        if (error) throw error;
      } else {
        // Upsert vote
        const { error } = await supabase
          .from("user_votes" as any)
          .upsert({
            user_id: user.id,
            builder_result_id: builderResultId,
            tool_id: toolId,
            vote: newVote,
            rating: myRating, // Preserve rating if it exists
          }, { onConflict: 'user_id,builder_result_id' });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error("Vote failed:", err);
      toast.error("Failed to register your vote.");
      // Rollback
      if (newVote === 1) setUpvotes(u => u - 1);
      if (newVote === -1) setDownvotes(d => d - 1);
      if (prevVote === 1) setUpvotes(u => u + 1);
      if (prevVote === -1) setDownvotes(d => d + 1);
      setMyVote(prevVote);
    } finally {
      setIsCasting(false);
    }
  }, [user, myVote, builderResultId, toolId, myRating, isCasting]);

  const handleRating = useCallback(async (ratingValue: number) => {
    if (!user) {
      toast.error("You must be logged in to rate this run.");
      return;
    }
    
    // We require a thumbs vote first to establish the row, or we default to +1
    let defaultVote = myVote;
    if (defaultVote === null) {
      defaultVote = 1; 
      setUpvotes(u => u + 1);
      setMyVote(1);
    }

    const prevRating = myRating;
    const sameRating = prevRating === ratingValue;
    const newRating = sameRating ? null : ratingValue;
    
    setMyRating(newRating);

    try {
      const { error } = await supabase
        .from("user_votes" as any)
        .upsert({
          user_id: user.id,
          builder_result_id: builderResultId,
          tool_id: toolId,
          vote: defaultVote,
          rating: newRating,
        }, { onConflict: 'user_id,builder_result_id' });
      
      if (error) throw error;
      if (newRating) {
        toast.success(`You rated this ${newRating} stars.`);
      }
    } catch (err: any) {
      console.error("Rating failed:", err);
      toast.error("Failed to register rating.");
      setMyRating(prevRating);
    }
  }, [user, myVote, myRating, builderResultId, toolId]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2 border border-border/40 rounded-full bg-background/50 px-2 py-1 shadow-sm shrink-0 w-fit">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleVote(1)}
          className={cn("h-7 px-2.5 rounded-full hover:text-success gap-1.5 transition-all", myVote === 1 && "bg-success/10 text-success")}
        >
          <ThumbsUp className={cn("w-3.5 h-3.5", myVote === 1 && "fill-current")} />
          <span className="text-xs font-semibold">{upvotes > 0 ? upvotes : ""}</span>
        </Button>
        <div className="w-px h-4 bg-border/50" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleVote(-1)}
          className={cn("h-7 px-2.5 rounded-full hover:text-destructive gap-1.5 transition-all", myVote === -1 && "bg-destructive/10 text-destructive")}
        >
          <ThumbsDown className={cn("w-3.5 h-3.5", myVote === -1 && "fill-current")} />
          <span className="text-xs font-semibold">{downvotes > 0 ? downvotes : ""}</span>
        </Button>
      </div>

      <div className="flex items-center gap-0.5 mt-1 opacity-80 hover:opacity-100 transition-opacity">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className="p-1 rounded-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          >
            <Star 
              className={cn(
                "w-3.5 h-3.5 transition-all text-muted-foreground",
                myRating && star <= myRating ? "text-warning fill-warning" : "hover:text-warning/50"
              )} 
            />
          </button>
        ))}
        {myRating && <span className="text-[10px] text-muted-foreground ml-1.5 font-sans">Your rating</span>}
      </div>
    </div>
  );
}
