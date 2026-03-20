import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogIn, Zap } from "lucide-react";

/**
 * Subtelny banner informujący gości, że widzą okrojoną ścieżkę (tylko v0).
 * Renderuje się TYLKO gdy !user.
 */
export function GuestOrchestrationBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) return null;

  return (
    <div className="w-full rounded-xl border border-border/50 bg-muted/20 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground font-sans leading-snug">
          <span className="font-medium text-foreground">Guest mode:</span> You're seeing a single-builder preview (v0 only). 
          Sign in to run <span className="font-semibold text-foreground">all builders simultaneously</span>.
        </p>
      </div>
      <button
        onClick={() => navigate("/auth")}
        className="shrink-0 inline-flex items-center gap-1.5 bg-foreground text-background px-3.5 py-1.5 rounded-full text-[11px] font-semibold hover:scale-[1.02] transition-all font-sans"
      >
        <LogIn className="w-3 h-3" />
        Sign In
      </button>
    </div>
  );
}
