import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface BuilderRatingStarsProps {
  toolId: string;
  experimentId?: string;
}

export function BuilderRatingStars({ toolId, experimentId }: BuilderRatingStarsProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [existing, setExisting] = useState<{ id: string; rating: number; review: string | null } | null>(null);
  const [avgRating, setAvgRating] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    // Load existing user rating
    if (user) {
      const query = supabase
        .from("builder_ratings")
        .select("id, rating, review")
        .eq("tool_id", toolId)
        .eq("user_id", user.id);

      if (experimentId) {
        query.eq("experiment_id", experimentId);
      }

      query.maybeSingle().then(({ data }) => {
        if (data) {
          setExisting(data);
          setRating(data.rating);
          setReview(data.review || "");
        }
      });
    }

    // Load aggregate
    supabase
      .from("builder_ratings")
      .select("rating")
      .eq("tool_id", toolId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const sum = data.reduce((acc, r) => acc + r.rating, 0);
          setAvgRating({ avg: sum / data.length, count: data.length });
        }
      });
  }, [toolId, user, experimentId]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    const payload = {
      tool_id: toolId,
      user_id: user.id,
      experiment_id: experimentId || null,
      rating,
      review: review.trim() || null,
    };

    if (existing) {
      await supabase
        .from("builder_ratings")
        .update({ rating, review: review.trim() || null })
        .eq("id", existing.id);
    } else {
      await supabase.from("builder_ratings").insert(payload);
    }

    toast({ title: "Rating saved!" });
    setExisting({ id: existing?.id || "", rating, review });
  };

  return (
    <div className="space-y-2">
      {/* Aggregate */}
      {avgRating && (
        <div className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
          <Star className="w-3.5 h-3.5 text-warning fill-warning" />
          <span className="font-medium text-foreground">{avgRating.avg.toFixed(1)}</span>
          <span>({avgRating.count} ratings)</span>
        </div>
      )}

      {/* User rating */}
      {user && (
        <div className="space-y-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= (hover || rating)
                      ? "text-warning fill-warning"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            <span className="text-[10px] text-muted-foreground font-sans ml-1">
              {rating > 0 ? `${rating}/5` : "Rate"}
            </span>
          </div>

          {rating > 0 && (
            <div className="flex gap-2">
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a short review (optional)..."
                className="min-h-[50px] text-xs font-sans resize-none"
              />
              <Button size="sm" onClick={handleSubmit} className="shrink-0 text-xs">
                {existing ? "Update" : "Submit"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
