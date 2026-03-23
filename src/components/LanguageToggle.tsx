import { forwardRef } from "react";
import { useTranslation, I18N_SINGLE_LOCALE_ENGLISH } from "@/lib/i18n";

/** Hidden while {@link I18N_SINGLE_LOCALE_ENGLISH} is true; re-enable with the nav/footer language rows. */
export const LanguageToggle = forwardRef<HTMLButtonElement>((_, ref) => {
  const { locale, setLocale } = useTranslation();

  if (I18N_SINGLE_LOCALE_ENGLISH) return null;

  return (
    <button
      ref={ref}
      onClick={() => setLocale(locale === "en" ? "pl" : "en")}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold font-sans text-muted-foreground hover:bg-foreground/5 transition-colors"
      title={locale === "en" ? "Switch to Polish" : "Switch to English"}
    >
      {locale === "en" ? "PL" : "EN"}
    </button>
  );
});
LanguageToggle.displayName = "LanguageToggle";
