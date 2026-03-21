import { useRef, useState, useEffect, forwardRef, type ReactNode } from "react";
import { LogOut, Menu, X, Swords, Newspaper, Radio, Compass, HelpCircle, Calculator, User, BarChart3, Home, ShoppingBag } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { FF } from "@/lib/featureFlags";
import type { Experiment } from "@/types/experiment";

interface PageFrameProps {
  children: ReactNode;
  experiment: Experiment | null;
  onBack: () => void;
  onVisibilityChange: (isPublic: boolean) => void;
}

const Logo = forwardRef<HTMLAnchorElement, { onClick: () => void }>(({ onClick }, ref) => {
  return (
    <a
      ref={ref}
      href="/"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="shrink-0 no-underline flex items-center h-full"
    >
      <span
        className="font-serif font-bold tracking-tight leading-none text-foreground"
        style={{ fontSize: "clamp(1.4rem, 2.5vw + 0.6rem, 2.2rem)" }}
      >
        pr<span style={{ fontSize: "1.6em", fontWeight: 800, lineHeight: 0.8, verticalAlign: "baseline", letterSpacing: "-0.02em" }}>0</span>ducent<span style={{ fontSize: "0.4em", fontWeight: 600, verticalAlign: "super", marginLeft: "0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>™</span>
      </span>
    </a>
  );
});
Logo.displayName = "Logo";

export function PageFrame({ children, experiment, onBack, onVisibilityChange }: PageFrameProps) {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const frameRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [frameRect, setFrameRect] = useState<{ left: number; width: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isHomepage = location.pathname === "/";

  const handleLogoClick = () => {
    if (isHomepage && experiment) {
      onBack();
    } else if (isHomepage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleAnchorClick = (href: string) => {
    if (isHomepage) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/" + href);
    }
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Arena", href: "/arena", icon: Swords },
    { label: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
    { label: t("nav.compare"), href: "/compare", icon: Compass },
    { label: t("nav.calculator"), href: "/calculator", icon: Calculator },
    { label: t("nav.pricing"), href: "/pricing", icon: Calculator },
    { label: t("nav.blog"), href: "/blog", icon: Newspaper },
    { label: t("nav.runsNow"), href: "/runs-now", icon: Radio },
    ...(FF.MARKETPLACE_ENABLED ? [{ label: "Marketplace", href: "/marketplace", icon: ShoppingBag }] : []),
    { label: t("nav.faq"), href: "#faq", icon: HelpCircle },
  ];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  return (
    <div
      ref={frameRef}
      className="page-frame mx-2 sm:mx-3 md:mx-4 lg:mx-auto md:max-w-[1400px] my-2 sm:my-3 md:my-4 pt-14 sm:pt-16"
    >
      {frameRect && (
        <div className="sticky-header" style={{ left: frameRect.left, width: frameRect.width, zIndex: 100 }}>
          <header className={`header-glass relative flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-12 sm:h-14 md:h-16 ${!menuOpen ? 'section-divider' : ''}`}>
            <Logo onClick={handleLogoClick} />

            {/* Right side: utility buttons + hamburger */}
            <div className="flex items-center gap-1.5" ref={menuRef}>
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

              {/* User avatar / sign-in CTA */}
              {user ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  title={t("nav.myAccount")}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
              ) : (
                <a
                  href="/auth"
                  onClick={(e) => { e.preventDefault(); navigate("/auth"); }}
                  className="hidden sm:inline-flex bg-foreground text-background px-4 md:px-5 py-2 text-[11px] sm:text-xs font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shrink-0 font-sans"
                >
                  {t("nav.getStarted")} →
                </a>
              )}

              {/* Hamburger — always visible */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Dropdown — edge-to-edge, near-opaque warm bg */}
              {menuOpen && (
                <div className="nav-dropdown-glass absolute top-full left-0 right-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden z-[100]">
                  <div className="p-4 sm:p-5 md:px-8 lg:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                          <button
                            key={link.href}
                            onClick={() => {
                              setMenuOpen(false);
                              if (link.href.startsWith("#")) {
                                handleAnchorClick(link.href);
                              } else {
                                navigate(link.href);
                              }
                            }}
                            className={`w-full flex items-center gap-3 p-3 sm:p-3.5 text-sm font-sans rounded-xl transition-colors duration-200 text-left group ${
                              active
                                ? "bg-foreground text-background font-semibold"
                                : "text-foreground hover:bg-foreground/[0.05]"
                            }`}
                          >
                            <Icon className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <span className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-[0.06em]">{link.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Auth actions */}
                  <div className="border-t border-foreground/[0.06] p-4 sm:p-5 md:px-8 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {user ? (
                        <>
                          <button
                            onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                            className="w-full flex items-center gap-3 p-3 sm:p-3.5 text-sm font-sans rounded-xl text-foreground hover:bg-foreground/[0.05] transition-colors text-left group"
                          >
                            <User className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <span className="font-extrabold uppercase tracking-[0.06em] text-xs sm:text-sm">{t("nav.myAccount")}</span>
                            <span className="ml-auto text-[10px] text-muted-foreground/60 truncate max-w-[80px]">
                              {user.email?.split("@")[0]}
                            </span>
                          </button>
                          <button
                            onClick={() => { setMenuOpen(false); signOut(); }}
                            className="w-full flex items-center gap-3 p-3 sm:p-3.5 text-sm font-sans rounded-xl text-foreground hover:bg-foreground/[0.05] transition-colors text-left group"
                          >
                            <LogOut className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <span className="font-extrabold uppercase tracking-[0.06em] text-xs sm:text-sm">{t("nav.signOut")}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setMenuOpen(false); navigate("/auth"); }}
                          className="col-span-1 sm:col-span-2 w-full flex items-center justify-center gap-2 p-3 sm:p-3.5 text-sm font-sans font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
                        >
                          {t("nav.getStarted")} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>
        </div>
      )}

      {children}
    </div>
  );
}
