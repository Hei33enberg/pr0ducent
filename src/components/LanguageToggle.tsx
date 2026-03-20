import { useTranslation, type Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "pl" : "en")}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold font-sans text-muted-foreground hover:bg-foreground/5 transition-colors"
      title={locale === "en" ? "Zmień na polski" : "Switch to English"}
    >
      {locale === "en" ? "PL" : "EN"}
    </button>
  );
}
