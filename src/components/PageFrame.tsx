import { useRef, useState, useEffect, type ReactNode } from "react";
import { Beaker, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareButton } from "@/components/ShareButton";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Experiment } from "@/types/experiment";

interface PageFrameProps {
  children: ReactNode;
  experiment: Experiment | null;
  onBack: () => void;
  onVisibilityChange: (isPublic: boolean) => void;
}

export function PageFrame({ children, experiment, onBack, onVisibilityChange }: PageFrameProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameRect, setFrameRect] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const update = () => {
      if (!frameRef.current) return;
      const r = frameRef.current.getBoundingClientRect();
      setFrameRect((prev) => {
        const next = { left: r.left + 4, width: r.width - 8 };
        if (prev && Math.abs(prev.left - next.left) < 1 && Math.abs(prev.width - next.width) < 1) return prev;
        return next;
      });
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    document.fonts?.ready?.then(update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div
      ref={frameRef}
      className="page-frame mx-2 sm:mx-3 md:mx-4 lg:mx-auto md:max-w-[1400px] my-2 sm:my-3 md:my-4 pt-14 sm:pt-16"
    >
      {frameRect && (
        <div className="sticky-header" style={{ left: frameRect.left, width: frameRect.width }}>
          <header className="header-glass flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-12 sm:h-14 md:h-16 section-divider">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (experiment) onBack();
                else window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="shrink-0 no-underline flex items-center gap-2 h-full"
            >
              <Beaker className="w-5 h-5" style={{ color: "hsl(4, 85%, 65%)" }} />
              <span
                className="font-serif font-bold tracking-tight leading-none"
                style={{ color: "#000", fontSize: "clamp(1.4rem, 2vw + 0.6rem, 2rem)" }}
              >
                Prompt<span style={{ color: "hsl(4, 85%, 65%)" }}>Lab</span>
              </span>
            </a>

            <div className="flex items-center gap-2.5">
              {experiment && user && (
                <ShareButton
                  experimentId={experiment.id}
                  isPublic={experiment.isPublic ?? false}
                  isOwner={true}
                  onVisibilityChange={onVisibilityChange}
                />
              )}
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground hidden sm:inline font-sans">{user.email}</span>
                  <button
                    onClick={signOut}
                    title="Wyloguj"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <a
                  href="/auth"
                  onClick={(e) => { e.preventDefault(); navigate("/auth"); }}
                  className="bg-foreground text-background px-4 md:px-6 py-2 md:py-2.5 text-[11px] sm:text-xs font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shrink-0 font-sans"
                >
                  Zaloguj się →
                </a>
              )}
            </div>
          </header>
        </div>
      )}

      {children}
    </div>
  );
}
