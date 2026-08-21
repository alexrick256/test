"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from "@/lib/i18n/locales";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getPath, interpolate } from "@/lib/i18n/format";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tList: <T = string>(key: string) => T[];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      try {
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Cookies können in manchen privaten Modi blockiert sein – Auswahl gilt dann nur für diese Session.
      }
      router.refresh();
    },
    [router],
  );

  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const value = getPath(dict, key);
      if (typeof value !== "string") return key;
      return interpolate(value, vars);
    },
    [dict],
  );

  const tList = useCallback(
    <T = string,>(key: string): T[] => {
      const value = getPath(dict, key);
      return Array.isArray(value) ? value : [];
    },
    [dict],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, tList }}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation muss innerhalb von LanguageProvider verwendet werden.");
  return ctx;
}
