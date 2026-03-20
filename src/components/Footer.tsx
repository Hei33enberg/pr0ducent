import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="section-divider border-t border-border/50 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span
              className="font-serif font-bold tracking-tight leading-none block mb-3 text-foreground"
              style={{ fontSize: "1.5rem" }}
            >
              pr<span style={{ fontSize: "1.6em", fontWeight: 800, lineHeight: 0.8, letterSpacing: "-0.02em" }}>0</span>ducent<span style={{ fontSize: "0.4em", fontWeight: 600, verticalAlign: "super", marginLeft: "0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>™</span>
            </span>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 font-sans">
              {t("footer.product")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-sans">
              <li><a href="#comparison" className="hover:text-foreground transition-colors">{t("footer.compare")}</a></li>
              <li><a href="/calculator" onClick={(e) => { e.preventDefault(); navigate("/calculator"); }} className="hover:text-foreground transition-colors">Calculator</a></li>
              <li><a href="/pricing" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }} className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{t("footer.howItWorks")}</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">{t("footer.faq")}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 font-sans">
              {t("footer.resources")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-sans">
              <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate("/blog"); }} className="hover:text-foreground transition-colors">{t("footer.blog")}</a></li>
              <li><a href="/runs-now" onClick={(e) => { e.preventDefault(); navigate("/runs-now"); }} className="hover:text-foreground transition-colors">Runs Now</a></li>
              <li><a href="/builders" onClick={(e) => { e.preventDefault(); navigate("/builders"); }} className="hover:text-foreground transition-colors">All Builders</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 font-sans">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground font-sans">
              <li><span className="opacity-50">{t("footer.privacy")}</span></li>
              <li><span className="opacity-50">{t("footer.terms")}</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-sans">
          <span>&copy; {year} pr0ducent. {t("footer.rights")}</span>
          <LanguageToggleInline />
        </div>
      </div>
    </footer>
  );
}

function LanguageToggleInline() {
  const { locale, setLocale } = useTranslation();
  return (
    <div className="flex items-center gap-1.5 text-xs font-sans">
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 rounded-md transition-colors ${locale === "en" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("pl")}
        className={`px-2 py-1 rounded-md transition-colors ${locale === "pl" ? "bg-foreground text-background font-semibold" : "text-muted-foreground hover:text-foreground"}`}
      >
        PL
      </button>
    </div>
  );
}
