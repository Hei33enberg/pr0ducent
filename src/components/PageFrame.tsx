import { useRef, useState, useEffect, type ReactNode } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import type { Experiment } from "@/types/experiment";

interface PageFrameProps {
  children: ReactNode;
  experiment: Experiment | null;
  onBack: () => void;
  onVisibilityChange: (isPublic: boolean) => void;
}

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <a
      href="/"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="shrink-0 no-underline flex items-center h-full"
    >
      <span
        className="font-serif font-bold tracking-tight leading-none"
        style={{ color: "#000", fontSize: "clamp(1.4rem, 2.5vw + 0.6rem, 2.2rem)" }}
      >
        pr<span style={{ fontSize: "1.6em", fontWeight: 800, lineHeight: 0.8, verticalAlign: "baseline", letterSpacing: "-0.02em" }}>0</span>ducent<span style={{ fontSize: "0.4em", fontWeight: 600, verticalAlign: "super", marginLeft: "0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>™</span>
      </span>
    </a>
  );
}

export function PageFrame({ children, experiment, onBack, onVisibilityChange }: PageFrameProps) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameRect, setFrameRect] = useState<{ left: number; width: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogoClick = () => {
    if (experiment) onBack();
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { label: t("nav.compare"), href: "/compare" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.dashboard"), href: "/dashboard/updates" },
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  return (
    <div
      ref={frameRef}
      className="page-frame mx-2 sm:mx-3 md:mx-4 lg:mx-auto md:max-w-[1400px] my-2 sm:my-3 md:my-4 pt-14 sm:pt-16"
    >
      {frameRect && (
        <div className="sticky-header" style={{ left: frameRect.left, width: frameRect.width }}>
          <header className="header-glass flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-12 sm:h-14 md:h-16 section-divider">
            <Logo onClick={handleLogoClick} />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 font-sans text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    if (link.href.startsWith("#")) {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      e.preventDefault();
                      navigate(link.href);
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {experiment && user && (
                <ShareButton
                  experimentId={experiment.id}
                  isPublic={experiment.isPublic ?? false}
                  isOwner={true}
                  onVisibilityChange={onVisibilityChange}
                />
              )}
              <LanguageToggle />
              <NotificationBell />
              {user ? (
                <>
                  <span className="text-xs text-muted-foreground hidden sm:inline font-sans">{user.email}</span>
                  <button
                    onClick={signOut}
                    title={t("nav.signOut")}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <a
                  href="/auth"
                  onClick={(e) => { e.preventDefault(); navigate("/auth"); }}
                  className="hidden sm:inline-flex bg-foreground text-background px-4 md:px-6 py-2 md:py-2.5 text-[11px] sm:text-xs font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shrink-0 font-sans"
                >
                  {t("nav.getStarted")}
                </a>
              )}
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </header>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border/50 px-6 py-4 space-y-3 font-sans">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (link.href.startsWith("#")) {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      e.preventDefault();
                      navigate(link.href);
                    }
                  }}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
              {!user && (
                <a
                  href="/auth"
                  onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); navigate("/auth"); }}
                  className="block bg-foreground text-background text-center px-4 py-2.5 text-xs font-semibold rounded-full mt-2"
                >
                  {t("nav.getStarted")}
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
