export const LOCALES = ["de", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";
export const LOCALE_COOKIE = "leviro-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  es: "ES",
};

export function isValidLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}
