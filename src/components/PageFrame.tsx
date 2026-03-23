import { copy } from "@/lib/copy";
import { useRef, useState, useEffect, useCallback, forwardRef, type ReactNode } from "react";
import { LogOut, User } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { NotificationBell } from "@/components/NotificationBell";
import BrandText from "@/components/BrandText";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { FF } from "@/lib/featureFlags";
import type { Experiment } from "@/types/experiment";

// Custom illustrated nav icons
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

const Logo = forwardRef<HTMLAnchorElement, { onClick: () => void; isHomepage: boolean }>(({ onClick, isHomepage }, ref) => {
  // Logo size: murd0ch Index.tsx wordmark clamp (pixel parity)
  const brand = (
    <BrandText
      text="pr0ducent"
      showTm
      variant="header"
      className="font-serif font-bold tracking-tight text-foreground leading-none"
      as="span"
      style={{ fontSize: "clamp(1.6rem, 2.5vw + 0.8rem, 2.4rem)" }}
    />
  );
  return (
    <a
      ref={ref}
      href="/"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="shrink-0 no-underline flex items-center min-h-0 min-w-0 overflow-visible"
    >
      {isHomepage ? (
        brand
      ) : (
        <h1 className="m-0 p-0 text-[inherit] font-inherit leading-none">{brand}</h1>
      )}
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
function useScrollDirection(menuOpen: boolean) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollDir = useRef<"up" | "down">("up");

  useEffect(() => {
    if (menuOpen) setHidden(false);
  }, [menuOpen]);

  useEffect(() => {
    let ticking = false;
    const THRESHOLD = 8;

    const onScroll = () => {
      if (menuOpen) return;
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
  }, [menuOpen]);

  return hidden;
}

export function PageFrame({ children, experiment, onBack, onVisibilityChange }: PageFrameProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const frameRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /** Full-screen mobile menu lives outside `menuRef` (sticky header); outside-click must include this or nav taps close the menu before navigation. */
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [frameRect, setFrameRect] = useState<{ left: number; width: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerHidden = useScrollDirection(menuOpen);

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

  // Lock body scroll while menu is open (desktop backdrop + dropdown or mobile overlay)
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

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
    { label: "Arena", subtitle: "Head-to-head battles", href: "/arena", iconSrc: navArena },
    { label: "Leaderboard", subtitle: "Builder rankings", href: "/leaderboard", iconSrc: navLeaderboard },
    { label: copy["nav.compare"], subtitle: "Side-by-side tools", href: "/compare", iconSrc: navCompare },
    { label: copy["nav.calculator"], subtitle: "ROI estimator", href: "/calculator", iconSrc: navCalculator },
    { label: copy["nav.pricing"], subtitle: "Plans & billing", href: "/pricing", iconSrc: navPricing },
    { label: copy["nav.blog"], subtitle: "News & insights", href: "/blog", iconSrc: navBlog },
    { label: copy["nav.runsNow"], subtitle: "Live experiments", href: "/runs-now", iconSrc: navRunsNow },
    ...(FF.MARKETPLACE_ENABLED ? [{ label: "Marketplace", subtitle: "Templates & remixes", href: "/marketplace", iconSrc: navMarketplace }] : []),
    { label: copy["nav.faq"], subtitle: "Common questions", href: "#faq", iconSrc: navFaq },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#")) {
      return location.pathname === "/" && location.hash === href;
    }
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

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
        className={`w-full flex items-center gap-3 sm:gap-3.5 p-3 sm:p-3.5 rounded-xl transition-all duration-200 text-left group ${
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
          <span className="font-sans text-xs sm:text-sm font-extrabold uppercase tracking-[0.08em] leading-tight">
            {link.label}
          </span>
          <span className={`font-sans text-[10px] sm:text-xs font-medium leading-tight mt-0.5 ${
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
      <div className="flex items-center justify-between px-4 h-12 shrink-0 border-b border-foreground/[0.06] bg-[hsla(30,22%,97%,0.98)]">
        <Logo isHomepage={isHomepage} onClick={() => { setMenuOpen(false); handleLogoClick(); }} />
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

      {/* CTA at bottom — solid strip (blur budget: no extra backdrop on mobile) */}
      <div className="shrink-0 border-t border-foreground/[0.06] bg-[hsla(30,22%,97%,0.98)]">
        <div className="px-4 py-3 pb-4">
          {user ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground/[0.05] text-foreground font-sans font-semibold text-sm"
              >
                <User className="w-4 h-4" />
                {copy["nav.myAccount"]}
              </button>
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-foreground/[0.05] text-foreground font-sans font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                {copy["nav.signOut"]}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setMenuOpen(false); navigate("/pricing"); }}
              className="w-full flex items-center justify-center gap-2 p-3.5 font-sans font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors text-base"
            >
              {copy["nav.getStarted"]}
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
      {/* Desktop: dim page behind nav so builder grid / hero doesn’t show through the glass bar (murd0ch-style shell). */}
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="menu-open-backdrop fixed inset-0 z-[440] hidden sm:block bg-black/25 dark:bg-black/35"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      {frameRect && (
        <div
          className={`sticky-header ${shouldHide ? "header-hidden" : ""} ${menuOpen ? "nav-menu-open" : ""}`}
          style={{ left: frameRect.left, width: frameRect.width }}
          ref={menuRef}
        >
          <header
            className={`header-glass relative flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 h-12 sm:h-14 md:h-16 overflow-visible ${!menuOpen ? "section-divider" : ""} ${
              menuOpen ? "bg-[hsla(30,22%,97%,0.98)] shadow-[0_1px_0_hsla(0,0%,0%,0.06)]" : ""
            }`}
          >
            <Logo isHomepage={isHomepage} onClick={handleLogoClick} />

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
                  title={copy["nav.myAccount"]}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                </button>
              ) : (
                <a
                  href="/pricing"
                  onClick={(e) => { e.preventDefault(); navigate("/pricing"); }}
                  className="inline-flex bg-foreground text-background px-2.5 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 text-[10px] sm:text-[11px] md:text-xs font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all duration-300 shrink-0 font-sans"
                >
                  {copy["nav.getStarted"]}
                </a>
              )}

              {/* Hamburger — always visible */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-foreground/5 transition-colors"
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
            <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
                {navLinks.map((link) => renderNavItem(link, "sm"))}
              </div>
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
                      <span className="font-sans font-extrabold uppercase tracking-[0.06em] text-xs sm:text-sm">{copy["nav.myAccount"]}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground/60 truncate max-w-[80px]">
                        {user.email?.splicopy["@"][0]}
                      </span>
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-foreground hover:bg-foreground/[0.05] transition-colors text-left group"
                    >
                      <LogOut className="w-5 h-5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                      <span className="font-sans font-extrabold uppercase tracking-[0.06em] text-xs sm:text-sm">{copy["nav.signOut"]}</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/pricing"); }}
                    className="col-span-2 w-full flex items-center justify-center gap-2 p-3.5 font-sans font-semibold rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    {copy["nav.getStarted"]}
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
