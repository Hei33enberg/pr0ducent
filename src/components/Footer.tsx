import { useTranslation } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import BrandText from "@/components/BrandText";

export function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="section-dark dot-grid-bg mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
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

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 font-sans" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
              {t("footer.product")}
            </h4>
            <ul className="space-y-2 text-sm font-sans" style={{ color: "hsla(0, 0%, 100%, 0.45)" }}>
              <li><a href="/compare" onClick={(e) => { e.preventDefault(); navigate("/compare"); }} className="hover:text-white transition-colors">{t("footer.compare")}</a></li>
              <li><a href="/calculator" onClick={(e) => { e.preventDefault(); navigate("/calculator"); }} className="hover:text-white transition-colors">{t("footer.calculator")}</a></li>
              <li><a href="/pricing" onClick={(e) => { e.preventDefault(); navigate("/pricing"); }} className="hover:text-white transition-colors">{t("footer.pricing")}</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">{t("footer.howItWorks")}</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">{t("footer.faq")}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 font-sans" style={{ color: "hsla(0, 0%, 100%, 0.7)" }}>
              {t("footer.resources")}
            </h4>
            <ul className="space-y-2 text-sm font-sans" style={{ color: "hsla(0, 0%, 100%, 0.45)" }}>
              <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate("/blog"); }} className="hover:text-white transition-colors">{t("footer.blog")}</a></li>
              <li><a href="/runs-now" onClick={(e) => { e.preventDefault(); navigate("/runs-now"); }} className="hover:text-white transition-colors">{t("footer.runsNow")}</a></li>
              <li><a href="/builders" onClick={(e) => { e.preventDefault(); navigate("/builders"); }} className="hover:text-white transition-colors">{t("footer.allBuilders")}</a></li>
              <li>
                <a
                  href="/docs"
                  onClick={(e) => { e.preventDefault(); navigate("/docs"); }}
                  className="hover:text-white transition-colors"
                >
                  {t("footer.vbpForBuilders")}
                </a>
              </li>
            </ul>
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

        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans" style={{ borderColor: "hsla(0, 0%, 100%, 0.1)", color: "hsla(0, 0%, 100%, 0.4)" }}>
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
        className={`px-2 py-1 rounded-md transition-colors ${locale === "en" ? "bg-white text-black font-semibold" : "hover:text-white"}`}
        style={locale !== "en" ? { color: "hsla(0, 0%, 100%, 0.45)" } : undefined}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("pl")}
        className={`px-2 py-1 rounded-md transition-colors ${locale === "pl" ? "bg-white text-black font-semibold" : "hover:text-white"}`}
        style={locale !== "pl" ? { color: "hsla(0, 0%, 100%, 0.45)" } : undefined}
      >
        PL
      </button>
    </div>
  );
}
