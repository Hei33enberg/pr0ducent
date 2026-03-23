import { useTranslation } from "@/lib/i18n";
import { useNavigate, useLocation } from "react-router-dom";
import BrandText from "@/components/BrandText";
import { FF } from "@/lib/featureFlags";

export function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const year = new Date().getFullYear();

  const handleAnchor = (id: string) => {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#" + id);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Arena", href: "/arena" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: t("nav.compare"), href: "/compare" },
    { label: t("nav.calculator"), href: "/calculator" },
    { label: t("nav.pricing"), href: "/pricing" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.runsNow"), href: "/runs-now" },
    ...(FF.MARKETPLACE_ENABLED ? [{ label: "Marketplace", href: "/marketplace" }] : []),
    { label: t("nav.faq"), href: "#faq" },
    { label: "Docs", href: "/docs" },
    { label: "All Builders", href: "/builders" },
  ];

  const handleClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (href.startsWith("#")) {
      handleAnchor(href.slice(1));
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="section-dark dot-grid-bg mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8 mb-12">
          {/* Brand */}
          <div>
            <BrandText
              text="pr0ducent"
              showTm
              className="font-serif font-bold tracking-tight leading-none block mb-3"
              as="span"
            />
            <p className="text-sm font-sans leading-relaxed" style={{ color: "hsla(0, 0%, 100%, 0.55)" }}>
              {t("footer.tagline")}
            </p>
          </div>

          {/* Nav links — mirrors dropdown 1:1 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 font-sans" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
              Navigation
            </h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(link.href, e)}
                  className="text-sm font-sans hover:text-white transition-colors"
                  style={{ color: "hsla(0, 0%, 100%, 0.45)" }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 font-sans" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2 text-sm font-sans" style={{ color: "hsla(0, 0%, 100%, 0.25)" }}>
              <li><span>{t("footer.privacy")}</span></li>
              <li><span>{t("footer.terms")}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 text-xs font-sans" style={{ borderColor: "hsla(0, 0%, 100%, 0.1)", color: "hsla(0, 0%, 100%, 0.4)" }}>
          <span>&copy; {year} pr0ducent. {t("footer.rights")}</span>
        </div>
      </div>
    </footer>
  );
}
