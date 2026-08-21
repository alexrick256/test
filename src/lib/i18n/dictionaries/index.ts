import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/types";
import de from "@/lib/i18n/dictionaries/de";
import en from "@/lib/i18n/dictionaries/en";
import es from "@/lib/i18n/dictionaries/es";

export const dictionaries: Record<Locale, Dictionary> = { de, en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
