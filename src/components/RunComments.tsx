import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface RunCommentsProps {
  experimentId: string;
}

export function RunComments({ experimentId }: RunCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase
      .from("run_comments")
      .select("*")
      .eq("experiment_id", experimentId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data);
      });
  }, [experimentId]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("run_comments")
      .insert({
        experiment_id: experimentId,
        user_id: user.id,
        content: newComment.trim(),
      })
      .select()
      .single();

    if (data && !error) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    await supabase.from("run_comments").delete().eq("id", commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold font-sans text-muted-foreground uppercase tracking-wider">
        💬 Comments ({comments.length})
      </h4>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="glass-card rounded-lg p-3 flex gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans text-foreground">{c.content}</p>
              <span className="text-[9px] text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </span>
            </div>
            {user?.id === c.user_id && (
              <button
                onClick={() => handleDelete(c.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {user ? (
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[60px] text-xs font-sans resize-none"
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || loading}
            className="shrink-0"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground font-sans">Sign in to comment.</p>
      )}
    </div>
  );
}
