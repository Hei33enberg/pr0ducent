import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import en from "@/locales/en.json";
import pl from "@/locales/pl.json";

export type Locale = "en" | "pl";

const dictionaries: Record<Locale, Record<string, string>> = { en, pl };

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function detectLocale(): Locale {
  try {
    // Check cookie first, then localStorage — NO browser detection
    const fromCookie = getCookie("pr0ducent_locale");
    if (fromCookie === "en" || fromCookie === "pl") return fromCookie;
    const fromStorage = localStorage.getItem("pr0ducent_locale");
    if (fromStorage === "en" || fromStorage === "pl") return fromStorage;
    return "en"; // Always default to English
  } catch {
    return "en";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("pr0ducent_locale", l);
      setCookie("pr0ducent_locale", l);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? fallback ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
