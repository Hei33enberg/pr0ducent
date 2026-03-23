import { useRef, useState, useEffect, useCallback, forwardRef, type ReactNode } from "react";
import { LogOut, User } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageToggle } from "@/components/LanguageToggle";
import BrandText from "@/components/BrandText";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { FF } from "@/lib/featureFlags";
import type { Experiment } from "@/types/experiment";

// Custom illustrated nav icons
import navHome from "@/assets/nav-icons/home.png";
import navArena from "@/assets/nav-icons/arena.png";
import navLeaderboard from "@/assets/nav-icons/leaderboard.png";
import navCompare from "@/assets/nav-icons/compare.png";
import navCalculator from "@/assets/nav-icons/calculator.png";
import navPricing from "@/assets/nav-icons/pricing.png";
import navBlog from "@/assets/nav-icons/blog.png";
import navRunsNow from "@/assets/nav-icons/runs-now.png";
import navMarketplace from "@/assets/nav-icons/marketplace.png";
import navFaq from "@/assets/nav-icons/faq.png";

interface PageFrameProps {
  children: ReactNode;
  experiment: Experiment | null;
  onBack: () => void;
  onVisibilityChange: (isPublic: boolean) => void;
}

interface NavItem {
  label: string;
  subtitle: string;
  href: string;
  iconSrc: string;
}

const Logo = forwardRef<HTMLAnchorElement, { onClick: () => void }>(({ onClick }, ref) => {
  return (
    <a
      ref={ref}
      href="/"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="shrink-0 no-underline flex items-center py-1 min-h-0 self-center"
    >
      <BrandText
        text="pr0ducent"
        showTm
        className="font-serif font-bold tracking-tight leading-none text-foreground"
        as="span"
        style={{ fontSize: "clamp(1.4rem, 2.5vw + 0.6rem, 2.2rem)" }}
      />
    </a>
  );
});
Logo.displayName = "Logo";

/* ── Animated hamburger (3 bars → X) ── */
function Hamburger({ open }: { open: boolean }) {
  return (
    <div className="hamburger-lines" aria-hidden="true">
      <span className={`hamburger-line ${open ? "hamburger-line-1-open" : ""}`} />
      <span className={`hamburger-line ${open ? "hamburger-line-2-open" : ""}`} />
      <span className={`hamburger-line ${open ? "hamburger-line-3-open" : ""}`} />
    </div>
  );
}

/* ── Scroll-direction detection (murd0ch Index parity: threshold + direction) ── */
function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDir = useRef<"up" | "down">("up");

  useEffect(() => {
    let ticking = false;
    const THRESHOLD = 8;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const delta = y - lastScrollY.current;

        if (y < 100) {
          setHidden(false);
          scrollDir.current = "up";
          lastScrollY.current = y;
          return;
        }

        if (delta > THRESHOLD && scrollDir.current !== "down") {
          scrollDir.current = "down";
          setHidden(true);
        } else if (delta < -THRESHOLD && scrollDir.current !== "up") {
          scrollDir.current = "up";
          setHidden(false);
        }

        lastScrollY.current = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

export function PageFrame({ children, experiment, onBack, onVisibilityChange }: PageFrameProps) {
  const { user, signOut } = useAuth();
  const { t, locale } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const frameRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /** Full-screen mobile menu lives outside `menuRef` (sticky header); outside-click must include this or nav taps close the menu before navigation. */
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [frameRect, setFrameRect] = useState<{ left: number; width: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerHidden = useScrollDirection();

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

  // Close menu on outside click (desktop dropdown is inside menuRef; mobile overlay is in mobileMenuRef)
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || mobileMenuRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobile && menuOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isMobile, menuOpen]);

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

  const navLinks: NavItem[] = [
    { label: "Home", subtitle: "Back to main", href: "/", iconSrc: navHome },
    { label: "Arena", subtitle: "Head-to-head battles", href: "/arena", iconSrc: navArena },
    { label: "Leaderboard", subtitle: "Builder rankings", href: "/leaderboard", iconSrc: navLeaderboard },
    { label: t("nav.compare"), subtitle: "Side-by-side tools", href: "/compare", iconSrc: navCompare },
    { label: t("nav.calculator"), subtitle: "ROI estimator", href: "/calculator", iconSrc: navCalculator },
    { label: t("nav.pricing"), subtitle: "Plans & billing", href: "/pricing", iconSrc: navPricing },
    { label: t("nav.blog"), subtitle: "News & insights", href: "/blog", iconSrc: navBlog },
    { label: t("nav.runsNow"), subtitle: "Live experiments", href: "/runs-now", iconSrc: navRunsNow },
    ...(FF.MARKETPLACE_ENABLED ? [{ label: "Marketplace", subtitle: "Templates & remixes", href: "/marketplace", iconSrc: navMarketplace }] : []),
    { label: t("nav.faq"), subtitle: "Common questions", href: "#faq", iconSrc: navFaq },
  ];

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      handleAnchorClick(href);
    } else {
      navigate(href);
    }
  };

  /* ── Nav item renderer (shared between desktop & mobile) ── */
  const renderNavItem = (link: NavItem, size: "sm" | "lg" = "sm") => {
    const active = isActive(link.href);
    /* murd0ch Index: emblems w-12 h-12 sm:w-14 sm:h-14 (48–56px) */
    const imgSize = size === "lg" ? 56 : 48;

    return (
      <button
        key={link.href}
        onClick={() => handleNavClick(link.href)}
        className={`w-full flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3.5 rounded-xl transition-all duration-200 text-left group ${
          active
            ? "bg-foreground text-background"
            : "text-foreground hover:bg-foreground/[0.05]"
        }`}
      >
        <img
          src={link.iconSrc}
          alt=""
          width={imgSize}
          height={imgSize}
          loading="lazy"
          decoding="async"
          className={`shrink-0 object-contain transition-all duration-200 ${
            active
              ? "brightness-0 invert drop-shadow-[0_1px_2px_rgba(255,255,255,0.3)]"
              : "opacity-80 group-hover:opacity-100 group-hover:scale-110"
          }`}
          style={{ imageRendering: "auto" }}
        />
        <div className="flex flex-col min-w-0">
          <span className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-[0.06em] leading-tight">
            {link.label}
          </span>
          <span className={`font-sans text-[10px] sm:text-xs leading-tight mt-0.5 ${
            active ? "text-background/60" : "text-muted-foreground"
          }`}>
            {link.subtitle}
          </span>
        </div>
      </button>
    );
  };

  /* ── Mobile full-screen overlay ── */
  const mobileOverlay = menuOpen && (
    <div ref={mobileMenuRef} className="menu-overlay-mobile sm:hidden">
      {/* Header bar with logo + close */}
      <div className="flex items-center justify-between px-5 sm:px-6 h-14 shrink-0 border-b border-foreground/[0.06]">
        <Logo onClick={() => { setMenuOpen(false); handleLogoClick(); }} />
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg"
        >
          <Hamburger open={true} />
        </button>
      </div>

      {/* Scrollable nav items */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-2">
          {navLinks.map((link) => renderNavItem(link, "lg"))}
        </div>
      </div>

      {/* Language + CTA at bottom — solid strip (blur budget: no extra backdrop on mobile) */}
      <div className="shrink-0 border-t border-foreground/[0.06] bg-[hsla(30,22%,97%,0.98)]">
        <div className="px-4 py-3 flex items-center gap-2">
          <LanguageToggle />
          <span className="font-sans text-xs text-muted-foreground">{locale === "en" ? "Switch language" : "Zmień język"}</span>
        </div>
        <div className="px-4 pb-4">
          {user ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground/[0.05] text-foreground font-sans font-semibold text-sm"
              >
                <User className="w-4 h-4" />
                {t("nav.myAccount")}
              </button>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground/[0.05] text-foreground font-sans font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                {t("nav.signOut")}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); navigate("/pricing"); }}
              className="w-full flex items-center justify-center gap-2 p-3.5 font-sans font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors text-base"
            >
              {t("nav.getStarted")}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Don't hide header when menu is open
  const shouldHide = headerHidden && !menuOpen;

  return (
    <div
      ref={frameRef}
      className="page-frame mx-2 sm:mx-3 md:mx-4 lg:mx-6 xl:mx-auto md:max-w-[1400px] my-2 sm:my-3 md:my-4 pt-14 sm:pt-16"
    >
      {frameRect && (
        <div
          className={`sticky-header ${shouldHide ? 'header-hidden' : ''}`}
          style={{ left: frameRect.left, width: frameRect.width }}
          ref={menuRef}
        >
          <header className={`header-glass relative flex items-center justify-between px-6 sm:px-6 md:px-8 lg:px-12 min-h-12 sm:min-h-14 md:min-h-16 pt-2.5 pb-2 sm:pt-2.5 sm:pb-2.5 md:pt-3 md:pb-2.5 ${!menuOpen ? 'section-divider' : ''}`}>
            <Logo onClick={handleLogoClick} />

            {/* Right side: utility buttons + hamburger */}
            <div className="flex items-center gap-2.5">
              {experiment && user && (
                <ShareButton
                  experimentId={experiment.id}
                  isPublic={experiment.isPublic ?? false}
                  isOwner={true}
                  onVisibilityChange={onVisibilityChange}
                />
              )}
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
                  href="/pricing"
                  onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}
                  className="hidden sm:inline-flex bg-foreground text-background px-4 md:px-5 py-2 text-[11px] sm:text-xs font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shrink-0 font-sans"
                >
                  {t("nav.getStarted")}
                </a>
              )}

              {/* Hamburger — always visible */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
              >
                <Hamburger open={menuOpen} />
              </button>
            </div>
          </header>

          {/* Desktop dropdown — direct child of sticky-header */}
          <div
            className="menu-dropdown hidden sm:block absolute left-0 right-0 top-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]"
            style={{
              transform: menuOpen ? "scaleY(1)" : "scaleY(0)",
              opacity: menuOpen ? 1 : 0,
              maxHeight: menuOpen ? "calc(100vh - 4rem)" : "0",
              overflowX: "hidden",
              overflowY: menuOpen ? "auto" : "hidden",
              transition:
                "transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, max-height 0s linear " +
                (menuOpen ? "0s" : "0.25s"),
              pointerEvents: menuOpen ? "auto" : "none",
            }}
          >
            <div className="p-4 sm:p-5 md:px-8 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {navLinks.map((link) => renderNavItem(link, "sm"))}
              </div>
            </div>

            {/* Language toggle row */}
            <div className="border-t border-foreground/[0.06] px-5 md:px-8 lg:px-12 py-3 flex items-center gap-2">
              <LanguageToggle />
              <span className="font-sans text-xs text-muted-foreground">{locale === "en" ? "Switch language" : "Zmień język"}</span>
            </div>
            {/* Auth actions */}
            <div className="border-t border-foreground/[0.06] p-5 md:px-8 lg:px-12">
              <div className="grid grid-cols-2 gap-1">
                {user ? (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-foreground hover:bg-foreground/[0.05] transition-colors text-left group"
                    >
                      <User className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="font-sans font-extrabold uppercase tracking-[0.06em] text-xs sm:text-sm">{t("nav.myAccount")}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60 truncate max-w-[80px]">
                        {user.email?.split("@")[0]}
                      </span>
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-foreground hover:bg-foreground/[0.05] transition-colors text-left group"
                    >
                      <LogOut className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="font-sans font-extrabold uppercase tracking-[0.06em] text-xs sm:text-sm">{t("nav.signOut")}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/pricing"); }}
                    className="col-span-2 w-full flex items-center justify-center gap-2 p-3.5 font-sans font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    {t("nav.getStarted")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile overlay — rendered outside header for full-screen */}
      {mobileOverlay}

      {children}
    </div>
  );
}
