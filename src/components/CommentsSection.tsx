import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserCommentRow } from "@/types/benchmark";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentsSectionProps {
  builderResultId: string;
  toolId: string;
  className?: string;
}

export function CommentsSection({ builderResultId, toolId, className }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<UserCommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PAGE_SIZE = 20;

  const fetchComments = useCallback(async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const { data, error } = await supabase
        .from("user_comments" as any)
        .select("*, profiles(email, avatar_url)")
        .eq("builder_result_id", builderResultId)
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (error) throw error;
      
      const records = data as unknown as UserCommentRow[];
      if (records.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);

      setComments(prev => isInitial ? records : [...prev, ...records]);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [builderResultId]);

  useEffect(() => {
    fetchComments(0, true).catch(() => setLoading(false));
  }, [fetchComments]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to comment.");
      return;
    }
    const trimmed = newComment.trim();
    if (!trimmed) return;
    if (trimmed.length > 2000) {
      toast.error("Comment is too long (max 2000 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("user_comments" as any)
        .insert({
          user_id: user.id,
          builder_result_id: builderResultId,
          tool_id: toolId,
          body: trimmed,
          // sentiment is left empty for backend AI to async update if wanted
        })
        .select("*, profiles(email, avatar_url)")
        .single();
        
      if (error) throw error;

      toast.success("Comment added.");
      setNewComment("");
      setComments(prev => [data as unknown as UserCommentRow, ...prev]);
    } catch (err) {
      console.error("Failed to post comment:", err);
      toast.error("Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex justify-center py-6", className)}>
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="text-sm font-semibold font-sans flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-muted-foreground" />
        Discussion
      </h4>
      
      {/* Input area */}
      {user ? (
        <div className="flex flex-col gap-2">
          <Textarea 
            placeholder="Add your thoughts or review on this builder's output..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] text-sm resize-none bg-background/50 focus-visible:ring-1"
            maxLength={2000}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground font-sans">
              {newComment.length}/2000
            </span>
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || !newComment.trim()} className="h-7 text-xs px-3">
              {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 mr-1.5" />}
              Post
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-border/40 text-center font-sans">
          Sign in to leave a comment.
        </div>
      )}

      {/* List */}
      <div className="space-y-3 mt-4">
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No comments yet. Be the first to review!</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="text-sm p-3 rounded-lg bg-card/60 border border-border/40 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary uppercase">
                    {c.profiles?.email?.[0] || "?"}
                  </div>
                  <span className="text-xs font-medium text-foreground">{c.profiles?.email?.split('@')[0] || "Anonymous"}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                {c.sentiment && (
                  <Badge variant="outline" className={cn(
                    "text-[9px] px-1.5 py-0 border-opacity-50",
                    c.sentiment === "positive" ? "text-success border-success" :
                    c.sentiment === "negative" ? "text-destructive border-destructive" :
                    "text-muted-foreground"
                  )}>
                    {c.sentiment}
                  </Badge>
                )}
              </div>
              <p className="text-xs font-sans text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {c.body}
              </p>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" onClick={loadMore} className="text-xs h-7">
            Load more comments
          </Button>
        </div>
      )}
    </div>
  );
}
